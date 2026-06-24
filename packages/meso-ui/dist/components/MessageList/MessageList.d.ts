import React from 'react';
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace';
import type { StreamState, ExtensionEvent } from '../../runtime';
import type { ArtifactDef } from '@meso.ai/types';
import './MessageList.css';
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    /** Persisted artifacts attached to a committed message (rendered with ArtifactPanel). */
    artifacts?: ArtifactDef[];
    /**
     * Frozen StreamState snapshot for a completed assistant turn.
     * When present, the message renders through the SAME blend path as the live
     * stream (with streaming=false), so tools + text stay interleaved in history
     * and nothing is rewritten on the streaming→done transition.
     */
    trace?: StreamState;
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
    /** Rendering mode: 'block' for legacy behavior (tools then text),
     * undefined or default for blend mode (tools and text interleaved) */
    renderingMode?: 'block';
    /** Verbosity / display options threaded into inline blend tool cards. */
    simplify?: SimplifyOptions;
}
export declare function MessageList({ messages, streaming, onArtifactCopy, onArtifactDownload, onToolConfirm, onToolCancel, emptyState, emptyStateAlign, className, renderExtension, renderLiveTrace, renderMarkdown, renderMermaid, highlightCode, hiddenArtifactLangs, renderingMode, simplify, }: MessageListProps): import("react/jsx-runtime").JSX.Element;
