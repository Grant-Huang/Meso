import { useCallback, useRef, useState } from 'react'
import { parseSSELine, applyEvent, createInitialStreamState } from '../runtime'
import type { StreamState, StreamStatus } from '../runtime'

// Re-export runtime types so existing imports from useSSEStream continue to work
export type {
  StreamState,
  StreamStatus,
  ArtifactState,
  SSEEvent,
  StageEvent,
  StagePayload,
  MemoryEvent,
  MemorySnippet,
  ThinkEvent,
  TextEvent,
  ArtifactEvent,
  DoneEvent,
  ErrorEvent,
  ExtensionEvent,
  ExtensionPayload,
} from '../runtime'

export interface StreamOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: Record<string, unknown>
}

/**
 * React hook wrapping the Meso SSE runtime.
 * For fetch-free usage (custom transports, Node.js), import directly from
 * @meso/ui/runtime: { parseSSELine, applyEvent, createInitialStreamState }
 */
export function useSSEStream(url: string) {
  const [state, setState] = useState<StreamState>(createInitialStreamState)
  const abortRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setState(prev => ({ ...prev, status: 'idle' as StreamStatus }))
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState(createInitialStreamState())
  }, [])

  const start = useCallback(async (options?: StreamOptions) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setState({ ...createInitialStreamState(), status: 'streaming' })

    const method = options?.method ?? (options?.body ? 'POST' : 'GET')

    try {
      const resp = await fetch(url, {
        method,
        headers: {
          ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: ctrl.signal,
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const reader = resp.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const event = parseSSELine(line)
          if (!event) continue
          setState(prev => applyEvent(prev, event))
          if (event.type === 'done' || event.type === 'error') return
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: (err as Error).message,
      }))
    }
  }, [url])

  return { state, start, abort, reset }
}
