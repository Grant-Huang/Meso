import { MessageList } from '@meso/ui'
import type { Message } from '@meso/ui'
import { useState, useEffect } from 'react'
import { Composer } from '../components/Composer'
import { useLlmStream } from '../hooks/useLlmStream'
import { PROVIDERS, ENV_KEYS } from '../hooks/providers'
import type { LlmProvider } from '../hooks/providers'

export function LiveChatPage() {
  const { state, send, abort, reset } = useLlmStream()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState<LlmProvider>(PROVIDERS[0])
  const [apiKey, setApiKey] = useState(() => ENV_KEYS[PROVIDERS[0].id] ?? '')
  const [showConfig, setShowConfig] = useState(false)

  // Update API key when provider changes (use env if available)
  const handleProviderChange = (p: LlmProvider) => {
    setProvider(p)
    setApiKey(ENV_KEYS[p.id] ?? '')
  }

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
    if (!apiKey.trim()) {
      setShowConfig(true)
      return
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])

    const history = [...messages, userMsg].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    send(history, {
      baseUrl: provider.baseUrl,
      model: provider.model,
      apiKey,
      systemPrompt: '你是一个基于 Meso 平台的 AI 助手，请用中文回答。',
    })
  }

  const hasKey = !!apiKey.trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Provider config bar */}
      <div style={{
        padding: '6px 16px',
        background: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <select
          value={provider.id}
          onChange={e => handleProviderChange(PROVIDERS.find(p => p.id === e.target.value)!)}
          style={{
            padding: '3px 8px',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            background: 'var(--color-bg-white)',
            color: 'var(--color-text)',
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >
          {PROVIDERS.map(p => (
            <option key={p.id} value={p.id}>{p.name} · {p.model}</option>
          ))}
        </select>

        <button
          onClick={() => setShowConfig(c => !c)}
          style={{
            padding: '3px 8px',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            background: hasKey ? 'rgba(42,122,79,0.1)' : 'rgba(184,50,50,0.1)',
            color: hasKey ? 'var(--color-success)' : 'var(--color-error)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {hasKey ? '✓ API Key 已配置' : '⚠ 配置 API Key'}
        </button>

        {state.status === 'streaming' && (
          <button
            onClick={abort}
            style={{
              marginLeft: 'auto',
              padding: '3px 8px',
              border: '1px solid var(--color-border)',
              borderRadius: 5,
              background: 'transparent',
              color: 'var(--color-text)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            中止
          </button>
        )}
      </div>

      {/* Inline API key config */}
      {showConfig && (
        <div style={{
          padding: '10px 16px',
          background: 'var(--color-bg-white)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            {provider.name} API Key：
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={`或在 .env 中设置 ${provider.apiKeyEnvHint}`}
            style={{
              flex: 1,
              padding: '5px 10px',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: 12,
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowConfig(false)}
            style={{
              padding: '5px 10px',
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            确认
          </button>
        </div>
      )}

      {state.status === 'error' && state.errorMessage && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(184,50,50,0.1)',
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-error)',
          fontSize: 12,
          flexShrink: 0,
        }}>
          错误：{state.errorMessage}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <MessageList
          messages={messages}
          streaming={state.status !== 'idle' ? state : undefined}
          emptyState={
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 32px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>接入真实 LLM API</div>
              <div style={{ fontSize: 12 }}>
                {hasKey
                  ? `已配置 ${provider.name}，发送消息开始对话`
                  : '请先点击上方"配置 API Key"'}
              </div>
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
        placeholder={hasKey ? `向 ${provider.name} 发送消息…` : '请先配置 API Key'}
      />
    </div>
  )
}
