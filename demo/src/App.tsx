import { ThreeColumnLayout } from '@meso/ui'
import { useState, useEffect } from 'react'
import { SessionList } from './components/SessionList'
import type { Session } from './components/SessionList'
import { SidebarFooter } from './components/SidebarFooter'
import { StreamingPage } from './pages/StreamingPage'
import { LayoutPage } from './pages/LayoutPage'
import { LiveChatPage } from './pages/LiveChatPage'

type Page = 'streaming' | 'layout' | 'live-chat'

const PAGE_SESSIONS: Record<Page, Session[]> = {
  streaming: [
    { id: 'mock-1', title: 'Mock 流式演示', lastTime: '刚刚' },
    { id: 'mock-2', title: '协议事件测试', lastTime: '今天' },
  ],
  layout: [
    { id: 'layout-1', title: 'ThreeColumnLayout', lastTime: '今天' },
  ],
  'live-chat': [
    { id: 'live-1', title: '真实 API 对话', lastTime: '今天' },
  ],
}

// SVG icons
const Icons = {
  streaming: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4l5 4-5 4M9 12h4"/>
    </svg>
  ),
  layout: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="5" height="14" rx="1" opacity=".9"/>
      <rect x="8" y="1" width="7" height="6" rx="1" opacity=".9"/>
      <rect x="8" y="9" width="7" height="6" rx="1" opacity=".6"/>
    </svg>
  ),
  liveChat: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z"/>
    </svg>
  ),
}

function getPageFromHash(): Page {
  const h = location.hash.slice(1)
  if (h === 'layout' || h === 'live-chat') return h
  return 'streaming'
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)
  const [sessions, setSessions] = useState<Session[]>(PAGE_SESSIONS[page])
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    PAGE_SESSIONS[page][0]?.id,
  )

  useEffect(() => {
    const onHash = () => {
      const p = getPageFromHash()
      setPage(p)
      setSessions(PAGE_SESSIONS[p])
      setActiveSessionId(PAGE_SESSIONS[p][0]?.id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (p: Page) => {
    location.hash = p
  }

  const navItems = [
    {
      id: 'streaming',
      label: 'SSE 演示',
      icon: Icons.streaming,
      active: page === 'streaming',
      onClick: () => navigate('streaming'),
    },
    {
      id: 'layout',
      label: '布局',
      icon: Icons.layout,
      active: page === 'layout',
      onClick: () => navigate('layout'),
    },
    {
      id: 'live-chat',
      label: '真实 API',
      icon: Icons.liveChat,
      active: page === 'live-chat',
      onClick: () => navigate('live-chat'),
    },
  ]

  const createSession = () => {
    const id = crypto.randomUUID()
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const newSession: Session = { id, title: '新对话', lastTime: now }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(id)
  }

  // LayoutPage manages its own full-height layout, render it standalone
  if (page === 'layout') {
    return <LayoutPage />
  }

  return (
    <div style={{ height: '100vh' }}>
      <ThreeColumnLayout
        appName="Meso Demo"
        navItems={navItems}
        sidebarFooter={<SidebarFooter />}
        sessionColumn={
          <SessionList
            sessions={sessions}
            activeId={activeSessionId}
            onSelect={setActiveSessionId}
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
            fontWeight: 600,
            color: 'var(--color-text)',
            gap: 8,
          }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
              {page === 'streaming' ? 'SSE 协议演示' : 'Live Chat'}
            </span>
          </div>
        }
      >
        {page === 'streaming' && <StreamingPage key={activeSessionId} />}
        {page === 'live-chat' && <LiveChatPage key={activeSessionId} />}
      </ThreeColumnLayout>
    </div>
  )
}
