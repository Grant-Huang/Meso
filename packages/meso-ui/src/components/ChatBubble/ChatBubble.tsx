import React from 'react'
import './ChatBubble.css'

export type ChatRole = 'user' | 'assistant'

export interface ChatBubbleProps {
  role: ChatRole
  /** Text content (supports simple line breaks via \n) */
  content: string
  /** Show streaming cursor at end */
  streaming?: boolean
  /** Timestamp label */
  timestamp?: string
}

export function ChatBubble({ role, content, streaming = false, timestamp }: ChatBubbleProps) {
  return (
    <div className={`meso-bubble meso-bubble--${role}`}>
      {role === 'assistant' && (
        <div className="meso-bubble__avatar" aria-hidden="true">AI</div>
      )}
      <div className="meso-bubble__body">
        <div className="meso-bubble__content">
          {content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
          {streaming && (
            <span className="meso-bubble__cursor" aria-hidden="true">▋</span>
          )}
        </div>
        {timestamp && <div className="meso-bubble__timestamp">{timestamp}</div>}
      </div>
    </div>
  )
}
