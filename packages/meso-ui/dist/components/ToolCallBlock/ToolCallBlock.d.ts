import type { ToolCallState } from '../../runtime';
import './ToolCallBlock.css';
export interface ToolCallBlockProps {
    toolCall: ToolCallState;
    /** Called when user approves a tool awaiting confirmation. */
    onConfirm?: (toolCallId: string) => void;
    /** Called when user cancels a tool awaiting confirmation. */
    onCancel?: (toolCallId: string) => void;
    className?: string;
    'data-testid'?: string;
}
export declare function ToolCallBlock({ toolCall, onConfirm, onCancel, className, 'data-testid': testId }: ToolCallBlockProps): import("react/jsx-runtime").JSX.Element;
