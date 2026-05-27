# 接入指南

本文描述第三方应用如何在 **1–2 天内**接入 Meso 平台，跑通首轮流式对话。

---

## 前置条件

- 你有一个能发送 SSE 事件流的后端（任意技术栈）
- 前端使用 React 18+
- 后端按 [SSE 协议规范](./streaming-protocol.md) 发送事件

---

## 步骤 1：安装

```bash
npm install @meso.ai/ui
# 或
yarn add @meso.ai/ui
```

peerDependencies：`react >= 18.0.0`，`react-dom >= 18.0.0`

---

## 步骤 2：引入 CSS Token

在应用入口（`main.tsx` / `_app.tsx`）导入设计 token：

```tsx
import '@meso.ai/ui/tokens.css'
```

**FOUC 防护**（亮/暗主题切换时避免闪烁）—— 放在 HTML `<head>` 最前，token CSS 之前：

```html
<head>
  <script>
    (function() {
      var t = localStorage.getItem('meso-theme') || 'light';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
  <link rel="stylesheet" href="/path/to/tokens.css" />
</head>
```

---

## 步骤 3：三栏布局

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

## 步骤 4：接入 SSE 流

```tsx
import { useSSEStream, MessageList } from '@meso.ai/ui'

function ChatPane() {
  const { state, start, abort, reset } = useSSEStream('https://your-api.com/stream')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    start({
      method: 'POST',
      body: { message: input, session_id: currentSessionId },
      headers: {
        // 鉴权由应用自行注入，平台不假设任何鉴权方式
        Authorization: `Bearer ${token}`,
      },
    })
    setInput('')
  }

  // 流结束后将本轮追加到历史
  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: state.textContent },
      ])
      reset()
    }
  }, [state.status])

  return (
    <div>
      <MessageList
        messages={messages}
        streaming={state}
        emptyState={<p>发送消息开始对话</p>}
      />
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend} disabled={state.status === 'streaming'}>发送</button>
      <button onClick={abort} disabled={state.status !== 'streaming'}>停止</button>
    </div>
  )
}
```

---

## 步骤 5（可选）：渲染扩展事件

如果你的后端发送了业务扩展事件（工具进度、确认门禁等），通过 `renderExtension` 渲染：

```tsx
<MessageList
  messages={messages}
  streaming={state}
  renderExtension={(event) => {
    if (event.payload.name === 'tool_progress') {
      return <ToolProgressCard data={event.payload.data} />
    }
    if (event.payload.name === 'confirm_gate') {
      return <ConfirmGate data={event.payload.data} onConfirm={handleConfirm} />
    }
    return null
  }}
/>
```

详见 [扩展事件指南](./extension-guide.md)。

---

## 输入区（Composer）约定

> **平台立场（normative）**：Meso 不提供 Composer 组件。输入区由应用自行开发，平台仅提供样式 token 支持贴底、最大宽度等布局行为。

**原因**：输入区的工具栏按钮（附件、知识库、Tools 开关）因应用而异，平台提供一个固定实现反而会成为障碍。

**推荐实现模式**：

```tsx
// 应用自绘 Composer，使用平台 CSS token 确保视觉一致
function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')
  return (
    <div className="my-composer">          {/* 应用自定义类名 */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend(text)
            setText('')
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

布局建议：将 Composer 放在 `ThreeColumnLayout` 的 `children` 槽位底部，使用 `position: sticky; bottom: 0` 贴底。

---

## 与常见框架的集成

### Next.js（App Router）

```tsx
// app/layout.tsx
import '@meso.ai/ui/tokens.css'

// app/page.tsx
'use client'
import { useSSEStream } from '@meso.ai/ui'
```

注意：`useSSEStream` 是 React Hook，须在 Client Component 中使用。

### Vite + React

```tsx
// src/main.tsx
import '@meso.ai/ui/tokens.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
```

---

## CORS 与鉴权说明

`useSSEStream` 使用 `fetch + ReadableStream`（非 `EventSource`）。  
第三方须自行处理：

- 后端设置正确的 CORS 响应头（`Access-Control-Allow-Origin`）
- Cookie 跨域场景需在 `start()` 的 `headers` 中传 `Authorization`，或后端允许 `credentials: 'include'`（需在 fetch 层手动注入，当前 Hook 尚不支持 credentials 选项，可传 header 替代）
- 后端须返回 `Content-Type: text/event-stream`

---

## 无 React 使用（Node.js / 测试 / 边缘函数）

```typescript
// 仅使用协议解析和状态机，不依赖 React
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/ui/runtime'

const lines = sseResponseText.split('\n')
const finalState = lines.reduce((state, line) => {
  const event = parseSSELine(line)
  return event ? applyEvent(state, event) : state
}, { ...createInitialStreamState(), status: 'streaming' as const })
```

用途：后端集成测试、验证 SSE 输出是否符合协议、边缘函数预处理。

---

## 步骤 5（可选）：工具调用与确认门

如果你的后端使用 `tool_call` / `tool_result` 标准事件，传入确认回调即可：

```tsx
<MessageList
  messages={messages}
  streaming={state}
  onToolConfirm={(toolCallId) => {
    // 发送确认信号到后端（通过你的 channel）
    fetch('/api/confirm-tool', { method: 'POST', body: JSON.stringify({ toolCallId }) })
  }}
  onToolCancel={(toolCallId) => {
    fetch('/api/cancel-tool', { method: 'POST', body: JSON.stringify({ toolCallId }) })
  }}
/>
```

当 `tool_call` 的 `risk` 为 `"destructive"` 时，平台自动渲染确认门，
用户点击"确认执行"后才调用 `onToolConfirm`。

---

## 验收检查列表

接入完成后，可按以下清单自检：

**基础流式**
- [ ] 发送消息后立即出现 StageTimeline 进度动画
- [ ] Think block 在推理时展开，`done: true` 后自动折叠
- [ ] 文字逐字流入，光标在末尾闪烁
- [ ] Artifact 面板在代码开始流入时弹出
- [ ] `done` 事件后光标消失，状态变为 `done`
- [ ] 点击「停止」后流式中止，状态回到 `idle`

**能力系统（如适用）**
- [ ] `capabilities` 事件后 `state.availableCapabilities` 填充正确
- [ ] `soul` 事件后 SoulIndicator 显示头像 + 特质标签
- [ ] `skill_active` 事件后 SkillIndicator 显示技能名 + 焦点
- [ ] `memory` 事件后记忆 chip 正确显示
- [ ] `memory_saved` 事件后"已记忆"chip 追加在回复底部
- [ ] `tool_call` 事件后 ToolCallBlock 显示 spinner
- [ ] `tool_result` 事件后 ToolCallBlock 更新为 check/error
- [ ] `risk: "destructive"` 工具触发确认门，点击确认后调用 `onToolConfirm`
- [ ] `resource_read` 事件后 ResourceReadBlock 显示 URI + spinner
- [ ] `resource_content` 事件后 ResourceReadBlock 更新为内容可折叠展示

**布局**
- [ ] 亮/暗主题切换后 FOUC 无闪烁
- [ ] 窄屏（≤900px）会话列隐藏，窄屏（≤600px）侧栏自动折叠
