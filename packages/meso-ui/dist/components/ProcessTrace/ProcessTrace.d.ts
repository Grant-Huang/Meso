import { type ReactNode } from 'react';
import type { StreamState, ToolCallState, PhaseRecord } from '../../runtime';
import './ProcessTrace.css';
export interface SimplifyOptions {
    hideMetadata?: boolean;
    hideResultDetails?: boolean;
    compact?: boolean;
    verbosity?: 'compact' | 'standard' | 'detailed';
    showDuration?: boolean;
    showProvider?: boolean;
    showRiskLevel?: boolean;
    showExecutionTimeline?: boolean;
    defaultParamsCollapsed?: boolean;
    defaultOutputCollapsed?: boolean;
    defaultMetadataCollapsed?: boolean;
}
export interface ProcessTraceProps {
    stream: StreamState;
    streaming?: boolean;
    turnStreaming?: boolean;
    defaultCollapsed?: boolean;
    className?: string;
    onToolConfirm?: (toolCallId: string) => void;
    onToolCancel?: (toolCallId: string) => void;
    renderToolCall?: (toolCall: ToolCallState) => ReactNode;
    renderPhase?: (phase: PhaseRecord) => ReactNode;
    renderWorkflow?: (stream: StreamState) => ReactNode;
    simplify?: SimplifyOptions;
}
export declare function ProcessTrace({ stream, streaming, turnStreaming, defaultCollapsed, className, onToolConfirm, onToolCancel, renderToolCall, renderPhase, renderWorkflow, simplify, }: ProcessTraceProps): import("react/jsx-runtime").JSX.Element | null;
