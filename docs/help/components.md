# 组件 API 与类型

`@meso/ui` 导出的全部组件、Hook 及 TypeScript 类型。所有组件支持明/暗双主题。

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
  useSSEStream,
  useTheme,
} from '@meso/ui'

// 类型（仅类型）
import type {
  Message,
  StreamState,
  ExtensionEvent,
  NavItem,
  StreamOptions,
  ArtifactState,
  StageItem,
  MemorySnippet,
  SSEEvent,
  ThinkPayload,
  TextPayload,
} from '@meso/ui'

// 纯运行时（无 React，可在 Node.js 使用）
import {
  parseSSELine,
  applyEvent,
  createInitialStreamState,
  PROTOCOL_VERSION,
} from '@meso/ui/runtime'
// 或等价地：
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso/types'
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
interface StageItem {
  id:     string
  label:  string
  status: 'pending' | 'active' | 'done' | 'error'
}
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `stages` | `StageItem[]` | 必填 | 阶段列表 |
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

## useSSEStream

核心流式请求 Hook。

```typescript
const { state, start, abort, reset } = useSSEStream(url: string)
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
  stages:         StageItem[]
  memorySnippets: MemorySnippet[]
  thinkContent:   string
  thinkDone:      boolean
  textContent:    string
  artifacts:      Record<string, ArtifactState>
  artifactOrder:  string[]
  extensions:     Record<string, ExtensionEvent[]>
  extensionLog:   ExtensionEvent[]
  errorMessage:   string | null
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

## 纯运行时函数（@meso/types）

可在 Node.js / 测试 / 边缘函数中使用，无 React 依赖：

```typescript
import { parseSSELine, applyEvent, createInitialStreamState, PROTOCOL_VERSION } from '@meso/types'

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
