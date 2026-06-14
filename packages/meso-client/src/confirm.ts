export interface ToolConfirmRequest {
  tool_call_id: string
  approved: boolean
  session_id?: string
}

export interface ToolConfirmChannel {
  confirm(request: ToolConfirmRequest): Promise<void>
}

export interface FetchConfirmChannelOptions {
  /** Endpoint that receives tool approval decisions. Default /api/tools/confirm */
  url?: string
  headers?: Record<string, string>
}

/** POST tool confirm decisions to a backend endpoint. */
export class FetchConfirmChannel implements ToolConfirmChannel {
  private url: string
  private headers: Record<string, string>

  constructor(options?: FetchConfirmChannelOptions) {
    this.url = options?.url ?? '/api/tools/confirm'
    this.headers = options?.headers ?? {}
  }

  async confirm(request: ToolConfirmRequest): Promise<void> {
    const resp = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: JSON.stringify(request),
    })
    if (!resp.ok) throw new Error(`Tool confirm failed: HTTP ${resp.status}`)
  }
}

export async function confirmTool(
  channel: ToolConfirmChannel,
  toolCallId: string,
  approved: boolean,
  sessionId?: string,
): Promise<void> {
  await channel.confirm({
    tool_call_id: toolCallId,
    approved,
    session_id: sessionId,
  })
}
