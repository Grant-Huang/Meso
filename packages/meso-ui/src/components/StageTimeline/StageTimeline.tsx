import './StageTimeline.css'

export type StageStatus = 'pending' | 'active' | 'done'

export interface Stage {
  id: string
  label: string
  status: StageStatus
}

export interface StageTimelineProps {
  stages: Stage[]
  /** Compact single-row display (for embedding in chat header) */
  compact?: boolean
}

export function StageTimeline({ stages, compact = false }: StageTimelineProps) {
  if (stages.length === 0) return null

  return (
    <div className={`meso-stages${compact ? ' meso-stages--compact' : ''}`} role="status" aria-label="处理进度">
      {stages.map((stage, idx) => (
        <div
          key={stage.id}
          className={`meso-stage meso-stage--${stage.status}`}
        >
          <div className="meso-stage__dot">
            {stage.status === 'done' ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1.5,5.5 4,8 8.5,2.5"/>
              </svg>
            ) : (
              <span className="meso-stage__dot-inner" />
            )}
          </div>
          {idx < stages.length - 1 && (
            <div className={`meso-stage__line${stage.status === 'done' ? ' meso-stage__line--done' : ''}`} />
          )}
          {!compact && <span className="meso-stage__label">{stage.label}</span>}
          {compact && <span className="meso-stage__label meso-stage__label--compact">{stage.label}</span>}
        </div>
      ))}
    </div>
  )
}
