import React, { useEffect, useRef, useMemo } from 'react'
import { ChatBubble } from '../ChatBubble'
import { ArtifactPanel } from '../ArtifactPanel'
import { SoulIndicator } from '../SoulIndicator'
import { SkillIndicator } from '../SkillIndicator'
import { CollapsibleToolTrace } from '../CollapsibleToolTrace'
import type { StreamState, ExtensionEvent } from '../../runtime'
import type { ArtifactDef } from '@meso.ai/types'
import type { ArtifactType } from '../ArtifactPanel'
import './MessageList.css'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  /** Persisted artifacts attached to a committed message (rendered with ArtifactPanel). */
  artifacts?: ArtifactDef[]
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
  if (lang === 'html' || lang === 'html preview') return { type: 'html' }
  if (lang === 'mermaid') return { type: 'mermaid' }
  if (lang === 'markdown') return { type: 'markdown' }
  if (lang === 'table') return { type: 'table' }
  return { type: 'code', language: lang }
}

/**
 * 计算已冻结和当前的工具调用
 * 已冻结：有result且不是最后一个（已完成，不会再改变）
 * 当前：最后一个工具（可能还在执行或等待确认）
 */
function splitToolCalls(stream: StreamState) {
  const toolIds = stream.toolCallOrder
  const currentIndex = toolIds.length - 1

  const frozenIds = toolIds.slice(0, currentIndex).filter(id => {
    const tc = stream.toolCalls[id]
    return tc.result !== undefined
  })

  const currentId = toolIds[currentIndex]

  return { frozenIds, currentId }
}

/**
 * LinearStreamingTools - 方案A：线性追加式工具显示
 *
 * 分离已完成（冻结）和当前进行中的工具：
 * - 已冻结的工具：不传 onConfirm/onCancel，永不改变位置
 * - 当前工具：可能显示确认门，可能改变状态
 */
function LinearStreamingTools({
  stream,
  onToolConfirm,
  onToolCancel,
}: {
  stream: StreamState
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
}) {
  const { frozenIds, currentId } = useMemo(
    () => splitToolCalls(stream),
    [stream.toolCallOrder, stream.toolCalls],
  )

  if (stream.toolCallOrder.length === 0) return null

  return (
    <>
      {/* Part A: 已冻结的工具调用（从不改变位置） */}
      {frozenIds.length > 0 && (
        <div className="meso-message-list__frozen-tools">
          <CollapsibleToolTrace
            stream={{
              ...stream,
              toolCallOrder: frozenIds,
            }}
            streaming={false}
            defaultExpanded="all"
            simplify={undefined}
            // 已完成的工具不需要交互回调
          />
        </div>
      )}

      {/* Part B: 当前进行中的工具（可能显示确认门） */}
      {currentId && (
        <div className="meso-message-list__current-tool">
          <CollapsibleToolTrace
            stream={{
              ...stream,
              toolCallOrder: [currentId],
            }}
            streaming={stream.status === 'streaming'}
            defaultExpanded="all"
            simplify={undefined}
            onToolConfirm={onToolConfirm}
            onToolCancel={onToolCancel}
          />
        </div>
      )}
    </>
  )
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
          <React.Fragment key={m.id}>
            <ChatBubble
              role={m.role}
              content={m.content}
              timestamp={m.timestamp}
              markdown={m.role === 'assistant'}
              renderMarkdown={renderMarkdown}
            />
            {m.artifacts && m.artifacts.length > 0 && m.artifacts.map(art => {
              const { type, language } = langToArtifactType(art.lang)
              return (
                <ArtifactPanel
                  key={art.id}
                  type={type}
                  content={art.content}
                  language={language}
                  onCopy={onArtifactCopy}
                  onDownload={onArtifactDownload}
                  renderMermaid={renderMermaid}
                  highlightCode={highlightCode}
                  renderMarkdown={renderMarkdown}
                />
              )
            })}
          </React.Fragment>
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

                {/* 分离已冻结和当前的工具调用（方案A：线性追加） */}
                <LinearStreamingTools
                  stream={streaming}
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
