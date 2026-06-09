import type { StatusIconStatus } from '../StatusIcon';
import './LogLine.css';
export interface LogLineProps {
    status: StatusIconStatus;
    /** Main label — always visible. */
    primary: string;
    /** Short outcome text shown after the primary (e.g. "找到 13 篇 · 30s"). */
    outcome?: string;
    /**
     * Optional expandable detail (raw JSON, log text, etc.).
     * When provided, the line gains an inline chevron toggle.
     */
    detail?: string;
    className?: string;
}
export declare function LogLine({ status, primary, outcome, detail, className }: LogLineProps): import("react/jsx-runtime").JSX.Element;
