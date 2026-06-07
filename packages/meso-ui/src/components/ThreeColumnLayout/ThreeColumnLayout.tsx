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
  /** Main area content (chat column) */
  children: React.ReactNode
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean
  /** App name shown in sidebar header */
  appName?: string
  /** Custom logo node replacing the default letter avatar (e.g. <MyMark size={26} />). */
  sidebarLogo?: React.ReactNode
  /** Custom title node replacing the default appName text (e.g. <MyWordmark size={15} />). */
  sidebarTitle?: React.ReactNode
  /** Optional header content for the main area topbar (left side) */
  mainHeader?: React.ReactNode
  /** Content rendered in the artifact pane. May be null/undefined; the toggle button is always shown. */
  artifactPanel?: React.ReactNode
  /** Whether the artifact pane starts visible */
  defaultArtifactVisible?: boolean
  /** Called whenever the artifact pane is toggled */
  onArtifactToggle?: (visible: boolean) => void
  /** Controlled artifact pane visibility. When provided, overrides internal state. */
  artifactVisible?: boolean
  /** Hide the artifact toggle button. Default true (button visible). */
  showArtifactToggle?: boolean
  /** Hide the session column. Default true (column visible). */
  showSessionColumn?: boolean
  /** Max-width of the chat content area, e.g. 860 or "860px". */
  contentMaxWidth?: number | string
  /** Width of the artifact panel when visible, e.g. 480 or "480px". Defaults to 40% of main area. */
  artifactPanelWidth?: number | string
  /** Called when the sidebar collapsed state changes. */
  onCollapsedChange?: (collapsed: boolean) => void
}

export function ThreeColumnLayout({
  navItems = [],
  sidebarFooter,
  sessionColumn,
  children,
  defaultCollapsed = false,
  appName = 'Meso',
  sidebarLogo,
  sidebarTitle,
  mainHeader,
  artifactPanel,
  defaultArtifactVisible = false,
  onArtifactToggle,
  artifactVisible,
  showArtifactToggle = true,
  showSessionColumn = true,
  contentMaxWidth,
  artifactPanelWidth,
  onCollapsedChange,
}: ThreeColumnLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [internalArtifactVisible, setInternalArtifactVisible] = useState(defaultArtifactVisible)

  const isArtifactVisible = artifactVisible !== undefined ? artifactVisible : internalArtifactVisible

  const toggleArtifact = () => {
    const next = !isArtifactVisible
    if (artifactVisible === undefined) setInternalArtifactVisible(next)
    onArtifactToggle?.(next)
  }

  return (
    <div className="meso-layout">
      {/* Left sidebar */}
      <aside className={`meso-sidebar${collapsed ? ' meso-sidebar--collapsed' : ''}`}>
        <div className="meso-sidebar__header">
          {sidebarLogo ? (
            <div className="meso-sidebar__logo meso-sidebar__logo--custom">{sidebarLogo}</div>
          ) : (
            <div className="meso-sidebar__logo">{appName[0]}</div>
          )}
          {sidebarTitle ? (
            <span className="meso-sidebar__title meso-sidebar__title--brand">{sidebarTitle}</span>
          ) : (
            <span className="meso-sidebar__title">{appName}</span>
          )}
          <button
            className="meso-sidebar__toggle"
            onClick={() => { const next = !collapsed; setCollapsed(next); onCollapsedChange?.(next) }}
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
      {showSessionColumn !== false && <div className="meso-session-col">{sessionColumn}</div>}

      {/* Right main area */}
      <main className="meso-main">
        {/* Topbar: always rendered so the artifact toggle is always visible */}
        <div className="meso-main__header">
          <div className="meso-main__header-content">{mainHeader}</div>
          {showArtifactToggle !== false && (
            <button
              className={`meso-artifact-toggle${isArtifactVisible ? ' meso-artifact-toggle--active' : ''}`}
              onClick={toggleArtifact}
              title={isArtifactVisible ? '关闭 Artifact' : '打开 Artifact'}
              aria-label={isArtifactVisible ? '关闭 Artifact' : '打开 Artifact'}
            >
              {isArtifactVisible ? (
                /* X / close icon */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                /* Panel / artifact icon */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="14" y1="3" x2="14" y2="21"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Body: chat + optional artifact pane */}
        <div className="meso-main__content">
          <div className="meso-main__chat" style={contentMaxWidth ? { maxWidth: contentMaxWidth, margin: '0 auto', width: '100%' } : undefined}>{children}</div>
          {isArtifactVisible && (
            <>
              <div className="meso-artifact-divider" aria-hidden="true" />
              <div
                className="meso-artifact-pane"
                style={artifactPanelWidth != null ? { width: artifactPanelWidth, minWidth: artifactPanelWidth, maxWidth: artifactPanelWidth } : undefined}
              >{artifactPanel}</div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
