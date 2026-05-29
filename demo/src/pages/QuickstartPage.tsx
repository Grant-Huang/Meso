/**
 * 快速接入示例页
 *
 * 展示消费方用最少代码完成 Meso 接入的完整模式：
 * 安装 → 引入样式 → useSSEStream → MessageList → Composer
 *
 * 这个页面本身就是一个可运行的最小接入示例。
 */
import { useSSEStream, MessageList } from '@meso.ai/ui'
import type { Message } from '@meso.ai/ui'
import { useState, useEffect, useRef } from 'react'

const CODE_INSTALL = `npm install @meso.ai/ui @meso.ai/types`

const CODE_STYLES = `// main.tsx
import '@meso.ai/ui/tokens.css'
import '@meso.ai/ui/style.css'`

const CODE_HOOK = `import { useSSEStream, MessageList } from '@meso.ai/ui'
import type { Message } from '@meso.ai/ui'
import { useState, useEffect } from 'react'

function ChatPane() {
  const { state, start, abort, reset } = useSSEStream('https://your-api/stream')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', content: state.textContent,
      }])
      reset()
    }
  }, [state.status])

  const send = () => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: input }])
    start({ method: 'POST', body: { message: input } })
    setInput('')
  }

  return (
    <>
      <MessageList
        messages={messages}
        streaming={state.status !== 'idle' ? state : undefined}
      />
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={send}  disabled={state.status === 'streaming'}>发送</button>
      <button onClick={abort} disabled={state.status !== 'streaming'}>停止</button>
    </>
  )
}`

const CODE_VERSION = `import { isCompatibleVersion } from '@meso.ai/ui'

// 在 transport 边界加版本校验（推荐）
if (!isCompatibleVersion(event)) return`

const CODE_BACKEND = `# Python / FastAPI 后端最小示例
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json, asyncio

app = FastAPI()

async def event_stream(message: str):
    def sse(type: str, payload: dict) -> str:
        return f'data: {json.dumps({"type": type, "schema_version": "1.0", "payload": payload})}\\n\\n'

    yield sse("stage", {"name": "处理中", "state": "active"})
    await asyncio.sleep(0.3)
    yield sse("stage", {"name": "处理中", "state": "done"})

    yield sse("think", {"delta": "用户问：" + message, "done": True})

    response = "这是来自后端的回复。"
    for char in response:
        yield sse("text", {"delta": char})
        await asyncio.sleep(0.05)

    yield sse("done", {})

@app.post("/stream")
async def stream(body: dict):
    return StreamingResponse(
        event_stream(body.get("message", "")),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )`

export function QuickstartPage() {
  // Live demo: connects to the mock stream in this demo app
  const { state, start, abort, reset } = useSSEStream('/api/mock-stream')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: state.textContent,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
      reset()
    }
  }, [state.status, state.textContent, reset])

  const send = () => {
    const text = input.trim()
    if (!text || state.status === 'streaming') return
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(), role: 'user', content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }])
    start({ method: 'POST', body: { message: text } })
    setInput('')
  }

  const section = (title: string, desc: string) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{desc}</div>
    </div>
  )

  const codeBlock = (code: string) => (
    <pre style={{
      background: 'var(--color-code-bg)',
      color: 'var(--color-code-text)',
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 12,
      lineHeight: 1.6,
      overflowX: 'auto',
      margin: '8px 0 24px',
      border: '1px solid var(--color-border)',
    }}><code>{code}</code></pre>
  )

  const badge = (label: string, color = 'var(--color-accent)') => (
    <span style={{
      background: color,
      color: '#fff',
      borderRadius: 4,
      padding: '1px 7px',
      fontSize: 11,
      fontWeight: 600,
      marginRight: 8,
    }}>{label}</span>
  )

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: guide */}
      <div style={{
        width: 520,
        flexShrink: 0,
        overflowY: 'auto',
        padding: '24px 28px',
        borderRight: '1px solid var(--color-border)',
        fontSize: 13,
      }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>快速接入指南</h2>
        <p style={{ margin: '0 0 28px', color: 'var(--color-text-secondary)', fontSize: 13 }}>
          5 分钟跑通首轮流式对话。右侧是运行中的真实 Demo。
        </p>

        {section('第 1 步：安装', '两个包都需要安装，@meso.ai/types 是 peerDependency')}
        {codeBlock(CODE_INSTALL)}

        {section('第 2 步：引入样式', '在应用入口（main.tsx）最顶部引入，顺序不能颠倒')}
        {codeBlock(CODE_STYLES)}

        {section('第 3 步：接入流式对话', 'useSSEStream 封装了 fetch、SSE 解析和状态机')}
        {codeBlock(CODE_HOOK)}

        {section('第 4 步：版本兼容性检查（推荐）', '确保后端协议版本与 SDK 匹配')}
        {codeBlock(CODE_VERSION)}

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
            后端最小示例
            {badge('Python', '#3776AB')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            任意语言均可，只需按协议格式输出 SSE 事件流
          </div>
        </div>
        {codeBlock(CODE_BACKEND)}

        <div style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
          fontSize: 12,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>相关文档</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--color-text-secondary)' }}>
            <span>📋 <a href="https://github.com/Grant-Huang/Meso/blob/main/docs/integration-guide.md" style={{ color: 'var(--color-accent)' }}>完整接入指南</a> — 含框架集成、验收清单</span>
            <span>📡 <a href="https://github.com/Grant-Huang/Meso/blob/main/docs/streaming-protocol.md" style={{ color: 'var(--color-accent)' }}>SSE 协议规范</a> — 16 种事件类型完整定义</span>
            <span>📦 <a href="https://github.com/Grant-Huang/Meso/blob/main/docs/consuming.md" style={{ color: 'var(--color-accent)' }}>消费指南</a> — npm / tarball / file: 安装对比</span>
            <span>🏗️ <a href="https://github.com/Grant-Huang/Meso/blob/main/docs/architecture.md" style={{ color: 'var(--color-accent)' }}>架构总览</a> — 系统分层与能力模型</span>
          </div>
        </div>
      </div>

      {/* Right: live demo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '10px 16px',
          background: 'var(--color-bg-elevated)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: state.status === 'streaming' ? 'var(--color-success)' : 'var(--color-text-muted)',
            display: 'inline-block',
          }} />
          <span>Live Demo — mock SSE 流（stage → think → text → artifact → done）</span>
          {state.status === 'streaming' && (
            <button
              onClick={abort}
              style={{
                marginLeft: 'auto',
                border: '1px solid var(--color-border)',
                borderRadius: 5,
                padding: '2px 8px',
                background: 'transparent',
                color: 'var(--color-text)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              中止
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <MessageList
            messages={messages}
            streaming={state.status !== 'idle' ? state : undefined}
            emptyState={
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 32px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>👆</div>
                <div style={{ fontSize: 13 }}>发送任意消息，查看完整流式过程</div>
              </div>
            }
            onArtifactCopy={content => navigator.clipboard.writeText(content).catch(() => {})}
          />
        </div>

        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-white)',
          display: 'flex',
          gap: 8,
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="发送消息…"
            disabled={state.status === 'streaming'}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text)',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            onClick={send}
            disabled={state.status === 'streaming' || !input.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer',
              opacity: (state.status === 'streaming' || !input.trim()) ? 0.5 : 1,
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
