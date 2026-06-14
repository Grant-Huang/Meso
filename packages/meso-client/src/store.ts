import type { StreamState } from '@meso.ai/types'

export interface MesoMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Snapshot of StreamState for assistant turns (optional). */
  streamState?: StreamState
  timestamp?: string
}

export interface MesoSessionStore {
  getMessages(sessionId: string): Promise<MesoMessage[]>
  saveMessages(sessionId: string, messages: MesoMessage[]): Promise<void>
}

export interface InMemorySessionStoreOptions {
  initial?: Record<string, MesoMessage[]>
}

/** Simple in-memory store for demos and tests. */
export class InMemorySessionStore implements MesoSessionStore {
  private data: Record<string, MesoMessage[]>

  constructor(options?: InMemorySessionStoreOptions) {
    this.data = { ...(options?.initial ?? {}) }
  }

  async getMessages(sessionId: string): Promise<MesoMessage[]> {
    return [...(this.data[sessionId] ?? [])]
  }

  async saveMessages(sessionId: string, messages: MesoMessage[]): Promise<void> {
    this.data[sessionId] = [...messages]
  }
}
