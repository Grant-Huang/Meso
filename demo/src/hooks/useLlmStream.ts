import { useCallback, useRef, useState } from 'react'
import { createInitialStreamState, applyEvent } from '@meso/types'
import type { StreamState, StreamStatus } from '@meso/ui'

export interface LlmMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface UseLlmStreamOptions {
  baseUrl: string
  model: string
  apiKey: string
  systemPrompt?: string
}

/**
 * Calls an OpenAI-compatible chat completions API with streaming and
 * translates the response into a Meso StreamState.
 *
 * Wire format expected: choices[0].delta.content chunks, terminated by [DONE].
 * Maps content deltas → TextEvent so MessageList renders them natively.
 */
export function useLlmStream() {
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

  const send = useCallback(async (
    messages: LlmMessage[],
    opts: UseLlmStreamOptions,
  ) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState({ ...createInitialStreamState(), status: 'streaming' })

    const allMessages = opts.systemPrompt
      ? [{ role: 'system' as const, content: opts.systemPrompt }, ...messages]
      : messages

    try {
      const resp = await fetch(`${opts.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${opts.apiKey}`,
        },
        body: JSON.stringify({
          model: opts.model,
          messages: allMessages,
          stream: true,
        }),
        signal: ctrl.signal,
      })

      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(`HTTP ${resp.status}: ${text.slice(0, 200)}`)
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
          if (data === '[DONE]') {
            setState(prev => applyEvent(prev, {
              type: 'done',
              schema_version: '1.0',
              payload: {},
            }))
            return
          }

          let parsed: unknown
          try { parsed = JSON.parse(data) } catch { continue }

          const chunk = parsed as {
            choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>
          }
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) {
            setState(prev => applyEvent(prev, {
              type: 'text',
              schema_version: '1.0',
              payload: { delta },
            }))
          }
        }
      }

      setState(prev => applyEvent(prev, {
        type: 'done',
        schema_version: '1.0',
        payload: {},
      }))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setState(prev => applyEvent(prev, {
        type: 'error',
        schema_version: '1.0',
        payload: { message: (err as Error).message },
      }))
    }
  }, [])

  return { state, send, abort, reset }
}
