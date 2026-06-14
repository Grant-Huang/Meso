import { useCallback, useRef, useState } from 'react'
import { parseSSELine, applyEvent, createInitialStreamState } from '../runtime'
import type {
  StreamState,
  StreamStatus,
  PhasePayload,
  MemorySnippet,
  MemorySavedPayload,
  CapabilitiesPayload,
  SoulPayload,
  SkillPayload,
  ToolCallPayload,
  ToolResultPayload,
  ResourceReadPayload,
  ResourceContentPayload,
  ArtifactState,
  ExtensionEvent,
  SSEEvent,
} from '../runtime'


export interface ReconnectOptions {
  maxAttempts?: number
  baseDelayMs?: number
}

export interface StreamOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: Record<string, unknown>
  watchdogMs?: number | null
  batchMs?: number | null
  reconnect?: boolean | ReconnectOptions
}

export interface StreamCallbacks {
  onCapabilities?: (capabilities: CapabilitiesPayload) => void
  onPhaseChange?: (phase: PhasePayload) => void
  onMemoryRecalled?: (snippets: MemorySnippet[]) => void
  onMemorySaved?: (saved: MemorySavedPayload) => void
  onSoulActivated?: (soul: SoulPayload) => void
  onSkillActivated?: (skill: SkillPayload) => void
  onToolCall?: (call: ToolCallPayload) => void
  onToolResult?: (result: ToolResultPayload) => void
  onResourceRead?: (read: ResourceReadPayload) => void
  onResourceContent?: (content: ResourceContentPayload) => void
  onArtifact?: (artifact: ArtifactState) => void
  onText?: (delta: string, state: StreamState) => void
  onThink?: (delta: string, state: StreamState) => void
  onExtensionEvent?: (event: ExtensionEvent) => void
  onError?: (message: string, code?: string) => void
  onDone?: (finalState: StreamState) => void
  onReconnect?: (attempt: number) => void
}

const BATCHABLE = new Set(['text', 'think'])

function dispatchCallbacks(event: SSEEvent, next: StreamState, cb?: StreamCallbacks) {
  if (!cb) return
  switch (event.type) {
    case 'capabilities': cb.onCapabilities?.(event.payload); break
    case 'phase': cb.onPhaseChange?.(event.payload); break
    case 'memory': cb.onMemoryRecalled?.(event.payload.snippets); break
    case 'memory_saved': cb.onMemorySaved?.(event.payload); break
    case 'soul': cb.onSoulActivated?.(event.payload); break
    case 'skill_active': cb.onSkillActivated?.(event.payload); break
    case 'tool_call': cb.onToolCall?.(event.payload); break
    case 'tool_result': cb.onToolResult?.(event.payload); break
    case 'resource_read': cb.onResourceRead?.(event.payload); break
    case 'resource_content': cb.onResourceContent?.(event.payload); break
    case 'text': cb.onText?.(event.payload.delta, next); break
    case 'think': cb.onThink?.(event.payload.delta, next); break
    case 'artifact': {
      const art = next.artifacts[event.payload.id]
      if (art) cb.onArtifact?.(art)
      break
    }
    case 'extension': cb.onExtensionEvent?.(event); break
    case 'error': cb.onError?.(event.payload.message, event.payload.code); break
    case 'done': cb.onDone?.(next); break
  }
}

export function useSSEStream(url: string, callbacks?: StreamCallbacks) {
  const [state, setState] = useState<StreamState>(createInitialStreamState)
  const abortRef = useRef<AbortController | null>(null)
  const inFlightRef = useRef(false)
  const callbacksRef = useRef<StreamCallbacks | undefined>(callbacks)
  callbacksRef.current = callbacks

  const abort = useCallback(() => {
    abortRef.current?.abort()
    inFlightRef.current = false
    setState(prev => ({ ...prev, status: 'idle' as StreamStatus }))
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    inFlightRef.current = false
    setState(createInitialStreamState())
  }, [])

  const start = useCallback(async (options?: StreamOptions) => {
    if (inFlightRef.current) return
    inFlightRef.current = true

    const reconnectCfg = typeof options?.reconnect === 'object'
      ? options.reconnect
      : { maxAttempts: 3, baseDelayMs: 1000 }
    const maxAttempts = options?.reconnect ? (reconnectCfg.maxAttempts ?? 3) : 0
    const baseDelayMs = reconnectCfg.baseDelayMs ?? 1000
    const batchMs = options?.batchMs === undefined ? 16 : options.batchMs

    let attempt = 0

    const connect = async (): Promise<'done' | 'error' | 'interrupted'> => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl

      const initial: StreamState = { ...createInitialStreamState(), status: 'streaming' }
      setState(initial)
      let current = initial

      const method = options?.method ?? (options?.body ? 'POST' : 'GET')
      const watchdogMs = options?.watchdogMs === undefined ? 120_000 : options.watchdogMs

      let watchdogTimer: ReturnType<typeof setTimeout> | null = null
      const clearWatchdog = () => { if (watchdogTimer) clearTimeout(watchdogTimer) }
      const resetWatchdog = () => {
        clearWatchdog()
        if (watchdogMs == null) return
        watchdogTimer = setTimeout(() => {
          ctrl.abort()
          const msg = `SSE stream timed out after ${watchdogMs}ms of inactivity`
          setState(prev => ({ ...prev, status: 'error', errorMessage: msg, errorCode: 'WATCHDOG_TIMEOUT' }))
          callbacksRef.current?.onError?.(msg, 'WATCHDOG_TIMEOUT')
        }, watchdogMs)
      }

      const pending: SSEEvent[] = []
      let batchTimer: ReturnType<typeof setTimeout> | null = null

      const applyOne = (event: SSEEvent): 'done' | 'error' | void => {
        const next = applyEvent(current, event)
        current = next
        setState(next)
        dispatchCallbacks(event, next, callbacksRef.current)
        if (event.type === 'done' || event.type === 'error') {
          clearWatchdog()
          return event.type
        }
      }

      const flushPending = (): 'done' | 'error' | void => {
        while (pending.length > 0) {
          const event = pending.shift()!
          const term = applyOne(event)
          if (term) return term
        }
      }

      const handleEvent = (event: SSEEvent): 'done' | 'error' | void => {
        if (batchMs != null && BATCHABLE.has(event.type)) {
          pending.push(event)
          if (!batchTimer) {
            batchTimer = setTimeout(() => {
              batchTimer = null
              flushPending()
            }, batchMs)
          }
          return
        }
        return applyOne(event)
      }

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
        resetWatchdog()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          resetWatchdog()
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const event = parseSSELine(line)
            if (!event) continue
            const term = handleEvent(event)
            if (term) return term
          }
        }

        if (batchTimer) {
          clearTimeout(batchTimer)
          batchTimer = null
        }
        const term = flushPending()
        if (term) return term
        return 'interrupted'
      } catch (err) {
        if ((err as Error).name === 'AbortError') return 'interrupted'
        throw err
      } finally {
        clearWatchdog()
        if (batchTimer) clearTimeout(batchTimer)
      }
    }

    try {
      while (true) {
        try {
          const result = await connect()
          if (result === 'done' || result === 'error') return
          if (!options?.reconnect || attempt >= maxAttempts) {
            const msg = 'SSE stream ended unexpectedly'
            setState(prev => ({ ...prev, status: 'error', errorMessage: msg, errorCode: 'STREAM_ENDED' }))
            callbacksRef.current?.onError?.(msg, 'STREAM_ENDED')
            return
          }
        } catch (err) {
          if (!options?.reconnect || attempt >= maxAttempts) {
            const msg = (err as Error).message
            setState(prev => ({ ...prev, status: 'error', errorMessage: msg }))
            callbacksRef.current?.onError?.(msg)
            return
          }
        }
        attempt += 1
        callbacksRef.current?.onReconnect?.(attempt)
        await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)))
      }
    } finally {
      inFlightRef.current = false
    }
  }, [url])

  return { state, start, abort, reset }
}
