import { StreamState, StagePayload, MemorySnippet, MemorySavedPayload, SoulPayload, ToolCallPayload, ToolResultPayload, ArtifactState } from '../runtime';
export type { StreamState, StreamStatus, ArtifactState, ToolCallStatus, ToolCallState, SSEEvent, StageEvent, StagePayload, MemoryEvent, MemorySnippet, MemorySavedEvent, MemorySavedPayload, SoulEvent, SoulPayload, ThinkEvent, ThinkPayload, TextEvent, TextPayload, ArtifactEvent, ToolRisk, ToolCallEvent, ToolCallPayload, ToolResultEvent, ToolResultPayload, DoneEvent, ErrorEvent, ExtensionEvent, ExtensionPayload, } from '../runtime';
export interface StreamOptions {
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
}
/** Lifecycle callbacks fired after each matching SSE event is applied to state. */
export interface StreamCallbacks {
    onStageChange?: (stage: StagePayload) => void;
    onMemoryRecalled?: (snippets: MemorySnippet[]) => void;
    onMemorySaved?: (saved: MemorySavedPayload) => void;
    onSoulActivated?: (soul: SoulPayload) => void;
    onToolCall?: (call: ToolCallPayload) => void;
    onToolResult?: (result: ToolResultPayload) => void;
    onArtifact?: (artifact: ArtifactState) => void;
    onError?: (message: string, code?: string) => void;
    onDone?: (finalState: StreamState) => void;
}
/**
 * React hook wrapping the Meso SSE runtime.
 * For fetch-free usage (custom transports, Node.js), import directly from
 * @meso/ui/runtime: { parseSSELine, applyEvent, createInitialStreamState }
 */
export declare function useSSEStream(url: string, callbacks?: StreamCallbacks): {
    state: StreamState;
    start: (options?: StreamOptions) => Promise<void>;
    abort: () => void;
    reset: () => void;
};
