import type { WorkflowRunState } from '@meso.ai/types';
import './WorkflowTimeline.css';
export interface WorkflowTimelineProps {
    /** One or more workflow runs to render. Use workflowRunOrder for deterministic order. */
    runs: WorkflowRunState[];
    /** Show run_id label when multiple runs are present. Default true. */
    showRunId?: boolean;
    /** When true, render nothing. Allows parent to hide timeline without unmounting. */
    hidden?: boolean;
}
export declare function WorkflowTimeline({ runs, showRunId, hidden }: WorkflowTimelineProps): import("react/jsx-runtime").JSX.Element | null;
