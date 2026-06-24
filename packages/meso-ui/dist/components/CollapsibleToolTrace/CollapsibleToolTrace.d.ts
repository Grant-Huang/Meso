import type { ReactNode } from 'react';
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace';
import type { StreamState, ToolCallState } from '../../runtime';
import './CollapsibleToolTrace.css';
export interface CollapsibleToolTraceProps {
    stream: StreamState;
    streaming?: boolean;
    /** Expansion strategy: 'none' = all collapsed, 'current' = last item expanded, 'all' = all expanded, 'last-n' = last N expanded */
    defaultExpanded?: 'all' | 'current' | 'none' | 'last-n';
    /** Number of items to expand when defaultExpanded='last-n' (default: 2) */
    expandCount?: number;
    /** Show only the most recent tool call */
    onlyShowCurrent?: boolean;
    /** Verbosity and display options */
    simplify?: SimplifyOptions;
    /** Called when user clicks a tool summary to expand */
    onToolClick?: (toolCallId: string) => void;
    /** Called when user approves tool confirmation */
    onToolConfirm?: (toolCallId: string) => void;
    /** Called when user cancels tool confirmation */
    onToolCancel?: (toolCallId: string) => void;
    /** Custom summary rendering for each tool */
    renderSummary?: (tc: ToolCallState, index: number) => ReactNode;
}
export declare function CollapsibleToolTrace({ stream, defaultExpanded, expandCount, onlyShowCurrent, simplify, onToolClick, onToolConfirm, onToolCancel, renderSummary, }: CollapsibleToolTraceProps): import("react/jsx-runtime").JSX.Element | null;
