import { MessageList, ChatComposer, CollapsibleToolTrace, SoulIndicator, SkillIndicator } from '@meso.ai/ui'
import type { Message, ExtensionEvent, StreamState } from '@meso.ai/ui'
import { useState, useEffect, useRef, useCallback } from 'react'
import React from 'react'
import { useLeanStream, SYS_NAMES } from '../hooks/useLeanStream'
import { PROVIDERS, ENV_KEYS } from '../hooks/providers'
import type { LlmProvider } from '../hooks/providers'
import { useArtifactContext } from '../components/ArtifactContext'
import type { SharedArtifact } from '../components/ArtifactContext'

const EXAMPLE_COMPLAINTS = [
  'A 线本周 OEE 从 85% 跌到 71%',
  'B 装配线点胶机频繁故障，停机越来越多',
  '夜班质量指数连续 3 天低于 95%',
]

const SYSTEM_COLORS: Record<string, string> = {
  mes: '#3498db',
  mom: '#9b59b6',
  erp: '#e67e22',
  plm: '#16a085',
  acquire: '#8e44ad',
  kb: '#27ae60',
  'lean-kb': '#27ae60',
  edgeos: '#c0392b',
}

function renderCitation(event: ExtensionEvent) {
  if (event.payload.name !== 'citation') return null
  const data = event.payload.data as { sources: Array<{ system: string; name: string; uri: string; score?: number }> }
  return (
    <div style={{
      margin: '8px 0',
      padding: '10px 12px',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      background: 'var(--color-bg-elevated)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        取证来源（{data.sources.length}）
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {data.sources.map(s => (
          <div
            key={s.uri}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
          >
            <span style={{
              flexShrink: 0,
              padding: '2px 7px',
              borderRadius: 4,
              background: `${SYSTEM_COLORS[s.system] ?? '#888'}1a`,
              color: SYSTEM_COLORS[s.system] ?? '#888',
              fontSize: 10,
              fontWeight: 600,
              minWidth: 52,
              textAlign: 'center',
            }}>
              {SYS_NAMES[s.system] ?? s.system}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 主窗口 artifact 链接卡片渲染 ──────────────────────────────────────────
//
// 解析 textContent 中的 [[artifact:<id>|<label>]] 标记，把文本拆成若干段，
// 标记处渲染为"打开右侧 <label>"可点击按钮（调用 openArtifactTab 切换右栏 tab），
// 其余文本段按行渲染（与无 markdown 渲染器时的 ChatBubble 行为一致）。

const ARTIFACT_TOKEN = /\[\[artifact:([^|\]]+)\|([^\]]+)\]\]/g

type TextSegment = { kind: 'text'; value: string } | { kind: 'artifact'; id: string; label: string }

function parseArtifactTokens(text: string): TextSegment[] {
  if (!text) return []
  const segments: TextSegment[] = []
  let lastIndex = 0
  ARTIFACT_TOKEN.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ARTIFACT_TOKEN.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ kind: 'text', value: text.slice(lastIndex, m.index) })
    }
    segments.push({ kind: 'artifact', id: m[1], label: m[2] })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < text.length) {
    segments.push({ kind: 'text', value: text.slice(lastIndex) })
  }
  return segments
}

function renderTextLines(value: string, keyBase: string) {
  return value.split('\n').map((line, i) => (
    <React.Fragment key={`${keyBase}-${i}`}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ))
}

/** 自定义流式渲染：Soul/Skill → CollapsibleToolTrace（执行过程+确认门，默认折叠）→ citation → text 主线（含链接卡片）→ memorySaved */
function buildRenderLiveTrace(opts: {
  openArtifactTab: (id: string) => void
  onToolConfirm: (id: string) => void
  onToolCancel: (id: string) => void
  renderExtension?: (event: ExtensionEvent) => React.ReactNode
}) {
  return (stream: StreamState): React.ReactNode => {
    const segments = parseArtifactTokens(stream.textContent)
    return (
      <>
        {(stream.activeSoul || stream.activeSkill) && (
          <div className="meso-message-list__context-row">
            {stream.activeSoul && <SoulIndicator soul={stream.activeSoul} />}
            {stream.activeSkill && <SkillIndicator skill={stream.activeSkill} />}
          </div>
        )}
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
        {(stream.textContent || stream.status === 'streaming') && (
          <div className="meso-bubble meso-bubble--assistant">
            <div className="meso-bubble__avatar" aria-hidden="true">AI</div>
            <div className="meso-bubble__body">
              <div className="meso-bubble__content">
                {segments.length === 0 && stream.status === 'streaming' ? (
                  <span className="meso-bubble__cursor" aria-hidden="true">▋</span>
                ) : (
                  segments.map((seg, i) => {
                    if (seg.kind === 'text') {
                      return <React.Fragment key={i}>{renderTextLines(seg.value, `seg-${i}`)}</React.Fragment>
                    }
                    return (
                      <div key={i} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        margin: '6px 0',
                        padding: '4px 8px',
                        borderLeft: '2px solid var(--color-accent)',
                        background: 'transparent',
                        color: 'var(--color-accent)',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }} onClick={() => opts.openArtifactTab(seg.id)}>
                        <span>› {seg.label}</span>
                      </div>
                    )
                  })
                )}
                {stream.status === 'streaming' && segments.length > 0 && (
                  <span className="meso-bubble__cursor" aria-hidden="true">▋</span>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
}

export function LeanManufacturingPage() {
  const { state, send, abort, reset, confirmTool, cancelTool } = useLeanStream()
  const [messages, setMessages] = useState<Message[]>([])
  const { setArtifacts, clearArtifacts, openArtifactTab } = useArtifactContext()
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState<LlmProvider>(PROVIDERS[0])
  const [apiKey, setApiKey] = useState(() => ENV_KEYS[PROVIDERS[0].id] ?? '')
  const [showConfig, setShowConfig] = useState(false)

  // 把 stream artifacts 上报到 App 右栏（流式增量 + done 终态均覆盖）
  // 注意：status==='idle' 时不调用 clearArtifacts()，避免 done→reset→idle
  // 之后已生成的 artifacts 被立即清空、右栏整体消失。清空责任交给
  // handleSend（新会话开始）与 App.tsx 的 navigate（页面切换）。
  useEffect(() => {
    if (state.status === 'idle' || state.artifactOrder.length === 0) {
      return
    }
    const arts: SharedArtifact[] = state.artifactOrder
      .map(id => state.artifacts[id])
      .filter((a): a is NonNullable<typeof a> => !!a)
      .map(a => ({ id: a.id, label: a.id, lang: a.lang, content: a.content, streaming: !a.done }))
    setArtifacts(arts)
  }, [state.artifacts, state.artifactOrder, state.status, setArtifacts])

  // 流结束或用户中止时，把已生成内容存为 assistant 消息（artifacts 保留渲染）
  const lastHandledStatusRef = useRef<string>('idle')
  useEffect(() => {
    const isTerminal = state.status === 'done' || state.status === 'error'
    // abort 把 status 置 idle；若此前有内容且不是自然完成，也保存
    const abortedWithContent = state.status === 'idle'
      && lastHandledStatusRef.current === 'streaming'
      && (state.artifactOrder.length > 0 || (state.textContent && state.textContent.trim().length > 0))
    if (!isTerminal && !abortedWithContent) {
      lastHandledStatusRef.current = state.status
      return
    }
    if (abortedWithContent) {
      const artifacts = state.artifactOrder
        .map(id => state.artifacts[id])
        .filter((a): a is NonNullable<typeof a> => !!a)
        .map(a => ({ id: a.id, lang: a.lang, content: a.content }))
      const content = state.textContent || '（会话已中止）'
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        artifacts: artifacts.length > 0 ? artifacts : undefined,
      }])
      lastHandledStatusRef.current = state.status
      reset()
      return
    }
    if (isTerminal && state.status === 'done') {
      const artifacts = state.artifactOrder
        .map(id => state.artifacts[id])
        .filter((a): a is NonNullable<typeof a> => !!a)
        .map(a => ({ id: a.id, lang: a.lang, content: a.content }))
      const content = state.textContent || '诊断完成，详见下方产物。'
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        artifacts: artifacts.length > 0 ? artifacts : undefined,
      }])
      lastHandledStatusRef.current = state.status
      reset()
    }
  }, [state.status, state.textContent, state.artifacts, state.artifactOrder, reset])

  useEffect(() => {
    if (state.status === 'error' && !state.errorMessage) {
      reset()
    }
  }, [state.status, state.errorMessage, reset])

  // 自定义流式渲染：隐藏内联 artifact，text 主线解析 [[artifact:xxx]] 为可点击链接卡片
  const renderLiveTrace = useCallback(
    buildRenderLiveTrace({
      openArtifactTab,
      onToolConfirm: confirmTool,
      onToolCancel: cancelTool,
      renderExtension: renderCitation,
    }),
    [openArtifactTab, confirmTool, cancelTool],
  )

  const handleProviderChange = (p: LlmProvider) => {
    setProvider(p)
    setApiKey(ENV_KEYS[p.id] ?? '')
  }

  const handleSend = (text: string) => {
    const complaint = text.trim()
    if (!complaint || state.status === 'streaming') return
    if (!apiKey.trim()) {
      setShowConfig(true)
      return
    }

    // 新一轮诊断开始：清空上一轮遗留的 artifact context
    clearArtifacts()

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: complaint,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    send(complaint, {
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
          hiddenArtifactLangs={['html', 'table']}
          onArtifactCopy={content => navigator.clipboard.writeText(content).catch(() => {})}
          onArtifactDownload={content => {
            const blob = new Blob([content], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'diagnosis.html'
            a.click()
            URL.revokeObjectURL(url)
          }}
          renderExtension={renderCitation}
          emptyState={
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 32px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏭</div>
              <div style={{ fontSize: 15, marginBottom: 6, fontWeight: 500 }}>精益生产 OEE 诊断</div>
              <div style={{ fontSize: 12, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.6 }}>
                描述一条产线异常，系统将从 MES/MOM/ERP/PLM/智能采集 5 个 MCP 多源取证，结合精益知识库生成 HTML 诊断报告、
                OEE 数据明细表与看板图表，派工后向边缘智能 OS 下发执行指令（两道确认门）。
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8 }}>试试这些场景：</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360, margin: '0 auto' }}>
                {EXAMPLE_COMPLAINTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setInput(c)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      background: 'transparent',
                      color: 'var(--color-text)',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      textAlign: 'left',
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
                    {c}
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
        placeholder={hasKey ? '描述产线异常（含产线名、现象、时段）…' : '请先配置 API Key'}
      />
    </div>
  )
}
