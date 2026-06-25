import { useState } from 'react'
import type { ReactNode } from 'react'
import { ToolCallBlock } from '../ToolCallBlock'
import { StatusIcon } from '../StatusIcon'
import { ChevronIcon } from '../ChevronIcon'
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace'
import { toolCallStatusToIcon } from '../../utils/statusMapping'
import type { StreamState, ToolCallState } from '../../runtime'
import './CollapsibleToolTrace.css'

export interface CollapsibleToolTraceProps {
  stream: StreamState
  streaming?: boolean

  /** Expansion strategy: 'none' = all collapsed, 'current' = last item expanded, 'all' = all expanded, 'last-n' = last N expanded */
  defaultExpanded?: 'all' | 'current' | 'none' | 'last-n'
  /** Number of items to expand when defaultExpanded='last-n' (default: 2) */
  expandCount?: number

  /** Show only the most recent tool call */
  onlyShowCurrent?: boolean

  /** Verbosity and display options */
  simplify?: SimplifyOptions

  /** Called when user clicks a tool summary to expand */
  onToolClick?: (toolCallId: string) => void
  /** Called when user approves tool confirmation */
  onToolConfirm?: (toolCallId: string) => void
  /** Called when user cancels tool confirmation */
  onToolCancel?: (toolCallId: string) => void

  /** Custom summary rendering for each tool */
  renderSummary?: (tc: ToolCallState, index: number) => ReactNode
}

export function CollapsibleToolTrace({
  stream,
  defaultExpanded = 'none',
  expandCount = 2,
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
    if (defaultExpanded === 'last-n' && visibleToolIds.length > 0) {
      const lastN = visibleToolIds.slice(-expandCount)
      return new Set(lastN)
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

  const renderToolText = (tc: ToolCallState, index: number): string => {
    const { call, result } = tc
    if (renderSummary) {
      return String(renderSummary(tc, index) ?? '')
    }

    const name = call.name
    const summary = result?.metadata?.resultCount
      ? ` — ${result.metadata.resultCount} 项`
      : ''
    const duration = result?.duration_ms ? ` (${result.duration_ms}ms)` : ''

    return `${name}${summary}${duration}`
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
                <ChevronIcon open={isExpanded} size={13} />
              </span>
              <span className="meso-collapsible-tool__status">
                <StatusIcon status={toolCallStatusToIcon(status)} size={13} />
              </span>
              <span className="meso-collapsible-tool__text">
                {renderToolText(tc, index)}
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
