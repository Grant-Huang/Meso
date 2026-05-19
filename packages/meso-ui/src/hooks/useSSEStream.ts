import { useCallback, useRef, useState } from 'react'

/** Event types emitted by the Meso SSE backend */
export type SSEEventType = 'stage' | 'memory' | 'think' | 'text' | 'artifact' | 'done' | 'error'

export interface StageEvent {
  type: 'stage'
  label: string
  status: 'active' | 'done'
}

export interface MemoryEvent {
  type: 'memory'
  items: string[]
}

export interface ThinkEvent {
  type: 'think'
  delta: string
  done?: boolean
}

export interface TextEvent {
  type: 'text'
  delta: string
}

export interface ArtifactEvent {
  type: 'artifact'
  artifactType: 'code' | 'html' | 'mermaid'
  language?: string
  delta: string
  done?: boolean
}

export interface DoneEvent {
  type: 'done'
}

export interface ErrorEvent {
  type: 'error'
  message: string
}

export type SSEEvent =
  | StageEvent
  | MemoryEvent
  | ThinkEvent
  | TextEvent
  | ArtifactEvent
  | DoneEvent
  | ErrorEvent

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error'

export interface StreamState {
  status: StreamStatus
  stages: StageEvent[]
  memoryItems: string[]
  thinkContent: string
  thinkDone: boolean
  textContent: string
  artifact: { type: ArtifactEvent['artifactType']; language?: string; content: string } | null
  artifact_done?: boolean
  errorMessage: string | null
}

export interface StreamOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: Record<string, unknown>
}

const initialState: StreamState = {
  status: 'idle',
  stages: [],
  memoryItems: [],
  thinkContent: '',
  thinkDone: false,
  textContent: '',
  artifact: null,
  artifact_done: false,
  errorMessage: null,
}

export function useSSEStream(url: string) {
  const [state, setState] = useState<StreamState>(initialState)
  const abortRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setState(prev => ({ ...prev, status: 'idle' }))
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState(initialState)
  }, [])

  const start = useCallback(async (options?: StreamOptions) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setState({ ...initialState, status: 'streaming' })

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

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`)
      }

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
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') return
          let event: SSEEvent
          try { event = JSON.parse(data) as SSEEvent } catch { continue }
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

function applyEvent(prev: StreamState, event: SSEEvent): StreamState {
  switch (event.type) {
    case 'stage':
      return {
        ...prev,
        stages: [
          ...prev.stages.filter((s) => s.label !== event.label),
          event,
        ],
      }
    case 'memory':
      return { ...prev, memoryItems: event.items }
    case 'think':
      return {
        ...prev,
        thinkContent: prev.thinkContent + event.delta,
        thinkDone: event.done ?? false,
      }
    case 'text':
      return { ...prev, textContent: prev.textContent + event.delta }
    case 'artifact':
      return {
        ...prev,
        artifact: {
          type: event.artifactType,
          language: event.language,
          content: (prev.artifact?.content ?? '') + event.delta,
        },
        artifact_done: event.done ?? false,
      }
    case 'done':
      return { ...prev, status: 'done' }
    case 'error':
      return { ...prev, status: 'error', errorMessage: event.message }
    default:
      return prev
  }
}
