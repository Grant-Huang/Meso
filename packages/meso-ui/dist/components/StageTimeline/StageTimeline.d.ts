import './StageTimeline.css';
export type StageStatus = 'pending' | 'active' | 'done' | 'error';
export interface Stage {
    id: string;
    label: string;
    status: StageStatus;
}
export interface StageTimelineProps {
    stages: Stage[];
    compact?: boolean;
}
export declare function StageTimeline({ stages, compact }: StageTimelineProps): import("react/jsx-runtime").JSX.Element | null;
