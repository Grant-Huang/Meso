import React from 'react';
import type { StreamState } from '../../hooks/useSSEStream';
import './MessageList.css';
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    /** Final text content (for completed turns) */
    content: string;
    timestamp?: string;
}
export interface MessageListProps {
    /** Completed conversation turns */
    messages: Message[];
    /** Live streaming state from useSSEStream (omit when idle) */
    streaming?: StreamState;
    /** Called when artifact copy button is clicked */
    onArtifactCopy?: (content: string) => void;
    /** Called when artifact download button is clicked */
    onArtifactDownload?: (content: string) => void;
    /** Rendered when messages is empty and no streaming */
    emptyState?: React.ReactNode;
    className?: string;
}
export declare function MessageList({ messages, streaming, onArtifactCopy, onArtifactDownload, emptyState, className, }: MessageListProps): import("react/jsx-runtime").JSX.Element;
