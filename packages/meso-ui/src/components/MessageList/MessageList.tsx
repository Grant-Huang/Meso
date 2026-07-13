import React, { useEffect, useRef, useMemo } from 'react'
import { ChatBubble } from '../ChatBubble'
import { ArtifactPanel } from '../ArtifactPanel'
import { SoulIndicator } from '../SoulIndicator'
import { SkillIndicator } from '../SkillIndicator'
import { CollapsibleToolTrace } from '../CollapsibleToolTrace'
import { ThinkBlock } from '../ThinkBlock'
import { StreamingCursor } from '../StreamingCursor'
import { ResourceReadBlock } from '../ResourceReadBlock'
import { resolveVerbosity } from '../../utils/verbosity'
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace'
import type { StreamState, ExtensionEvent } from '../../runtime'
import type { ArtifactDef } from '@meso.ai/types'
import type { ArtifactType } from '../ArtifactPanel'
import { buildBlendItems } from './buildBlendItems'
import './MessageList.css'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  /** Persisted artifacts attached to a committed message (rendered with ArtifactPanel). */
  artifacts?: ArtifactDef[]
  /**
   * Frozen StreamState snapshot for a completed assistant turn.
   * When present, the message renders through the SAME blend path as the live
   * stream (with streaming=false), so tools + text stay interleaved in history
   * and nothing is rewritten on the streaming→done transition.
   */
  trace?: StreamState
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
  /** Verbosity / display options threaded into inline blend tool cards. */
  simplify?: SimplifyOptions
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
  simplify,
}: {
  stream: StreamState
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  simplify?: SimplifyOptions
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
            simplify={simplify}
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
            simplify={simplify}
            onToolConfirm={onToolConfirm}
            onToolCancel={onToolCancel}
          />
        </div>
      )}
    </>
  )
}

/**
 * InterleavedStreamingContent - Context-Blend 模式：混合渲染（live + committed 同一路径）
 *
 * 遵循 eventLog 的严格到达顺序，将工具和文本交错显示。
 * - 连续文本 delta 合并为一段（保持叙述连贯 + Markdown 渲染）
 * - 工具/制品卡片打断文本段，保留交错（blend）
 * - streaming=true：最后一个工具为 "current"，展开、可显示确认门
 * - streaming=false：committed 轮次，所有工具折叠、原地可展开，无回写
 */
function InterleavedStreamingContent({
  stream,
  streaming,
  onToolConfirm,
  onToolCancel,
  renderExtension,
  onArtifactCopy,
  onArtifactDownload,
  renderMermaid,
  highlightCode,
  renderMarkdown,
  hiddenArtifactLangs,
  simplify,
}: {
  stream: StreamState
  streaming: boolean
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  renderExtension?: (event: ExtensionEvent) => React.ReactNode
  onArtifactCopy?: (content: string) => void
  onArtifactDownload?: (content: string) => void
  renderMermaid?: (source: string) => Promise<string>
  highlightCode?: (code: string, lang: string) => string
  renderMarkdown?: (source: string) => string
  hiddenArtifactLangs?: string[]
  simplify?: SimplifyOptions
}) {
  const { currentId } = useMemo(
    () => splitToolCalls(stream),
    [stream.toolCallOrder, stream.toolCalls],
  )
  const items = useMemo(
    () => buildBlendItems(stream, hiddenArtifactLangs),
    [stream.eventLog, stream.textChunks, stream.artifacts, stream.toolCalls, stream.resourceReads, stream.extensionLog, hiddenArtifactLangs],
  )
  const lastTextKey = useMemo(() => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].kind === 'text') return items[i].key
    }
    return null
  }, [items])

  return (
    <div className="meso-message-list__interleaved">
      {/* Soul/Skill 始终在顶部 */}
      {(stream.activeSoul || stream.activeSkill) && (
        <div className="meso-message-list__context-row">
          {stream.activeSoul && <SoulIndicator soul={stream.activeSoul} />}
          {stream.activeSkill && <SkillIndicator skill={stream.activeSkill} />}
        </div>
      )}

      {/* 召回的记忆片段（轮次开头） */}
      {stream.memorySnippets.length > 0 && (
        <div className="meso-memory-chips">
          {stream.memorySnippets.map((snippet, i) => (
            <span key={i} className="meso-memory-chip" title={snippet.content}>
              [{snippet.category}] {snippet.content}
            </span>
          ))}
        </div>
      )}

      {/* 推理（think）：轮次开头的可折叠思考块 */}
      {stream.thinkContent && (
        <ThinkBlock
          content={stream.thinkContent}
          streaming={streaming && !stream.thinkDone}
          collapseWhen="streamEnd"
          defaultOpen={true}
          simplify={simplify}
        />
      )}

      {/* 主循环：遵循 eventLog 顺序渲染合并后的条目 */}
      {items.map((item) => {
        if (item.kind === 'text') {
          const useMd = typeof renderMarkdown === 'function'
          const isTail = streaming && item.key === lastTextKey && stream.artifactOrder.length === 0
          return (
            <div key={item.key} className="meso-event-text" data-streaming-role="content">
              {useMd ? (
                <div className="meso-bubble__md" dangerouslySetInnerHTML={{ __html: renderMarkdown!(item.text) }} />
              ) : (
                <>
                  {item.text}
                  {isTail && <StreamingCursor />}
                </>
              )}
            </div>
          )
        }

        if (item.kind === 'tool') {
          const tc = stream.toolCalls[item.id]
          if (!tc) return null
          // committed (streaming=false): 全部折叠、无 current；live: 最后一个为 current
          const isCurrent = streaming && item.id === currentId
          // frozen tool expansion derives from verbosity: detailed → all, else none
          const frozenExpanded = resolveVerbosity(simplify) === 'detailed' ? 'all' : 'none'
          return (
            <div
              key={item.key}
              className={`meso-event-tool meso-event-tool--${isCurrent ? 'current' : 'frozen'}`}
              data-streaming-role="content"
            >
              <CollapsibleToolTrace
                stream={{ ...stream, toolCallOrder: [item.id] }}
                streaming={isCurrent && stream.status === 'streaming'}
                defaultExpanded={isCurrent ? 'all' : frozenExpanded}
                simplify={simplify}
                onToolConfirm={isCurrent ? onToolConfirm : undefined}
                onToolCancel={isCurrent ? onToolCancel : undefined}
              />
            </div>
          )
        }

        if (item.kind === 'resource') {
          const rr = stream.resourceReads[item.id]
          if (!rr) return null
          return (
            <div key={item.key} className="meso-event-resource" data-streaming-role="content">
              <ResourceReadBlock resourceRead={rr} simplify={simplify} />
            </div>
          )
        }

        if (item.kind === 'extension') {
          if (!renderExtension) return null
          const ext = stream.extensionLog[item.index]
          if (!ext) return null
          return (
            <div key={item.key} className="meso-event-extension" data-streaming-role="content">
              {renderExtension(ext)}
            </div>
          )
        }

        // artifact
        const art = stream.artifacts[item.id]
        if (!art) return null
        const { type: artType, language } = langToArtifactType(art.lang)
        return (
          <div key={item.key} className="meso-event-artifact" data-streaming-role="content">
            <ArtifactPanel
              type={artType}
              content={art.content}
              language={language}
              streaming={streaming && !art.done}
              onCopy={onArtifactCopy}
              onDownload={onArtifactDownload}
              renderMermaid={renderMermaid}
              highlightCode={highlightCode}
              renderMarkdown={renderMarkdown}
            />
          </div>
        )
      })}

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
  simplify,
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

        {messages.map((m) => {
          // 已完成助手轮次带 trace：走与 live 相同的 blend 渲染路径（streaming=false）。
          // done 只是"同组件 streaming 从 true 变 false"，工具+文本保持交错，零回写。
          if (m.role === 'assistant' && m.trace && isBlendMode) {
            return (
              <div key={m.id} className="meso-message-list__committed">
                <InterleavedStreamingContent
                  stream={m.trace}
                  streaming={false}
                  renderExtension={renderExtension}
                  onArtifactCopy={onArtifactCopy}
                  onArtifactDownload={onArtifactDownload}
                  renderMermaid={renderMermaid}
                  highlightCode={highlightCode}
                  renderMarkdown={renderMarkdown}
                  hiddenArtifactLangs={hiddenArtifactLangs}
                  simplify={simplify}
                />
                {m.timestamp && <div className="meso-bubble__timestamp">{m.timestamp}</div>}
              </div>
            )
          }
          return (
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
          )
        })}

        {streaming && streaming.status !== 'idle' && (
          <div className="meso-message-list__live">
            {renderLiveTrace ? renderLiveTrace(streaming) : (
              <>
                {isBlendMode ? (
                  <InterleavedStreamingContent
                    stream={streaming}
                    streaming={streaming.status === 'streaming'}
                    onToolConfirm={onToolConfirm}
                    onToolCancel={onToolCancel}
                    renderExtension={renderExtension}
                    onArtifactCopy={onArtifactCopy}
                    onArtifactDownload={onArtifactDownload}
                    renderMermaid={renderMermaid}
                    highlightCode={highlightCode}
                    renderMarkdown={renderMarkdown}
                    hiddenArtifactLangs={hiddenArtifactLangs}
                    simplify={simplify}
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
                      simplify={simplify}
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
