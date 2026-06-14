export interface ToolConfirmRequest {
    tool_call_id: string;
    approved: boolean;
    session_id?: string;
}
export interface ToolConfirmChannel {
    confirm(request: ToolConfirmRequest): Promise<void>;
}
export interface FetchConfirmChannelOptions {
    /** Endpoint that receives tool approval decisions. Default /api/tools/confirm */
    url?: string;
    headers?: Record<string, string>;
}
/** POST tool confirm decisions to a backend endpoint. */
export declare class FetchConfirmChannel implements ToolConfirmChannel {
    private url;
    private headers;
    constructor(options?: FetchConfirmChannelOptions);
    confirm(request: ToolConfirmRequest): Promise<void>;
}
export declare function confirmTool(channel: ToolConfirmChannel, toolCallId: string, approved: boolean, sessionId?: string): Promise<void>;
