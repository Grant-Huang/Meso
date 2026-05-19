import React, { useEffect, useRef } from 'react'
import { ChatBubble } from '../ChatBubble'
import { ThinkBlock } from '../ThinkBlock'
import { StageTimeline } from '../StageTimeline'
import { ArtifactPanel } from '../ArtifactPanel'
import type { StreamState } from '../../hooks/useSSEStream'
import type { ArtifactType } from '../ArtifactPanel'
import type { Stage } from '../StageTimeline'
import './MessageList.css'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  /** Final text content (for completed turns) */
  content: string
  timestamp?: string
}

export interface MessageListProps {
  /** Completed conversation turns */
  messages: Message[]
  /** Live streaming state from useSSEStream (omit when idle) */
  streaming?: StreamState
  /** Called when artifact copy button is clicked */
  onArtifactCopy?: (content: string) => void
  /** Called when artifact download button is clicked */
  onArtifactDownload?: (content: string) => void
  /** Rendered when messages is empty and no streaming */
  emptyState?: React.ReactNode
  className?: string
}

export function MessageList({
  messages,
  streaming,
  onArtifactCopy,
  onArtifactDownload,
  emptyState,
  className,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const hasContent = messages.length > 0 || (streaming && streaming.status !== 'idle')

  return (
    <div className={`meso-message-list${className ? ` ${className}` : ''}`}>
      <div className="meso-message-list__inner">
        {!hasContent && emptyState && (
          <div className="meso-message-list__empty">{emptyState}</div>
        )}

        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            role={m.role}
            content={m.content}
            timestamp={m.timestamp}
          />
        ))}

        {streaming && streaming.status !== 'idle' && (
          <div className="meso-message-list__live">
            {streaming.stages.length > 0 && !streaming.stages.every(s => s.status === 'done') && (
              <StageTimeline
                stages={streaming.stages.map((s): Stage => ({
                  id: s.label,
                  label: s.label,
                  status: s.status === 'done' ? 'done' : 'active',
                }))}
              />
            )}

            {streaming.memoryItems.length > 0 && (
              <div className="meso-memory-chips">
                {streaming.memoryItems.map((item, i) => (
                  <span key={i} className="meso-memory-chip">{item}</span>
                ))}
              </div>
            )}

            {streaming.thinkContent && (
              <ThinkBlock content={streaming.thinkContent} streaming={!streaming.thinkDone} />
            )}

            {(streaming.textContent || streaming.status === 'streaming') && (
              <ChatBubble
                role="assistant"
                content={streaming.textContent}
                streaming={streaming.status === 'streaming' && !streaming.artifact}
              />
            )}

            {streaming.artifact && (
              <ArtifactPanel
                type={streaming.artifact.type as ArtifactType}
                content={streaming.artifact.content}
                language={streaming.artifact.language}
                streaming={!streaming.artifact_done}
                onCopy={onArtifactCopy}
                onDownload={onArtifactDownload}
              />
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
