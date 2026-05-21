import { ThreeColumnLayout } from '@meso/ui'
import { useState } from 'react'
import { SessionList } from '../components/SessionList'
import type { Session } from '../components/SessionList'
import { SidebarFooter } from '../components/SidebarFooter'

const SAMPLE_SESSIONS: Session[] = [
  { id: 's1', title: 'ThreeColumnLayout 用法', lastTime: '10:30' },
  { id: 's2', title: '侧栏折叠动画', lastTime: '09:15' },
  { id: 's3', title: '响应式断点测试', lastTime: '昨天' },
]

// Minimal SVG icons
const Icons = {
  chat: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z"/>
  </svg>,
  layout: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="14" rx="1"/>
    <rect x="9" y="1" width="6" height="6" rx="1"/>
    <rect x="9" y="9" width="6" height="6" rx="1"/>
  </svg>,
  settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="2.5"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
  </svg>,
}

export function LayoutPage() {
  const [sessions, setSessions] = useState<Session[]>(SAMPLE_SESSIONS)
  const [activeId, setActiveId] = useState<string | undefined>('s1')
  const [activeNav, setActiveNav] = useState('chat')

  const navItems = [
    {
      id: 'chat',
      label: '对话',
      icon: Icons.chat,
      active: activeNav === 'chat',
      onClick: () => setActiveNav('chat'),
    },
    {
      id: 'layout',
      label: '布局',
      icon: Icons.layout,
      active: activeNav === 'layout',
      onClick: () => setActiveNav('layout'),
    },
    {
      id: 'settings',
      label: '设置',
      icon: Icons.settings,
      active: activeNav === 'settings',
      onClick: () => setActiveNav('settings'),
    },
  ]

  const createSession = () => {
    const id = crypto.randomUUID()
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    setSessions(prev => [{ id, title: '新对话', lastTime: now }, ...prev])
    setActiveId(id)
  }

  const activeSession = sessions.find(s => s.id === activeId)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Info bar above layout */}
      <div style={{
        padding: '8px 16px',
        background: 'var(--color-accent)',
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        ThreeColumnLayout 演示 — 点击侧栏箭头折叠，缩小窗口测试响应式断点（≤900px 隐藏会话列）
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ThreeColumnLayout
          appName="Meso Demo"
          navItems={navItems}
          sidebarFooter={<SidebarFooter />}
          sessionColumn={
            <SessionList
              sessions={sessions}
              activeId={activeId}
              onSelect={setActiveId}
              onNew={createSession}
            />
          }
          mainHeader={
            <div style={{
              padding: '0 20px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              {activeSession?.title ?? '选择会话'}
            </div>
          }
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 16,
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
              <p style={{ marginBottom: 8 }}>
                当前 nav：<strong style={{ color: 'var(--color-accent)' }}>{activeNav}</strong>
                {activeSession && <> · 会话：<strong style={{ color: 'var(--color-accent)' }}>{activeSession.title}</strong></>}
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                这是 ThreeColumnLayout 的主内容区（flex:1）。
                点击导航项、切换会话、折叠侧栏，体验布局系统。
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}>
              {[
                ['侧栏展开', '145px', '--sidebar-w'],
                ['侧栏折叠', '52px', '--sidebar-w-collapsed'],
                ['会话列', '260px', '--session-col-w'],
              ].map(([label, value, token]) => (
                <div key={token} style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{value}</div>
                  <div>{label}</div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', marginTop: 4 }}>{token}</div>
                </div>
              ))}
            </div>
          </div>
        </ThreeColumnLayout>
      </div>
    </div>
  )
}
