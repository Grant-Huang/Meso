export type ChatRole = 'user' | 'assistant';
export interface ChatBubbleProps {
    role: ChatRole;
    /** Text content (supports simple line breaks via \n) */
    content: string;
    /** Show streaming cursor at end */
    streaming?: boolean;
    /** Timestamp label */
    timestamp?: string;
}
export declare function ChatBubble({ role, content, streaming, timestamp }: ChatBubbleProps): import("react/jsx-runtime").JSX.Element;
