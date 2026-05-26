import React, { useState, useEffect, useRef } from 'react'
import './ArtifactPaneShell.css'

export interface ArtifactTab {
  id: string
  label: string
  content: React.ReactNode
  /**
   * When true, this tab is considered "ready" (content has loaded/streamed).
   * Used with autoSelectFirstReady to switch to the first tab that becomes ready.
   */
  ready?: boolean
}

export interface ArtifactPaneShellProps {
  tabs: ArtifactTab[]
  /** Controlled active tab id. */
  activeTabId?: string
  /** Called when user clicks a tab. */
  onTabChange?: (id: string) => void
  /**
   * When true, automatically select the first tab that transitions to ready=true.
   * Only fires once — subsequent ready transitions don't override user selection.
   */
  autoSelectFirstReady?: boolean
}

export function ArtifactPaneShell({
  tabs,
  activeTabId,
  onTabChange,
  autoSelectFirstReady = false,
}: ArtifactPaneShellProps) {
  const isControlled = activeTabId !== undefined
  const [internalActive, setInternalActive] = useState(tabs[0]?.id ?? '')
  const activeId = isControlled ? activeTabId! : internalActive
  const hasAutoSelected = useRef(false)

  // Auto-select first ready tab (only once, don't override user selection)
  useEffect(() => {
    if (!autoSelectFirstReady || hasAutoSelected.current) return
    const firstReady = tabs.find(t => t.ready)
    if (!firstReady) return
    hasAutoSelected.current = true
    if (!isControlled) setInternalActive(firstReady.id)
    onTabChange?.(firstReady.id)
  }, [tabs, autoSelectFirstReady, isControlled, onTabChange])

  const selectTab = (id: string) => {
    if (!isControlled) setInternalActive(id)
    onTabChange?.(id)
  }

  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0]

  if (tabs.length === 0) return null

  return (
    <div className="meso-artifact-shell">
      <div className="meso-artifact-shell__tabs" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            className={`meso-artifact-shell__tab${tab.id === activeId ? ' meso-artifact-shell__tab--active' : ''}`}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
            {tab.ready === false && (
              <span className="meso-artifact-shell__tab-dot" aria-label="加载中" />
            )}
          </button>
        ))}
      </div>
      <div className="meso-artifact-shell__content" role="tabpanel">
        {activeTab?.content}
      </div>
    </div>
  )
}
