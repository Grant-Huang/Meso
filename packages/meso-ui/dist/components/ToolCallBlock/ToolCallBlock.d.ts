import type { ToolCallState } from '../../runtime';
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace';
import './ToolCallBlock.css';
export interface ToolCallBlockProps {
    toolCall: ToolCallState;
    /** Called when user approves a tool awaiting confirmation. */
    onConfirm?: (toolCallId: string) => void;
    /** Called when user cancels a tool awaiting confirmation. */
    onCancel?: (toolCallId: string) => void;
    className?: string;
    'data-testid'?: string;
    simplify?: SimplifyOptions;
}
export declare function ToolCallBlock({ toolCall, onConfirm, onCancel, className, 'data-testid': testId, simplify }: ToolCallBlockProps): import("react/jsx-runtime").JSX.Element;
