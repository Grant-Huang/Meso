import { StatusIcon } from '../StatusIcon'
import type { StatusIconStatus } from '../StatusIcon'
import './StageTimeline.css'

export type StageStatus = 'pending' | 'active' | 'done' | 'error'

export interface Stage {
  id: string
  label: string
  status: StageStatus
}

export interface StageTimelineProps {
  stages: Stage[]
  compact?: boolean
}

function stageStatusToIcon(status: StageStatus): StatusIconStatus {
  switch (status) {
    case 'pending': return 'pending'
    case 'active': return 'running'
    case 'done': return 'done'
    case 'error': return 'error'
  }
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
            <StatusIcon status={stageStatusToIcon(stage.status)} size={10} />
          </div>
          {idx < stages.length - 1 && (
            <div className={`meso-stage__line${stage.status === 'done' ? ' meso-stage__line--done' : ''}`} />
          )}
          <span className={`meso-stage__label${compact ? ' meso-stage__label--compact' : ''}`}>{stage.label}</span>
        </div>
      ))}
    </div>
  )
}
