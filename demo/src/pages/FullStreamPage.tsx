import { MessageList, ChatComposer, CollapsibleToolTrace } from '@meso.ai/ui'
import type { Message, ExtensionEvent, StreamState } from '@meso.ai/ui'
import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import { useFullStream } from '../hooks/useFullStream'
import { PROVIDERS, ENV_KEYS } from '../hooks/providers'
import type { LlmProvider } from '../hooks/providers'

const EXAMPLE_TOPICS = [
  'AI Agent 框架对比',
  'React 19 新特性',
  '边缘计算现状',
  'RAG vs Fine-tuning 选型',
]

function renderCitation(event: ExtensionEvent) {
  if (event.payload.name !== 'citation') return null
  const data = event.payload.data as { sources: Array<{ id: string; title: string; url: string; score: number }> }
  return (
    <div style={{
      margin: '8px 0',
      padding: '8px 0',
      borderLeft: '2px solid var(--color-accent)',
      paddingLeft: '12px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        引用来源（{data.sources.length}）
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {data.sources.map(s => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
              fontSize: 11,
              color: 'var(--color-text)',
              textDecoration: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{
              flexShrink: 0,
              color: 'var(--color-accent)',
              fontSize: 10,
              fontWeight: 600,
              minWidth: 24,
              textAlign: 'right',
            }}>
              {(s.score * 100).toFixed(0)}%
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.title}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function buildRenderLiveTrace(opts: {
  onToolConfirm: (id: string) => void
  onToolCancel: (id: string) => void
  renderExtension?: (event: ExtensionEvent) => React.ReactNode
}) {
  return (stream: StreamState): React.ReactNode => {
    return (
      <>
        <div style={{ marginBottom: 12 }}>
          <CollapsibleToolTrace
            stream={stream}
            streaming={stream.status === 'streaming'}
            defaultExpanded="none"
            simplify={{ hideMetadata: false }}
            onToolConfirm={opts.onToolConfirm}
            onToolCancel={opts.onToolCancel}
            renderSummary={(tc) => {
              const icon = tc.status === 'error' ? '✗' : (tc.status === 'pending' ? '◆' : '✓')
              const name = tc.call.name
              const count = tc.result?.metadata?.resultCount ? ` — ${tc.result.metadata.resultCount} 项` : ''
              const duration = tc.result?.duration_ms ? ` (${tc.result.duration_ms}ms)` : ''
              return `${icon} ${name}${count}${duration}`
            }}
          />
        </div>
        {opts.renderExtension && stream.extensionLog.length > 0 && (() => {
          const renderExt = opts.renderExtension!
          return (
            <div style={{ marginBottom: 12 }}>
              {stream.extensionLog.map((ext, i) => (
                <React.Fragment key={i}>{renderExt(ext)}</React.Fragment>
              ))}
            </div>
          )
        })()}
      </>
    )
  }
}

export function FullStreamPage() {
  const { state, send, abort, reset, confirmTool, cancelTool } = useFullStream()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState<LlmProvider>(PROVIDERS[0])
  const [apiKey, setApiKey] = useState(() => ENV_KEYS[PROVIDERS[0].id] ?? '')
  const [showConfig, setShowConfig] = useState(false)

  const renderLiveTrace = useCallback(
    buildRenderLiveTrace({
      onToolConfirm: confirmTool,
      onToolCancel: cancelTool,
      renderExtension: renderCitation,
    }),
    [confirmTool, cancelTool],
  )

  // 流结束后把报告存为 assistant 消息（artifacts 保留渲染，不降级为纯文本）
  useEffect(() => {
    if (state.status === 'done') {
      const artifacts = state.artifactOrder
        .map(id => state.artifacts[id])
        .filter((a): a is NonNullable<typeof a> => !!a)
        .map(a => ({ id: a.id, lang: a.lang, content: a.content }))
      const content = state.textContent || '研究完成，详见下方产物。'
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        artifacts: artifacts.length > 0 ? artifacts : undefined,
      }])
      reset()
    }
  }, [state.status, state.textContent, state.artifacts, state.artifactOrder, reset])

  // 用户取消发布时（error），若有已生成内容也保留进历史
  useEffect(() => {
    if (state.status === 'error' && !state.errorMessage) {
      reset()
    }
  }, [state.status, state.errorMessage, reset])

  const handleProviderChange = (p: LlmProvider) => {
    setProvider(p)
    setApiKey(ENV_KEYS[p.id] ?? '')
  }

  const handleSend = (text: string) => {
    const topic = text.trim()
    if (!topic || state.status === 'streaming') return
    if (!apiKey.trim()) {
      setShowConfig(true)
      return
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `研究主题：${topic}`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    send(topic, {
      baseUrl: provider.baseUrl,
      model: provider.model,
      apiKey,
    })
  }

  const hasKey = !!apiKey.trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Provider / Key 配置条 */}
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

      {/* 内联 API Key 配置 */}
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

      {/* 错误提示 */}
      {state.status === 'error' && state.errorMessage && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(184,50,50,0.1)',
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-error)',
          fontSize: 12,
          flexShrink: 0,
        }}>
          {state.errorMessage}
        </div>
      )}

      {/* 消息列表 */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <MessageList
          messages={messages}
          streaming={state.status !== 'idle' ? state : undefined}
          onToolConfirm={confirmTool}
          onToolCancel={cancelTool}
          renderLiveTrace={renderLiveTrace}
          onArtifactCopy={content => navigator.clipboard.writeText(content).catch(() => {})}
          onArtifactDownload={content => {
            const blob = new Blob([content], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'report.md'
            a.click()
            URL.revokeObjectURL(url)
          }}
          renderExtension={renderCitation}
          emptyState={
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 32px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔬</div>
              <div style={{ fontSize: 15, marginBottom: 6, fontWeight: 500 }}>深度研究助手</div>
              <div style={{ fontSize: 12, marginBottom: 20, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
                输入一个研究主题，系统将走完整的多源汇总流程：召回记忆 → 多源并行采集（MCP/KB/网页）→
                综合生成结构化报告，并在发布前请求你的确认。
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8 }}>试试这些主题：</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 460, margin: '0 auto' }}>
                {EXAMPLE_TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setInput(topic)}
                    style={{
                      padding: '4px 10px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 14,
                      background: 'transparent',
                      color: 'var(--color-text)',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--color-accent)'
                      el.style.color = 'var(--color-accent)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--color-border)'
                      el.style.color = 'var(--color-text)'
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              {!hasKey && (
                <div style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 16 }}>
                  请先配置 {provider.name} API Key
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* 输入框 */}
      <ChatComposer
        value={input}
        onChange={setInput}
        onSubmit={() => handleSend(input)}
        onStop={abort}
        streaming={state.status === 'streaming'}
        placeholder={hasKey ? '输入要研究的主题…' : '请先配置 API Key'}
      />
    </div>
  )
}
