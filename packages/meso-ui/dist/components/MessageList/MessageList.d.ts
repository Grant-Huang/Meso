import React from 'react';
import type { StreamState, ExtensionEvent } from '../../runtime';
import './MessageList.css';
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}
export interface MessageListProps {
    messages: Message[];
    streaming?: StreamState;
    onArtifactCopy?: (content: string) => void;
    onArtifactDownload?: (content: string) => void;
    onToolConfirm?: (toolCallId: string) => void;
    onToolCancel?: (toolCallId: string) => void;
    emptyState?: React.ReactNode;
    emptyStateAlign?: 'center' | 'top';
    className?: string;
    renderExtension?: (event: ExtensionEvent) => React.ReactNode;
    renderLiveTrace?: (stream: StreamState) => React.ReactNode;
    renderMarkdown?: (source: string) => string;
    hiddenArtifactLangs?: string[];
    renderMermaid?: (source: string) => Promise<string>;
    highlightCode?: (code: string, lang: string) => string;
}
export declare function MessageList({ messages, streaming, onArtifactCopy, onArtifactDownload, onToolConfirm, onToolCancel, emptyState, emptyStateAlign, className, renderExtension, renderLiveTrace, renderMarkdown, renderMermaid, highlightCode, hiddenArtifactLangs, }: MessageListProps): import("react/jsx-runtime").JSX.Element;
