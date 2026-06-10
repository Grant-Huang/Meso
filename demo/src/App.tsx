import { ThreeColumnLayout } from '@meso.ai/ui'
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
import { DocGenPage } from './pages/DocGenPage'
import { WorkflowPage } from './pages/WorkflowPage'
import { QuickstartPage } from './pages/QuickstartPage'
import { ToolsPage } from './pages/ToolsPage'
import PersonaPage from './pages/PersonaPage'
import ResourcesPage from './pages/ResourcesPage'
import ExtensionPage from './pages/ExtensionPage'

type Page = 'streaming' | 'layout' | 'live-chat' | 'typography' | 'components' | 'memory' | 'plugin' | 'docgen' | 'workflow' | 'quickstart' | 'tools' | 'persona' | 'resources' | 'extension'

const ALL_PAGES = new Set<Page>(['streaming', 'layout', 'live-chat', 'typography', 'components', 'memory', 'plugin', 'docgen', 'workflow', 'quickstart', 'tools', 'persona', 'resources', 'extension'])

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
  docgen: [
    { id: 'dg-1', title: '市场分析报告', lastTime: '今天' },
    { id: 'dg-2', title: '产品发布简报', lastTime: '今天' },
    { id: 'dg-3', title: '团队周会纪要', lastTime: '今天' },
  ],
  workflow: [{ id: 'wf-1', title: 'DAG 工作流观测', lastTime: '今天' }],
  quickstart: [{ id: 'qs-1', title: '快速接入示例', lastTime: '今天' }],
  tools: [{ id: 'tools-1', title: '工具集成 Demo', lastTime: '今天' }],
  persona: [{ id: 'persona-1', title: 'Soul · Skill 演示', lastTime: '今天' }],
  resources: [{ id: 'res-1', title: 'MCP 资源读取', lastTime: '今天' }],
  extension: [{ id: 'ext-1', title: 'Extension Events', lastTime: '今天' }],
}

const PAGE_TITLES: Record<Page, string> = {
  streaming: 'SSE 协议演示',
  layout: '布局规范',
  'live-chat': 'Live Chat',
  typography: '字体规范',
  components: '基础组件',
  memory: '记忆系统',
  plugin: '应用插件',
  docgen: '文档生成器',
  workflow: 'DAG 工作流可观测性',
  quickstart: '快速接入示例',
  tools: '工具集成',
  persona: 'Soul · Skill · Capabilities',
  resources: 'MCP Resource Reads',
  extension: 'Extension Events',
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
  docgen: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="1" width="10" height="13" rx="1.5"/><line x1="4.5" y1="5" x2="9.5" y2="5"/><line x1="4.5" y1="7.5" x2="9.5" y2="7.5"/><line x1="4.5" y1="10" x2="7.5" y2="10"/><circle cx="13" cy="13" r="2.5" fill="var(--color-accent)" stroke="none"/><line x1="12" y1="13" x2="14" y2="13" stroke="white" strokeWidth="1.2"/><line x1="13" y1="12" x2="13" y2="14" stroke="white" strokeWidth="1.2"/></svg>,
  workflow: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="3" cy="3.5" r="1.5"/><circle cx="13" cy="3.5" r="1.5"/><circle cx="3" cy="12.5" r="1.5"/><circle cx="13" cy="12.5" r="1.5"/><circle cx="8" cy="8" r="1.5"/><line x1="4.5" y1="3.5" x2="6.5" y2="8"/><line x1="11.5" y1="3.5" x2="9.5" y2="8"/><line x1="6.5" y1="8" x2="4.5" y2="12.5"/><line x1="9.5" y1="8" x2="11.5" y2="12.5"/></svg>,
  quickstart: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8h12M9 4l5 4-5 4"/></svg>,
  tools: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 2.5a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-1.5-.4L3 14l-1-1 6-6a3 3 0 0 1-.5-1.5 3 3 0 0 1 3-3z"/></svg>,
  persona: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5.5" r="3"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"/></svg>,
  resources: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M10 2v4h4" opacity=".6"/><line x1="5" y1="8" x2="11" y2="8" opacity=".7"/><line x1="5" y1="11" x2="9" y2="11" opacity=".7"/></svg>,
  extension: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="5" height="5" rx="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2" opacity=".6"/><rect x="2" y="9" width="5" height="5" rx="1.2" opacity=".6"/><path d="M9 11.5h4M11 9.5v4" strokeWidth="1.8"/></svg>,
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
    { id: 'docgen',      label: '文档生成',   icon: Icons.docgen,      active: page === 'docgen',      onClick: () => navigate('docgen') },
    { id: 'workflow',    label: 'DAG 工作流', icon: Icons.workflow,    active: page === 'workflow',    onClick: () => navigate('workflow') },
    { id: 'quickstart',  label: '接入示例',   icon: Icons.quickstart,  active: page === 'quickstart',  onClick: () => navigate('quickstart') },
    { id: 'tools',       label: '工具集成',   icon: Icons.tools,       active: page === 'tools',       onClick: () => navigate('tools') },
    { id: 'persona',     label: 'Soul / Skill', icon: Icons.persona,   active: page === 'persona',     onClick: () => navigate('persona') },
    { id: 'resources',   label: 'MCP 资源',   icon: Icons.resources,   active: page === 'resources',   onClick: () => navigate('resources') },
    { id: 'extension',   label: 'Extension',  icon: Icons.extension,   active: page === 'extension',   onClick: () => navigate('extension') },
  ]

  // Static showcase pages don't need a session column "new" button
  const isStaticPage = ['layout', 'typography', 'components', 'memory', 'plugin', 'docgen', 'workflow', 'quickstart', 'tools', 'persona', 'resources', 'extension'].includes(page)

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
        {page === 'layout'     && <LayoutPage />}
        {page === 'typography' && <TypographyPage />}
        {page === 'components' && <ComponentsPage />}
        {page === 'memory'     && <MemoryPage />}
        {page === 'plugin'     && <PluginPage />}
        {page === 'docgen'     && <DocGenPage key={activeSessionId} />}
        {page === 'workflow'   && <WorkflowPage />}
        {page === 'quickstart' && <QuickstartPage />}
        {page === 'tools'      && <ToolsPage />}
        {page === 'persona'    && <PersonaPage />}
        {page === 'resources'  && <ResourcesPage />}
        {page === 'extension'  && <ExtensionPage />}
      </ThreeColumnLayout>
    </div>
  )
}
