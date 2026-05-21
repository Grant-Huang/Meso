import { PROTOCOL_VERSION } from './protocol'
import type { SSEEvent } from './protocol'

/**
 * Parse a single SSE data line into an SSEEvent.
 *
 * Returns:
 *   SSEEvent  — valid protocol 1.0 event
 *   null      — empty line, comment (": …"), non-data line, invalid JSON,
 *               or missing required fields (skip silently)
 *
 * Special cases:
 *   "data: [DONE]"  → normalized to DoneEvent (same as {"type":"done",...})
 *   Missing schema_version → assumed "1.0" for transition-period tolerance
 */
export function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith('data: ')) return null

  const data = line.slice(6).trim()

  // OpenAI-compatible [DONE] sentinel
  if (data === '[DONE]') {
    return { type: 'done', schema_version: PROTOCOL_VERSION, payload: {} } as SSEEvent
  }

  let raw: unknown
  try {
    raw = JSON.parse(data)
  } catch {
    return null
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>

  if (typeof obj.type !== 'string') return null
  if (!obj.payload || typeof obj.payload !== 'object' || Array.isArray(obj.payload)) return null

  // Tolerate missing schema_version during protocol migration
  if (!obj.schema_version) obj.schema_version = PROTOCOL_VERSION

  return obj as unknown as SSEEvent
}
