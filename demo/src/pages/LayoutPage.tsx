import React from 'react'

export function LayoutPage() {
  return (
    <div style={{
      padding: '32px 40px',
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box',
      color: 'var(--color-text)',
    }}>
      <h2 style={{ fontSize: 18, fontWeight: 650, marginBottom: 4 }}>ThreeColumnLayout</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 32 }}>
        当前页面本身就运行在 ThreeColumnLayout 内——左侧是侧边栏，中间是会话列，这里是主内容区。
      </p>

      {/* Dimension tokens */}
      <Section title="尺寸 Token">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {([
            ['--sidebar-w', '145px', '侧栏展开宽度'],
            ['--sidebar-w-collapsed', '52px', '侧栏折叠宽度'],
            ['--session-col-w', '260px', '会话列宽度'],
          ] as const).map(([token, value, label]) => (
            <TokenCard key={token} token={token} value={value} label={label} />
          ))}
        </div>
      </Section>

      {/* Columns */}
      <Section title="三栏结构">
        <div style={{ display: 'flex', gap: 12 }}>
          {([
            ['侧边栏', 'meso-sidebar', '固定宽度，flex-shrink: 0，折叠动画 0.2s'],
            ['会话列', 'meso-session-col', '固定宽度，≤900px 自动隐藏'],
            ['主内容区', 'meso-main', 'flex: 1，承载 topbar + 内容 + artifact 面板'],
          ] as const).map(([name, cls, desc]) => (
            <div key={cls} style={{
              flex: 1,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{name}</div>
              <code style={{ fontSize: 11, color: 'var(--color-accent)', display: 'block', marginBottom: 6 }}>.{cls}</code>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Responsive */}
      <Section title="响应式断点">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([
            ['> 900px', '三栏全部显示'],
            ['≤ 900px', '会话列隐藏（display: none）'],
            ['≤ 600px', '侧边栏强制折叠为图标模式'],
          ] as const).map(([bp, desc]) => (
            <div key={bp} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '10px 14px',
            }}>
              <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', minWidth: 80 }}>{bp}</code>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Props */}
      <Section title="核心 Props">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Prop', '类型', '说明'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              ['navItems', 'NavItem[]', '侧边栏导航项，含 icon / label / active / onClick'],
              ['sessionColumn', 'ReactNode', '会话列完整内容'],
              ['children', 'ReactNode', '主内容区'],
              ['sidebarFooter', 'ReactNode', '侧边栏底部（用户菜单等）'],
              ['mainHeader', 'ReactNode', '主区顶栏左侧内容'],
              ['artifactPanel', 'ReactNode', 'Artifact 面板内容，toggle 按钮始终可见'],
              ['defaultCollapsed', 'boolean', '侧边栏初始折叠状态'],
              ['contentMaxWidth', 'number | string', '聊天内容区最大宽度'],
            ] as const).map(([prop, type, desc]) => (
              <tr key={prop} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '8px 12px' }}><code style={{ color: 'var(--color-accent)' }}>{prop}</code></td>
                <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{type}</td>
                <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function TokenCard({ token, value, label }: { token: string; value: string; label: string }) {
  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '14px 16px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-accent)', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{label}</div>
      <code style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{token}</code>
    </div>
  )
}
