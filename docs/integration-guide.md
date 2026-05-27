# 接入指南

本文描述第三方应用如何在 **1–2 天内**接入 Meso 平台，跑通首轮流式对话。

---

## 前置条件

- 前端使用 React 18+
- 后端能发送 SSE 事件流（任意技术栈）
- 后端按 [SSE 协议规范](./streaming-protocol.md) 格式发送事件

---

## 步骤 1：安装

```bash
npm install @meso.ai/ui @meso.ai/types
# 或
pnpm add @meso.ai/ui @meso.ai/types
```

`@meso.ai/types` 提供完整协议 TypeScript 类型；`@meso.ai/ui` 依赖它作为 peerDependency，两个包需同时安装。

---

## 步骤 2：引入 CSS

在应用入口（`main.tsx` / `_app.tsx`）导入设计 token 和组件样式：

```tsx
import '@meso.ai/ui/tokens.css'  // 设计 token（CSS 变量，亮/暗主题）— 必须
import '@meso.ai/ui/style.css'   // 所有组件样式 — 必须
```

不要写死内部路径 `node_modules/@meso.ai/ui/dist/style.css`，这不受 SemVer 保护。

**FOUC 防护**（亮/暗主题切换时避免闪烁）—— 放在 HTML `<head>` 最前、CSS 之前：

```html
<head>
  <script>
    (function() {
      var t = localStorage.getItem('meso-theme') || 'light';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
</head>
```

---

## 步骤 3：版本兼容性检查（推荐）

在 transport 边界加版本校验，确保后端协议与 SDK 版本匹配：

```tsx
import { isCompatibleVersion } from '@meso.ai/ui'

// 每条 SSE 事件解析后调用（开销极低）
if (!isCompatibleVersion(event)) {
  console.warn('Meso protocol version mismatch, skipping event')
  return
}
```

开发 / 测试环境可改用严格模式，不兼容时直接抛出：

```tsx
import { assertCompatibleVersion } from '@meso.ai/ui'
assertCompatibleVersion(event)  // throws: "Meso protocol version mismatch: ..."
```

---

## 步骤 4：三栏布局

```tsx
import { ThreeColumnLayout } from '@meso.ai/ui'

function App() {
  return (
    <ThreeColumnLayout
      appName="My App"
      navItems={[
        {
          id: 'chat',
          icon: <MessageIcon />,
          label: '对话',
          onClick: () => setPage('chat'),
        },
      ]}
      sessionColumn={<SessionList />}  // 可选
    >
      {/* 主内容区 */}
    </ThreeColumnLayout>
  )
}
```

导航项、会话列、Logo、页脚均由应用提供，平台只提供布局壳。

---

## 步骤 5：接入 SSE 流

```tsx
import { useSSEStream, MessageList } from '@meso.ai/ui'
import type { Message } from '@meso.ai/ui'

function ChatPane() {
  const { state, start, abort, reset } = useSSEStream('https://your-api.com/stream')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    // 先追加用户消息
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(), role: 'user', content: input,
    }])
    // 发起流请求（鉴权 header 由应用注入，平台不假设任何鉴权方式）
    start({
      method: 'POST',
      body: { message: input, session_id: currentSessionId },
      headers: { Authorization: `Bearer ${token}` },
    })
    setInput('')
  }

  // 流结束后将本轮追加到历史
  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', content: state.textContent,
      }])
      reset()
    }
  }, [state.status])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <MessageList
          messages={messages}
          streaming={state.status !== 'idle' ? state : undefined}
          emptyState={<p>发送消息开始对话</p>}
        />
      </div>
      <div style={{ padding: 16 }}>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button onClick={handleSend} disabled={state.status === 'streaming'}>发送</button>
        <button onClick={abort}      disabled={state.status !== 'streaming'}>停止</button>
      </div>
    </div>
  )
}
```

---

## 步骤 6（可选）：Stage 进度桥接

如果你的后端发 `stage` 事件，可用 `stagePayloadToStage` 将协议 payload 转换为 `StageTimeline` 所需类型，避免手写映射：

```tsx
import { stagePayloadToStage } from '@meso.ai/ui'
import { StageTimeline } from '@meso.ai/ui'

// state.stages 由 useSSEStream 自动维护，无需手动转换
// 若需要独立渲染 StageTimeline：
const stages = stagePayloads.map((p, i) => stagePayloadToStage(p, `stage-${i}`))
<StageTimeline stages={stages} />
```

---

## 步骤 7（可选）：工具调用与确认门

如果后端使用 `tool_call` / `tool_result` 标准事件，传入确认回调即可：

```tsx
<MessageList
  messages={messages}
  streaming={state.status !== 'idle' ? state : undefined}
  onToolConfirm={(toolCallId) => {
    fetch('/api/confirm-tool', { method: 'POST', body: JSON.stringify({ toolCallId }) })
  }}
  onToolCancel={(toolCallId) => {
    fetch('/api/cancel-tool', { method: 'POST', body: JSON.stringify({ toolCallId }) })
  }}
/>
```

当 `tool_call` 的 `risk` 为 `"destructive"` 时，平台自动渲染确认门，用户点击"确认执行"后才调用 `onToolConfirm`。

---

## 步骤 8（可选）：扩展事件

如果后端发送业务扩展事件（工具进度、自定义卡片等），通过 `renderExtension` 渲染：

```tsx
<MessageList
  messages={messages}
  streaming={state.status !== 'idle' ? state : undefined}
  renderExtension={(event) => {
    if (event.payload.name === 'tool_progress') {
      return <ToolProgressCard data={event.payload.data} />
    }
    return null
  }}
/>
```

详见 [扩展事件指南](./extension-guide.md)。

---

## 输入区（Composer）约定

> **平台立场**：Meso 不提供 Composer 组件。输入区由应用自行开发，平台提供 CSS token 支持视觉一致。

**原因**：输入区的工具栏按钮（附件、知识库、Tools 开关）因应用而异，平台提供固定实现反而成为障碍。

**推荐实现模式**：

```tsx
function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')
  return (
    <div style={{
      position: 'sticky', bottom: 0,
      background: 'var(--color-bg-white)',
      borderTop: '1px solid var(--color-border)',
      padding: 12,
    }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); onSend(text); setText('')
          }
        }}
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-white)' }}
      />
      <button
        onClick={() => { onSend(text); setText('') }}
        disabled={disabled}
        style={{ background: 'var(--color-accent)', color: '#fff' }}
      >
        发送
      </button>
    </div>
  )
}
```

---

## 与常见框架集成

### Next.js（App Router）

```tsx
// app/layout.tsx
import '@meso.ai/ui/tokens.css'
import '@meso.ai/ui/style.css'

// app/chat/page.tsx
'use client'  // useSSEStream 是 React Hook，须在 Client Component 中使用
import { useSSEStream, MessageList } from '@meso.ai/ui'
```

### Vite + React

```tsx
// src/main.tsx
import '@meso.ai/ui/tokens.css'
import '@meso.ai/ui/style.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
```

---

## 无 React 使用（Node.js / 测试 / 边缘函数）

```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/ui/runtime'

const lines = sseResponseText.split('\n')
const finalState = lines.reduce((state, line) => {
  const event = parseSSELine(line)
  return event ? applyEvent(state, event) : state
}, { ...createInitialStreamState(), status: 'streaming' as const })
```

用途：后端集成测试、验证 SSE 输出是否符合协议、边缘函数预处理。

---

## CORS 与鉴权说明

`useSSEStream` 使用 `fetch + ReadableStream`（非原生 `EventSource`）。第三方须自行处理：

- 后端返回 `Content-Type: text/event-stream`
- 后端设置正确的 CORS 响应头（`Access-Control-Allow-Origin`）
- Cookie 跨域场景通过 `start()` 的 `headers` 传 `Authorization`

---

## 验收检查列表

接入完成后按以下清单自检：

**基础流式**
- [ ] 发送消息后立即出现 StageTimeline 进度动画
- [ ] ThinkBlock 在推理时展开，`done: true` 后自动折叠
- [ ] 文字逐字流入，光标在末尾闪烁
- [ ] ArtifactPanel 在代码开始流入时弹出
- [ ] `done` 事件后光标消失，状态变为 `done`
- [ ] 点击「停止」后流式中止，状态回到 `idle`

**能力系统（如适用）**
- [ ] `soul` 事件后 SoulIndicator 显示头像 + 特质标签
- [ ] `skill_active` 事件后 SkillIndicator 显示技能名 + 焦点
- [ ] `memory` 事件后记忆 chip 正确显示
- [ ] `tool_call` 事件后 ToolCallBlock 显示 spinner
- [ ] `tool_result` 事件后 ToolCallBlock 更新为 check / error
- [ ] `risk: "destructive"` 工具触发确认门，点击确认后调用 `onToolConfirm`
- [ ] `resource_read` 后 ResourceReadBlock 显示 URI + spinner
- [ ] `resource_content` 后 ResourceReadBlock 更新为内容可折叠展示
- [ ] `workflow_node` 事件后 WorkflowTimeline 节点状态正确更新

**布局与主题**
- [ ] 亮/暗主题切换后无 FOUC 闪烁
- [ ] 窄屏（≤ 900px）会话列隐藏，窄屏（≤ 600px）侧栏自动折叠
- [ ] `schema_version` 不匹配时 `isCompatibleVersion` 返回 false，事件被跳过
