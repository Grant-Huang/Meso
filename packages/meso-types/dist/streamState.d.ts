import type { StagePayload, MemorySnippet, ExtensionEvent } from './protocol';
export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';
export interface ArtifactState {
    id: string;
    lang: string;
    content: string;
    done: boolean;
}
export interface StreamState {
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
export declare function createInitialStreamState(): StreamState;
