import type { SSEEvent } from './protocol';
import type { StreamState } from './streamState';
/**
 * Pure state machine reducer.
 * Apply one SSE event to the current StreamState and return the next state.
 * Does not mutate the input state.
 *
 * Supports narration field: if any event payload has narration?: string,
 * it is automatically converted to a text event and applied first.
 * This enables "who executes, who describes" design pattern.
 */
export declare function applyEvent(state: StreamState, event: SSEEvent): StreamState;
