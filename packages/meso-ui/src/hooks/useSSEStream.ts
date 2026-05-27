import { useCallback, useRef, useState } from 'react'
import { parseSSELine, applyEvent, createInitialStreamState } from '../runtime'
import type {
  StreamState,
  StreamStatus,
  StagePayload,
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
} from '../runtime'


export interface StreamOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: Record<string, unknown>
}

/** Lifecycle callbacks fired after each matching SSE event is applied to state. */
export interface StreamCallbacks {
  onCapabilities?: (capabilities: CapabilitiesPayload) => void
  onStageChange?: (stage: StagePayload) => void
  onMemoryRecalled?: (snippets: MemorySnippet[]) => void
  onMemorySaved?: (saved: MemorySavedPayload) => void
  onSoulActivated?: (soul: SoulPayload) => void
  onSkillActivated?: (skill: SkillPayload) => void
  onToolCall?: (call: ToolCallPayload) => void
  onToolResult?: (result: ToolResultPayload) => void
  onResourceRead?: (read: ResourceReadPayload) => void
  onResourceContent?: (content: ResourceContentPayload) => void
  onArtifact?: (artifact: ArtifactState) => void
  onError?: (message: string, code?: string) => void
  onDone?: (finalState: StreamState) => void
}

/**
 * React hook wrapping the Meso SSE runtime.
 * For fetch-free usage (custom transports, Node.js), import directly from
 * @meso.ai/ui/runtime: { parseSSELine, applyEvent, createInitialStreamState }
 */
export function useSSEStream(url: string, callbacks?: StreamCallbacks) {
  const [state, setState] = useState<StreamState>(createInitialStreamState)
  const abortRef = useRef<AbortController | null>(null)
  // Always read the latest callbacks without putting them in dependency arrays
  const callbacksRef = useRef<StreamCallbacks | undefined>(callbacks)
  callbacksRef.current = callbacks

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

    const initial: StreamState = { ...createInitialStreamState(), status: 'streaming' }
    setState(initial)
    let current = initial

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

          const next = applyEvent(current, event)
          current = next
          setState(next)

          const cb = callbacksRef.current
          if (cb) {
            switch (event.type) {
              case 'capabilities':    cb.onCapabilities?.(event.payload); break
              case 'stage':           cb.onStageChange?.(event.payload); break
              case 'memory':          cb.onMemoryRecalled?.(event.payload.snippets); break
              case 'memory_saved':    cb.onMemorySaved?.(event.payload); break
              case 'soul':            cb.onSoulActivated?.(event.payload); break
              case 'skill_active':    cb.onSkillActivated?.(event.payload); break
              case 'tool_call':       cb.onToolCall?.(event.payload); break
              case 'tool_result':     cb.onToolResult?.(event.payload); break
              case 'resource_read':   cb.onResourceRead?.(event.payload); break
              case 'resource_content':cb.onResourceContent?.(event.payload); break
              case 'artifact': {
                const art = next.artifacts[event.payload.id]
                if (art) cb.onArtifact?.(art)
                break
              }
              case 'error': cb.onError?.(event.payload.message, event.payload.code); break
              case 'done':  cb.onDone?.(next); break
            }
          }

          if (event.type === 'done' || event.type === 'error') return
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const msg = (err as Error).message
      setState(prev => ({ ...prev, status: 'error', errorMessage: msg }))
      callbacksRef.current?.onError?.(msg)
    }
  }, [url])

  return { state, start, abort, reset }
}
