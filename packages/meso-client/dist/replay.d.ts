import { type StreamState } from '@meso.ai/types';
/** Replay a fixture string (one SSE line per row) into a final StreamState. */
export declare function replayTurn(fixture: string): StreamState;
