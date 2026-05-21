# 流式 UI

本页描述平台组件如何响应 SSE 事件、事件与 UI 的对应关系，以及 StreamState 字段规范。

组件的完整 Props API 见 [组件 API 与类型](#components)。

---

## MessageList：一站式流式渲染

`MessageList` 是最核心的组件，同时接受已完成的历史消息和实时流式状态，内部自动完成所有子组件的编排：

```tsx
import { useSSEStream, MessageList } from '@meso/ui'
import type { Message } from '@meso/ui'

function ChatArea() {
  const { state, start, abort, reset } = useSSEStream('/api/stream')
  const [messages, setMessages] = useState<Message[]>([])

  return (
    <MessageList
      messages={messages}             // 历史完成轮次
      streaming={state}              // 当前流式状态
      emptyState={<EmptyPrompt />}
      renderExtension={(event) => {  // 可选：渲染扩展事件
        if (event.payload.name === 'tool_progress') {
          return <ToolCard data={event.payload.data} />
        }
      }}
    />
  )
}
```

当 `streaming.status !== 'idle'` 时，MessageList 在历史消息下方自动渲染**实时区域**，包含以下层次（按顺序）：

```
┌─ 实时区域 ──────────────────────────────────────┐
│  StageTimeline   （有未完成 stage 时显示）         │
│  Memory 芯片      （收到 memory 事件后显示）       │
│  扩展事件区域     （有 extensionLog 且提供了       │
│                   renderExtension 时显示）        │
│  ThinkBlock      （有 thinkContent 时显示）       │
│  ChatBubble      （AI 正文 + 流式光标）           │
│  ArtifactPanel   （有 artifact 时显示，           │
│                   按 artifactOrder 顺序）         │
└─────────────────────────────────────────────────┘
```

---

## SSE 事件 → UI 对应关系

| SSE 事件 | StreamState 变化 | UI 动作 |
|---------|-----------------|---------|
| `stage` active | `stages` 追加/更新 | StageTimeline 出现，旋转动画 |
| `stage` done | `stages[n].state = 'done'` | 打对号，全 done 后 1.5s 折叠 |
| `memory` | `memorySnippets` 替换 | Memory 芯片出现 |
| `think` delta | `thinkContent` 追加 | ThinkBlock 展开，逐字显示 |
| `think` done:true | `thinkDone = true` | 1.5s 后自动折叠 |
| `text` | `textContent` 追加 | ChatBubble 出现，光标闪烁 |
| `artifact` | `artifacts[id]` 追加 | ArtifactPanel 弹出（首次出现时） |
| `artifact` done:true | `artifacts[id].done = true` | 触发最终语法高亮 / 图表渲染 |
| `extension` | `extensionLog` + `extensions[name]` | `renderExtension` 调用 |
| `done` | `status = 'done'` | 光标消失 |
| `error` | `status = 'error'`, `errorMessage` | 错误提示显示 |

---

## StreamState 字段完整说明

`useSSEStream` 返回的 `state` 对象：

```typescript
interface StreamState {
  status:         'idle' | 'streaming' | 'done' | 'error'

  // 阶段进度（按首次出现顺序）
  stages:         Array<{ name: string; state: 'active' | 'done' | 'error' }>

  // 记忆召回结果（整体替换）
  memorySnippets: Array<{ category: string; content: string }>

  // 推理过程
  thinkContent:   string     // 累积全文
  thinkDone:      boolean    // 收到 think done:true

  // 正文
  textContent:    string     // 累积全文

  // Artifacts（多个，按顺序）
  artifacts:      Record<string, { id: string; lang: string; content: string; done: boolean }>
  artifactOrder:  string[]   // id 按首次出现顺序

  // 扩展事件
  extensionLog:   ExtensionEvent[]                  // 按到达顺序
  extensions:     Record<string, ExtensionEvent[]>  // 按 name 分桶

  // 错误
  errorMessage:   string | null
}
```

---

## ThinkBlock 生命周期

```
think delta 到达 → ThinkBlock 展开，逐字追加文本，末尾显示光标
think done:true  → streaming=false，等待 autoCollapseDelay（默认 1500ms）
折叠动画         → max-height: content-height → 0，300ms ease
用户点击标题     → 随时手动切换展开/折叠，优先级高于自动折叠
```

ThinkBlock 在流式期间禁止折叠动画（防止闪烁）。`done` 后用户可以随时展开查看完整推理过程。

---

## ArtifactPanel 渲染模式

`lang` 字段决定渲染方式：

| `lang` 值 | 渲染方式 | 特殊行为 |
|-----------|---------|---------|
| `"html preview"` | sandbox iframe | 流式期间显示原始 HTML，done 后渲染 iframe |
| `"mermaid"` | Mermaid SVG 图表 | done 后调用 Mermaid 引擎渲染 |
| 其他（python、tsx、sql…）| 代码高亮 | done 后触发最终语法高亮 |

多个 artifact 按 `artifactOrder` 顺序排列，每个独立显示在 ArtifactPanel 中。

---

## StageTimeline 折叠时机

StageTimeline 在 `MessageList` 内部自动管理：

- 有任意 stage 处于 `active` → 显示，展开
- 所有 stage 均为 `done`/`error` → 1.5s 后自动折叠
- `done` 事件到达且所有 stage 完成 → 立即触发折叠倒计时

---

## 完整示例：手动组合各组件

不使用 `MessageList`，完全自定义渲染：

```tsx
import {
  ChatBubble, ThinkBlock, StageTimeline, ArtifactPanel, useSSEStream
} from '@meso/ui'

function CustomChat() {
  const { state, start, abort } = useSSEStream('/api/stream')
  const [messages, setMessages] = useState([])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* 已完成轮次 */}
      {messages.map(m => (
        <ChatBubble key={m.id} role={m.role} content={m.content} timestamp={m.time} />
      ))}

      {/* 流式实时区域 */}
      {state.status !== 'idle' && (
        <div style={{ padding: '0 16px' }}>
          {/* 阶段进度 */}
          {state.stages.length > 0 && (
            <StageTimeline
              stages={state.stages.map(s => ({
                id: s.name,
                label: s.name,
                status: s.state === 'done' ? 'done' : s.state === 'error' ? 'error' : 'active',
              }))}
            />
          )}

          {/* 记忆芯片 */}
          {state.memorySnippets.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
              {state.memorySnippets.map((s, i) => (
                <span key={i} style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 20, padding: '2px 10px',
                  fontSize: 12, color: 'var(--color-text-secondary)',
                }}>
                  [{s.category}] {s.content}
                </span>
              ))}
            </div>
          )}

          {/* 推理过程 */}
          {state.thinkContent && (
            <ThinkBlock
              content={state.thinkContent}
              streaming={!state.thinkDone}
              autoCollapseDelay={1500}
            />
          )}

          {/* AI 正文 */}
          {(state.textContent || state.status === 'streaming') && (
            <ChatBubble
              role="assistant"
              content={state.textContent}
              streaming={state.status === 'streaming' && !state.textContent.length ? false : state.status === 'streaming'}
            />
          )}

          {/* Artifacts */}
          {state.artifactOrder.map(id => {
            const art = state.artifacts[id]
            const type = art.lang === 'html preview' ? 'html'
                       : art.lang === 'mermaid'      ? 'mermaid'
                       : 'code'
            return (
              <ArtifactPanel
                key={id}
                type={type}
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
