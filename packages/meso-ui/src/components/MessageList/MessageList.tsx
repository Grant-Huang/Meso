import React, { useEffect, useRef } from 'react'
import { ChatBubble } from '../ChatBubble'
import { ThinkBlock } from '../ThinkBlock'
import { StageTimeline } from '../StageTimeline'
import { ArtifactPanel } from '../ArtifactPanel'
import { ToolCallBlock } from '../ToolCallBlock'
import { SoulIndicator } from '../SoulIndicator'
import { SkillIndicator } from '../SkillIndicator'
import { ResourceReadBlock } from '../ResourceReadBlock'
import type { StreamState, ExtensionEvent } from '../../runtime'
import type { ArtifactType } from '../ArtifactPanel'
import type { Stage } from '../StageTimeline'
import './MessageList.css'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  /** Final text content for completed turns. */
  content: string
  timestamp?: string
}

export interface MessageListProps {
  /** Completed conversation turns. */
  messages: Message[]
  /** Live streaming state from useSSEStream; omit when idle. */
  streaming?: StreamState
  /** Called when artifact copy button is clicked. */
  onArtifactCopy?: (content: string) => void
  /** Called when artifact download button is clicked. */
  onArtifactDownload?: (content: string) => void
  /**
   * Called when user confirms a tool awaiting confirmation.
   * The app should send the approval to the backend via its own channel.
   */
  onToolConfirm?: (toolCallId: string) => void
  /** Called when user cancels a tool awaiting confirmation. */
  onToolCancel?: (toolCallId: string) => void
  /** Rendered when messages is empty and no streaming is active. */
  emptyState?: React.ReactNode
  className?: string
  /**
   * Render custom UI for extension events in arrival order.
   * Use this for domain-specific events that don't fit standard types.
   */
  renderExtension?: (event: ExtensionEvent) => React.ReactNode
  /**
   * Sanitized HTML factory for Markdown rendering in assistant bubbles.
   * When provided, assistant bubbles render content as Markdown.
   * Must return sanitized HTML (e.g. marked + DOMPurify output).
   */
  renderMarkdown?: (source: string) => string
  /**
   * Async Mermaid renderer passed to ArtifactPanel.
   * Receives source, returns SVG string. Called once streaming is done.
   */
  renderMermaid?: (source: string) => Promise<string>
  /**
   * Syntax highlighter passed to ArtifactPanel.
   * Receives (code, lang), returns sanitized HTML. Called once streaming is done.
   */
  highlightCode?: (code: string, lang: string) => string
}

/** Map protocol lang string to ArtifactPanel type + language prop. */
function langToArtifactType(lang: string): { type: ArtifactType; language?: string } {
  if (lang === 'html preview') return { type: 'html' }
  if (lang === 'mermaid') return { type: 'mermaid' }
  if (lang === 'markdown') return { type: 'markdown' }
  if (lang === 'table') return { type: 'table' }
  return { type: 'code', language: lang }
}

export function MessageList({
  messages,
  streaming,
  onArtifactCopy,
  onArtifactDownload,
  onToolConfirm,
  onToolCancel,
  emptyState,
  className,
  renderExtension,
  renderMarkdown,
  renderMermaid,
  highlightCode,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const hasContent = messages.length > 0 || (streaming && streaming.status !== 'idle')

  const allStagesDone = streaming
    ? streaming.stages.every(s => s.state === 'done' || s.state === 'error')
    : true

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
            markdown={m.role === 'assistant'}
            renderMarkdown={renderMarkdown}
          />
        ))}

        {streaming && streaming.status !== 'idle' && (
          <div className="meso-message-list__live">
            {/* Soul + Skill context row */}
            {(streaming.activeSoul || streaming.activeSkill) && (
              <div className="meso-message-list__context-row">
                {streaming.activeSoul && <SoulIndicator soul={streaming.activeSoul} />}
                {streaming.activeSkill && <SkillIndicator skill={streaming.activeSkill} />}
              </div>
            )}

            {/* Pipeline stages */}
            {streaming.stages.length > 0 && !allStagesDone && (
              <StageTimeline
                stages={streaming.stages.map((s): Stage => ({
                  id: s.name,
                  label: s.name,
                  status: s.state === 'done' || s.state === 'error' ? 'done' : 'active',
                }))}
              />
            )}

            {/* Recalled memory chips */}
            {streaming.memorySnippets.length > 0 && (
              <div className="meso-memory-chips">
                {streaming.memorySnippets.map((snippet, i) => (
                  <span key={i} className="meso-memory-chip" title={snippet.content}>
                    [{snippet.category}] {snippet.content}
                  </span>
                ))}
              </div>
            )}

            {/* Resource reads (MCP) */}
            {streaming.resourceReadOrder.length > 0 && (
              <div className="meso-message-list__resources">
                {streaming.resourceReadOrder.map(id => {
                  const rr = streaming.resourceReads[id]
                  if (!rr) return null
                  return <ResourceReadBlock key={id} resourceRead={rr} />
                })}
              </div>
            )}

            {/* Tool calls (local / MCP / API) */}
            {streaming.toolCallOrder.length > 0 && (
              <div className="meso-message-list__tools">
                {streaming.toolCallOrder.map(id => {
                  const tc = streaming.toolCalls[id]
                  if (!tc) return null
                  return (
                    <ToolCallBlock
                      key={id}
                      toolCall={tc}
                      onConfirm={onToolConfirm}
                      onCancel={onToolCancel}
                    />
                  )
                })}
              </div>
            )}

            {/* Extension events (domain-specific) */}
            {renderExtension && streaming.extensionLog.length > 0 && (
              <div className="meso-message-list__extensions">
                {streaming.extensionLog.map((ext, i) => (
                  <React.Fragment key={i}>{renderExtension(ext)}</React.Fragment>
                ))}
              </div>
            )}

            {streaming.thinkContent && (
              <ThinkBlock
                content={streaming.thinkContent}
                streaming={!streaming.thinkDone}
              />
            )}

            {(streaming.textContent || streaming.status === 'streaming') && (
              <ChatBubble
                role="assistant"
                content={streaming.textContent}
                streaming={
                  streaming.status === 'streaming' &&
                  streaming.artifactOrder.length === 0
                }
                markdown={true}
                renderMarkdown={renderMarkdown}
              />
            )}

            {streaming.artifactOrder.map(id => {
              const art = streaming.artifacts[id]
              if (!art) return null
              const { type, language } = langToArtifactType(art.lang)
              return (
                <ArtifactPanel
                  key={id}
                  type={type}
                  content={art.content}
                  language={language}
                  streaming={!art.done}
                  onCopy={onArtifactCopy}
                  onDownload={onArtifactDownload}
                  renderMermaid={renderMermaid}
                  highlightCode={highlightCode}
                  renderMarkdown={renderMarkdown}
                />
              )
            })}

            {/* Memory saved notifications */}
            {streaming.memorySaved.length > 0 && (
              <div className="meso-memory-saved">
                {streaming.memorySaved.map(m => (
                  <span key={m.id} className="meso-memory-saved__chip" title={m.preview}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z"/>
                    </svg>
                    已记忆 [{m.category}]
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
