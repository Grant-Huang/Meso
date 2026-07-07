import { StatusIcon } from '../StatusIcon'
import type { JSX } from 'react'
import './PreconditionUnmetBanner.css'

export interface PreconditionUnmetBannerProps {
  /** StreamState.preconditionGaps — missing evidence domains. */
  gaps?: string[]
  /** StreamState.preconditionSummary — user-facing summary text. */
  summary?: string | null
  /** Optional callback when user wants to retry / supplement. */
  onRetry?: () => void
}

export function PreconditionUnmetBanner({
  gaps,
  summary,
  onRetry,
}: PreconditionUnmetBannerProps): JSX.Element | null {
  const hasGaps = Array.isArray(gaps) && gaps.length > 0
  const hasSummary = typeof summary === 'string' && summary.length > 0
  if (!hasGaps && !hasSummary) return null

  return (
    <div className="meso-precondition-banner" role="alert" data-testid="meso-precondition-banner">
      <div className="meso-precondition-banner__header">
        <StatusIcon status="error" size={18} className="meso-precondition-banner__icon" />
        <span className="meso-precondition-banner__title">证据不足，前置条件未满足</span>
      </div>

      <p className="meso-precondition-banner__body">
        {hasSummary ? summary : '分析所需的取证数据未齐备'}
      </p>

      {hasGaps && (
        <div className="meso-precondition-banner__gaps">
          {gaps!.map((g) => (
            <span key={g} className="meso-precondition-banner__gap-tag">
              {g}
            </span>
          ))}
        </div>
      )}

      {onRetry && (
        <button
          type="button"
          className="meso-precondition-banner__retry-btn"
          onClick={onRetry}
        >
          补充信息后重试
        </button>
      )}
    </div>
  )
}
