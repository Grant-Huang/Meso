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
  errorMessage: string | null
}

const initialState: StreamState = {
  status: 'idle',
  stages: [],
  memoryItems: [],
  thinkContent: '',
  thinkDone: false,
  textContent: '',
  artifact: null,
  errorMessage: null,
}

export function useSSEStream(url: string) {
  const [state, setState] = useState<StreamState>(initialState)
  const esRef = useRef<EventSource | null>(null)

  const reset = useCallback(() => {
    esRef.current?.close()
    setState(initialState)
  }, [])

  const start = useCallback(
    (body?: Record<string, unknown>) => {
      esRef.current?.close()
      setState({ ...initialState, status: 'streaming' })

      // POST then stream — or direct GET for simple cases
      const fullUrl = body
        ? `${url}?${new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)]))}`.toString()
        : url

      const es = new EventSource(fullUrl)
      esRef.current = es

      es.onmessage = (e) => {
        let event: SSEEvent
        try {
          event = JSON.parse(e.data) as SSEEvent
        } catch {
          return
        }

        setState((prev) => applyEvent(prev, event))

        if (event.type === 'done' || event.type === 'error') {
          es.close()
        }
      }

      es.onerror = () => {
        es.close()
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: '连接中断',
        }))
      }
    },
    [url],
  )

  return { state, start, reset }
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
      }
    case 'done':
      return { ...prev, status: 'done' }
    case 'error':
      return { ...prev, status: 'error', errorMessage: event.message }
    default:
      return prev
  }
}
