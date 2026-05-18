import { useEffect, useRef, useState } from 'react'
import './ThinkBlock.css'

export interface ThinkBlockProps {
  /** Accumulated think content */
  content: string
  /** Whether the stream is still active (not done yet) */
  streaming?: boolean
  /** When streaming ends and done=true, auto-collapse after this delay (ms). Default 1500. */
  autoCollapseDelay?: number
}

export function ThinkBlock({ content, streaming = false, autoCollapseDelay = 1500 }: ThinkBlockProps) {
  const [open, setOpen] = useState(true)
  const prevStreaming = useRef(streaming)

  // Auto-collapse when streaming transitions to done
  useEffect(() => {
    if (prevStreaming.current && !streaming) {
      const timer = setTimeout(() => setOpen(false), autoCollapseDelay)
      return () => clearTimeout(timer)
    }
    prevStreaming.current = streaming
  }, [streaming, autoCollapseDelay])

  return (
    <div className={`meso-think${open ? ' meso-think--open' : ''}`}>
      <button
        className="meso-think__header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <svg className="meso-think__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,5 7,9 11,5"/>
        </svg>
        <span className="meso-think__label">思考过程</span>
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
