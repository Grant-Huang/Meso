import { useState } from 'react'
import type { ReactNode } from 'react'
import { ToolCallBlock } from '../ToolCallBlock'
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace'
import type { StreamState, ToolCallState } from '../../runtime'
import './CollapsibleToolTrace.css'

export interface CollapsibleToolTraceProps {
  stream: StreamState
  streaming?: boolean
  defaultExpanded?: 'all' | 'current' | 'none'
  onlyShowCurrent?: boolean
  simplify?: SimplifyOptions
  onToolClick?: (toolCallId: string) => void
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  renderSummary?: (tc: ToolCallState, index: number) => ReactNode
}

export function CollapsibleToolTrace({
  stream,
  defaultExpanded = 'none',
  onlyShowCurrent = false,
  simplify,
  onToolClick,
  onToolConfirm,
  onToolCancel,
  renderSummary,
}: CollapsibleToolTraceProps) {
  const toolIds = stream.toolCallOrder
  const visibleToolIds = onlyShowCurrent && toolIds.length > 0
    ? [toolIds[toolIds.length - 1]]
    : toolIds

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (defaultExpanded === 'none') return new Set()
    if (defaultExpanded === 'all') return new Set(visibleToolIds)
    if (defaultExpanded === 'current' && visibleToolIds.length > 0) {
      return new Set([visibleToolIds[visibleToolIds.length - 1]])
    }
    return new Set()
  })

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedIds(newSet)
    onToolClick?.(id)
  }

  const renderToolSummary = (tc: ToolCallState, index: number): string => {
    const { call, result, status } = tc
    if (renderSummary) {
      return String(renderSummary(tc, index) ?? '')
    }

    const icon = status === 'error' ? '✗' : '✓'
    const name = call.name
    const summary = result?.metadata?.resultCount
      ? ` — ${result.metadata.resultCount} 项`
      : ''
    const duration = result?.duration_ms ? ` (${result.duration_ms}ms)` : ''

    return `${icon} ${name}${summary}${duration}`
  }

  if (visibleToolIds.length === 0) return null

  return (
    <div className="meso-collapsible-tool-trace">
      {visibleToolIds.map((id, index) => {
        const tc = stream.toolCalls[id]
        if (!tc) return null

        const isExpanded = expandedIds.has(id)
        const { status } = tc

        return (
          <div key={id} className={`meso-collapsible-tool__item meso-collapsible-tool__item--${status}`}>
            <button
              className="meso-collapsible-tool__summary"
              onClick={() => toggleExpanded(id)}
              aria-expanded={isExpanded}
            >
              <span className="meso-collapsible-tool__toggle">
                {isExpanded ? '▼' : '▶'}
              </span>
              <span className="meso-collapsible-tool__text">
                {renderToolSummary(tc, index)}
              </span>
            </button>

            {isExpanded && (
              <div className="meso-collapsible-tool__details">
                <ToolCallBlock
                  toolCall={tc}
                  onConfirm={onToolConfirm}
                  onCancel={onToolCancel}
                  simplify={simplify}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
