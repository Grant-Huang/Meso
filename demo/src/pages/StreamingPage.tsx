import { useSSEStream, MessageList } from '@meso.ai/ui'
import type { Message } from '@meso.ai/ui'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Composer } from '../components/Composer'

interface StreamingPageProps {
  /** The currently active session. Changes when the user picks a different session
   *  from the sidebar, but the component stays mounted so streaming continues. */
  sessionId: string
}

/**
 * Demonstrates the full Meso SSE protocol using the mock backend at /api/mock-stream.
 * Shows: stage timeline, memory chips, think block, text streaming, artifact panel.
 *
 * Session persistence strategy:
 * - Messages for every session are stored in a ref (messagesMapRef) so they survive
 *   session switches without re-mounting the component.
 * - When the active sessionId changes, we simply show that session's messages.
 * - If streaming is in progress for session A while the user switches to session B,
 *   the fetch continues in the background; when it completes the result is saved to
 *   session A's messages and will be visible when the user returns.
 */
export function StreamingPage({ sessionId }: StreamingPageProps) {
  const { state, start, abort, reset } = useSSEStream('/api/mock-stream')

  // Per-session message storage. We use a ref so updates don't cause stale closures
  // and don't trigger unnecessary re-renders for background sessions.
  const messagesMapRef = useRef<Record<string, Message[]>>({})
  const [displayMessages, setDisplayMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  // Always-current reference to sessionId, used inside stable callbacks.
  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId

  // Which session triggered the currently running stream request.
  const streamingForRef = useRef<string>(sessionId)

  // When the active session changes, refresh the displayed messages.
  useEffect(() => {
    setDisplayMessages(messagesMapRef.current[sessionId] ?? [])
  }, [sessionId])

  // Stable helper: write messages for a session and update display if it's active.
  const updateMessages = useCallback((sid: string, msgs: Message[]) => {
    messagesMapRef.current[sid] = msgs
    if (sid === sessionIdRef.current) {
      setDisplayMessages(msgs)
    }
  }, [])

  // When streaming finishes, append the assistant reply to the correct session.
  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      const sid = streamingForRef.current
      const prev = messagesMapRef.current[sid] ?? []
      updateMessages(sid, [
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
  }, [state.status, state.textContent, reset, updateMessages])

  const handleSend = (text: string) => {
    streamingForRef.current = sessionId
    const prev = messagesMapRef.current[sessionId] ?? []
    updateMessages(sessionId, [
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
          messages={displayMessages}
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
