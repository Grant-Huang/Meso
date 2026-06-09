import { type ReactNode } from 'react';
import type { StreamState, ToolCallState } from '../../runtime';
import type { Stage } from '../StageTimeline';
import './ProcessTrace.css';
export interface ProcessTraceProps {
    /** The live or completed stream state to render. */
    stream: StreamState;
    /** Whether the stream is still active. Controls ThinkBlock streaming mode. */
    streaming?: boolean;
    /** Initial collapsed state of the outer summary header. Default false (expanded). */
    defaultCollapsed?: boolean;
    /** Callback for tool confirm/cancel (forwarded to ToolCallBlock). */
    onToolConfirm?: (toolCallId: string) => void;
    onToolCancel?: (toolCallId: string) => void;
    /**
     * Optional render slot for custom stage body content.
     * Rendered below each stage chip in the StageTimeline area.
     * Return null/undefined to use default rendering.
     */
    renderStageBody?: (stage: Stage, streamStage: StreamState['stages'][number]) => ReactNode;
    /**
     * Optional render slot that replaces the default ToolCallBlock for a specific call.
     * Return null/undefined to fall back to ToolCallBlock.
     */
    renderToolCall?: (toolCall: ToolCallState) => ReactNode;
}
export declare function ProcessTrace({ stream, streaming, defaultCollapsed, onToolConfirm, onToolCancel, renderStageBody, renderToolCall, }: ProcessTraceProps): import("react/jsx-runtime").JSX.Element | null;
