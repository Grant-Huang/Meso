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
  ToolCallBlock,
  ConfirmGate,
  SoulIndicator,
  SkillIndicator,
  ResourceReadBlock,
  useSSEStream,
  useTheme,
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
  SSEEvent,
  ThinkPayload,
  TextPayload,
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
| `renderExtension` | `(e: ExtensionEvent) => ReactNode \| null` | 扩展事件渲染插槽，按 `extensionLog` 顺序调用 |
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
  metadata?:  Record<string, unknown>  // 应用自定义字段，平台不解析
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

可折叠推理过程块。

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `content` | `string` | 必填 | 推理文本（纯文本）|
| `streaming` | `boolean` | `false` | `true` 时末尾显示光标，禁止折叠动画 |
| `autoCollapseDelay` | `number` | `1500` | `streaming` 变 `false` 后多久（ms）自动折叠 |

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

每个节点展示名称、耗时，有 `metadata` 时显示展开按钮。节点状态：

| `state` | 显示 |
|---------|------|
| `'active'` | 旋转动画圆点（accent 色） |
| `'done'` | 绿色对号圆点 |
| `'error'` | 红色 × 圆点 |
| `'skipped'` | 短横线圆点（次要色） |

---

## ToolCallBlock

展示单个工具调用的调用参数与执行结果，支持 `awaiting_confirm` 状态。

```tsx
import { ToolCallBlock } from '@meso.ai/ui'

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

---

## ConfirmGate

危险操作的独立确认弹层，按 `risk` 字段渲染不同样式（safe / write / destructive）。

```tsx
import { ConfirmGate } from '@meso.ai/ui'

<ConfirmGate
  toolCall={pendingCall}
  onConfirm={id => postConfirm(id)}
  onCancel={id => postCancel(id)}
/>
```

| Prop | 类型 | 说明 |
|------|------|------|
| `toolCall` | `ToolCallPayload` | 待确认的工具调用 |
| `onConfirm` | `(id: string) => void` | 用户确认时回调 |
| `onCancel` | `(id: string) => void` | 用户取消时回调 |

---

## SoulIndicator

展示当前激活的 Soul（人格/角色）信息。

```tsx
import { SoulIndicator } from '@meso.ai/ui'

{state.activeSoul && (
  <SoulIndicator soul={state.activeSoul} compact={false} />
)}
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `soul` | `SoulPayload` | 必填 | 来自 `state.activeSoul` |
| `compact` | `boolean` | `false` | 紧凑模式：仅显示头像，不显示名称和特征 |

---

## SkillIndicator

展示当前激活的 Skill（操作模式）信息。

```tsx
import { SkillIndicator } from '@meso.ai/ui'

{state.activeSkill && (
  <SkillIndicator skill={state.activeSkill} />
)}
```

| Prop | 类型 | 说明 |
|------|------|------|
| `skill` | `SkillPayload` | 来自 `state.activeSkill` |

---

## ResourceReadBlock

展示单个 MCP 资源读取的 URI、内容（可折叠）和状态。

```tsx
import { ResourceReadBlock } from '@meso.ai/ui'

{state.resourceReadOrder.map(id => (
  <ResourceReadBlock key={id} resourceRead={state.resourceReads[id]} />
))}
```

| Prop | 类型 | 说明 |
|------|------|------|
| `resourceRead` | `ResourceReadState` | 来自 `state.resourceReads[id]` |

---

## useSSEStream

核心流式请求 Hook。

```typescript
const { state, start, abort, reset } = useSSEStream(url: string, callbacks?: StreamCallbacks)
```

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `state` | `StreamState` | 当前流式状态（见 [流式 UI](#streaming) 中的完整字段说明）|
| `start(options?)` | `(options?: StreamOptions) => void` | 发起请求，自动重置状态 |
| `abort()` | `() => void` | 中止当前流，状态变 `idle` |
| `reset()` | `() => void` | 重置所有状态到 `idle` 初始值 |

### StreamOptions

```typescript
interface StreamOptions {
  method?:  'GET' | 'POST'              // 默认：有 body 时 POST，否则 GET
  headers?: Record<string, string>      // 自定义请求头（Authorization 等）
  body?:    Record<string, unknown>     // POST body，自动序列化为 JSON
}
```

### StreamCallbacks

可选的第二参数，用于在事件到达时触发副作用（日志、分析、通知等），不影响状态更新。

```typescript
interface StreamCallbacks {
  onCapabilities?:   (capabilities: CapabilitiesPayload) => void
  onStageChange?:    (stage: StagePayload) => void
  onMemoryRecalled?: (snippets: MemorySnippet[]) => void
  onMemorySaved?:    (saved: MemorySavedPayload) => void
  onSoulActivated?:  (soul: SoulPayload) => void
  onSkillActivated?: (skill: SkillPayload) => void
  onToolCall?:       (call: ToolCallPayload) => void
  onToolResult?:     (result: ToolResultPayload) => void
  onResourceRead?:   (read: ResourceReadPayload) => void
  onResourceContent?:(content: ResourceContentPayload) => void
  onArtifact?:       (artifact: ArtifactState) => void
  onError?:          (message: string, code?: string) => void
  onDone?:           (finalState: StreamState) => void
}
```

---

## useTheme

主题管理 Hook。

```typescript
const { theme, toggle } = useTheme()
// theme: 'light' | 'dark'
// toggle(): 切换并持久化到 localStorage（key: 'meso-theme'）
```

---

## StreamingCursor

独立流式光标组件（`MessageList` 内部已使用，通常不需要单独引用）。

```tsx
<StreamingCursor active={state.status === 'streaming'} />
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `active` | `boolean` | `false` | `true` 时显示闪烁动画 |

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
  stages:         Stage[]

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

interface ArtifactState {
  id:       string
  lang:     string
  content:  string
  done:     boolean
}

interface MemorySnippet {
  category: string
  content:  string
}
```

---

## 纯运行时函数（@meso.ai/types）

可在 Node.js / 测试 / 边缘函数中使用，无 React 依赖：

```typescript
import { parseSSELine, applyEvent, createInitialStreamState, PROTOCOL_VERSION } from '@meso.ai/types'

// PROTOCOL_VERSION = "1.0"

// 创建初始状态
const initial = createInitialStreamState()
// → { status:'idle', stages:[], memorySnippets:[], thinkContent:'', ... }

// 解析一行 SSE 文本
const event = parseSSELine('data: {"type":"text","schema_version":"1.0","payload":{"delta":"hi"}}')
// → { type:'text', schema_version:'1.0', payload:{ delta:'hi' } }

// 应用事件到状态（纯函数，不修改原状态）
const nextState = applyEvent({ ...initial, status:'streaming' }, event)
// → { ..., textContent:'hi' }
```

使用场景见 [测试与调试](#testing)。
