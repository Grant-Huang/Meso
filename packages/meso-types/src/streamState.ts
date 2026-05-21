import type {
  StagePayload,
  MemorySnippet,
  MemorySavedPayload,
  SoulPayload,
  ToolCallPayload,
  ToolResultPayload,
  ExtensionEvent,
} from './protocol'

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error'

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
}

export interface StreamState {
  status: StreamStatus
  /** Pipeline stages in arrival order; deduped by name. */
  stages: StagePayload[]
  /** Memory snippets recalled before generation. */
  memorySnippets: MemorySnippet[]
  /** Memory entries persisted during this session (backend confirmations). */
  memorySaved: MemorySavedPayload[]
  /** Active soul/persona for this response; null until soul event received. */
  activeSoul: SoulPayload | null
  thinkContent: string
  thinkDone: boolean
  textContent: string
  /** Artifacts keyed by id for O(1) lookup during incremental updates. */
  artifacts: Record<string, ArtifactState>
  /** Artifact ids in first-seen order — use for deterministic rendering. */
  artifactOrder: string[]
  /** Tool calls keyed by id for O(1) lookup and result correlation. */
  toolCalls: Record<string, ToolCallState>
  /** Tool call ids in first-seen order — use for deterministic rendering. */
  toolCallOrder: string[]
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
    stages: [],
    memorySnippets: [],
    memorySaved: [],
    activeSoul: null,
    thinkContent: '',
    thinkDone: false,
    textContent: '',
    artifacts: {},
    artifactOrder: [],
    toolCalls: {},
    toolCallOrder: [],
    extensions: {},
    extensionLog: [],
    errorMessage: null,
  }
}
