# 流式 UI

本页描述平台组件如何响应 SSE 事件、事件与 UI 的对应关系，以及 StreamState 字段规范。

组件的完整 Props API 见 [组件 API 与类型](#components)。

---

## MessageList：一站式流式渲染

`MessageList` 是最核心的组件，同时接受已完成的历史消息和实时流式状态，内部自动完成所有子组件的编排：

```tsx
import { useSSEStream, MessageList, ProcessTrace } from '@meso.ai/ui'
import type { Message } from '@meso.ai/ui'

function ChatArea() {
  const { state, start, abort, reset } = useSSEStream('/api/stream')
  const [messages, setMessages] = useState<Message[]>([])

  return (
    <MessageList
      messages={messages}
      streaming={state}
      emptyState={<EmptyPrompt />}
      renderLiveTrace={(stream) => (
        <ProcessTrace stream={stream} streaming={stream.status === 'streaming'} />
      )}
      renderExtension={(event) => {
        if (event.payload.name === 'citation') {
          return <CitationCard data={event.payload.data} />
        }
      }}
    />
  )
}
```

当 `streaming.status !== 'idle'` 时，MessageList 在历史消息下方自动渲染**实时区域**：

```
┌─ 实时区域 ──────────────────────────────────────┐
│  ProcessTrace / 执行区（renderLiveTrace 插槽）    │
│    ├─ ThinkBlock                                │
│    ├─ StageTimeline                             │
│    ├─ ToolCallBlock                             │
│    └─ WorkflowTimeline                          │
│  ChatBubble      （AI 正文 + 流式光标）           │
│  ArtifactPanel   （有 artifact 时显示，           │
│                   按 artifactOrder 顺序）         │
└─────────────────────────────────────────────────┘
```

---

## SSE 事件 → UI 对应关系

| SSE 事件 | StreamState 变化 | UI 动作 |
|---------|-----------------|---------|
| `capabilities` | `availableCapabilities` 设置 | 应用可按需展示可用能力 |
| `soul` | `activeSoul` 设置 | SoulIndicator 显示当前人格 |
| `skill_active` | `activeSkill` 设置 | SkillIndicator 显示当前技能 |
| `phase` running | `phases[id]` 创建/更新，`phaseOrder` 追加 | ProcessTrace / StageTimeline 更新 |
| `phase` done | `phases[id].state = 'done'`，存储 `pinnedThink`/`body` | ThinkBlock 切到快照 |
| `memory` | `memorySnippets` 替换 | Memory 芯片出现 |
| `memory_saved` | `memorySaved` 追加 | 可选 UI 提示已保存 |
| `tool_call` | `toolCalls[id]` 添加，`toolCallOrder` 追加 | ToolCallBlock 出现；`risk=destructive/write` 时触发 ConfirmGate |
| `tool_result` | `toolCalls[id].result` 更新 | ToolCallBlock 更新为 done/error |
| `resource_read` | `resourceReads[id]` 添加 | ResourceReadBlock 出现 |
| `resource_content` | `resourceReads[id].content` 更新 | ResourceReadBlock 更新为 done |
| `think` delta（无 phase_id）| `thinkContent` 追加 | ThinkBlock 展开，逐字显示 |
| `think` delta（有 phase_id）| `phases[phase_id].thinkContent` 追加 | Per-phase ThinkBlock |
| `think` done:true | `thinkDone = true` | 1.5s 后自动折叠 |
| `text` | `textContent` 追加 | ChatBubble 出现，光标闪烁 |
| `artifact` | `artifacts[id]` 追加 | ArtifactPanel 弹出（首次出现时）|
| `artifact` done:true | `artifacts[id].done = true` | 触发最终语法高亮 / 图表渲染 |
| `workflow_node` | `workflowRuns[run_id].nodes[node_id]` 更新 | WorkflowTimeline 树形更新 |
| `extension` | `extensionLog` + `extensions[name]` | `renderExtension` 调用 |
| `done` | `status = 'done'` | 光标消失 |
| `error` | `status = 'error'`, `errorMessage` | 错误提示显示 |

---

## StreamState 字段完整说明

```typescript
interface StreamState {
  status:         'idle' | 'streaming' | 'done' | 'error'

  // 能力上下文（LLM 生成前设定）
  availableCapabilities: CapabilitiesPayload | null
  activeSoul:            SoulPayload | null
  activeSkill:           SkillPayload | null

  // 阶段进度（按首次出现顺序，deduped by name）
  stages:         StagePayload[]

  // 一级流水线阶段（v2.1+，比 stage 更丰富）
  phases:         Record<string, PhaseRecord>
  phaseOrder:     string[]   // id 按首次出现顺序

  // 记忆
  memorySnippets: MemorySnippet[]       // 整体替换
  memorySaved:    MemorySavedPayload[]

  // 工具调用 & 资源读取
  toolCalls:         Record<string, ToolCallState>
  toolCallOrder:     string[]
  resourceReads:     Record<string, ResourceReadState>
  resourceReadOrder: string[]

  // 推理过程（顶层，无 phase_id 的 think 事件）
  thinkContent:   string
  thinkDone:      boolean

  // 正文
  textContent:    string

  // Artifacts（多个，按顺序）
  artifacts:      Record<string, ArtifactState>
  artifactOrder:  string[]

  // 工作流节点（developer telemetry）
  workflowRuns:     Record<string, WorkflowRunState>
  workflowRunOrder: string[]

  // 扩展事件
  extensionLog:   ExtensionEvent[]
  extensions:     Record<string, ExtensionEvent[]>

  errorMessage:   string | null
}
```

### PhaseRecord（v2.1+）

```typescript
interface PhaseRecord {
  id:           string
  name:         string
  state:        'pending' | 'running' | 'done' | 'error'
  thinkContent: string     // 该阶段的 think delta 累积
  pinnedThink?: string     // done 时的冻结快照
  body?:        string     // 结构化产出 JSON 字符串
  startedAt?:   number
  endedAt?:     number
}
```

---

## ThinkBlock 生命周期

```
think delta 到达 → ThinkBlock 展开，逐字追加文本，末尾显示光标
think done:true  → streaming=false，等待 autoCollapseDelay（默认 1500ms）
折叠动画         → max-height: content-height → 0，300ms ease
用户点击标题     → 随时手动切换展开/折叠，优先级高于自动折叠
轮次结束         → turnStreaming false 时清除 userIntent，恢复系统默认
```

**userIntent 模式（v2.1+）：**

ThinkBlock 内部使用 `userIntent` 跟踪用户明确的折叠偏好：

```
open = userIntent !== null ? userIntent : systemOpen
```

只有当用户未手动操作（`userIntent === null`）时，自动折叠计时器才会生效。`turnStreaming` prop 在轮次结束（`true → false`）时重置 `userIntent`，确保下一轮从默认展开状态开始。

**streaming → done 同源原则：**

流式阶段和完成态必须共用同一渲染路径，不得在 done 后切换 DOM 结构：

```tsx
// ✅ 正确：同一个 ThinkBlock，只是 prop 状态变化
<ThinkBlock
  content={phase.thinkContent}
  streaming={phase.state === 'running'}
  pinnedContent={phase.pinnedThink}   // done 后显示此快照
/>

// ❌ 错误：streaming 时用 ThinkBlock，done 后换 div.body-text
{isStreaming
  ? <ThinkBlock content={think} />
  : <div className="body-text">{think}</div>
}
```

---

## Phase 流水线渲染模式（v2.1+）

使用 `phase` 事件时，每个阶段有独立的 think 流和结构化产出：

```tsx
function PhaseList({ stream, streaming }: { stream: StreamState; streaming: boolean }) {
  return (
    <div className="phase-list">
      {stream.phaseOrder.map(id => {
        const phase = stream.phases[id]
        if (!phase) return null
        return (
          <div key={id} className="phase-item">
            <div className="phase-header">
              <StatusIcon
                status={
                  phase.state === 'running' ? 'running'
                  : phase.state === 'done'  ? 'done'
                  : phase.state === 'error' ? 'error'
                  : 'pending'
                }
                size={14}
              />
              <span>{phase.name}</span>
            </div>

            {(phase.thinkContent || phase.pinnedThink) && (
              <ThinkBlock
                content={phase.thinkContent}
                streaming={streaming && phase.state === 'running'}
                pinnedContent={phase.pinnedThink}
                collapseWhen="done"
              />
            )}

            {phase.body && phase.state === 'done' && (
              <pre className="phase-body">{phase.body}</pre>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

---

## ArtifactPanel 渲染模式

`lang` 字段决定渲染方式：

| `lang` 值 | 渲染方式 | 特殊行为 |
|-----------|---------|---------|
| `"html preview"` | sandbox iframe | 流式期间显示原始 HTML，done 后渲染 iframe |
| `"mermaid"` | Mermaid SVG 图表 | done 后调用 Mermaid 引擎渲染 |
| 其他（python、tsx、sql…）| 代码高亮 | done 后触发最终语法高亮 |

---

## StageTimeline 折叠时机

- 有任意 stage 处于 `active` → 显示，展开
- 所有 stage 均为 `done`/`error` → 1.5s 后自动折叠
- `done` 事件到达且所有 stage 完成 → 立即触发折叠倒计时

---

## SSE 不活跃超时（v2.1+）

`useSSEStream` 内置 watchdog，默认 120 秒无数据时自动终止流：

```typescript
const { state, start } = useSSEStream('/api/stream', {
  onError: (msg, code) => {
    if (code === 'WATCHDOG_TIMEOUT') {
      showToast('连接超时，请重试')
    }
  }
})

// 自定义超时时长
start({ watchdogMs: 60_000 })
```

超时后 `state.status = 'error'`，`state.errorMessage` 包含超时说明。

---

## 完整示例：手动组合各组件

不使用 `MessageList`，完全自定义渲染：

```tsx
import {
  ChatBubble, ThinkBlock, StageTimeline, ArtifactPanel,
  StatusIcon, LogLine, useSSEStream, phaseRecordToStage
} from '@meso.ai/ui'

function CustomChat() {
  const { state, start, abort } = useSSEStream('/api/stream')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* 流式实时区域 */}
      {state.status !== 'idle' && (
        <div style={{ padding: '0 16px' }}>
          {/* 阶段进度 */}
          {state.phaseOrder.length > 0 && (
            <StageTimeline
              compact
              stages={state.phaseOrder
                .map(id => state.phases[id])
                .filter(Boolean)
                .map(phaseRecordToStage)}
            />
          )}

          {/* 工具调用日志（轻量版） */}
          {state.toolCallOrder.map(id => {
            const tc = state.toolCalls[id]
            if (!tc) return null
            return (
              <LogLine
                key={id}
                status={tc.status === 'done' ? 'done' : tc.status === 'error' ? 'error' : 'running'}
                primary={tc.call.name}
                outcome={tc.result ? '完成' : undefined}
              />
            )
          })}

          {/* 推理过程 */}
          {state.thinkContent && (
            <ThinkBlock
              content={state.thinkContent}
              streaming={!state.thinkDone}
              turnStreaming={state.status === 'streaming'}
            />
          )}

          {/* AI 正文 */}
          {state.textContent && (
            <ChatBubble
              role="assistant"
              content={state.textContent}
              streaming={state.status === 'streaming'}
            />
          )}

          {/* Artifacts */}
          {state.artifactOrder.map(id => {
            const art = state.artifacts[id]
            return (
              <ArtifactPanel
                key={id}
                type={art.lang === 'html preview' ? 'html' : art.lang === 'mermaid' ? 'mermaid' : 'code'}
                content={art.content}
                language={art.lang}
                streaming={!art.done}
                onCopy={text => navigator.clipboard.writeText(text)}
              />
            )
          })}

          {/* 错误 */}
          {state.status === 'error' && (
            <div style={{ color: 'var(--color-error)', padding: '8px 0', fontSize: 13 }}>
              ⚠ {state.errorMessage || '发生错误，请重试'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

错误状态的完整处理模式见 [错误处理](#error-handling)。
