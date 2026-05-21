import type { StreamState } from '../runtime';
export type { StreamState, StreamStatus, ArtifactState, SSEEvent, StageEvent, StagePayload, MemoryEvent, MemorySnippet, ThinkEvent, ThinkPayload, TextEvent, TextPayload, ArtifactEvent, DoneEvent, ErrorEvent, ExtensionEvent, ExtensionPayload, } from '../runtime';
export interface StreamOptions {
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
}
/**
 * React hook wrapping the Meso SSE runtime.
 * For fetch-free usage (custom transports, Node.js), import directly from
 * @meso/ui/runtime: { parseSSELine, applyEvent, createInitialStreamState }
 */
export declare function useSSEStream(url: string): {
    state: StreamState;
    start: (options?: StreamOptions) => Promise<void>;
    abort: () => void;
    reset: () => void;
};
