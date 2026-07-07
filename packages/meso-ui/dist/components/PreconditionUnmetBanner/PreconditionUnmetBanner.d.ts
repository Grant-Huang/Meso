import type { JSX } from 'react';
import './PreconditionUnmetBanner.css';
export interface PreconditionUnmetBannerProps {
    /** StreamState.preconditionGaps — missing evidence domains. */
    gaps?: string[];
    /** StreamState.preconditionSummary — user-facing summary text. */
    summary?: string | null;
    /** Optional callback when user wants to retry / supplement. */
    onRetry?: () => void;
}
export declare function PreconditionUnmetBanner({ gaps, summary, onRetry, }: PreconditionUnmetBannerProps): JSX.Element | null;
