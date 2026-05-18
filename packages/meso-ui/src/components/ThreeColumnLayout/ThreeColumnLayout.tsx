import React, { useState } from 'react'
import './ThreeColumnLayout.css'

export interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export interface ThreeColumnLayoutProps {
  /** Nav items for the left sidebar */
  navItems?: NavItem[]
  /** Content for the bottom of the sidebar (e.g. user avatar/menu) */
  sidebarFooter?: React.ReactNode
  /** Full content of the middle session column */
  sessionColumn: React.ReactNode
  /** Main area content (right column) */
  children: React.ReactNode
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean
  /** App name shown in sidebar header */
  appName?: string
  /** Optional header content for the main area */
  mainHeader?: React.ReactNode
}

export function ThreeColumnLayout({
  navItems = [],
  sidebarFooter,
  sessionColumn,
  children,
  defaultCollapsed = false,
  appName = 'Meso',
  mainHeader,
}: ThreeColumnLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className="meso-layout">
      {/* Left sidebar */}
      <aside className={`meso-sidebar${collapsed ? ' meso-sidebar--collapsed' : ''}`}>
        <div className="meso-sidebar__header">
          <div className="meso-sidebar__logo">{appName[0]}</div>
          <span className="meso-sidebar__title">{appName}</span>
          <button
            className="meso-sidebar__toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
          >
            {/* Hamburger icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="4" x2="14" y2="4"/>
              <line x1="2" y1="8" x2="14" y2="8"/>
              <line x1="2" y1="12" x2="14" y2="12"/>
            </svg>
          </button>
        </div>
        <nav className="meso-sidebar__nav">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`meso-sidebar__nav-item${item.active ? ' meso-sidebar__nav-item--active' : ''}`}
              onClick={item.onClick}
              title={item.label}
            >
              <span className="meso-sidebar__nav-icon">{item.icon}</span>
              <span className="meso-sidebar__nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        {sidebarFooter && (
          <div className="meso-sidebar__footer">{sidebarFooter}</div>
        )}
      </aside>

      {/* Middle session column */}
      <div className="meso-session-col">
        {sessionColumn}
      </div>

      {/* Right main area */}
      <main className="meso-main">
        {mainHeader && <div className="meso-main__header">{mainHeader}</div>}
        <div className="meso-main__content">{children}</div>
      </main>
    </div>
  )
}
