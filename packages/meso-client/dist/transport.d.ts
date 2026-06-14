import { type StreamState, type SSEEvent } from '@meso.ai/types';
export interface MesoTransportRequest {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    signal?: AbortSignal;
}
export interface MesoTransport {
    /** Open an SSE stream and invoke onEvent for each parsed event. */
    stream(request: MesoTransportRequest, onEvent: (event: SSEEvent, state: StreamState) => void): Promise<StreamState>;
}
/** Default fetch-based transport for browser and Node 18+. */
export declare class FetchMesoTransport implements MesoTransport {
    stream(request: MesoTransportRequest, onEvent: (event: SSEEvent, state: StreamState) => void): Promise<StreamState>;
}
