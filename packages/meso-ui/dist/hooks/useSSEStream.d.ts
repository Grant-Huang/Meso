/** Event types emitted by the Meso SSE backend */
export type SSEEventType = 'stage' | 'memory' | 'think' | 'text' | 'artifact' | 'done' | 'error';
export interface StageEvent {
    type: 'stage';
    label: string;
    status: 'active' | 'done';
}
export interface MemoryEvent {
    type: 'memory';
    items: string[];
}
export interface ThinkEvent {
    type: 'think';
    delta: string;
    done?: boolean;
}
export interface TextEvent {
    type: 'text';
    delta: string;
}
export interface ArtifactEvent {
    type: 'artifact';
    artifactType: 'code' | 'html' | 'mermaid';
    language?: string;
    delta: string;
    done?: boolean;
}
export interface DoneEvent {
    type: 'done';
}
export interface ErrorEvent {
    type: 'error';
    message: string;
}
export type SSEEvent = StageEvent | MemoryEvent | ThinkEvent | TextEvent | ArtifactEvent | DoneEvent | ErrorEvent;
export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';
export interface StreamState {
    status: StreamStatus;
    stages: StageEvent[];
    memoryItems: string[];
    thinkContent: string;
    thinkDone: boolean;
    textContent: string;
    artifact: {
        type: ArtifactEvent['artifactType'];
        language?: string;
        content: string;
    } | null;
    artifact_done?: boolean;
    errorMessage: string | null;
}
export interface StreamOptions {
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
}
export declare function useSSEStream(url: string): {
    state: StreamState;
    start: (options?: StreamOptions) => Promise<void>;
    abort: () => void;
    reset: () => void;
};
