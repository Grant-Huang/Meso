import './StatusIcon.css';
export type StatusIconStatus = 'running' | 'done' | 'error' | 'pending' | 'warning';
export interface StatusIconProps {
    status: StatusIconStatus;
    size?: number;
    className?: string;
    'aria-label'?: string;
}
export declare function StatusIcon({ status, size, className, 'aria-label': ariaLabel, }: StatusIconProps): import("react/jsx-runtime").JSX.Element;
