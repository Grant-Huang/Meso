import { useEffect, useRef, useState } from 'react'
import './ThinkBlock.css'

export interface ThinkBlockProps {
  content: string
  streaming?: boolean
  /**
   * Delay in ms before auto-collapsing when streaming ends.
   * Pass null to disable auto-collapse. Default 1500.
   */
  autoCollapseDelay?: number | null
  /** Initial open state. Defaults to true. */
  defaultOpen?: boolean
  /** Controlled open state. When provided, component is fully controlled. */
  open?: boolean
  /** Called when the open state changes (user click or auto-collapse). */
  onOpenChange?: (open: boolean) => void
  /**
   * 'streamEnd' (default): auto-collapse after streaming ends (respects autoCollapseDelay).
   * 'never': never auto-collapse; user must click to collapse.
   */
  collapseWhen?: 'streamEnd' | 'never'
  /** Label shown in the header when collapsed. Default "已思考". */
  summary?: string
}

export function ThinkBlock({
  content,
  streaming = false,
  autoCollapseDelay = 1500,
  defaultOpen = true,
  open,
  onOpenChange,
  collapseWhen = 'streamEnd',
  summary = '已思考',
}: ThinkBlockProps) {
  const isControlled = open !== undefined

  // System open state — managed by auto-collapse timer
  const [systemOpen, setSystemOpen] = useState(defaultOpen)
  // User intent: null = follow system; true/false = user has explicitly toggled
  const [userIntent, setUserIntent] = useState<boolean | null>(null)
  const userIntentRef = useRef<boolean | null>(null)
  userIntentRef.current = userIntent

  const isOpen = isControlled ? open! : (userIntent !== null ? userIntent : systemOpen)

  const prevStreaming = useRef(streaming)

  const handleToggle = () => {
    const next = !isOpen
    if (!isControlled) setUserIntent(next)
    onOpenChange?.(next)
  }

  // Auto-collapse: updates system default; user intent overrides it
  useEffect(() => {
    if (collapseWhen === 'never') return
    if (autoCollapseDelay === null) return
    if (prevStreaming.current && !streaming) {
      const timer = setTimeout(() => {
        if (!isControlled) setSystemOpen(false)
        // Only fire onOpenChange if user hasn't overridden the collapse
        if (userIntentRef.current === null) onOpenChange?.(false)
      }, autoCollapseDelay)
      return () => clearTimeout(timer)
    }
    prevStreaming.current = streaming
  }, [streaming, autoCollapseDelay, collapseWhen, isControlled, onOpenChange])

  const label = isOpen ? '思考过程' : summary

  return (
    <div className={`meso-think${isOpen ? ' meso-think--open' : ''}`}>
      <button
        className="meso-think__header"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <svg className="meso-think__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,5 7,9 11,5"/>
        </svg>
        <span className="meso-think__label">{label}</span>
        {streaming && <span className="meso-think__dot" aria-label="思考中" />}
      </button>
      <div className="meso-think__body">
        <div className="meso-think__content">
          {content}
          {streaming && (
            <span className="meso-think__cursor" aria-hidden="true">▋</span>
          )}
        </div>
      </div>
    </div>
  )
}
