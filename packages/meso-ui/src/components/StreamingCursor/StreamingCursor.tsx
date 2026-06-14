import './StreamingCursor.css'

export interface StreamingCursorProps {
  active?: boolean
}

export function StreamingCursor({ active = true }: StreamingCursorProps) {
  if (!active) return null
  return <span className="meso-streaming-cursor" aria-hidden="true">▋</span>
}
