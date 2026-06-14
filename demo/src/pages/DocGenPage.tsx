import { useState, useRef, useCallback } from 'react'
import { StatusIcon } from '@meso.ai/ui'
import type { StatusIconStatus } from '@meso.ai/ui'

type PhaseState = 'pending' | 'running' | 'done'

interface PhaseItem {
  name: string
  state: PhaseState
}

interface Artifact {
  id: string
  lang: string
  label: string
  content: string
}

interface Turn {
  userMessage: string
  phases: PhaseItem[]
  thinks: string[]
  artifacts: Artifact[]
  textContent: string
  status: 'streaming' | 'done'
}

// ── Mock data for doc generation demo ───────────────────────────────────────

const PRESETS: Record<string, { input: string; title: string; type: string; sectionCount: number }> = {
  report: {
    input: '生成一份2026年Q2市场分析报告，包含核心营收、用户留存率等关键指标',
    title: '2026 年第二季度市场分析报告',
    type: 'report',
    sectionCount: 4,
  },
  brief: {
    input: '生成一份 Meso 2.1 版本的产品发布简报',
    title: 'Meso 2.1 产品发布简报',
    type: 'brief',
    sectionCount: 3,
  },
  memo: {
    input: '生成一份讨论文档生成工具方案选型的团队周会纪要',
    title: '技术周会纪要',
    type: 'memo',
    sectionCount: 3,
  },
}

const MOCK_JSON = `{
  "title": "2026 年第二季度市场分析报告",
  "subtitle": "核心业务指标与增长策略",
  "author": "数据分析组",
  "date": "2026-04-01",
  "doc_type": "report",
  "summary": "本季度整体营收同比增长 23%，用户留存率有所下滑…",
  "sections": [
    { "heading": "核心指标概览", "metrics": [...] },
    { "heading": "业务亮点",    "items": [...] },
    { "heading": "风险与挑战", "items": [...] },
    { "heading": "下季度目标", "key_values": [...] }
  ]
}`

const MOCK_TEMPLATE = `<div class="doc-header">
  <div class="doc-title">{{ title }}</div>
  {% if subtitle %}<div class="doc-subtitle">{{ subtitle }}</div>{% endif %}
  <div class="doc-meta">
    {% if author %}<span>作者：{{ author }}</span>{% endif %}
    <span>类型：{{ doc_type }}</span>
  </div>
</div>
{% if summary %}
<div class="doc-summary">{{ summary }}</div>
{% endif %}
{% for section in sections %}
<div class="section">
  <div class="section-heading">{{ section.heading }}</div>
  {% if section.metrics %}
  <div class="metrics-grid">…</div>
  {% endif %}
</div>
{% endfor %}
<div class="doc-footer">由 Meso Doc Generator 生成</div>`

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

// ── Styles (inline, matching MESO tokens) ────────────────────────────────────

const s = {
  page: { display: 'flex', flexDirection: 'column' as const, height: '100%', overflow: 'hidden' },
  infoBar: {
    padding: '6px 16px',
    background: 'var(--color-bg-elevated)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 12, color: 'var(--color-text-secondary)',
    display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
  },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftPane: {
    width: 380, flexShrink: 0,
    borderRight: '1px solid var(--color-border)',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
  },
  thread: { flex: 1, overflowY: 'auto' as const, padding: '16px 0' },
  row: { padding: '0 16px 12px' },
  userBubble: { display: 'flex', justifyContent: 'flex-end' },
  userContent: {
    maxWidth: '82%', background: 'var(--color-bg-white)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px 12px 4px 12px',
    padding: '8px 12px', fontSize: 14, lineHeight: 1.6,
  },
  aiRow: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  phaseBar: { display: 'flex', flexDirection: 'column' as const, gap: 3 },
  phaseItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 },
  thinkBlock: {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)', borderRadius: 8,
    padding: '8px 12px', fontSize: 12, lineHeight: 1.65,
    color: 'var(--color-text-secondary)', fontStyle: 'italic' as const,
    whiteSpace: 'pre-wrap' as const,
  },
  artifactCard: {
    border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden',
  },
  artifactHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', background: 'var(--color-bg-elevated)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 12, color: 'var(--color-text-secondary)',
  },
  artifactLang: {
    fontSize: 10, padding: '1px 6px', borderRadius: 4,
    background: 'rgba(82,124,94,0.1)', color: 'var(--color-accent)',
    fontWeight: 600, fontFamily: 'monospace', textTransform: 'uppercase' as const,
  },
  artifactBody: {
    fontFamily: '"SF Mono","Fira Code",monospace', fontSize: 11,
    lineHeight: 1.55, padding: '10px 12px',
    background: 'var(--color-bg)', color: 'var(--color-text)',
    overflowX: 'auto' as const, maxHeight: 160, overflowY: 'auto' as const,
    whiteSpace: 'pre' as const,
  },
  textContent: { fontSize: 14, color: 'var(--color-text)', lineHeight: 1.7 },
  rightPane: {
    flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
  },
  previewHeader: {
    padding: '8px 16px', background: 'var(--color-bg-elevated)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 12, color: 'var(--color-text-secondary)',
    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
  },
  previewPlaceholder: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-text-muted)', gap: 10, padding: 40, textAlign: 'center' as const,
  },
  composer: {
    padding: '10px 12px', borderTop: '1px solid var(--color-border)',
    background: 'var(--color-bg)', flexShrink: 0,
    display: 'flex', gap: 8, alignItems: 'flex-end',
  },
  composerInput: {
    flex: 1, resize: 'none' as const, padding: '8px 12px',
    borderRadius: 8, border: '1px solid var(--color-border)',
    background: 'var(--color-bg-white)', fontFamily: 'inherit',
    fontSize: 13, lineHeight: 1.5, color: 'var(--color-text)',
    outline: 'none', minHeight: 38,
  },
  sendBtn: {
    flexShrink: 0, width: 36, height: 36,
    borderRadius: 8, border: 'none',
    background: 'var(--color-accent)', color: '#fff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}

function phaseStateToIcon(state: PhaseState): StatusIconStatus {
  switch (state) {
    case 'pending': return 'pending'
    case 'running': return 'running'
    case 'done': return 'done'
  }
}

export function DocGenPage() {
  const [input, setInput] = useState(PRESETS.report.input)
  const [turns, setTurns] = useState<Turn[]>([])
  const [streaming, setStreaming] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
    })
  }, [])

  const updateLastTurn = useCallback((updater: (t: Turn) => Turn) => {
    setTurns(prev => {
      const next = [...prev]
      next[next.length - 1] = updater(next[next.length - 1])
      return next
    })
    scrollBottom()
  }, [scrollBottom])

  const handleSend = async () => {
    if (streaming || !input.trim()) return
    setStreaming(true)
    setPreviewHtml(null)

    const message = input.trim()
    const preset = Object.values(PRESETS).find(p => p.input === message) || PRESETS.report

    const newTurn: Turn = {
      userMessage: message,
      phases: [
        { name: '分析需求', state: 'running' },
        { name: '生成模板', state: 'pending' },
        { name: '渲染文档', state: 'pending' },
      ],
      thinks: [],
      artifacts: [],
      textContent: '',
      status: 'streaming',
    }
    setTurns(prev => [...prev, newTurn])
    scrollBottom()

    await delay(200)

    // Phase 1
    updateLastTurn(t => ({ ...t, thinks: [`正在理解需求，识别文档类型：${preset.type}，共 ${preset.sectionCount} 个章节…`] }))
    await delay(1200)
    updateLastTurn(t => ({
      ...t,
      phases: t.phases.map(p => p.name === '分析需求' ? { ...p, state: 'done' } : p),
      artifacts: [...t.artifacts, { id: 'json', lang: 'json', label: '结构化内容', content: MOCK_JSON }],
    }))
    await delay(400)

    // Phase 2
    updateLastTurn(t => ({
      ...t,
      phases: t.phases.map(p => p.name === '生成模板' ? { ...p, state: 'running' } : p),
    }))
    await delay(1000)
    updateLastTurn(t => ({
      ...t,
      phases: t.phases.map(p => p.name === '生成模板' ? { ...p, state: 'done' } : p),
      artifacts: [...t.artifacts, { id: 'tpl', lang: 'jinja2', label: 'Jinja2 渲染模板', content: MOCK_TEMPLATE }],
    }))
    await delay(400)

    // Phase 3
    updateLastTurn(t => ({
      ...t,
      phases: t.phases.map(p => p.name === '渲染文档' ? { ...p, state: 'running' } : p),
    }))
    await delay(700)
    updateLastTurn(t => ({
      ...t,
      phases: t.phases.map(p => p.name === '渲染文档' ? { ...p, state: 'done' } : p),
    }))

    // Preview
    setPreviewHtml(buildPreviewHtml(preset.title, preset.type))

    await delay(200)
    updateLastTurn(t => ({
      ...t,
      textContent: `文档《${preset.title}》已生成完成，共 ${preset.sectionCount} 个章节。`,
      status: 'done',
    }))

    setStreaming(false)
  }

  return (
    <div style={s.page}>

      <div style={s.infoBar}>
        <span>独立工具：<code style={{ fontSize: 11 }}>tools/doc-generator/</code></span>
        <span style={{ color: 'var(--color-text-muted)' }}>·</span>
        <span>LLM 1 → JSON → LLM 2 → Jinja2 → 渲染引擎 → HTML</span>
        <span style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          SSE 接入：<code style={{ fontSize: 11 }}>POST /generate</code>
        </span>
      </div>

      <div style={s.workspace}>
        {/* Left: chat */}
        <div style={s.leftPane}>
          <div ref={threadRef} style={s.thread}>
            {turns.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📄</div>
                <div style={{ fontSize: 14, marginBottom: 6 }}>文档生成演示</div>
                <div style={{ fontSize: 12 }}>输入文档需求，查看三步生成流程</div>
              </div>
            )}
            {turns.map((turn, i) => (
              <div key={i}>
                <div style={s.row}>
                  <div style={s.userBubble}>
                    <div style={s.userContent}>{turn.userMessage}</div>
                  </div>
                </div>
                <div style={s.row}>
                  <div style={s.aiRow}>
                    {/* Phases */}
                    <div style={s.phaseBar}>
                      {turn.phases.map(phase => (
                        <div key={phase.name} style={s.phaseItem}>
                          <StatusIcon status={phaseStateToIcon(phase.state)} size={10} />
                          <span style={{
                            fontSize: 12,
                            color: phase.state === 'running' ? 'var(--color-accent-dark, #3d6b52)' : 'var(--color-text-muted)',
                            fontWeight: phase.state === 'running' ? 600 : 400,
                          }}>{phase.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Think blocks */}
                    {turn.thinks.map((t, j) => (
                      <div key={j} style={s.thinkBlock}>{t}</div>
                    ))}

                    {/* Artifacts */}
                    {turn.artifacts.map(art => (
                      <div key={art.id} style={s.artifactCard}>
                        <div style={s.artifactHeader}>
                          <span style={s.artifactLang}>{art.lang}</span>
                          <span>{art.label}</span>
                        </div>
                        <pre style={s.artifactBody}>{art.content}</pre>
                      </div>
                    ))}

                    {/* Text */}
                    {turn.textContent && (
                      <div style={s.textContent}>{turn.textContent}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={s.composer}>
            <textarea
              style={s.composerInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={2}
              placeholder="描述你想生成的文档内容…"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            />
            <button
              style={{ ...s.sendBtn, opacity: streaming ? 0.4 : 1, cursor: streaming ? 'not-allowed' : 'pointer' }}
              onClick={handleSend}
              disabled={streaming}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="13" x2="8" y2="3"/>
                <polyline points="4,7 8,3 12,7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right: preview */}
        <div style={s.rightPane}>
          <div style={s.previewHeader}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <rect x="1" y="1" width="12" height="12" rx="2"/>
              <line x1="3.5" y1="4.5" x2="10.5" y2="4.5"/>
              <line x1="3.5" y1="7" x2="8" y2="7"/>
              <line x1="3.5" y1="9.5" x2="9" y2="9.5"/>
            </svg>
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>文档预览</span>
            {previewHtml && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-muted)' }}>
                html preview artifact
              </span>
            )}
          </div>

          {!previewHtml ? (
            <div style={s.previewPlaceholder}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                <rect x="8" y="4" width="32" height="40" rx="3"/>
                <line x1="14" y1="14" x2="34" y2="14"/>
                <line x1="14" y1="20" x2="28" y2="20"/>
                <line x1="14" y1="26" x2="30" y2="26"/>
                <line x1="14" y1="32" x2="26" y2="32"/>
              </svg>
              <div style={{ fontSize: 13 }}>发送请求后，渲染完成的文档将在此预览</div>
              <div style={{ fontSize: 12 }}>通过 artifact (lang: "html preview") 事件推送</div>
            </div>
          ) : (
            <iframe
              style={{ flex: 1, border: 'none', background: '#fff' }}
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
              title="文档预览"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Preview HTML builder ───────────────────────────────────────────────────────

function buildPreviewHtml(title: string, docType: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="UTF-8"/>
<style>
:root{--color-text:#1a1a1a;--color-text-secondary:#4b5563;--color-text-muted:#9ca3af;--color-border:#e5e7eb;--color-accent:#527c5e;--color-accent-dark:#3d6b52;--color-accent-light:#f0f4f1;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.7;color:var(--color-text);padding:32px 40px;max-width:820px;margin:0 auto;}
.doc-header{border-bottom:2px solid var(--color-accent);padding-bottom:16px;margin-bottom:22px;}
.doc-title{font-size:22px;font-weight:700;color:var(--color-accent-dark);margin-bottom:4px;}
.doc-subtitle{font-size:13px;color:var(--color-text-secondary);margin-bottom:8px;}
.doc-meta{display:flex;gap:16px;font-size:11px;color:var(--color-text-muted);}
.doc-summary{background:var(--color-accent-light);border-left:3px solid var(--color-accent);padding:11px 14px;border-radius:0 5px 5px 0;margin-bottom:24px;font-size:13px;color:var(--color-text-secondary);}
.section{margin-bottom:24px;}
.section-heading{font-size:15px;font-weight:650;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--color-border);}
.section-content{font-size:13px;color:var(--color-text-secondary);margin-bottom:10px;}
.metrics-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;}
.metric-card{flex:1;min-width:110px;background:#f9fafb;border:1px solid var(--color-border);border-radius:7px;padding:12px;border-top:2px solid var(--color-border);}
.metric-card.up{border-top-color:#22c55e;}.metric-card.down{border-top-color:#ef4444;}
.metric-name{font-size:11px;color:var(--color-text-muted);margin-bottom:4px;}
.metric-value{font-size:19px;font-weight:700;}
.metric-card.up .metric-value{color:#16a34a;}.metric-card.down .metric-value{color:#dc2626;}
ul.item-list{padding-left:16px;margin-top:8px;}
ul.item-list li{margin-bottom:5px;font-size:13px;color:var(--color-text-secondary);}
table.kv-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;}
table.kv-table td{padding:8px 10px;border:1px solid var(--color-border);}
table.kv-table td:first-child{font-weight:600;width:30%;background:#f9fafb;}
table.kv-table td:last-child{color:var(--color-text-secondary);}
.doc-footer{margin-top:36px;padding-top:12px;border-top:1px solid var(--color-border);font-size:11px;color:var(--color-text-muted);text-align:center;}
</style></head>
<body>
<div class="doc-header">
  <div class="doc-title">${title}</div>
  <div class="doc-subtitle">核心业务指标与增长策略</div>
  <div class="doc-meta"><span>作者：数据分析组</span><span>日期：2026-04-01</span><span>类型：${docType}</span></div>
</div>
<div class="doc-summary">本季度整体营收同比增长 23%，用户留存率有所下滑，建议重点关注用户激活环节的优化。</div>
<div class="section">
  <div class="section-heading">核心指标概览</div>
  <div class="section-content">以下为本季度关键业务数据汇总：</div>
  <div class="metrics-grid">
    <div class="metric-card up"><div class="metric-name">核心营收</div><div class="metric-value">1,200 万</div></div>
    <div class="metric-card down"><div class="metric-name">用户留存率</div><div class="metric-value">68%</div></div>
    <div class="metric-card up"><div class="metric-name">新增用户</div><div class="metric-value">45,320</div></div>
    <div class="metric-card"><div class="metric-name">月活用户</div><div class="metric-value">128,000</div></div>
  </div>
</div>
<div class="section">
  <div class="section-heading">业务亮点</div>
  <div class="section-content">本季度在以下方向取得显著进展：</div>
  <ul class="item-list">
    <li>企业客户签约数量同比增长 41%，大客户收入贡献提升至 58%</li>
    <li>AI 辅助功能上线，用户平均使用时长增加 18 分钟/天</li>
    <li>移动端 DAU 突破 8 万，环比增长 12%</li>
    <li>客服满意度评分达 4.7/5，创历史新高</li>
  </ul>
</div>
<div class="section">
  <div class="section-heading">下季度目标</div>
  <table class="kv-table">
    <tr><td>营收目标</td><td>1,500 万（同比 +25%）</td></tr>
    <tr><td>用户留存率目标</td><td>提升至 72%</td></tr>
    <tr><td>重点新功能</td><td>工作流自动化、批量导出</td></tr>
    <tr><td>重点市场</td><td>华南区、东南亚试点</td></tr>
  </table>
</div>
<div class="doc-footer">由 Meso Doc Generator 生成</div>
</body></html>`
}
