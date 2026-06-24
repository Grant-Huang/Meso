import { useState } from 'react'
import type { ToolCallState, ToolRisk, CapabilityProvider } from '../../runtime'
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace'
import { ConfirmGate } from '../ConfirmGate'
import { StatusIcon } from '../StatusIcon'
import { toolCallStatusToIcon } from '../../utils/statusMapping'
import './ToolCallBlock.css'

export interface ToolCallBlockProps {
  toolCall: ToolCallState
  /** Called when user approves a tool awaiting confirmation. */
  onConfirm?: (toolCallId: string) => void
  /** Called when user cancels a tool awaiting confirmation. */
  onCancel?: (toolCallId: string) => void
  className?: string
  'data-testid'?: string
  simplify?: SimplifyOptions
}

const RISK_LABEL: Record<NonNullable<ToolRisk>, string> = {
  safe: '只读',
  write: '写入',
  destructive: '危险',
}

const PROVIDER_LABEL: Partial<Record<CapabilityProvider, string>> = {
  mcp: 'MCP',
  api: 'API',
  local: '本地',
}

export function ToolCallBlock({ toolCall, onConfirm, onCancel, className, 'data-testid': testId, simplify }: ToolCallBlockProps) {
  const { call, result, status } = toolCall
  const risk = call.risk ?? 'safe'
  const hasArgs = Object.keys(call.args).length > 0

  // Determine verbosity level from new or legacy props
  const verbosity = simplify?.verbosity ?? (simplify?.compact ? 'compact' : 'standard')

  // Determine visibility based on verbosity
  const isCompact = verbosity === 'compact'
  const isStandard = verbosity === 'standard'
  const isDetailed = verbosity === 'detailed'

  // Show/hide elements per verbosity level
  const showDuration = simplify?.showDuration ?? true // Show in all modes
  const showProvider = simplify?.showProvider ?? (!isCompact) // Hide only in compact
  const showRiskLevel = simplify?.showRiskLevel ?? (isStandard || isDetailed) // Show in standard and detailed
  const showExecutionTimeline = simplify?.showExecutionTimeline ?? (isDetailed)

  // Default collapse states per verbosity
  // Compact: parameters/output/metadata only visible when expanded
  // Standard: parameters/output/metadata collapsed by default
  // Detailed: parameters/output/metadata expanded by default
  const defaultParamsCollapsed = simplify?.defaultParamsCollapsed ?? (isCompact || isStandard)
  const defaultOutputCollapsed = simplify?.defaultOutputCollapsed ?? (isCompact || isStandard)
  const defaultMetadataCollapsed = simplify?.defaultMetadataCollapsed ?? (isCompact || isStandard)

  const [argsOpen, setArgsOpen] = useState(!defaultParamsCollapsed)
  const [resultOpen, setResultOpen] = useState(!defaultOutputCollapsed)
  const [metadataOpen, setMetadataOpen] = useState(!defaultMetadataCollapsed)

  const summaryCount = result?.metadata?.resultCount
  const narration = result?.narration

  return (
    <div
      className={`meso-tool meso-tool--${status} meso-tool--risk-${risk} meso-tool--${verbosity}${className ? ` ${className}` : ''}`}
      data-testid={testId ?? 'meso-tool-call-block'}
    >
      <div className="meso-tool__header">
        <StatusIcon status={toolCallStatusToIcon(status)} size={14} className="meso-tool__status-icon" />
        <span className="meso-tool__name">{call.name}</span>

        {/* Summary metrics: result count and duration shown in all modes */}
        {summaryCount !== undefined && (
          <span className="meso-tool__summary">— {summaryCount} 项</span>
        )}
        {showDuration && result?.duration_ms !== undefined && (
          <span className="meso-tool__duration">({result.duration_ms}ms)</span>
        )}

        {/* Risk level badge */}
        {showRiskLevel && risk !== 'safe' && (
          <span className={`meso-tool__risk meso-tool__risk--${risk}`}>
            {RISK_LABEL[risk]}
          </span>
        )}

        {/* Provider and annotations */}
        {showProvider && call.provider && PROVIDER_LABEL[call.provider] && (
          <span className={`meso-tool__provider meso-tool__provider--${call.provider}`}>
            {PROVIDER_LABEL[call.provider]}
          </span>
        )}
        {call.annotations?.open_world && (
          <span className="meso-tool__annotation" title="此工具会访问外部网络">🌐</span>
        )}
      </div>

      {/* Narration: shown in all modes (when available) */}
      {narration && (
        <div className="meso-tool__narration">
          {narration}
        </div>
      )}

      {/* Parameters section: shown in all modes (Standard/Detailed have it in header, Compact via details) */}
      {hasArgs && (
        <details className="meso-tool__params-details" open={argsOpen}>
          <summary
            className="meso-tool__params-summary"
            onClick={e => {
              e.preventDefault()
              setArgsOpen(o => !o)
            }}
          >
            <span className="meso-tool__params-toggle">
              {argsOpen ? '▾' : '▸'} Input Parameters
            </span>
          </summary>
          {argsOpen && (
            <pre className="meso-tool__args">
              {JSON.stringify(call.args, null, isDetailed ? 2 : 1)}
            </pre>
          )}
        </details>
      )}

      {/* Confirmation gate */}
      {status === 'awaiting_confirm' && onConfirm && onCancel && (
        <ConfirmGate
          toolCall={call}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}

      {/* Output/Result section: shown in all modes when available */}
      {(status === 'done' || status === 'error') && result && (
        <details className="meso-tool__result-details" open={resultOpen}>
          <summary
            className="meso-tool__result-summary"
            onClick={e => {
              e.preventDefault()
              setResultOpen(o => !o)
            }}
          >
            <span className="meso-tool__result-toggle">
              {resultOpen ? '▾' : '▸'} {status === 'error' ? 'Error' : 'Output'}
            </span>
          </summary>
          {resultOpen && (
            <pre className={`meso-tool__output${status === 'error' ? ' meso-tool__output--error' : ''}`}>
              {status === 'error' ? result.error : (
                isDetailed ? result.output : result.output.slice(0, 200) + (result.output.length > 200 ? '...' : '')
              )}
            </pre>
          )}
        </details>
      )}

      {/* Metadata section: shown in all modes when available */}
      {result?.metadata && (
        <details className="meso-tool__metadata-details" open={metadataOpen}>
          <summary
            className="meso-tool__metadata-summary"
            onClick={e => {
              e.preventDefault()
              setMetadataOpen(o => !o)
            }}
          >
            <span className="meso-tool__metadata-toggle">
              {metadataOpen ? '▾' : '▸'} Metadata
            </span>
          </summary>
          {metadataOpen && (
            <div className="meso-tool__metadata">
              {result.metadata.resultCount !== undefined && (
                <div className="meso-tool__metadata-row">
                  <span className="meso-tool__metadata-key">resultCount:</span>
                  <span className="meso-tool__metadata-value">{result.metadata.resultCount}</span>
                </div>
              )}
              {result.metadata.category !== undefined && (
                <div className="meso-tool__metadata-row">
                  <span className="meso-tool__metadata-key">category:</span>
                  <span className="meso-tool__metadata-value">{result.metadata.category}</span>
                </div>
              )}
              {isDetailed && result.metadata.custom && (
                <div className="meso-tool__metadata-row">
                  <span className="meso-tool__metadata-key">custom:</span>
                  <pre className="meso-tool__metadata-custom">
                    {JSON.stringify(result.metadata.custom, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </details>
      )}

      {/* Execution timeline: detailed mode only */}
      {isDetailed && showExecutionTimeline && result?.duration_ms && (
        <details className="meso-tool__timeline-details" open={false}>
          <summary className="meso-tool__timeline-summary">Execution Timeline</summary>
          <div className="meso-tool__timeline">
            <div className="meso-tool__timeline-row">
              <span className="meso-tool__timeline-label">Duration:</span>
              <span className="meso-tool__timeline-value">{result.duration_ms}ms</span>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
