import type { ToolCallStatus, ResourceReadStatus, PhaseState } from '../runtime';
import type { StatusIconStatus } from '../components/StatusIcon';
export declare function toolCallStatusToIcon(status: ToolCallStatus): StatusIconStatus;
export declare function resourceReadStatusToIcon(status: ResourceReadStatus): StatusIconStatus;
export declare function phaseStateToIcon(state: PhaseState): StatusIconStatus;
