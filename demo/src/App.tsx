import { ThreeColumnLayout } from '@meso/ui'
import { useState, useEffect } from 'react'
import { SessionList } from './components/SessionList'
import type { Session } from './components/SessionList'
import { SidebarFooter } from './components/SidebarFooter'
import { StreamingPage } from './pages/StreamingPage'
import { LayoutPage } from './pages/LayoutPage'
import { LiveChatPage } from './pages/LiveChatPage'
import { TypographyPage } from './pages/TypographyPage'
import { ComponentsPage } from './pages/ComponentsPage'
import { MemoryPage } from './pages/MemoryPage'
import { PluginPage } from './pages/PluginPage'

type Page = 'streaming' | 'layout' | 'live-chat' | 'typography' | 'components' | 'memory' | 'plugin'

const ALL_PAGES = new Set<Page>(['streaming', 'layout', 'live-chat', 'typography', 'components', 'memory', 'plugin'])

const PAGE_SESSIONS: Record<Page, Session[]> = {
  streaming: [
    { id: 'mock-1', title: 'Mock 流式演示', lastTime: '刚刚' },
    { id: 'mock-2', title: '协议事件测试', lastTime: '今天' },
  ],
  layout: [{ id: 'layout-1', title: 'ThreeColumnLayout', lastTime: '今天' }],
  'live-chat': [{ id: 'live-1', title: '真实 API 对话', lastTime: '今天' }],
  typography: [{ id: 'typo-1', title: '字体规范', lastTime: '今天' }],
  components: [{ id: 'comp-1', title: '基础组件', lastTime: '今天' }],
  memory: [{ id: 'mem-1', title: '记忆系统', lastTime: '今天' }],
  plugin: [{ id: 'plug-1', title: '应用插件', lastTime: '今天' }],
}

const PAGE_TITLES: Record<Page, string> = {
  streaming: 'SSE 协议演示',
  layout: '布局规范',
  'live-chat': 'Live Chat',
  typography: '字体规范',
  components: '基础组件',
  memory: '记忆系统',
  plugin: '应用插件',
}

// SVG icons
const Icons = {
  streaming: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4l5 4-5 4M9 12h4"/></svg>,
  layout: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="5" height="14" rx="1" opacity=".9"/><rect x="8" y="1" width="7" height="6" rx="1" opacity=".9"/><rect x="8" y="9" width="7" height="6" rx="1" opacity=".6"/></svg>,
  liveChat: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z"/></svg>,
  typography: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h12M2 7h8M2 11h10"/></svg>,
  components: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/></svg>,
  memory: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="8" cy="5" rx="6" ry="2.5"/><path d="M2 5v6c0 1.38 2.69 2.5 6 2.5S14 12.38 14 11V5"/><path d="M2 8c0 1.38 2.69 2.5 6 2.5S14 9.38 14 8" opacity=".4"/></svg>,
  plugin: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.2" opacity=".6"/><rect x="1" y="9" width="6" height="6" rx="1.2" opacity=".6"/><rect x="9" y="9" width="6" height="6" rx="1.2" opacity=".4"/></svg>,
}

function getPageFromHash(): Page {
  const h = location.hash.slice(1) as Page
  return ALL_PAGES.has(h) ? h : 'streaming'
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)
  const [sessions, setSessions] = useState<Session[]>(PAGE_SESSIONS[page])
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(PAGE_SESSIONS[page][0]?.id)

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

  const navigate = (p: Page) => { location.hash = p }

  const createSession = () => {
    const id = crypto.randomUUID()
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    setSessions(prev => [{ id, title: '新对话', lastTime: now }, ...prev])
    setActiveSessionId(id)
  }

  const navItems = [
    { id: 'streaming',   label: 'SSE 演示',  icon: Icons.streaming,   active: page === 'streaming',   onClick: () => navigate('streaming') },
    { id: 'layout',      label: '布局',       icon: Icons.layout,      active: page === 'layout',      onClick: () => navigate('layout') },
    { id: 'live-chat',   label: '真实 API',   icon: Icons.liveChat,    active: page === 'live-chat',   onClick: () => navigate('live-chat') },
    { id: 'typography',  label: '字体',       icon: Icons.typography,  active: page === 'typography',  onClick: () => navigate('typography') },
    { id: 'components',  label: '组件',       icon: Icons.components,  active: page === 'components',  onClick: () => navigate('components') },
    { id: 'memory',      label: '记忆',       icon: Icons.memory,      active: page === 'memory',      onClick: () => navigate('memory') },
    { id: 'plugin',      label: '插件',       icon: Icons.plugin,      active: page === 'plugin',      onClick: () => navigate('plugin') },
  ]

  // LayoutPage manages its own full-height container
  if (page === 'layout') return <LayoutPage />

  // Static showcase pages don't need a session column "new" button
  const isStaticPage = ['typography', 'components', 'memory', 'plugin'].includes(page)

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
            onNew={isStaticPage ? () => {} : createSession}
          />
        }
        mainHeader={
          <div style={{ padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 400, color: 'var(--color-text-secondary)', gap: 8 }}>
            {PAGE_TITLES[page]}
          </div>
        }
      >
        {page === 'streaming'  && <StreamingPage  key={activeSessionId} sessionId={activeSessionId ?? ''} />}
        {page === 'live-chat'  && <LiveChatPage   key={activeSessionId} sessionId={activeSessionId ?? ''} />}
        {page === 'typography' && <TypographyPage />}
        {page === 'components' && <ComponentsPage />}
        {page === 'memory'     && <MemoryPage />}
        {page === 'plugin'     && <PluginPage />}
      </ThreeColumnLayout>
    </div>
  )
}
