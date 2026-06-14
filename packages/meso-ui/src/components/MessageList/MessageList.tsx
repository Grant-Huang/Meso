import React, { useEffect, useRef } from 'react'
import { ChatBubble } from '../ChatBubble'
import { ArtifactPanel } from '../ArtifactPanel'
import { SoulIndicator } from '../SoulIndicator'
import { SkillIndicator } from '../SkillIndicator'
import { ProcessTrace } from '../ProcessTrace'
import type { StreamState, ExtensionEvent } from '../../runtime'
import type { ArtifactType } from '../ArtifactPanel'
import './MessageList.css'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface MessageListProps {
  messages: Message[]
  streaming?: StreamState
  onArtifactCopy?: (content: string) => void
  onArtifactDownload?: (content: string) => void
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  emptyState?: React.ReactNode
  emptyStateAlign?: 'center' | 'top'
  className?: string
  renderExtension?: (event: ExtensionEvent) => React.ReactNode
  renderLiveTrace?: (stream: StreamState) => React.ReactNode
  renderMarkdown?: (source: string) => string
  hiddenArtifactLangs?: string[]
  renderMermaid?: (source: string) => Promise<string>
  highlightCode?: (code: string, lang: string) => string
}

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
  emptyStateAlign = 'center',
  className,
  renderExtension,
  renderLiveTrace,
  renderMarkdown,
  renderMermaid,
  highlightCode,
  hiddenArtifactLangs,
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
          <div className={`meso-message-list__empty${emptyStateAlign === 'top' ? ' meso-message-list__empty--top' : ''}`}>
            {emptyState}
          </div>
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
            {renderLiveTrace ? renderLiveTrace(streaming) : (
              <>
                {(streaming.activeSoul || streaming.activeSkill) && (
                  <div className="meso-message-list__context-row">
                    {streaming.activeSoul && <SoulIndicator soul={streaming.activeSoul} />}
                    {streaming.activeSkill && <SkillIndicator skill={streaming.activeSkill} />}
                  </div>
                )}
                <ProcessTrace
                  stream={streaming}
                  streaming={streaming.status === 'streaming'}
                  turnStreaming={streaming.status === 'streaming'}
                  onToolConfirm={onToolConfirm}
                  onToolCancel={onToolCancel}
                />
                {renderExtension && streaming.extensionLog.length > 0 && (
                  <div className="meso-message-list__extensions">
                    {streaming.extensionLog.map((ext, i) => (
                      <React.Fragment key={i}>{renderExtension(ext)}</React.Fragment>
                    ))}
                  </div>
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
                  if (hiddenArtifactLangs?.includes(art.lang)) return null
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
              </>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
