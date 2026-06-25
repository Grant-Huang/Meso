import { useEffect, useRef, useState } from 'react'
import { StreamingCursor } from '../StreamingCursor'
import { resolveVerbosity } from '../../utils/verbosity'
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace'
import './ThinkBlock.css'

export interface ThinkBlockProps {
  content: string
  /**
   * Frozen snapshot of the content taken when streaming ended.
   * When provided and streaming is false, this is displayed instead of
   * `content` — preventing a flash if `content` changes after stream end.
   */
  pinnedContent?: string
  streaming?: boolean
  /**
   * Whether the parent conversation turn is still streaming.
   * When it transitions false → false, the user's manual fold/unfold intent
   * is reset so the next turn starts with the system default.
   */
  turnStreaming?: boolean
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
  /**
   * Label shown in the header when collapsed.
   * When omitted, a one-line summary is derived dynamically from the last
   * sentence of `content` (so the collapsed header reflects the *conclusion*
   * of the thinking, not a static "已思考").
   */
  summary?: string
  /**
   * Verbosity options. When provided, derives defaultOpen and collapseWhen
   * from the verbosity level unless explicitly overridden by those props:
   *   compact  → defaultOpen=false
   *   standard → defaultOpen=true, collapseWhen='streamEnd'
   *   detailed → defaultOpen=true, collapseWhen='never'
   */
  simplify?: SimplifyOptions
}

/**
 * Derive a one-line collapsed-header summary from think content.
 * Takes the last sentence (the conclusion) and truncates it.
 */
function deriveThinkSummary(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return '已思考'
  const sentences = cleaned.split(/(?<=[。！？.!?])/).map(s => s.trim()).filter(Boolean)
  const last = sentences[sentences.length - 1] || cleaned
  return last.length > 36 ? last.slice(0, 36) + '…' : last
}

export function ThinkBlock({
  content,
  pinnedContent,
  streaming = false,
  turnStreaming,
  autoCollapseDelay = 1500,
  defaultOpen,
  open,
  onOpenChange,
  collapseWhen,
  summary,
  simplify,
}: ThinkBlockProps) {
  // Derive defaultOpen / collapseWhen from verbosity when not explicitly set.
  const verbosity = resolveVerbosity(simplify)
  const effectiveDefaultOpen = defaultOpen ?? (verbosity !== 'compact')
  const effectiveCollapseWhen = collapseWhen ?? (verbosity === 'detailed' ? 'never' : 'streamEnd')

  const isControlled = open !== undefined

  // System open state — managed by auto-collapse timer
  const [systemOpen, setSystemOpen] = useState(effectiveDefaultOpen)
  // User intent: null = follow system; true/false = user has explicitly toggled
  const [userIntent, setUserIntent] = useState<boolean | null>(null)
  const userIntentRef = useRef<boolean | null>(null)
  userIntentRef.current = userIntent

  const isOpen = isControlled ? open! : (userIntent !== null ? userIntent : systemOpen)

  const prevStreaming = useRef(streaming)
  const prevTurnStreaming = useRef(turnStreaming)

  const handleToggle = () => {
    const next = !isOpen
    if (!isControlled) setUserIntent(next)
    onOpenChange?.(next)
  }

  // Auto-collapse: updates system default; user intent overrides it
  useEffect(() => {
    if (effectiveCollapseWhen === 'never') return
    if (autoCollapseDelay === null) return
    if (prevStreaming.current && !streaming) {
      const timer = setTimeout(() => {
        if (!isControlled) setSystemOpen(false)
        // Only fire onOpenChange if user hasn't overridden
        if (userIntentRef.current === null) onOpenChange?.(false)
      }, autoCollapseDelay)
      return () => clearTimeout(timer)
    }
    prevStreaming.current = streaming
  }, [streaming, autoCollapseDelay, effectiveCollapseWhen, isControlled, onOpenChange])

  // Reset user intent when the turn ends so the next turn starts fresh
  useEffect(() => {
    if (turnStreaming === undefined) return
    if (prevTurnStreaming.current && !turnStreaming) {
      setUserIntent(null)
    }
    prevTurnStreaming.current = turnStreaming
  }, [turnStreaming])

  const displayContent = (!streaming && pinnedContent !== undefined) ? pinnedContent : content
  const label = isOpen ? '思考过程' : (summary ?? deriveThinkSummary(displayContent))

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
          {displayContent}
          {streaming && (
            <StreamingCursor />
          )}
        </div>
      </div>
    </div>
  )
}
