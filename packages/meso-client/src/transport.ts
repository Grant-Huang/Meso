import {
  parseSSELine,
  applyEvent,
  createInitialStreamState,
  type StreamState,
  type SSEEvent,
} from '@meso.ai/types'

export interface MesoTransportRequest {
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: Record<string, unknown>
  signal?: AbortSignal
}

export interface MesoTransport {
  /** Open an SSE stream and invoke onEvent for each parsed event. */
  stream(
    request: MesoTransportRequest,
    onEvent: (event: SSEEvent, state: StreamState) => void,
  ): Promise<StreamState>
}

/** Default fetch-based transport for browser and Node 18+. */
export class FetchMesoTransport implements MesoTransport {
  async stream(
    request: MesoTransportRequest,
    onEvent: (event: SSEEvent, state: StreamState) => void,
  ): Promise<StreamState> {
    const method = request.method ?? (request.body ? 'POST' : 'GET')
    const resp = await fetch(request.url, {
      method,
      headers: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...request.headers,
      },
      body: request.body ? JSON.stringify(request.body) : undefined,
      signal: request.signal,
    })

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let state: StreamState = { ...createInitialStreamState(), status: 'streaming' }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const event = parseSSELine(line)
        if (!event) continue
        state = applyEvent(state, event)
        onEvent(event, state)
        if (event.type === 'done' || event.type === 'error') return state
      }
    }
    return state
  }
}
