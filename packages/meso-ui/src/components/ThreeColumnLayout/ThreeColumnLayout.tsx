import React, { useState, useCallback, useEffect, useRef } from 'react'
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
  sessionColumn?: React.ReactNode
  /** Whether the session column is visible */
  sessionColumnVisible?: boolean
  /** Main area content (chat pane) */
  children: React.ReactNode
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean
  /** App name shown in sidebar header */
  appName?: string
  /**
   * Custom logo node shown in sidebar header.
   * When provided, replaces the default letter-initial square.
   */
  logo?: React.ReactNode
  /** Optional header content for the main area */
  mainHeader?: React.ReactNode
  /** Content rendered in the artifact pane (right side of split layout) */
  artifactContent?: React.ReactNode
  /** Whether to show the split layout */
  splitMode?: boolean
  /** Callback when splitMode changes (e.g. user collapses artifact pane) */
  onSplitModeChange?: (split: boolean) => void
  /** Initial chat/artifact split ratio (0.4–0.8), default 0.6 */
  defaultSplitRatio?: number
  /** Callback when ratio changes after drag */
  onSplitRatioChange?: (ratio: number) => void
  /** localStorage key to persist split ratio; omit to skip persistence */
  splitRatioStorageKey?: string
}

const RATIO_MIN = 0.4
const RATIO_MAX = 0.8
const RATIO_DEFAULT = 0.6

function readStoredRatio(key: string | undefined, fallback: number): number {
  if (!key) return fallback
  try {
    const v = parseFloat(localStorage.getItem(key) ?? '')
    if (!isNaN(v) && v >= RATIO_MIN && v <= RATIO_MAX) return v
  } catch {}
  return fallback
}

function writeStoredRatio(key: string | undefined, ratio: number) {
  if (!key) return
  try { localStorage.setItem(key, String(ratio)) } catch {}
}

export function ThreeColumnLayout({
  navItems = [],
  sidebarFooter,
  sessionColumn,
  sessionColumnVisible = true,
  children,
  defaultCollapsed = false,
  appName = 'Meso',
  logo,
  mainHeader,
  artifactContent,
  splitMode = false,
  onSplitModeChange,
  defaultSplitRatio = RATIO_DEFAULT,
  onSplitRatioChange,
  splitRatioStorageKey,
}: ThreeColumnLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [ratio, setRatio] = useState(() =>
    readStoredRatio(splitRatioStorageKey, defaultSplitRatio)
  )

  const dragging = useRef(false)
  const mainRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !mainRef.current) return
    const rect = mainRef.current.getBoundingClientRect()
    const raw = (e.clientX - rect.left) / rect.width
    const clamped = Math.min(RATIO_MAX, Math.max(RATIO_MIN, raw))
    setRatio(clamped)
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
    setRatio(prev => {
      writeStoredRatio(splitRatioStorageKey, prev)
      onSplitRatioChange?.(prev)
      return prev
    })
  }, [splitRatioStorageKey, onSplitRatioChange])

  // Persist when splitRatioStorageKey changes
  useEffect(() => {
    writeStoredRatio(splitRatioStorageKey, ratio)
  }, [splitRatioStorageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const showSplit = splitMode && !!artifactContent

  return (
    <div className="meso-layout">
      {/* Left sidebar */}
      <aside className={`meso-sidebar${collapsed ? ' meso-sidebar--collapsed' : ''}`}>
        <div className="meso-sidebar__header">
          <div className={`meso-sidebar__logo${logo ? ' meso-sidebar__logo--custom' : ''}`}>
            {logo ?? appName[0]}
          </div>
          <span className="meso-sidebar__title">{appName}</span>
          <button
            className="meso-sidebar__toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
          >
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
      {sessionColumn !== undefined && (
        <div className={`meso-session-col${!sessionColumnVisible ? ' meso-session-col--hidden' : ''}`}>
          {sessionColumn}
        </div>
      )}

      {/* Right main area */}
      <main className="meso-main" ref={mainRef}>
        {mainHeader && (
          <div className="meso-main__header">
            {mainHeader}
            {artifactContent && (
              <button
                className="meso-main__artifact-toggle"
                onClick={() => onSplitModeChange?.(!splitMode)}
                aria-label={splitMode ? '收起预览' : '展开预览'}
                title={splitMode ? '收起预览' : '展开预览'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {splitMode ? (
                    // collapse: chevron right
                    <polyline points="6,3 11,8 6,13"/>
                  ) : (
                    // expand: split columns icon
                    <>
                      <rect x="1" y="2" width="14" height="12" rx="1.5"/>
                      <line x1="8" y1="2" x2="8" y2="14"/>
                    </>
                  )}
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="meso-main__content">
          {showSplit ? (
            <>
              <div
                className="meso-main__chat"
                style={{ width: `${ratio * 100}%` }}
              >
                {children}
              </div>

              <div
                className="meso-split-divider"
                role="separator"
                aria-label="拖动调整宽度"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />

              <div className="meso-main__artifact">
                {artifactContent}
              </div>
            </>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  )
}
