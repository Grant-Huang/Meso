import { ToolCallPayload } from '../../runtime';
export interface ConfirmGateProps {
    toolCall: ToolCallPayload;
    onConfirm: (toolCallId: string) => void;
    onCancel: (toolCallId: string) => void;
}
export declare function ConfirmGate({ toolCall, onConfirm, onCancel }: ConfirmGateProps): import("react/jsx-runtime").JSX.Element;
