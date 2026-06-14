import type { ToolCallStatus, ResourceReadStatus, PhaseState } from '../runtime'
import type { StatusIconStatus } from '../components/StatusIcon'

export function toolCallStatusToIcon(status: ToolCallStatus): StatusIconStatus {
  switch (status) {
    case 'pending': return 'pending'
    case 'running': return 'running'
    case 'awaiting_confirm': return 'warning'
    case 'done': return 'done'
    case 'error': return 'error'
  }
}

export function resourceReadStatusToIcon(status: ResourceReadStatus): StatusIconStatus {
  switch (status) {
    case 'pending': return 'pending'
    case 'done': return 'done'
    case 'error': return 'error'
  }
}

export function phaseStateToIcon(state: PhaseState): StatusIconStatus {
  switch (state) {
    case 'pending': return 'pending'
    case 'running': return 'running'
    case 'done': return 'done'
    case 'error': return 'error'
  }
}
