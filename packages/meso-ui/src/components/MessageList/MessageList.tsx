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
  /** Rendering mode: 'block' for legacy behavior (tools then text),
   * undefined or default for blend mode (tools and text interleaved) */
  renderingMode?: 'block'
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

/**
 * InterleavedStreamingContent - Context-Blend 模式：混合流式渲染
 *
 * 遵循 eventLog 的严格到达顺序，将工具和文本交错显示。
 * - 已冻结的工具：内联显示，折叠状态（可点击展开）
 * - 当前工具：展开显示（可能显示确认门）
 * - 文本和制品：按到达顺序渲染
 */
function InterleavedStreamingContent({
  stream,
  onToolConfirm,
  onToolCancel,
  renderExtension,
  onArtifactCopy,
  onArtifactDownload,
  renderMermaid,
  highlightCode,
  renderMarkdown,
  hiddenArtifactLangs,
}: {
  stream: StreamState
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  renderExtension?: (event: ExtensionEvent) => React.ReactNode
  onArtifactCopy?: (content: string) => void
  onArtifactDownload?: (content: string) => void
  renderMermaid?: (source: string) => Promise<string>
  highlightCode?: (code: string, lang: string) => string
  renderMarkdown?: (source: string) => string
  hiddenArtifactLangs?: string[]
}) {
  const { frozenIds, currentId } = useMemo(
    () => splitToolCalls(stream),
    [stream.toolCallOrder, stream.toolCalls],
  )
  const frozenSet = new Set(frozenIds)

  return (
    <div className="meso-message-list__interleaved">
      {/* Soul/Skill 始终在顶部 */}
      {(stream.activeSoul || stream.activeSkill) && (
        <div className="meso-message-list__context-row">
          {stream.activeSoul && <SoulIndicator soul={stream.activeSoul} />}
          {stream.activeSkill && <SkillIndicator skill={stream.activeSkill} />}
        </div>
      )}

      {/* 主循环：遵循 eventLog 顺序渲染 */}
      {stream.eventLog.map((logEntry) => {
        const { type, id } = logEntry

        switch (type) {
          case 'text': {
            const chunk = stream.textChunks.find(tc => tc.id === id)
            if (!chunk) return null
            return (
              <div key={`text-${id}`} className="meso-event-text">
                {chunk.delta}
              </div>
            )
          }

          case 'tool_call': {
            const tc = stream.toolCalls[id]
            if (!tc) return null
            const isFrozen = frozenSet.has(id)
            const isCurrent = id === currentId

            return (
              <div
                key={`tool-${id}`}
                className={`meso-event-tool meso-event-tool--${isFrozen ? 'frozen' : 'current'}`}
              >
                <CollapsibleToolTrace
                  stream={{
                    ...stream,
                    toolCallOrder: [id],
                  }}
                  streaming={isCurrent && stream.status === 'streaming'}
                  defaultExpanded={isCurrent ? 'all' : 'none'}
                  simplify={undefined}
                  onToolConfirm={isCurrent ? onToolConfirm : undefined}
                  onToolCancel={isCurrent ? onToolCancel : undefined}
                />
              </div>
            )
          }

          case 'artifact': {
            const art = stream.artifacts[id]
            if (!art) return null
            if (hiddenArtifactLangs?.includes(art.lang)) return null

            const { type: artType, language } = langToArtifactType(art.lang)
            return (
              <div key={`artifact-${id}`} className="meso-event-artifact">
                <ArtifactPanel
                  type={artType}
                  content={art.content}
                  language={language}
                  streaming={!art.done}
                  onCopy={onArtifactCopy}
                  onDownload={onArtifactDownload}
                  renderMermaid={renderMermaid}
                  highlightCode={highlightCode}
                  renderMarkdown={renderMarkdown}
                />
              </div>
            )
          }

          default:
            return null
        }
      })}

      {/* Extensions in order */}
      {renderExtension && stream.extensionLog.length > 0 && (
        <div className="meso-message-list__extensions">
          {stream.extensionLog.map((ext, i) => (
            <React.Fragment key={i}>{renderExtension(ext)}</React.Fragment>
          ))}
        </div>
      )}

      {/* 记忆通知在最后 */}
      {stream.memorySaved.length > 0 && (
        <div className="meso-memory-saved">
          {stream.memorySaved.map(m => (
            <span key={m.id} className="meso-memory-saved__chip" title={m.preview}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" />
              </svg>
              已记忆 [{m.category}]
            </span>
          ))}
        </div>
      )}
    </div>
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
  renderingMode,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isBlendMode = renderingMode !== 'block'
  const effectiveMode = renderingMode || 'blend'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  // 流结束时冻结已渲染的节点
  useEffect(() => {
    if (!streaming || streaming.status !== 'done') return

    const container = document.querySelector('.meso-message-list__live')
    if (!container) return

    const nodes = container.querySelectorAll('[data-streaming-role="content"]')
    nodes.forEach(node => {
      ;(node as HTMLElement).contentEditable = 'false'
      ;(node as HTMLElement).dataset.frozen = 'true'
    })
  }, [streaming?.status])

  const hasContent = messages.length > 0 || (streaming && streaming.status !== 'idle')

  return (
    <div className={`meso-message-list meso-message-list--mode-${effectiveMode}${className ? ` ${className}` : ''}`}>
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
                {isBlendMode ? (
                  <InterleavedStreamingContent
                    stream={streaming}
                    onToolConfirm={onToolConfirm}
                    onToolCancel={onToolCancel}
                    renderExtension={renderExtension}
                    onArtifactCopy={onArtifactCopy}
                    onArtifactDownload={onArtifactDownload}
                    renderMermaid={renderMermaid}
                    highlightCode={highlightCode}
                    renderMarkdown={renderMarkdown}
                    hiddenArtifactLangs={hiddenArtifactLangs}
                  />
                ) : (
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
              </>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
