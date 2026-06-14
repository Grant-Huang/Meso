import { useFoldState } from '../../hooks/useFoldState'
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
  'data-testid'?: string
}

export function LogLine({ status, primary, outcome, detail, className, 'data-testid': testId }: LogLineProps) {
  const hasDetail = detail !== undefined && detail !== ''
  const fold = useFoldState({ system: false })

  return (
    <div className={`meso-log-line${className ? ` ${className}` : ''}`} data-testid={testId ?? 'meso-log-line'}>
      <div
        className={`meso-log-line__row${hasDetail ? ' meso-log-line__row--clickable' : ''}`}
        onClick={hasDetail ? fold.toggle : undefined}
        role={hasDetail ? 'button' : undefined}
        tabIndex={hasDetail ? 0 : undefined}
        onKeyDown={hasDetail ? (e) => { if (e.key === 'Enter' || e.key === ' ') fold.toggle() } : undefined}
        aria-expanded={hasDetail ? fold.open : undefined}
        aria-label={hasDetail ? `${primary}，${fold.open ? '折叠' : '展开'}详情` : undefined}
      >
        <StatusIcon status={status} size={14} className="meso-log-line__icon" />
        <span className="meso-log-line__primary">{primary}</span>
        {outcome && (
          <span className="meso-log-line__outcome">{outcome}</span>
        )}
        {hasDetail && (
          <svg
            className={`meso-log-line__chevron${fold.open ? ' meso-log-line__chevron--open' : ''}`}
            width="12" height="12" viewBox="0 0 12 12"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="2.5,4.5 6,7.5 9.5,4.5"/>
          </svg>
        )}
      </div>
      {hasDetail && fold.open && (
        <pre className="meso-log-line__detail">{detail}</pre>
      )}
    </div>
  )
}
