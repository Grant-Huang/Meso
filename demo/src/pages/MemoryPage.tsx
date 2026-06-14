import { useState, useEffect } from 'react'

interface RecallResult {
  catLabel: string
  catBg: string
  catColor: string
  text: string
  source: string
  score: string
  date: string
}

const RESULTS_MAP: Record<string, RecallResult[]> = {
  default: [
    { catLabel: '用户偏好', catBg: 'rgba(61,107,82,0.13)', catColor: 'var(--color-accent)', text: '用户偏好简洁回复，不需要冗余解释；偏好代码示例多于理论描述。', source: 'preferences.md', score: '0.92', date: '2025-01-10' },
    { catLabel: '项目背景', catBg: 'rgba(47,125,74,.12)', catColor: 'var(--color-success)', text: '当前项目使用 PostgreSQL 15，生产环境，orders 表约 80 万行数据，已启用分区表但未完全迁移。', source: 'meso_context.md', score: '0.88', date: '2025-01-08' },
    { catLabel: '技术决策', catBg: 'rgba(180,83,9,.1)', catColor: 'var(--color-warning)', text: '2025-01-06: 已决定使用 B-tree 索引方案，放弃 GIN（避免写入性能下降）。', source: 'decisions.md', score: '0.74', date: '2025-01-06' },
  ],
  react: [
    { catLabel: '用户偏好', catBg: 'rgba(61,107,82,0.13)', catColor: 'var(--color-accent)', text: '偏好 TypeScript，使用 arrow functions 和 hooks，避免 class components。', source: 'preferences.md', score: '0.95', date: '2025-01-10' },
    { catLabel: '项目背景', catBg: 'rgba(47,125,74,.12)', catColor: 'var(--color-success)', text: '当前项目：Meso，React 18 + Vite，使用 @meso.ai/ui 组件库。', source: 'meso_context.md', score: '0.89', date: '2025-01-09' },
  ],
}

/** Memory system showcase */
export function MemoryPage() {
  const [query, setQuery] = useState('PostgreSQL 索引优化')
  const [results, setResults] = useState<RecallResult[]>([])
  const [visibleCount, setVisibleCount] = useState(0)

  const runSearch = () => {
    const key = query.toLowerCase().includes('react') || query.toLowerCase().includes('meso') ? 'react' : 'default'
    setResults(RESULTS_MAP[key])
    setVisibleCount(0)
  }

  useEffect(() => {
    if (results.length === 0) return
    let i = 0
    const timer = setInterval(() => {
      i++
      setVisibleCount(i)
      if (i >= results.length) clearInterval(timer)
    }, 180)
    return () => clearInterval(timer)
  }, [results])

  const Section = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 14px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  )

  const mono = '"SF Mono","Fira Code",monospace'

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <ellipse cx="8" cy="5" rx="6" ry="3" stroke="var(--color-accent)" strokeWidth="1.5"/>
          <path d="M2 5v6c0 1.66 2.69 3 6 3s6-1.34 6-3V5" stroke="var(--color-accent)" strokeWidth="1.5"/>
          <path d="M2 8c0 1.66 2.69 3 6 3s6-1.34 6-3" stroke="var(--color-accent)" strokeWidth="1.3" opacity=".5"/>
        </svg>
        记忆系统
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 28 }}>存储结构 · 召回算法 · 模拟召回 · 系统提示注入</div>

      <Section label="1 · 记忆存储结构" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Short-term */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(61,107,82,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="var(--color-accent)" strokeWidth="1.5"/><path d="M6 7h8M6 10h6M6 13h4" stroke="var(--color-accent)" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>短期记忆</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>会话级 · 对话结束清除</div>
            </div>
          </div>
          {['session_context.md', 'tool_results.md', 'artifact_refs.md'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: 'var(--color-bg-elevated)', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="1" width="9" height="11" rx="1.5" stroke="var(--color-text-muted)" strokeWidth="1.2"/><path d="M4 4.5h5M4 7h3" stroke="var(--color-text-muted)" strokeWidth="1.1" strokeLinecap="round"/></svg>
              <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--color-accent)' }}>{f}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 10 }}>会话结束自动清除 · 不跨会话保留</div>
        </div>

        {/* Long-term */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(47,125,74,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h5v12H4zM11 4h5v12h-5z" stroke="var(--color-success)" strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 8h5M11 8h5M4 12h5M11 12h5" stroke="var(--color-success)" strokeWidth="1.1" strokeLinecap="round" opacity=".6"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>长期记忆</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>向量数据库 · 持久化跨会话</div>
            </div>
          </div>
          {['用户偏好/preferences.md', '项目/meso_context.md', '决策日志/decisions.md'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: 'var(--color-bg-elevated)', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 9V5a1 1 0 0 1 1-1h5l3 3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" stroke="var(--color-text-muted)" strokeWidth="1.2"/><path d="M8 4v3h3" stroke="var(--color-text-muted)" strokeWidth="1.1"/></svg>
              <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--color-accent)' }}>{f}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 10 }}>永久保存 · 跨会话 · 支持语义检索</div>
        </div>
      </div>

      <Section label="2 · 召回评分公式" />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 15, color: 'var(--color-text)', padding: '10px 16px', background: 'var(--color-bg-elevated)', borderRadius: 8, border: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--color-accent-dark)', fontWeight: 700 }}>score</span>
            {' = '}
            <span style={{ color: 'var(--color-accent)' }}>0.35</span>
            {' × '}
            <span style={{ color: 'var(--color-text-secondary)' }}>keyword</span>
            {' + '}
            <span style={{ color: 'var(--color-accent)' }}>0.65</span>
            {' × '}
            <span style={{ color: 'var(--color-text-secondary)' }}>semantic</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>最终得分越高，记忆片段越优先注入上下文</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 200 }}>
          {[{ label: '关键词 (BM25)', pct: 35 }, { label: '语义相似度', pct: 65 }].map(w => (
            <div key={w.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', minWidth: 90 }}>{w.label}</span>
              <div style={{ flex: 1, height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${w.pct}%`, background: 'var(--color-accent)', borderRadius: 3, opacity: w.pct < 50 ? .6 : 1 }} />
              </div>
              <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--color-accent)', minWidth: 32, textAlign: 'right' }}>{w.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <Section label="3 · 模拟召回" />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runSearch() }}
            placeholder="输入查询，例如：PostgreSQL 索引优化"
            style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-bg-elevated)', fontSize: 14, fontFamily: 'inherit', color: 'var(--color-text)', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          <button onClick={runSearch} style={{ padding: '9px 18px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            搜索记忆
          </button>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 14px', opacity: i < visibleCount ? 1 : 0, transform: i < visibleCount ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity .35s, transform .35s' }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1, background: r.catBg, color: r.catColor }}>{r.catLabel}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>{r.text}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3, display: 'flex', gap: 12 }}>
                  <span>{r.source}</span>
                  <span style={{ fontFamily: mono }}>score: {r.score}</span>
                  <span>{r.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>输入查询后点击搜索记忆</div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-border-light)' }}>
          {[
            { label: '用户偏好', bg: 'rgba(61,107,82,0.13)', color: 'var(--color-accent)' },
            { label: '项目背景', bg: 'rgba(47,125,74,.12)', color: 'var(--color-success)' },
            { label: '技术决策', bg: 'rgba(180,83,9,.1)', color: 'var(--color-warning)' },
            { label: '反馈记录', bg: 'rgba(192,57,43,.08)', color: 'var(--color-error)' },
          ].map(c => (
            <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>
          ))}
        </div>
      </div>

      <Section label="4 · 注入系统提示" />

      <div style={{ background: 'var(--color-code-bg)', borderRadius: 10, padding: '20px 22px', fontFamily: mono, fontSize: 12, lineHeight: 1.8, overflowX: 'auto' }}>
        <div style={{ color: '#6a8872' }}># ── 系统提示片段 ──────────────────────────────</div>
        <br />
        <div style={{ color: '#b8c9b4' }}>你是 Meso，一个具备长期记忆的 AI 助手。</div>
        <div style={{ color: '#b8c9b4' }}>以下是与当前查询相关的记忆片段，请在回复时参考：</div>
        <br />
        <div style={{ color: '#9cb8a8', fontWeight: 700 }}>--- 相关记忆 ---</div>
        <br />
        {[
          { cat: '[用户偏好]', score: 'score=0.92', lines: ['用户偏好简洁回复，不需要冗余解释；偏好代码示例多于理论描述。'] },
          { cat: '[项目背景]', score: 'score=0.88', lines: ['当前项目使用 PostgreSQL 15，生产环境，orders 表约 80 万行数据，', '已启用分区表但未完全迁移。'] },
          { cat: '[技术决策]', score: 'score=0.74', lines: ['2025-01-06: 已决定使用 B-tree 索引，放弃 GIN（避免写入性能下降）。'] },
        ].map(entry => (
          <div key={entry.cat} style={{ marginBottom: 8 }}>
            <div><span style={{ color: '#527c5e', fontWeight: 600 }}>{entry.cat}</span> <span style={{ color: '#6a8872' }}>{entry.score}</span></div>
            {entry.lines.map((l, i) => <div key={i} style={{ color: '#cdd8ca' }}>{l}</div>)}
          </div>
        ))}
        <div style={{ color: '#9cb8a8', fontWeight: 700 }}>--- 记忆结束 ---</div>
        <div style={{ color: '#6a8872' }}># ─────────────────────────────────────────────</div>
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}
