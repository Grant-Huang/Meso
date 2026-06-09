import type {
  StagePayload,
  MemorySnippet,
  MemorySavedPayload,
  SoulPayload,
  SkillPayload,
  CapabilitiesPayload,
  ToolCallPayload,
  ToolResultPayload,
  ResourceReadPayload,
  ResourceContentPayload,
  ExtensionEvent,
  WorkflowNodeState,
  PhaseState as PhaseLifecycleState,
} from './protocol'

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error'

/**
 * Runtime state of a single phase within a multi-step pipeline.
 * Populated by `phase` events; think chunks with matching `phase_id`
 * are accumulated into `thinkContent`.
 */
export interface PhaseRecord {
  id: string
  name: string
  state: PhaseLifecycleState
  /** Think chunks accumulated from think events with this phase_id. */
  thinkContent: string
  /**
   * Frozen snapshot of the think content delivered by the backend on the
   * done event. When present, use this instead of thinkContent to avoid
   * streaming→done content flash.
   */
  pinnedThink?: string
  /** Structured output produced by this phase (e.g. a brief, plan JSON). */
  body?: string
  startedAt?: number
  endedAt?: number
}

export interface ArtifactState {
  id: string
  lang: string
  content: string
  done: boolean
}

export type ToolCallStatus =
  | 'pending'          // call received, execution not yet started
  | 'running'          // backend acknowledged start
  | 'awaiting_confirm' // backend waiting for user approval
  | 'done'             // result received
  | 'error'            // result received with error

export interface ToolCallState {
  call: ToolCallPayload
  result?: ToolResultPayload
  status: ToolCallStatus
  /** Mirrors ToolCallPayload.groupId — promoted for convenient filtering. */
  groupId?: string
  /** Mirrors ToolCallPayload.groupKind — promoted for convenient filtering. */
  groupKind?: string
}

export type ResourceReadStatus = 'pending' | 'done' | 'error'

export interface ResourceReadState {
  read: ResourceReadPayload
  content?: ResourceContentPayload
  status: ResourceReadStatus
}

export interface WorkflowNodeRecord {
  node_id: string
  run_id: string
  parent_id?: string | null
  name: string
  state: WorkflowNodeState
  started_at?: number
  duration_ms?: number
  metadata?: Record<string, unknown>
}

export interface WorkflowRunState {
  run_id: string
  /** All nodes keyed by node_id for O(1) lookup and state updates. */
  nodes: Record<string, WorkflowNodeRecord>
  /** Node ids in first-seen order — use for deterministic rendering. */
  nodeOrder: string[]
}

export interface StreamState {
  status: StreamStatus

  // ── Capability context (set before LLM generates) ──────────────────────────
  /** All capabilities available in this session — from the capabilities event. */
  availableCapabilities: CapabilitiesPayload | null
  /** Active soul/persona; null until soul event received. */
  activeSoul: SoulPayload | null
  /** Active skill/operational mode; null until skill_active event received. */
  activeSkill: SkillPayload | null

  // ── Pipeline progress ──────────────────────────────────────────────────────
  /** Pipeline stages in arrival order; deduped by name. */
  stages: StagePayload[]

  // ── Memory ─────────────────────────────────────────────────────────────────
  /** Memory snippets recalled before generation. */
  memorySnippets: MemorySnippet[]
  /** Memory entries persisted during this session (backend confirmations). */
  memorySaved: MemorySavedPayload[]

  // ── Capability invocations ─────────────────────────────────────────────────
  /** Tool calls keyed by id for O(1) lookup and result correlation. */
  toolCalls: Record<string, ToolCallState>
  /** Tool call ids in first-seen order — use for deterministic rendering. */
  toolCallOrder: string[]
  /** MCP resource reads keyed by id for O(1) lookup and content correlation. */
  resourceReads: Record<string, ResourceReadState>
  /** Resource read ids in first-seen order — use for deterministic rendering. */
  resourceReadOrder: string[]

  // ── LLM output ─────────────────────────────────────────────────────────────
  thinkContent: string
  thinkDone: boolean
  textContent: string
  /** Artifacts keyed by id for O(1) lookup during incremental updates. */
  artifacts: Record<string, ArtifactState>
  /** Artifact ids in first-seen order — use for deterministic rendering. */
  artifactOrder: string[]

  // ── Workflow observability ─────────────────────────────────────────────────
  /**
   * Workflow runs keyed by run_id. One stream may contain multiple runs
   * (e.g. parallel sub-graphs from LangGraph or Temporal).
   * Stage = user-readable coarse progress; workflow_node = developer-facing fine steps.
   */
  workflowRuns: Record<string, WorkflowRunState>
  /** Run ids in first-seen order — use for deterministic rendering. */
  workflowRunOrder: string[]

  // ── Phases ─────────────────────────────────────────────────────────────────
  /**
   * Multi-step pipeline phases keyed by id.
   * Populated by `phase` events; richer alternative to `stages` for apps
   * that need per-phase think streams and structured output.
   */
  phases: Record<string, PhaseRecord>
  /** Phase ids in first-seen order — use for deterministic rendering. */
  phaseOrder: string[]

  // ── Extension escape hatch ─────────────────────────────────────────────────
  /**
   * Extension events keyed by name for lookup (e.g. extensions["tool_progress"]).
   * For time-ordered rendering, use extensionLog instead.
   */
  extensions: Record<string, ExtensionEvent[]>
  /** All extension events in arrival order — use when sequential rendering matters. */
  extensionLog: ExtensionEvent[]

  errorMessage: string | null
}

export function createInitialStreamState(): StreamState {
  return {
    status: 'idle',
    availableCapabilities: null,
    activeSoul: null,
    activeSkill: null,
    stages: [],
    memorySnippets: [],
    memorySaved: [],
    toolCalls: {},
    toolCallOrder: [],
    resourceReads: {},
    resourceReadOrder: [],
    thinkContent: '',
    thinkDone: false,
    textContent: '',
    artifacts: {},
    artifactOrder: [],
    workflowRuns: {},
    workflowRunOrder: [],
    phases: {},
    phaseOrder: [],
    extensions: {},
    extensionLog: [],
    errorMessage: null,
  }
}

/**
 * Returns true if the state contains at least one artifact with non-empty content.
 * Pass `excludeLangs` to skip specific lang values (e.g. internal graph types).
 */
export function streamStateHasArtifacts(
  state: StreamState,
  options?: { excludeLangs?: string[] },
): boolean {
  const excluded = new Set(options?.excludeLangs ?? [])
  return state.artifactOrder.some((id) => {
    const art = state.artifacts[id]
    return art != null && !excluded.has(art.lang) && Boolean(art.content.trim())
  })
}

/** Minimal artifact definition for constructing a StreamState from stored data. */
export interface ArtifactDef {
  id: string
  lang: string
  content: string
}

/**
 * Constructs a completed StreamState containing only the given artifacts.
 * Use this instead of manually spreading `createInitialStreamState()` when
 * restoring saved artifacts (e.g. persisted review content, session replay).
 */
export function createStreamStateWithArtifacts(artifacts: ArtifactDef[]): StreamState {
  const artifactRecord: Record<string, ArtifactState> = {}
  const artifactOrder: string[] = []
  for (const def of artifacts) {
    artifactRecord[def.id] = { id: def.id, lang: def.lang, content: def.content, done: true }
    artifactOrder.push(def.id)
  }
  return {
    ...createInitialStreamState(),
    status: 'done',
    artifacts: artifactRecord,
    artifactOrder,
  }
}
