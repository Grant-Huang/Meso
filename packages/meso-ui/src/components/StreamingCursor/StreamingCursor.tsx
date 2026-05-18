import './StreamingCursor.css'

export interface StreamingCursorProps {
  /** Whether the cursor is currently visible/blinking */
  active?: boolean
}

export function StreamingCursor({ active = true }: StreamingCursorProps) {
  if (!active) return null
  return <span className="meso-streaming-cursor" aria-hidden="true">▋</span>
}
