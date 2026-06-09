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

// ── Shared capability metadata ───────────────────────────────────────────────
//
// Every callable capability in Meso belongs to a provider.
// This type is shared across tool_call, skill_active, resource_read, and
// the capabilities discovery event.

/**
 * Who provides this capability.
 *   builtin — platform built-in (search_knowledge, save_memory, …)
 *   local   — app-defined function in the same process
 *   mcp     — served by an MCP (Model Context Protocol) server
 *   api     — external REST/gRPC endpoint
 */
export type CapabilityProvider = 'builtin' | 'local' | 'mcp' | 'api'

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
  /**
   * When present, routes this chunk to a specific phase's thinkContent
   * rather than the top-level StreamState.thinkContent.
   * The phase must have been created via a prior phase event.
   */
  phase_id?: string
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

// ── Capabilities discovery event ─────────────────────────────────────────────
//
// Sent once at stream start to announce all capabilities available in this
// session. Frontends use this to render skill selectors, tool toggles, MCP
// server panels, etc. — without hardcoding any app-specific knowledge.

export type ToolRisk = 'safe' | 'write' | 'destructive'

export interface ToolSpec {
  name: string
  description?: string
  provider: CapabilityProvider
  /** MCP server name when provider = "mcp". */
  server?: string
  risk?: ToolRisk
  /** JSON Schema for the tool's input parameters. */
  input_schema?: Record<string, unknown>
}

export interface SkillSpec {
  id: string
  name: string
  description?: string
  provider?: CapabilityProvider
  server?: string
  focus_points?: Array<{ id: string; name: string }>
}

export interface ResourceSpec {
  /** MCP resource URI (e.g. "file:///path/to/doc" or "db://table/id"). */
  uri: string
  name?: string
  description?: string
  /** MCP server that exposes this resource. */
  server?: string
  mime_type?: string
}

export interface MCPServerSpec {
  name: string
  version?: string
  /** Which MCP capability groups this server exposes. */
  capabilities: Array<'tools' | 'resources' | 'prompts' | 'sampling'>
}

export interface CapabilitiesPayload {
  tools?: ToolSpec[]
  skills?: SkillSpec[]
  resources?: ResourceSpec[]
  mcp_servers?: MCPServerSpec[]
}

/**
 * Capability discovery — sent once at stream start.
 * Frontend uses this to populate skill selectors, tool toggles, and MCP panels.
 * Backend sends only what is relevant to the current session/app.
 */
export type CapabilitiesEvent = Envelope<'capabilities', CapabilitiesPayload>

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

// ── Skill event ──────────────────────────────────────────────────────────────
//
// Distinct from Soul: Soul = WHO (identity, stable), Skill = HOW (operational
// mode, can switch within a session). MCP Prompts map to skills.

export interface SkillPayload {
  id: string
  name: string
  version?: string
  provider?: CapabilityProvider
  /** MCP server name when provider = "mcp" (MCP prompt → Meso skill). */
  server?: string
  /** Active focus_point ids selected for this invocation. */
  focus?: string[]
  description?: string
}
/**
 * Skill activation — emitted when backend selects or switches operational mode.
 * Maps MCP prompts to the same signal: backends translate get_prompt results
 * into skill_active before injecting the prompt content into the system prompt.
 */
export type SkillActiveEvent = Envelope<'skill_active', SkillPayload>

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

/** MCP tool annotations mapped to platform-standard fields. */
export interface ToolAnnotations {
  /** Tool result is safe to retry (MCP: idempotentHint). */
  idempotent?: boolean
  /** Tool may make external network calls (MCP: openWorldHint). */
  open_world?: boolean
}

export interface ToolCallPayload {
  /** Unique id scoping this invocation within the response. */
  id: string
  name: string
  args: Record<string, unknown>
  /**
   * Risk level hint for UI rendering and confirm gate.
   * Omit or use "safe" for read-only tools.
   * Maps from MCP annotations: readOnlyHint → safe, destructiveHint → destructive.
   */
  risk?: ToolRisk
  /** Who provides this tool. Omit for platform built-ins. */
  provider?: CapabilityProvider
  /** MCP server name when provider = "mcp". */
  server?: string
  /** Optional MCP-originated behaviour hints for UI rendering. */
  annotations?: ToolAnnotations
  /**
   * Groups this call with related calls under the same logical operation.
   * Use a stable id (e.g. subtopic id) so the frontend can route tool steps
   * to the correct UI container without text parsing.
   */
  groupId?: string
  /** Semantic kind of the group (e.g. "subtopic", "parallel_search"). */
  groupKind?: string
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

// ── MCP Resource events ──────────────────────────────────────────────────────
//
// Resources are distinct from tools: they are identified by URI, are read-only,
// and return structured content (text, image, blob) rather than arbitrary output.
// Tools = "call a function". Resources = "read a document".

export interface ResourceReadPayload {
  /** Unique id scoping this read within the response (for correlation). */
  id: string
  /** MCP resource URI (e.g. "file:///path/to/doc"). */
  uri: string
  name?: string
  /** MCP server that serves this resource. */
  server?: string
}
/** LLM or backend requested a resource read — emitted before content arrives. */
export type ResourceReadEvent = Envelope<'resource_read', ResourceReadPayload>

export interface ResourceContentItem {
  type: 'text' | 'image' | 'blob'
  /** Present when type = "text". */
  text?: string
  /** Present when type = "image" | "blob". Base64-encoded. */
  data?: string
  mime_type?: string
}

export interface ResourceContentPayload {
  /** Matches the id from the corresponding resource_read event. */
  resource_read_id: string
  contents: ResourceContentItem[]
  /** Present only on failure. */
  error?: string
  duration_ms?: number
}
/** Resource content arrived (or failed). */
export type ResourceContentEvent = Envelope<'resource_content', ResourceContentPayload>

// ── Workflow node event ──────────────────────────────────────────────────────
//
// Developer-facing fine-grained observability for DAG/workflow execution.
// Complements stage (user-readable coarse progress) with per-node telemetry.
//
// Division of labour:
//   stage         — user-visible pipeline label ("召回记忆", "生成回复")
//   workflow_node — developer step inside a backend workflow (web_search, fetch_batch_3)
//
// A single stream may contain multiple workflow runs (e.g., parallel sub-graphs).
// The DAG executor lives in the backend (LangGraph, Temporal, custom code) —
// this event is the read-only signal it emits; Meso only observes and renders.

export type WorkflowNodeState = 'active' | 'done' | 'error' | 'skipped'

export interface WorkflowNodePayload {
  /** Groups all nodes belonging to the same workflow execution. */
  run_id: string
  /** Unique node identifier within the run. */
  node_id: string
  /** Parent node id for tree/sub-graph structure. Null or absent = root node. */
  parent_id?: string | null
  /** Developer-facing node name (e.g. "web_search", "fetch_batch_3"). */
  name: string
  state: WorkflowNodeState
  /** Unix ms timestamp when this node started. */
  started_at?: number
  /** Wall-clock duration in milliseconds (present on done/error). */
  duration_ms?: number
  /** Arbitrary domain-specific metadata (e.g. input/output summaries). */
  metadata?: Record<string, unknown>
}
/** Fine-grained workflow node progress — developer-facing, not shown to end users. */
export type WorkflowNodeEvent = Envelope<'workflow_node', WorkflowNodePayload>

// ── External tool definition (dev-time registration format) ─────────────────
//
// Tool authors write one ToolDefinition per tool (as a .json file or inline in
// manifest.json). Backends read these at startup and translate them into ToolSpec
// entries in the capabilities SSE event. This type is NOT an SSE event — it is
// a config-file contract for development-time tool registration.
//
// Supported forms in manifest.json "tools" array:
//   "search_knowledge"           → built-in tool ID (string)
//   "./tools/my-tool.json"       → path to a ToolDefinition file (string)
//   { schema_version: "1.0", … } → inline ToolDefinition (object)

export interface ExternalToolAuth {
  type: 'bearer' | 'api_key' | 'basic'
  /** HTTP header to carry the credential (default: "Authorization"). */
  header?: string
  /** Name of the environment variable holding the secret, e.g. "${MY_API_KEY}". */
  env?: string
}

export interface ToolDefinition {
  schema_version: '1.0'
  /**
   * Stable unique identifier. Use dot-namespacing to avoid collisions,
   * e.g. "acme.web_search", "myapp.export_docx".
   */
  id: string
  /** Display name shown in UI and passed to the LLM. */
  name: string
  /** Semver — bump when input_schema or behaviour changes. */
  version: string
  description: string
  risk?: ToolRisk
  /**
   * How the backend invokes this tool at runtime:
   *   local — function in the same backend process
   *   api   — HTTP endpoint (provide `endpoint`)
   *   mcp   — via a named MCP server (prefer manifest mcp.servers instead)
   */
  provider: Extract<CapabilityProvider, 'local' | 'api' | 'mcp'>
  /** Required when provider = "api". */
  endpoint?: string
  /** HTTP method for provider = "api" (default: "POST"). */
  method?: 'GET' | 'POST'
  auth?: ExternalToolAuth
  /** JSON Schema describing the tool's input parameters. */
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
    [key: string]: unknown
  }
  /** Free-form tags for filtering and grouping in tool-picker UI. */
  tags?: string[]
  /** Icon name (Ant Design icon or custom asset key). */
  icon?: string
}

// ── Phase event ──────────────────────────────────────────────────────────────
//
// Phases are coarse, user-visible stages of a multi-step AI pipeline.
// Unlike workflow_node (developer telemetry), phases are first-class citizens
// in StreamState and can carry per-phase think streams and structured output.
//
// Division of labour:
//   stage  — lightweight progress label (deprecated path; use phase for richer UX)
//   phase  — full lifecycle with nested think stream + structured body
//
// Typical flow:
//   phase(id, name, state:"running") → think(delta, phase_id) × N
//   → think(delta, phase_id, done:true) → phase(id, name, state:"done", body, pinned_think)

export type PhaseState = 'pending' | 'running' | 'done' | 'error'

export interface PhasePayload {
  /** Stable identifier for this phase (e.g. "understand", "search", "generate"). */
  id: string
  /** User-visible display name (e.g. "理解需求", "检索文献"). */
  name: string
  state: PhaseState
  /**
   * Structured output produced by this phase (e.g. a brief, JSON plan).
   * Present on done events; persisted in PhaseRecord.body.
   */
  body?: string
  /**
   * Frozen snapshot of the think stream for this phase.
   * Send on the done event to prevent streaming→done content flash in ThinkBlock.
   * When present, ThinkBlock should display this instead of the live content.
   */
  pinned_think?: string
  /** Unix ms timestamp when this phase started. */
  started_at?: number
  /** Unix ms timestamp when this phase ended. */
  ended_at?: number
}
/** Phase lifecycle event — emitted at start (state:"running") and end (state:"done"/"error"). */
export type PhaseEvent = Envelope<'phase', PhasePayload>

// ── Extension event ─────────────────────────────────────────────────────────
//
// Third-party backends use this channel for domain-specific events that don't
// fit any standard type. Standard types should always be preferred when they
// semantically match — extension is the escape hatch, not the default.

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
  | PhaseEvent
  | CapabilitiesEvent
  | MemoryEvent
  | MemorySavedEvent
  | SoulEvent
  | SkillActiveEvent
  | ThinkEvent
  | TextEvent
  | ArtifactEvent
  | ToolCallEvent
  | ToolResultEvent
  | ResourceReadEvent
  | ResourceContentEvent
  | WorkflowNodeEvent
  | DoneEvent
  | ErrorEvent
  | ExtensionEvent
