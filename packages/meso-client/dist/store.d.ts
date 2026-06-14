import type { StreamState } from '@meso.ai/types';
export interface MesoMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    /** Snapshot of StreamState for assistant turns (optional). */
    streamState?: StreamState;
    timestamp?: string;
}
export interface MesoSessionStore {
    getMessages(sessionId: string): Promise<MesoMessage[]>;
    saveMessages(sessionId: string, messages: MesoMessage[]): Promise<void>;
}
export interface InMemorySessionStoreOptions {
    initial?: Record<string, MesoMessage[]>;
}
/** Simple in-memory store for demos and tests. */
export declare class InMemorySessionStore implements MesoSessionStore {
    private data;
    constructor(options?: InMemorySessionStoreOptions);
    getMessages(sessionId: string): Promise<MesoMessage[]>;
    saveMessages(sessionId: string, messages: MesoMessage[]): Promise<void>;
}
