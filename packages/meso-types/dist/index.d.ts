/**
 * Pure state machine reducer.
 * Apply one SSE event to the current StreamState and return the next state.
 * Does not mutate the input state.
 */
export declare function applyEvent(state: StreamState, event: SSEEvent): StreamState;

/** Incremental artifact content (code, HTML preview, Mermaid diagram, …). */
export declare type ArtifactEvent = Envelope<'artifact', ArtifactPayload>;

export declare interface ArtifactPayload {
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

export declare interface ArtifactState {
    id: string;
    lang: string;
    content: string;
    done: boolean;
}

export declare function createInitialStreamState(): StreamState;

/** Stream ended successfully. Mutually exclusive with ErrorEvent. */
export declare type DoneEvent = Envelope<'done', Record<string, never>>;

/** Standard envelope wrapping every SSE event. */
declare type Envelope<T extends string, P> = {
    type: T;
    schema_version: ProtocolVersion;
    payload: P;
};

/** Unrecoverable error. Mutually exclusive with DoneEvent. */
declare type ErrorEvent_2 = Envelope<'error', ErrorPayload>;
export { ErrorEvent_2 as ErrorEvent }

export declare interface ErrorPayload {
    message: string;
    /** Optional machine-readable error code (e.g. "UPSTREAM_TIMEOUT"). */
    code?: string;
}

/** Third-party extension event — consumed via MessageList's renderExtension prop. */
export declare type ExtensionEvent = Envelope<'extension', ExtensionPayload>;

export declare interface ExtensionPayload {
    /** Identifies the extension type (e.g. "tool_progress", "confirm_gate"). */
    name: string;
    /** Optional semver for the extension schema itself. */
    version?: string;
    data: unknown;
}

/** Memory recall results; replaces previous snippets when received. */
export declare type MemoryEvent = Envelope<'memory', MemoryPayload>;

export declare interface MemoryPayload {
    snippets: MemorySnippet[];
}

export declare interface MemorySnippet {
    category: string;
    content: string;
}

/**
 * Parse a single SSE data line into an SSEEvent.
 *
 * Returns:
 *   SSEEvent  — valid protocol 1.0 event
 *   null      — empty line, comment (": …"), non-data line, invalid JSON,
 *               or missing required fields (skip silently)
 *
 * Special cases:
 *   "data: [DONE]"  → normalized to DoneEvent (same as {"type":"done",...})
 *   Missing schema_version → assumed "1.0" for transition-period tolerance
 */
export declare function parseSSELine(line: string): SSEEvent | null;

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

export declare type ProtocolVersion = typeof PROTOCOL_VERSION;

export declare type SSEEvent = StageEvent | MemoryEvent | ThinkEvent | TextEvent_2 | ArtifactEvent | DoneEvent | ErrorEvent_2 | ExtensionEvent;

/** Pipeline stage progress (召回记忆, 检索知识, 生成回复, …). */
export declare type StageEvent = Envelope<'stage', StagePayload>;

export declare interface StagePayload {
    name: string;
    state: 'active' | 'done' | 'error';
}

export declare interface StreamState {
    status: StreamStatus;
    /** Pipeline stages in arrival order; deduped by name. */
    stages: StagePayload[];
    /** Memory snippets recalled before generation. */
    memorySnippets: MemorySnippet[];
    thinkContent: string;
    thinkDone: boolean;
    textContent: string;
    /** Artifacts keyed by id for O(1) lookup during incremental updates. */
    artifacts: Record<string, ArtifactState>;
    /** Artifact ids in first-seen order — use for deterministic rendering. */
    artifactOrder: string[];
    /**
     * Extension events keyed by name for lookup (e.g. extensions["tool_progress"]).
     * For time-ordered rendering, use extensionLog instead.
     */
    extensions: Record<string, ExtensionEvent[]>;
    /** All extension events in arrival order — use when sequential rendering matters. */
    extensionLog: ExtensionEvent[];
    errorMessage: string | null;
}

export declare type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';

/** Incremental response text. */
declare type TextEvent_2 = Envelope<'text', TextPayload>;
export { TextEvent_2 as TextEvent }

export declare interface TextPayload {
    delta: string;
}

/** Incremental reasoning text. */
export declare type ThinkEvent = Envelope<'think', ThinkPayload>;

export declare interface ThinkPayload {
    delta: string;
    /** true on the final think chunk — triggers auto-collapse in ThinkBlock. */
    done?: boolean;
}

export { }
