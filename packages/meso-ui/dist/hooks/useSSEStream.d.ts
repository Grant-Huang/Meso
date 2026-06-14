import type { StreamState, PhasePayload, MemorySnippet, MemorySavedPayload, CapabilitiesPayload, SoulPayload, SkillPayload, ToolCallPayload, ToolResultPayload, ResourceReadPayload, ResourceContentPayload, ArtifactState, ExtensionEvent } from '../runtime';
export interface ReconnectOptions {
    maxAttempts?: number;
    baseDelayMs?: number;
}
export interface StreamOptions {
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    watchdogMs?: number | null;
    batchMs?: number | null;
    reconnect?: boolean | ReconnectOptions;
}
export interface StreamCallbacks {
    onCapabilities?: (capabilities: CapabilitiesPayload) => void;
    onPhaseChange?: (phase: PhasePayload) => void;
    onMemoryRecalled?: (snippets: MemorySnippet[]) => void;
    onMemorySaved?: (saved: MemorySavedPayload) => void;
    onSoulActivated?: (soul: SoulPayload) => void;
    onSkillActivated?: (skill: SkillPayload) => void;
    onToolCall?: (call: ToolCallPayload) => void;
    onToolResult?: (result: ToolResultPayload) => void;
    onResourceRead?: (read: ResourceReadPayload) => void;
    onResourceContent?: (content: ResourceContentPayload) => void;
    onArtifact?: (artifact: ArtifactState) => void;
    onText?: (delta: string, state: StreamState) => void;
    onThink?: (delta: string, state: StreamState) => void;
    onExtensionEvent?: (event: ExtensionEvent) => void;
    onError?: (message: string, code?: string) => void;
    onDone?: (finalState: StreamState) => void;
    onReconnect?: (attempt: number) => void;
}
export declare function useSSEStream(url: string, callbacks?: StreamCallbacks): {
    state: StreamState;
    start: (options?: StreamOptions) => Promise<void>;
    abort: () => void;
    reset: () => void;
};
