import { useState } from 'react'

/** Components showcase — mirrors docs/demo/05-components.html */
export function ComponentsPage() {
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [composerText, setComposerText] = useState('')

  const Section = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 14px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  )

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 24px' }}>
      {children}
    </div>
  )

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, fontFamily: 'inherit', lineHeight: 1,
    transition: 'filter .15s',
  }

  const BUTTONS = [
    { label: '新建会话', style: { background: 'var(--color-accent)', color: '#fff' } },
    { label: '保存记忆', style: { background: 'var(--color-success)', color: '#fff' } },
    { label: '删除会话', style: { background: 'var(--color-error)', color: '#fff' } },
    { label: '注意事项', style: { background: 'var(--color-warning)', color: '#fff' } },
    { label: '轮廓按钮', style: { background: 'transparent', color: 'var(--color-accent)', border: '1.5px solid var(--color-accent)' } },
    { label: '幽灵按钮', style: { background: 'rgba(61,107,82,0.10)', color: 'var(--color-accent)' } },
  ]

  const BADGES = [
    { label: '信息', bg: 'rgba(61,107,82,0.13)', color: 'var(--color-accent)' },
    { label: '成功', bg: 'rgba(47,125,74,.12)', color: 'var(--color-success)' },
    { label: '警告', bg: 'rgba(180,83,9,.12)', color: 'var(--color-warning)' },
    { label: '错误', bg: 'rgba(192,57,43,.1)', color: 'var(--color-error)' },
    { label: '中性', bg: 'rgba(28,38,32,0.08)', color: 'var(--color-text-secondary)' },
  ]

  const CARDS = [
    { bg: 'var(--color-bg)', label: '--color-bg', title: '页面背景卡', sub: 'border-radius: 10px' },
    { bg: 'var(--color-bg-elevated)', label: '--color-bg-elevated', title: '提升背景卡', sub: '顶栏、Artifact 面板、工具提示' },
    { bg: 'var(--color-bg-white)', label: '--color-bg-white', title: '纯白卡片', sub: '输入框、会话列表、弹窗内容' },
    { bg: 'var(--color-bg-sidebar)', label: '--color-bg-sidebar', title: '侧栏背景卡', sub: '左侧导航栏及次级列表' },
    { bg: 'var(--color-accent)', label: 'accent-filled', title: '强调色卡片', sub: '高亮状态、活跃选中项', invert: true },
  ]

  const RADII = [
    { px: 10, label: '卡片' },
    { px: 8, label: '按钮' },
    { px: 6, label: '会话项' },
    { px: 12, label: '弹窗' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: 920, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--color-accent)" opacity=".5"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--color-accent)"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--color-accent)"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--color-accent)" opacity=".5"/>
        </svg>
        基础组件
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 28 }}>按钮 · 输入框 · 标签 · 卡片 · 圆角参考 · Composer</div>

      {/* 1. Buttons */}
      <Section label="1 · 按钮" />
      <Wrap>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {BUTTONS.map(b => (
            <button key={b.label} style={{ ...btnBase, ...b.style as React.CSSProperties }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >
              {b.label}
            </button>
          ))}
        </div>
      </Wrap>

      {/* 2. Inputs */}
      <Section label="2 · 输入框状态" />
      <Wrap>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: '默认状态', value: 'PostgreSQL 查询优化', hint: '输入会话名称', id: 'default' },
            { label: '聚焦状态', value: '', placeholder: '搜索记忆…', hint: '按 Enter 确认搜索', id: 'focused', focused: true },
            { label: '占位符', value: '', placeholder: '输入关键词或语义描述…', hint: ' ', id: 'placeholder' },
            { label: '错误状态', value: 'invalid@#$', hint: '名称包含非法字符', id: 'error', error: true },
          ].map(inp => (
            <div key={inp.id} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{inp.label}</label>
              <input
                defaultValue={inp.value}
                placeholder={inp.placeholder}
                readOnly={inp.id !== 'focused'}
                onFocus={() => setFocusedInput(inp.id)}
                onBlur={() => setFocusedInput(null)}
                style={{
                  padding: '8px 12px', borderRadius: 8,
                  border: `1.5px solid ${inp.error ? 'var(--color-error)' : (inp.focused || focusedInput === inp.id) ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: 'var(--color-bg-white)',
                  fontSize: 14, fontFamily: 'inherit', color: 'var(--color-text)',
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                  boxShadow: (inp.focused || focusedInput === inp.id) ? '0 0 0 3px rgba(61,107,82,0.16)' : 'none',
                }}
              />
              <span style={{ fontSize: 11, color: inp.error ? 'var(--color-error)' : 'var(--color-text-muted)' }}>{inp.hint}</span>
            </div>
          ))}
        </div>
      </Wrap>

      {/* 3. Badges */}
      <Section label="3 · 标签 / 徽章" />
      <Wrap>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {BADGES.map(b => (
            <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: b.bg, color: b.color }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
              {b.label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
          {[
            { label: 'Python', bg: 'rgba(61,107,82,0.13)', color: 'var(--color-accent)', radius: 6 },
            { label: '已保存', bg: 'rgba(47,125,74,.12)', color: 'var(--color-success)', radius: 6 },
            { label: '待审核', bg: 'rgba(180,83,9,.12)', color: 'var(--color-warning)', radius: 6 },
            { label: '失败', bg: 'rgba(192,57,43,.1)', color: 'var(--color-error)', radius: 6 },
            { label: '草稿', bg: 'rgba(28,38,32,0.08)', color: 'var(--color-text-secondary)', radius: 6 },
            { label: '用户偏好', bg: 'rgba(61,107,82,0.13)', color: 'var(--color-accent)', radius: 99 },
            { label: '项目背景', bg: 'rgba(47,125,74,.12)', color: 'var(--color-success)', radius: 99 },
          ].map(b => (
            <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: b.radius, fontSize: 12, fontWeight: 500, background: b.bg, color: b.color }}>
              {b.label}
            </span>
          ))}
        </div>
      </Wrap>

      {/* 4. Cards */}
      <Section label="4 · 卡片变体" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {CARDS.map(c => (
          <div key={c.label} style={{ background: c.bg, border: c.invert ? 'none' : '1px solid var(--color-border)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, opacity: .6, color: c.invert ? '#fff' : 'inherit' }}>{c.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: c.invert ? '#fff' : 'var(--color-text)' }}>{c.title}</div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: c.invert ? 'rgba(255,255,255,.7)' : 'var(--color-text-secondary)' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* 5. Border radius */}
      <Section label="5 · 圆角参考" />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {RADII.map(r => (
          <div key={r.label} style={{ background: 'var(--color-bg-white)', border: '1.5px solid var(--color-border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 18px' }}>
            <div style={{ width: 48, height: 48, background: 'rgba(61,107,82,0.16)', border: '2px solid var(--color-accent)', borderRadius: r.px }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.label}</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-accent)', fontWeight: 600 }}>{r.px}px</span>
          </div>
        ))}
        {/* Chat bubble asymmetric radius */}
        <div style={{ background: 'var(--color-bg-white)', border: '1.5px solid var(--color-border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 18px' }}>
          <div style={{ width: 56, height: 36, background: 'rgba(61,107,82,0.16)', border: '2px solid var(--color-accent)', borderRadius: '14px 14px 4px 14px' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>用户气泡</span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-accent)', fontWeight: 600 }}>14/14/4/14</span>
        </div>
      </div>

      {/* 6. Composer */}
      <Section label="6 · 输入框 (Composer)" />
      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
        <textarea
          value={composerText}
          onChange={e => setComposerText(e.target.value)}
          placeholder="向 Meso 发送消息…"
          rows={3}
          style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--color-text)', background: 'transparent', lineHeight: 1.6 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderTop: '1px solid var(--color-border-light)', paddingTop: 8 }}>
          {[
            <svg key="up" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 10V12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            <svg key="kb" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
            <svg key="tool" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 2.5a4 4 0 0 1-4 5.5L2 11.5 4.5 14l3.5-3.5A4 4 0 1 1 9.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          ].map((icon, i) => (
            <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(61,107,82,0.10)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' }}
            >{icon}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            style={{ background: composerText.trim() ? 'var(--color-accent)' : 'var(--color-border)', color: '#fff', border: 'none', cursor: composerText.trim() ? 'pointer' : 'default', padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', transition: 'background .12s' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 1L1 5.5l5 2 2 5L13 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>
            发送
          </button>
        </div>
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}
