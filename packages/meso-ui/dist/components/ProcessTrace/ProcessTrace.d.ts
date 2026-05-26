import type { StreamState } from '../../runtime';
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
}
export declare function ProcessTrace({ stream, streaming, defaultCollapsed, onToolConfirm, onToolCancel, }: ProcessTraceProps): import("react/jsx-runtime").JSX.Element | null;
