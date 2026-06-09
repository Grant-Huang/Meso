import { useState } from 'react'
import { StatusIcon } from '../StatusIcon'
import type { StatusIconStatus } from '../StatusIcon'
import './LogLine.css'

export interface LogLineProps {
  status: StatusIconStatus
  /** Main label — always visible. */
  primary: string
  /** Short outcome text shown after the primary (e.g. "找到 13 篇 · 30s"). */
  outcome?: string
  /**
   * Optional expandable detail (raw JSON, log text, etc.).
   * When provided, the line gains an inline chevron toggle.
   */
  detail?: string
  className?: string
}

export function LogLine({ status, primary, outcome, detail, className }: LogLineProps) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = detail !== undefined && detail !== ''

  return (
    <div className={`meso-log-line${className ? ` ${className}` : ''}`}>
      <div
        className={`meso-log-line__row${hasDetail ? ' meso-log-line__row--clickable' : ''}`}
        onClick={hasDetail ? () => setExpanded(v => !v) : undefined}
        role={hasDetail ? 'button' : undefined}
        tabIndex={hasDetail ? 0 : undefined}
        onKeyDown={hasDetail ? (e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v) } : undefined}
        aria-expanded={hasDetail ? expanded : undefined}
      >
        <StatusIcon status={status} size={14} className="meso-log-line__icon" />
        <span className="meso-log-line__primary">{primary}</span>
        {outcome && (
          <span className="meso-log-line__outcome">{outcome}</span>
        )}
        {hasDetail && (
          <svg
            className={`meso-log-line__chevron${expanded ? ' meso-log-line__chevron--open' : ''}`}
            width="12" height="12" viewBox="0 0 12 12"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="2.5,4.5 6,7.5 9.5,4.5"/>
          </svg>
        )}
      </div>
      {hasDetail && expanded && (
        <pre className="meso-log-line__detail">{detail}</pre>
      )}
    </div>
  )
}
