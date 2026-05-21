import React from 'react';
import type { StreamState } from '../../runtime/streamState';
import type { ExtensionEvent } from '../../runtime/protocol';
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
    /** Rendered when messages is empty and no streaming is active. */
    emptyState?: React.ReactNode;
    className?: string;
    /**
     * Render custom UI for extension events in arrival order.
     * Use this for tool progress, confirm gates, business entity cards, etc.
     * Third parties should not need to fork the platform runtime to use this.
     *
     * @example
     * renderExtension={(event) => {
     *   if (event.payload.name === 'tool_progress') {
     *     return <ToolProgressCard data={event.payload.data} />
     *   }
     * }}
     */
    renderExtension?: (event: ExtensionEvent) => React.ReactNode;
}
export declare function MessageList({ messages, streaming, onArtifactCopy, onArtifactDownload, emptyState, className, renderExtension, }: MessageListProps): import("react/jsx-runtime").JSX.Element;
