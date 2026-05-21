import { useSSEStream, MessageList } from '@meso/ui'
import type { Message } from '@meso/ui'
import { useState, useEffect } from 'react'
import { Composer } from '../components/Composer'

/**
 * Demonstrates the full Meso SSE protocol using the mock backend at /api/mock-stream.
 * Shows: stage timeline, memory chips, think block, text streaming, artifact panel.
 */
export function StreamingPage() {
  const { state, start, abort, reset } = useSSEStream('/api/mock-stream')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: state.textContent,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      reset()
    }
  }, [state.status, state.textContent, reset])

  const handleSend = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    start({ method: 'POST', body: { message: text } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Info bar */}
      <div style={{
        padding: '6px 16px',
        background: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border)',
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <span>Mock 后端：<code style={{ fontSize: 11 }}>/api/mock-stream</code></span>
        <span style={{ color: 'var(--color-text-muted)' }}>·</span>
        <span>演示完整 SSE 协议：stage → memory → think → text → artifact → done</span>
        {state.status === 'streaming' && (
          <>
            <span style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }}>·</span>
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
          </>
        )}
      </div>

      {/* Message area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <MessageList
          messages={messages}
          streaming={state.status !== 'idle' ? state : undefined}
          emptyState={
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 32px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>SSE 协议演示</div>
              <div style={{ fontSize: 12 }}>发送任意消息，查看完整流式过程</div>
            </div>
          }
          onArtifactCopy={content => navigator.clipboard.writeText(content).catch(() => {})}
        />
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={state.status === 'streaming'}
      />
    </div>
  )
}
