import { createInitialStreamState, type StreamState } from '@meso.ai/types'
import type { MesoMessage, MesoSessionStore } from './store'
import { InMemorySessionStore } from './store'
import { FetchMesoTransport, type MesoTransport } from './transport'
import { FetchConfirmChannel, type ToolConfirmChannel, confirmTool } from './confirm'

export interface CreateMesoSessionOptions {
  sessionId: string
  streamUrl: string
  transport?: MesoTransport
  store?: MesoSessionStore
  confirmChannel?: ToolConfirmChannel
  headers?: Record<string, string>
  onStreamState?: (state: StreamState) => void
}

export interface MesoSession {
  sessionId: string
  messages: MesoMessage[]
  streaming: StreamState
  sendMessage(text: string): Promise<void>
  confirmToolCall(toolCallId: string, approved: boolean): Promise<void>
  load(): Promise<void>
  resetStream(): void
}

let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export function createMesoSession(options: CreateMesoSessionOptions): MesoSession {
  const {
    sessionId,
    streamUrl,
    transport = new FetchMesoTransport(),
    store = new InMemorySessionStore(),
    confirmChannel = new FetchConfirmChannel(),
    headers,
    onStreamState,
  } = options

  let messages: MesoMessage[] = []
  let streaming: StreamState = createInitialStreamState()
  let abortCtrl: AbortController | null = null

  const persist = async () => {
    await store.saveMessages(sessionId, messages)
  }

  const session: MesoSession = {
    sessionId,
    get messages() { return messages },
    get streaming() { return streaming },

    async load() {
      messages = await store.getMessages(sessionId)
    },

    resetStream() {
      abortCtrl?.abort()
      streaming = createInitialStreamState()
      onStreamState?.(streaming)
    },

    async sendMessage(text: string) {
      abortCtrl?.abort()
      abortCtrl = new AbortController()

      const userMsg: MesoMessage = {
        id: nextId('user'),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }
      messages = [...messages, userMsg]
      await persist()

      streaming = { ...createInitialStreamState(), status: 'streaming' }
      onStreamState?.(streaming)

      const final = await transport.stream(
        {
          url: streamUrl,
          method: 'POST',
          headers,
          body: { session_id: sessionId, message: text },
          signal: abortCtrl.signal,
        },
        (_event, state) => {
          streaming = state
          onStreamState?.(state)
        },
      )

      streaming = final
      onStreamState?.(final)

      const assistantMsg: MesoMessage = {
        id: nextId('assistant'),
        role: 'assistant',
        content: final.textContent,
        streamState: final,
        timestamp: new Date().toISOString(),
      }
      messages = [...messages, assistantMsg]
      await persist()
    },

    async confirmToolCall(toolCallId: string, approved: boolean) {
      await confirmTool(confirmChannel, toolCallId, approved, sessionId)
    },
  }

  return session
}
