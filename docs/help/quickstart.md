# 快速接入

从安装到跑通首轮流式对话，预计 **1–2 天**。

---

## 步骤一：安装

```bash
npm install @meso/ui
# 或
yarn add @meso/ui
```

peerDependencies：`react >= 18`，`react-dom >= 18`

---

## 步骤二：引入 CSS Token + FOUC 防护

> FOUC（Flash of Unstyled Content）是主题切换时出现的短暂闪烁，必须在 HTML head 最顶部放置防护脚本来消除。

**`index.html`**（Vite 项目）：

```html
<head>
  <!-- 1. FOUC 防护脚本：必须在所有 CSS 之前 -->
  <script>
    (function(){
      var t = localStorage.getItem('meso-theme') || 'light';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>

  <!-- 2. 其余 head 内容 -->
</head>
```

**`main.tsx`**（Vite 项目在 JS 中引入 CSS）：

```tsx
import '@meso/ui/tokens.css'   // 设计 token，全局引入一次
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

完整的 token 说明和主题系统见 [设计系统](#tokens)。

---

## 步骤三：三栏布局

```tsx
// App.tsx
import { ThreeColumnLayout, useTheme } from '@meso/ui'

export function App() {
  const { theme, toggle } = useTheme()
  const [page, setPage] = useState('chat')

  return (
    <ThreeColumnLayout
      appName="My App"
      navItems={[
        {
          id: 'chat',
          label: '对话',
          icon: <ChatIcon />,
          onClick: () => setPage('chat'),
          active: page === 'chat',
        },
      ]}
      sessionColumn={<SessionList />}   // 中栏，可选
      footerSlot={<UserProfile />}      // 侧栏底部，可选
    >
      {page === 'chat' && <ChatPage />}
    </ThreeColumnLayout>
  )
}
```

布局详细规范见 [布局规范](#layout)。

---

## 步骤四：接入 SSE 流

```tsx
// ChatPage.tsx
import { useSSEStream, MessageList } from '@meso/ui'
import { useState, useEffect } from 'react'

export function ChatPage() {
  const { state, start, abort, reset } = useSSEStream('https://your-backend/stream')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || state.status === 'streaming') return
    // 将用户消息加入历史
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: input }])
    // 发起 SSE 请求
    start({
      method: 'POST',
      body: { message: input, session_id: currentSessionId },
      headers: { Authorization: `Bearer ${token}` },
    })
    setInput('')
  }

  // 流结束后将 AI 回复追加到历史
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <MessageList
        messages={messages}
        streaming={state}
        emptyState={<p style={{ textAlign:'center', color:'var(--color-text-muted)' }}>发送消息开始对话</p>}
      />

      {/* Composer — 平台不提供，由应用自行实现 */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
          placeholder="输入消息… (Enter 发送，Shift+Enter 换行)"
          rows={3}
          style={{
            width: '100%', resize: 'none',
            border: '1px solid var(--color-border)', borderRadius: 8,
            padding: '8px 12px',
            background: 'var(--color-bg-white)', color: 'var(--color-text)',
            fontFamily: 'inherit', fontSize: 14,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={handleSend}
            disabled={state.status === 'streaming'}
            style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}
          >
            {state.status === 'streaming' ? '生成中…' : '发送'}
          </button>
          {state.status === 'streaming' && (
            <button
              onClick={abort}
              style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', background: 'transparent', color: 'var(--color-text)' }}
            >
              停止
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 步骤五：后端发送 SSE

后端用任何语言实现，只需遵守 [SSE 协议 v1.0](#protocol) 格式：

```python
# Python / FastAPI 示例（non-normative）
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json, asyncio

app = FastAPI()

@app.post("/stream")
async def stream_endpoint(body: dict):
    async def generate():
        # 1. 阶段进度
        yield sse({"type":"stage","schema_version":"1.0",
                   "payload":{"name":"分析中","state":"active"}})
        await asyncio.sleep(0.1)

        # 2. 推理过程（可选）
        yield sse({"type":"think","schema_version":"1.0",
                   "payload":{"delta":"用户问的是…","done":False}})
        yield sse({"type":"think","schema_version":"1.0",
                   "payload":{"delta":"","done":True}})

        # 3. 正文流式输出
        for chunk in llm_stream(body["message"]):
            yield sse({"type":"text","schema_version":"1.0",
                       "payload":{"delta":chunk}})

        # 4. 完成
        yield sse({"type":"stage","schema_version":"1.0",
                   "payload":{"name":"分析中","state":"done"}})
        yield sse({"type":"done","schema_version":"1.0","payload":{}})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )

def sse(obj):
    return f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"
```

> **CORS**：后端需设置 `Access-Control-Allow-Origin`。`useSSEStream` 使用 `fetch + ReadableStream`（非 `EventSource`），鉴权通过 `headers` 传入，不依赖 Cookie。

---

## Next.js App Router

```tsx
// app/layout.tsx
import '@meso/ui/tokens.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* FOUC 防护脚本必须在 CSS 加载前执行 */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){var t=localStorage.getItem('meso-theme')||'light';document.documentElement.setAttribute('data-theme',t);})()`
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

```tsx
// app/chat/page.tsx
'use client'   // ← useSSEStream 是 React Hook，必须在 Client Component 中使用
import { useSSEStream, MessageList } from '@meso/ui'
```
