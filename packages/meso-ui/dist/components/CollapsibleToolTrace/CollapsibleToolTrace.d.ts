import type { ReactNode } from 'react';
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace';
import type { StreamState, ToolCallState } from '../../runtime';
import './CollapsibleToolTrace.css';
export interface CollapsibleToolTraceProps {
    stream: StreamState;
    streaming?: boolean;
    defaultExpanded?: 'all' | 'current' | 'none';
    onlyShowCurrent?: boolean;
    simplify?: SimplifyOptions;
    onToolClick?: (toolCallId: string) => void;
    onToolConfirm?: (toolCallId: string) => void;
    onToolCancel?: (toolCallId: string) => void;
    renderSummary?: (tc: ToolCallState, index: number) => ReactNode;
}
export declare function CollapsibleToolTrace({ stream, defaultExpanded, onlyShowCurrent, simplify, onToolClick, onToolConfirm, onToolCancel, renderSummary, }: CollapsibleToolTraceProps): import("react/jsx-runtime").JSX.Element | null;
