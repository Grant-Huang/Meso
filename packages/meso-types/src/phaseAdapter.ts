import type { PhaseRecord } from './streamState'

/**
 * UI Stage shape — mirrors StageTimeline component props.
 * Defined here so the adapter can be used without importing @meso.ai/ui.
 */
export interface Stage {
  id: string
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
}

/**
 * Convert a PhaseRecord into a Stage ready for StageTimeline.
 *
 * Field mapping:
 *   phase.id    → stage.id
 *   phase.name  → stage.label
 *   phase.state → stage.status (running → active)
 */
export function phaseRecordToStage(phase: PhaseRecord): Stage {
  const status: Stage['status'] =
    phase.state === 'running' ? 'active'
    : phase.state === 'pending' ? 'pending'
    : phase.state === 'error' ? 'error'
    : 'done'
  return {
    id: phase.id,
    label: phase.name,
    status,
  }
}
