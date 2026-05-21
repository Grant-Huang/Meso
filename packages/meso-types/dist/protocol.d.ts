/**
 * Meso SSE Streaming Protocol — v1.0
 *
 * Every event is wrapped in a standard envelope:
 *   data: {"type":"<event_type>","schema_version":"1.0","payload":{...}}\n\n
 *
 * This file is the single source of truth for event shapes.
 * useSSEStream, applyEvent, and all third-party backends must conform to it.
 */
export declare const PROTOCOL_VERSION: "1.0";
export type ProtocolVersion = typeof PROTOCOL_VERSION;
/** Standard envelope wrapping every SSE event. */
type Envelope<T extends string, P> = {
    type: T;
    schema_version: ProtocolVersion;
    payload: P;
};
export interface StagePayload {
    name: string;
    state: 'active' | 'done' | 'error';
}
/** Pipeline stage progress (召回记忆, 检索知识, 生成回复, …). */
export type StageEvent = Envelope<'stage', StagePayload>;
export interface MemorySnippet {
    category: string;
    content: string;
}
export interface MemoryPayload {
    snippets: MemorySnippet[];
}
/** Memory recall results; replaces previous snippets when received. */
export type MemoryEvent = Envelope<'memory', MemoryPayload>;
export interface ThinkPayload {
    delta: string;
    /** true on the final think chunk — triggers auto-collapse in ThinkBlock. */
    done?: boolean;
}
/** Incremental reasoning text. */
export type ThinkEvent = Envelope<'think', ThinkPayload>;
export interface TextPayload {
    delta: string;
}
/** Incremental response text. */
export type TextEvent = Envelope<'text', TextPayload>;
export interface ArtifactPayload {
    /** Unique artifact identifier; multiple artifacts per response use distinct ids. */
    id: string;
    /**
     * Content language/type. Well-known values:
     *   "html preview" | "mermaid" | "python" | "typescript" | …
     */
    lang: string;
    delta: string;
    /** true on the final artifact chunk. */
    done?: boolean;
}
/** Incremental artifact content (code, HTML preview, Mermaid diagram, …). */
export type ArtifactEvent = Envelope<'artifact', ArtifactPayload>;
/** Stream ended successfully. Mutually exclusive with ErrorEvent. */
export type DoneEvent = Envelope<'done', Record<string, never>>;
export interface ErrorPayload {
    message: string;
    /** Optional machine-readable error code (e.g. "UPSTREAM_TIMEOUT"). */
    code?: string;
}
/** Unrecoverable error. Mutually exclusive with DoneEvent. */
export type ErrorEvent = Envelope<'error', ErrorPayload>;
export interface ExtensionPayload {
    /** Identifies the extension type (e.g. "tool_progress", "confirm_gate"). */
    name: string;
    /** Optional semver for the extension schema itself. */
    version?: string;
    data: unknown;
}
/** Third-party extension event — consumed via MessageList's renderExtension prop. */
export type ExtensionEvent = Envelope<'extension', ExtensionPayload>;
export type SSEEvent = StageEvent | MemoryEvent | ThinkEvent | TextEvent | ArtifactEvent | DoneEvent | ErrorEvent | ExtensionEvent;
export {};
