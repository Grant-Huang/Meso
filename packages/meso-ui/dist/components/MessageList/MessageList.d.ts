import React from 'react';
import type { StreamState, ExtensionEvent } from '../../runtime';
import './MessageList.css';
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    /** Final text content for completed turns. */
    content: string;
    timestamp?: string;
}
export interface MessageListProps {
    /** Completed conversation turns. */
    messages: Message[];
    /** Live streaming state from useSSEStream; omit when idle. */
    streaming?: StreamState;
    /** Called when artifact copy button is clicked. */
    onArtifactCopy?: (content: string) => void;
    /** Called when artifact download button is clicked. */
    onArtifactDownload?: (content: string) => void;
    /**
     * Called when user confirms a tool awaiting confirmation.
     * The app should send the approval to the backend via its own channel.
     */
    onToolConfirm?: (toolCallId: string) => void;
    /** Called when user cancels a tool awaiting confirmation. */
    onToolCancel?: (toolCallId: string) => void;
    /** Rendered when messages is empty and no streaming is active. */
    emptyState?: React.ReactNode;
    className?: string;
    /**
     * Render custom UI for extension events in arrival order.
     * Use this for domain-specific events that don't fit standard types.
     */
    renderExtension?: (event: ExtensionEvent) => React.ReactNode;
}
export declare function MessageList({ messages, streaming, onArtifactCopy, onArtifactDownload, onToolConfirm, onToolCancel, emptyState, className, renderExtension, }: MessageListProps): import("react/jsx-runtime").JSX.Element;
