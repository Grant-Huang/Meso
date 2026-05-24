import React from 'react'
import './ChatBubble.css'

export type ChatRole = 'user' | 'assistant'

export interface ChatBubbleProps {
  role: ChatRole
  /** Text content */
  content: string
  /** Show streaming cursor at end */
  streaming?: boolean
  /** Timestamp label */
  timestamp?: string
  /**
   * When true, render content as Markdown via renderMarkdown.
   * Falls back to line-split if renderMarkdown is not provided.
   */
  markdown?: boolean
  /**
   * Sanitized HTML string factory (e.g. marked + DOMPurify).
   * Required for markdown=true to take effect.
   */
  renderMarkdown?: (source: string) => string
}

export function ChatBubble({
  role,
  content,
  streaming = false,
  timestamp,
  markdown = false,
  renderMarkdown,
}: ChatBubbleProps) {
  const useMarkdown = markdown && typeof renderMarkdown === 'function'

  return (
    <div className={`meso-bubble meso-bubble--${role}`}>
      {role === 'assistant' && (
        <div className="meso-bubble__avatar" aria-hidden="true">AI</div>
      )}
      <div className="meso-bubble__body">
        {useMarkdown ? (
          <div
            className="meso-bubble__content meso-bubble__md"
            // renderMarkdown must return sanitized HTML (e.g. DOMPurify output)
            dangerouslySetInnerHTML={{ __html: renderMarkdown!(content) }}
          />
        ) : (
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
        )}
        {timestamp && <div className="meso-bubble__timestamp">{timestamp}</div>}
      </div>
    </div>
  )
}
