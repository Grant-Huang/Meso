/**
 * Re-exports everything from @meso/types.
 * Implementation lives solely in @meso/types — do not duplicate here.
 *
 * Consumers who don't need React can import from @meso/types directly
 * (zero-dep, smaller bundle). This re-export exists so that
 * `@meso/ui/runtime` continues to work as a convenience path.
 */
export {
  PROTOCOL_VERSION,
  createInitialStreamState,
  applyEvent,
  parseSSELine,
} from '@meso/types'

export type {
  ProtocolVersion,
  SSEEvent,
  StageEvent,
  StagePayload,
  MemoryEvent,
  MemorySnippet,
  MemoryPayload,
  ThinkEvent,
  ThinkPayload,
  TextEvent,
  TextPayload,
  ArtifactEvent,
  ArtifactPayload,
  DoneEvent,
  ErrorEvent,
  ErrorPayload,
  ExtensionEvent,
  ExtensionPayload,
  StreamState,
  StreamStatus,
  ArtifactState,
} from '@meso/types'
