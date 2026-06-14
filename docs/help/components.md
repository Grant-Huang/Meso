# 组件 API 与类型

`@meso.ai/ui` 导出的全部组件、Hook 及 TypeScript 类型。所有组件支持明/暗双主题。

---

## 导入参考

```typescript
// React 组件 + Hook
import {
  ThreeColumnLayout,
  MessageList,
  ChatBubble,
  ThinkBlock,
  StageTimeline,
  ArtifactPanel,
  StreamingCursor,
  WorkflowTimeline,
  ProcessTrace,
  ToolCallBlock,
  ConfirmGate,
  SoulIndicator,
  SkillIndicator,
  ResourceReadBlock,
  StatusIcon,
  LogLine,
  useSSEStream,
  useTheme,
  useFoldState,
} from '@meso.ai/ui'

// 类型（仅类型）
import type {
  Message,
  StreamState,
  ExtensionEvent,
  NavItem,
  StreamOptions,
  StreamCallbacks,
  ArtifactState,
  Stage,
  StageStatus,
  MemorySnippet,
  WorkflowRunState,
  WorkflowNodeRecord,
  WorkflowNodeState,
  PhaseRecord,
  PhaseState,
  ToolCallState,
  SSEEvent,
  ThinkPayload,
  TextPayload,
  StatusIconStatus,
  FoldStateOptions,
  FoldState,
} from '@meso.ai/ui'

// 纯运行时（无 React，可在 Node.js 使用）
import {
  parseSSELine,
  applyEvent,
  createInitialStreamState,
  PROTOCOL_VERSION,
} from '@meso.ai/ui/runtime'
// 或等价地：
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/types'
```

---

## ThreeColumnLayout

三栏应用壳，仅提供槽位，不内置任何业务逻辑。

```tsx
<ThreeColumnLayout
  appName="My App"
  navItems={navItems}
  sessionColumn={<SessionList />}   // 必填，中栏
  sidebarFooter={<UserProfile />}   // 可选，侧栏底部
  mainHeader={<PageTitle />}        // 可选，主区顶部
  defaultCollapsed={false}
>
  <MainContent />
</ThreeColumnLayout>
```

### ThreeColumnLayoutProps

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `appName` | `string` | `'Meso'` | 侧栏顶部品牌名 |
| `navItems` | `NavItem[]` | `[]` | 左侧导航项，由应用完全控制 |
| `sessionColumn` | `ReactNode` | **必填** | 中栏内容（会话列表等）|
| `sidebarFooter` | `ReactNode` | — | 侧栏底部（用户头像、设置按钮等）|
| `mainHeader` | `ReactNode` | — | 主内容区顶部区域 |
| `defaultCollapsed` | `boolean` | `false` | 侧栏初始折叠状态 |
| `children` | `ReactNode` | **必填** | 右侧主内容区 |

### NavItem

```typescript
interface NavItem {
  id:       string
  label:    string
  icon:     React.ReactNode   // 建议 16×16 SVG stroke 图标
  onClick?: () => void
  active?:  boolean           // 高亮当前页
}
```

---

## MessageList

多轮对话渲染组件，合并历史消息与实时流式状态。

```tsx
<MessageList
  messages={messages}
  streaming={state}
  emptyState={<p>发送消息开始对话</p>}
  renderExtension={handler}
  renderLiveTrace={(stream, streaming) => (
    <ProcessTrace stream={stream} streaming={streaming} />
  )}
  onArtifactCopy={text => navigator.clipboard.writeText(text)}
  onArtifactDownload={text => triggerDownload(text)}
/>
```

### MessageListProps

| Prop | 类型 | 说明 |
|------|------|------|
| `messages` | `Message[]` | 完成的历史轮次 |
| `streaming` | `StreamState` | 实时流式状态；`status === 'idle'` 时传 `undefined` 也可 |
| `emptyState` | `ReactNode` | 无消息时的占位内容 |
| `renderExtension` | `(e: ExtensionEvent) => ReactNode \| null` | 扩展事件渲染插槽 |
| `renderLiveTrace` | `(stream: StreamState, streaming: boolean) => ReactNode` | 覆盖默认执行区渲染，可接入 `ProcessTrace` |
| `onArtifactCopy` | `(content: string) => void` | Artifact 复制按钮回调 |
| `onArtifactDownload` | `(content: string) => void` | Artifact 下载按钮回调 |
| `className` | `string` | 自定义 CSS 类名 |

### Message 类型

```typescript
interface Message {
  id:        string
  role:      'user' | 'assistant'
  content:   string           // 支持 Markdown
  timestamp?: string          // 显示在气泡下方（格式由应用决定）
  metadata?:  Record<string, unknown>
}
```

---

## ChatBubble

单条消息气泡，支持 Markdown 渲染和流式光标。

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `role` | `'user' \| 'assistant'` | 必填 | 决定气泡方向和颜色 |
| `content` | `string` | 必填 | 消息文本（Markdown）|
| `streaming` | `boolean` | `false` | `true` 时末尾显示闪烁光标 ▋ |
| `timestamp` | `string` | — | 时间文字，显示在气泡下方 |

---

## ThinkBlock

可折叠推理过程块，支持用户 intent 优先折叠、冻结快照，和多轮重置。

```tsx
<ThinkBlock
  content={state.thinkContent}
  streaming={!state.thinkDone}
  pinnedContent={phase.pinnedThink}   // done 后显示快照
  turnStreaming={isStreaming}          // 轮次结束时重置折叠意图
  autoCollapseDelay={1500}
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `content` | `string` | 必填 | 推理文本（纯文本）|
| `streaming` | `boolean` | `false` | `true` 时末尾显示光标，禁止折叠动画 |
| `autoCollapseDelay` | `number` | `1500` | `streaming` 变 `false` 后多久（ms）自动折叠 |
| `pinnedContent` | `string` | — | （v2.1+）done 后显示此快照而非 `content`，防止 streaming→done 内容闪烁 |
| `turnStreaming` | `boolean` | — | （v2.1+）父轮次 streaming 标志；true→false 转换时重置用户折叠意图 |
| `collapseWhen` | `'done' \| 'never'` | `'done'` | `'never'` 禁用自动折叠（适合在 ProcessTrace 内使用）|
| `defaultOpen` | `boolean` | `true` | 初始展开状态 |
| `open` | `boolean` | — | 受控模式，优先于内部状态 |
| `onOpenChange` | `(open: boolean) => void` | — | 折叠状态变化回调 |
| `label` | `string` | — | 自定义标题文字（默认"思考过程"/"已思考"）|

**折叠行为（userIntent 模式）：**

用户点击始终优先于系统自动折叠。只有当用户未明确操作时，`autoCollapseDelay` 才会生效。`turnStreaming` 在轮次结束时清除用户意图，使下一轮恢复默认。

**`pinnedContent` 用法：**

```tsx
// 后端在 phase done 事件中提供 pinned_think，
// 前端将其作为 pinnedContent 传入，防止 done 后内容重排导致的闪烁
const phase = state.phases['understand']
<ThinkBlock
  content={phase.thinkContent}
  streaming={phase.state === 'running'}
  pinnedContent={phase.pinnedThink}   // 存在则 done 后显示此内容
/>
```

---

## StageTimeline

流水线阶段进度时间轴。

```typescript
type StageStatus = 'pending' | 'active' | 'done'

interface Stage {
  id:     string
  label:  string
  status: StageStatus
}
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `stages` | `Stage[]` | 必填 | 阶段列表 |
| `compact` | `boolean` | `false` | 单行紧凑模式 |

| `status` | 显示 |
|----------|------|
| `'pending'` | 灰色空心圆点 |
| `'active'` | 旋转动画圆点 + accent 色文字 |
| `'done'` | 绿色对号点 + 次要色文字 |
| `'error'` | 红色 × 点 + 错误色文字 |

---

## ProcessTrace

执行过程折叠摘要，聚合 think、phases、memory、resource reads、tool calls 和 workflow，带可展开/折叠的总览 header。

```tsx
<ProcessTrace
  stream={state}
  streaming={isStreaming}
  defaultCollapsed={false}
  onToolConfirm={id => postConfirm(id)}
  onToolCancel={id => postCancel(id)}
  renderPhase={phase =>
    phase.id === 'search' ? <RetrievalResult phase={phase} /> : null
  }
  renderToolCall={tc =>
    tc.call.name === 'web_search' ? <SearchCard tc={tc} /> : null
  }
/>
```

### ProcessTraceProps

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `stream` | `StreamState` | 必填 | 实时或已完成的流状态 |
| `streaming` | `boolean` | `false` | 是否仍在流式；控制 ThinkBlock 光标和摘要 · 动画 |
| `defaultCollapsed` | `boolean` | `false` | 初始折叠状态 |
| `onToolConfirm` | `(id: string) => void` | — | 工具确认回调（转发给 ToolCallBlock）|
| `onToolCancel` | `(id: string) => void` | — | 工具取消回调 |
| `renderPhase` | `(phase: PhaseRecord) => ReactNode` | — | 替换指定 phase 的默认渲染；返回 null/undefined 使用默认 |
| `renderToolCall` | `(toolCall: ToolCallState) => ReactNode` | — | 替换指定 toolCall 的默认 ToolCallBlock；返回 null/undefined 使用默认 |

**自动生成摘要文字示例：**

- `3 阶段 · 5 步` — 有 phases + tool calls
- `2 步 · 1 项失败` — 有失败的 tool call 或 workflow 节点

---

## StatusIcon

状态指示图标原语（v2.1+），供 `LogLine`、自定义执行区等组件复用。

```tsx
import { StatusIcon } from '@meso.ai/ui'
import type { StatusIconStatus } from '@meso.ai/ui'

<StatusIcon status="running" size={16} aria-label="正在执行" />
<StatusIcon status="done" size={14} />
<StatusIcon status="error" />
```

### StatusIconProps

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `status` | `StatusIconStatus` | 必填 | 见下表 |
| `size` | `number` | `16` | 图标尺寸（px），等比缩放 |
| `className` | `string` | — | 自定义 CSS 类名 |
| `aria-label` | `string` | — | 无障碍标签 |

### StatusIconStatus

| 值 | 外观 | 颜色 |
|----|------|------|
| `'running'` | 旋转虚线圆环 + 中心脉冲圆点 | `--color-accent` |
| `'done'` | 实心圆 + 对勾 | `--color-success` |
| `'error'` | 实心圆 + × | `--color-error` |
| `'pending'` | 空心圆 | `--color-text-muted` |
| `'warning'` | 实心圆 + ! | `--color-warning` |

---

## LogLine

内联日志行，展示状态 + 主要文本 + 可选结果标签 + 可折叠详情（v2.1+）。

```tsx
import { LogLine } from '@meso.ai/ui'

// 基础用法
<LogLine status="done" primary="已检索 3 篇文档" outcome="用时 1.2s" />

// 带可展开详情
<LogLine
  status="error"
  primary="调用 web_search 失败"
  outcome="超时"
  detail="Error: connect ETIMEDOUT 8.8.8.8:443\n  at TCPConnectWrap..."
/>

// 运行中
<LogLine status="running" primary="正在分析代码库…" />
```

### LogLineProps

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `status` | `StatusIconStatus` | 必填 | 左侧状态图标 |
| `primary` | `string` | 必填 | 主要描述文字，常显 |
| `outcome` | `string` | — | 行尾结果标签（浅色），如"用时 1.2s"、"3 条结果" |
| `detail` | `string` | — | 展开详情，提供后显示内联折叠箭头；内容以 `<pre>` 等宽渲染 |
| `className` | `string` | — | 自定义 CSS 类名 |

**键盘交互：** 有 `detail` 时，行可聚焦（`role="button"`），`Enter`/`Space` 展开/折叠。

**典型场景：**

```tsx
// 渲染 tool_call 的轻量版（不需要 ConfirmGate 时）
{state.toolCallOrder.map(id => {
  const tc = state.toolCalls[id]
  const statusMap = {
    pending: 'running', done: 'done', error: 'error', awaiting_confirm: 'warning',
  } as const
  return (
    <LogLine
      key={id}
      status={statusMap[tc.status]}
      primary={tc.call.name}
      outcome={tc.result ? '完成' : undefined}
      detail={tc.result?.content}
    />
  )
})}
```

---

## ArtifactPanel

代码 / HTML 预览 / Mermaid 图表面板，含复制和下载按钮。

| Prop | 类型 | 说明 |
|------|------|------|
| `type` | `'code' \| 'html' \| 'mermaid'` | 渲染方式 |
| `content` | `string` | 内容文本 |
| `language` | `string` | 代码语言（`type='code'` 时用于语法高亮）|
| `streaming` | `boolean` | `true` 时显示"生成中"标识，禁止图表渲染 |
| `onCopy` | `(content: string) => void` | 复制按钮回调 |
| `onDownload` | `(content: string) => void` | 自定义下载回调 |

---

## WorkflowTimeline

DAG 工作流可观测性组件，将 `workflow_node` 事件流渲染为带深度缩进的树形节点列表。

```tsx
import { WorkflowTimeline } from '@meso.ai/ui'

<WorkflowTimeline
  runs={Object.values(state.workflowRuns)}
  showRunId={state.workflowRunOrder.length > 1}
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `runs` | `WorkflowRunState[]` | 必填 | 工作流运行列表，来自 `state.workflowRuns` |
| `showRunId` | `boolean` | `true` | 多 run 时是否显示 run_id 标签 |

---

## ToolCallBlock

展示单个工具调用的调用参数与执行结果，支持 `awaiting_confirm` 状态。

```tsx
{state.toolCallOrder.map(id => (
  <ToolCallBlock
    key={id}
    toolCall={state.toolCalls[id]}
    onConfirm={id => postConfirm(id)}
    onCancel={id => postCancel(id)}
  />
))}
```

| Prop | 类型 | 说明 |
|------|------|------|
| `toolCall` | `ToolCallState` | 来自 `state.toolCalls[id]` |
| `onConfirm` | `(id: string) => void` | 用户批准时回调（awaiting_confirm 状态） |
| `onCancel` | `(id: string) => void` | 用户拒绝时回调 |

### ToolCallState 类型

```typescript
interface ToolCallState {
  call:      ToolCallPayload
  result?:   ToolResultPayload
  status:    'pending' | 'done' | 'error' | 'awaiting_confirm'
  groupId?:  string   // 来自 call.groupId，提升到顶层方便过滤
  groupKind?: string  // 来自 call.groupKind
}
```

---

## ConfirmGate

危险操作的独立确认弹层，按 `risk` 字段渲染不同样式（safe / write / destructive）。

```tsx
<ConfirmGate
  toolCall={pendingCall}
  onConfirm={id => postConfirm(id)}
  onCancel={id => postCancel(id)}
/>
```

---

## SoulIndicator / SkillIndicator

```tsx
{state.activeSoul  && <SoulIndicator  soul={state.activeSoul}  compact={false} />}
{state.activeSkill && <SkillIndicator skill={state.activeSkill} />}
```

| Prop（SoulIndicator） | 类型 | 默认 | 说明 |
|----------------------|------|------|------|
| `soul` | `SoulPayload` | 必填 | 来自 `state.activeSoul` |
| `compact` | `boolean` | `false` | 紧凑模式：仅显示头像 |

---

## ResourceReadBlock

展示单个 MCP 资源读取的 URI、内容（可折叠）和状态。

```tsx
{state.resourceReadOrder.map(id => (
  <ResourceReadBlock key={id} resourceRead={state.resourceReads[id]} />
))}
```

---

## useSSEStream

核心流式请求 Hook。

```typescript
const { state, start, abort, reset } = useSSEStream(url: string, callbacks?: StreamCallbacks)
```

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `state` | `StreamState` | 当前流式状态 |
| `start(options?)` | `(options?: StreamOptions) => void` | 发起请求，自动重置状态 |
| `abort()` | `() => void` | 中止当前流，状态变 `idle` |
| `reset()` | `() => void` | 重置所有状态到 `idle` 初始值 |

### StreamOptions

```typescript
interface StreamOptions {
  method?:      'GET' | 'POST'              // 默认：有 body 时 POST，否则 GET
  headers?:     Record<string, string>      // Authorization 等
  body?:        Record<string, unknown>     // POST body，自动序列化为 JSON
  watchdogMs?:  number | null              // （v2.1+）无数据超时（ms），默认 120000；null 禁用
}
```

**`watchdogMs` 说明（v2.1+）：**

默认 120 秒内未收到任何 SSE 数据，流自动中止并置为 `error` 状态，`onError` 回调收到 `code: 'WATCHDOG_TIMEOUT'`。

```typescript
// 对话场景：延长到 3 分钟
start({ watchdogMs: 180_000 })

// 关键操作：10 秒超时
start({ watchdogMs: 10_000 })

// 禁用（后台任务）
start({ watchdogMs: null })
```

### StreamCallbacks

```typescript
interface StreamCallbacks {
  onCapabilities?:   (capabilities: CapabilitiesPayload) => void
  onPhaseChange?:    (phase: PhasePayload) => void
  onMemoryRecalled?: (snippets: MemorySnippet[]) => void
  onMemorySaved?:    (saved: MemorySavedPayload) => void
  onSoulActivated?:  (soul: SoulPayload) => void
  onSkillActivated?: (skill: SkillPayload) => void
  onToolCall?:       (call: ToolCallPayload) => void
  onToolResult?:     (result: ToolResultPayload) => void
  onResourceRead?:   (read: ResourceReadPayload) => void
  onResourceContent?:(content: ResourceContentPayload) => void
  onArtifact?:       (artifact: ArtifactState) => void
  onExtensionEvent?: (event: ExtensionEvent) => void
  onError?:          (message: string, code?: string) => void
  onDone?:           (finalState: StreamState) => void
}
```

---

## useTheme

```typescript
const { theme, toggle } = useTheme()
// theme: 'light' | 'dark'
// toggle(): 切换并持久化到 localStorage（key: 'meso-theme'）
```

---

## useFoldState

管理折叠状态的 Hook（v2.1+），实现 userIntent 优先模式：用户点击永远优先于系统自动行为。

```typescript
import { useFoldState } from '@meso.ai/ui'
import type { FoldStateOptions, FoldState } from '@meso.ai/ui'

const { open, setOpen, toggle, clearIntent, hasUserIntent } = useFoldState({
  system: isStreaming,          // 系统默认状态（如流式时展开）
  resetOnTurnStart: true,       // 新轮次开始时清除用户意图
})
```

### FoldStateOptions

```typescript
interface FoldStateOptions {
  system:             boolean   // 系统默认展开/折叠状态
  resetOnTurnStart?:  boolean   // true：system false→true 时重置 userIntent（默认 false）
}
```

### FoldState

```typescript
interface FoldState {
  open:         boolean             // 当前展开状态（userIntent ?? system）
  setOpen:      (v: boolean) => void  // 设置用户意图
  toggle:       () => void          // 切换并记录用户意图
  clearIntent:  () => void          // 清除用户意图，回归系统默认
  hasUserIntent: boolean            // 用户是否有明确意图
}
```

**原理：**

```
open = userIntent !== null ? userIntent : system
```

`userIntent` 默认为 `null`（跟随系统）。用户点击后设为 `true`/`false`，之后系统状态变化不再覆盖用户选择。`resetOnTurnStart` 在新一轮开始时清除意图，让下一轮回到系统默认。

---

## StreamingCursor

```tsx
<StreamingCursor active={state.status === 'streaming'} />
```

`MessageList` 内部已使用，通常不需要单独引用。

---

## 完整 StreamState 类型

```typescript
interface StreamState {
  status:         'idle' | 'streaming' | 'done' | 'error'

  // 能力上下文
  availableCapabilities: CapabilitiesPayload | null
  activeSoul:            SoulPayload | null
  activeSkill:           SkillPayload | null

  // 阶段进度
  stages:         StagePayload[]

  // 一级流水线阶段（v2.1+）
  phases:         Record<string, PhaseRecord>
  phaseOrder:     string[]

  // 记忆
  memorySnippets: MemorySnippet[]
  memorySaved:    MemorySavedPayload[]

  // 工具调用 & 资源读取
  toolCalls:         Record<string, ToolCallState>
  toolCallOrder:     string[]
  resourceReads:     Record<string, ResourceReadState>
  resourceReadOrder: string[]

  // LLM 输出
  thinkContent:  string
  thinkDone:     boolean
  textContent:   string
  artifacts:     Record<string, ArtifactState>
  artifactOrder: string[]

  // 工作流节点
  workflowRuns:     Record<string, WorkflowRunState>
  workflowRunOrder: string[]

  // 扩展事件
  extensions:   Record<string, ExtensionEvent[]>
  extensionLog: ExtensionEvent[]

  errorMessage: string | null
}
```

### PhaseRecord（v2.1+）

```typescript
interface PhaseRecord {
  id:           string
  name:         string
  state:        'pending' | 'running' | 'done' | 'error'
  thinkContent: string          // 该阶段的 think 流累积内容
  pinnedThink?: string          // done 时后端提供的冻结快照
  body?:        string          // 结构化产出（JSON 字符串）
  startedAt?:   number          // ms 时间戳
  endedAt?:     number
}
```

---

## 纯运行时函数（@meso.ai/types）

可在 Node.js / 测试 / 边缘函数中使用，无 React 依赖：

```typescript
import { parseSSELine, applyEvent, createInitialStreamState, PROTOCOL_VERSION } from '@meso.ai/types'

// PROTOCOL_VERSION = "1.0"

const initial = createInitialStreamState()
// → { status:'idle', stages:[], phaseOrder:[], phases:{}, thinkContent:'', ... }

const event = parseSSELine('data: {"type":"text","schema_version":"1.0","payload":{"delta":"hi"}}')
const nextState = applyEvent({ ...initial, status:'streaming' }, event)
```

完整使用场景见 [测试与调试](#testing)。
