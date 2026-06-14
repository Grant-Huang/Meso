import { type StreamState } from '@meso.ai/types';
import type { MesoMessage, MesoSessionStore } from './store';
import { type MesoTransport } from './transport';
import { type ToolConfirmChannel } from './confirm';
export interface CreateMesoSessionOptions {
    sessionId: string;
    streamUrl: string;
    transport?: MesoTransport;
    store?: MesoSessionStore;
    confirmChannel?: ToolConfirmChannel;
    headers?: Record<string, string>;
    onStreamState?: (state: StreamState) => void;
}
export interface MesoSession {
    sessionId: string;
    messages: MesoMessage[];
    streaming: StreamState;
    sendMessage(text: string): Promise<void>;
    confirmToolCall(toolCallId: string, approved: boolean): Promise<void>;
    load(): Promise<void>;
    resetStream(): void;
}
export declare function createMesoSession(options: CreateMesoSessionOptions): MesoSession;
