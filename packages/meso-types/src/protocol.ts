/**
 * Meso SSE Streaming Protocol — v1.0
 *
 * Every event is wrapped in a standard envelope:
 *   data: {"type":"<event_type>","schema_version":"1.0","payload":{...}}\n\n
 *
 * This file is the single source of truth for event shapes.
 * useSSEStream, applyEvent, and all third-party backends must conform to it.
 */

export const PROTOCOL_VERSION = '1.0' as const
export type ProtocolVersion = typeof PROTOCOL_VERSION

/** Standard envelope wrapping every SSE event. */
type Envelope<T extends string, P> = {
  type: T
  schema_version: ProtocolVersion
  payload: P
}

// ── Standard events ─────────────────────────────────────────────────────────

export interface StagePayload {
  name: string
  state: 'active' | 'done' | 'error'
}
/** Pipeline stage progress (召回记忆, 检索知识, 生成回复, …). */
export type StageEvent = Envelope<'stage', StagePayload>

export interface MemorySnippet {
  category: string
  content: string
}
export interface MemoryPayload {
  snippets: MemorySnippet[]
}
/** Memory recall results; replaces previous snippets when received. */
export type MemoryEvent = Envelope<'memory', MemoryPayload>

export interface ThinkPayload {
  delta: string
  /** true on the final think chunk — triggers auto-collapse in ThinkBlock. */
  done?: boolean
}
/** Incremental reasoning text. */
export type ThinkEvent = Envelope<'think', ThinkPayload>

export interface TextPayload {
  delta: string
}
/** Incremental response text. */
export type TextEvent = Envelope<'text', TextPayload>

export interface ArtifactPayload {
  /** Unique artifact identifier; multiple artifacts per response use distinct ids. */
  id: string
  /**
   * Content language/type. Well-known values:
   *   "html preview" | "mermaid" | "python" | "typescript" | …
   */
  lang: string
  delta: string
  /** true on the final artifact chunk. */
  done?: boolean
}
/** Incremental artifact content (code, HTML preview, Mermaid diagram, …). */
export type ArtifactEvent = Envelope<'artifact', ArtifactPayload>

/** Stream ended successfully. Mutually exclusive with ErrorEvent. */
export type DoneEvent = Envelope<'done', Record<string, never>>

export interface ErrorPayload {
  message: string
  /** Optional machine-readable error code (e.g. "UPSTREAM_TIMEOUT"). */
  code?: string
}
/** Unrecoverable error. Mutually exclusive with DoneEvent. */
export type ErrorEvent = Envelope<'error', ErrorPayload>

// ── Soul event ───────────────────────────────────────────────────────────────

export interface SoulPayload {
  /** Stable identifier for this soul definition. */
  id: string
  /** Display name shown in UI. */
  name: string
  /** Semver of the soul definition — bumped when personality changes. */
  version: string
  /** Optional avatar URL or data URI. */
  avatar?: string
  /** Optional trait tags for UI display (e.g. ["严谨", "好奇"]). */
  traits?: string[]
}
/** Active soul/persona notification — sent once at stream start. */
export type SoulEvent = Envelope<'soul', SoulPayload>

// ── Memory write event ───────────────────────────────────────────────────────

export interface MemorySavedPayload {
  /** Unique id of the saved memory entry. */
  id: string
  category: string
  /** Short excerpt for toast display (≤ 80 chars). */
  preview: string
}
/** Backend confirmation that a memory was persisted during this session. */
export type MemorySavedEvent = Envelope<'memory_saved', MemorySavedPayload>

// ── Tool events ──────────────────────────────────────────────────────────────

export type ToolRisk = 'safe' | 'write' | 'destructive'

export interface ToolCallPayload {
  /** Unique id scoping this invocation within the response. */
  id: string
  name: string
  args: Record<string, unknown>
  /**
   * Risk level hint for UI rendering and confirm gate.
   * Omit or use "safe" for read-only tools.
   */
  risk?: ToolRisk
}
/** LLM decided to call a tool — emitted before execution starts. */
export type ToolCallEvent = Envelope<'tool_call', ToolCallPayload>

export interface ToolResultPayload {
  /** Matches the id from the corresponding tool_call event. */
  tool_call_id: string
  /** Serialised output (stringified JSON, plain text, etc.). */
  output: string
  /** Present only on failure. */
  error?: string
  duration_ms?: number
}
/** Tool execution completed (success or error). */
export type ToolResultEvent = Envelope<'tool_result', ToolResultPayload>

// ── Extension event ─────────────────────────────────────────────────────────
//
// Third-party backends use this channel for domain-specific events
// (tool progress, confirm gates, business entity references, etc.)
// without forking the platform runtime.
//
// Example:
//   data: {"type":"extension","schema_version":"1.0",
//           "payload":{"name":"tool_progress","data":{"tool":"search","status":"running"}}}

export interface ExtensionPayload {
  /** Identifies the extension type (e.g. "tool_progress", "confirm_gate"). */
  name: string
  /** Optional semver for the extension schema itself. */
  version?: string
  data: unknown
}
/** Third-party extension event — consumed via MessageList's renderExtension prop. */
export type ExtensionEvent = Envelope<'extension', ExtensionPayload>

// ── Union ────────────────────────────────────────────────────────────────────

export type SSEEvent =
  | StageEvent
  | MemoryEvent
  | MemorySavedEvent
  | SoulEvent
  | ThinkEvent
  | TextEvent
  | ArtifactEvent
  | ToolCallEvent
  | ToolResultEvent
  | DoneEvent
  | ErrorEvent
  | ExtensionEvent
