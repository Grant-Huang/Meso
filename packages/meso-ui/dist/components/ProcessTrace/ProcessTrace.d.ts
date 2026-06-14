import { type ReactNode } from 'react';
import type { StreamState, ToolCallState, PhaseRecord } from '../../runtime';
import './ProcessTrace.css';
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
}
export declare function ProcessTrace({ stream, streaming, turnStreaming, defaultCollapsed, className, onToolConfirm, onToolCancel, renderToolCall, renderPhase, renderWorkflow, }: ProcessTraceProps): import("react/jsx-runtime").JSX.Element | null;
