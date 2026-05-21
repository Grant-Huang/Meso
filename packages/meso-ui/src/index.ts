// Components
export { ThreeColumnLayout } from './components/ThreeColumnLayout'
export type { ThreeColumnLayoutProps, NavItem } from './components/ThreeColumnLayout'

export { ChatBubble } from './components/ChatBubble'
export type { ChatBubbleProps, ChatRole } from './components/ChatBubble'

export { ThinkBlock } from './components/ThinkBlock'
export type { ThinkBlockProps } from './components/ThinkBlock'

export { StreamingCursor } from './components/StreamingCursor'
export type { StreamingCursorProps } from './components/StreamingCursor'

export { ArtifactPanel } from './components/ArtifactPanel'
export type { ArtifactPanelProps, ArtifactType } from './components/ArtifactPanel'

export { StageTimeline } from './components/StageTimeline'
export type { StageTimelineProps, Stage, StageStatus } from './components/StageTimeline'

export { MessageList } from './components/MessageList'
export type { MessageListProps, Message } from './components/MessageList'

// Hooks
export { useSSEStream } from './hooks/useSSEStream'
export type { StreamOptions } from './hooks/useSSEStream'

export { useTheme } from './hooks/useTheme'
export type { Theme } from './hooks/useTheme'

// Runtime (also available as @meso/ui/runtime for React-free usage)
export {
  PROTOCOL_VERSION,
  parseSSELine,
  applyEvent,
  createInitialStreamState,
} from './runtime'
export type {
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
} from './runtime'
