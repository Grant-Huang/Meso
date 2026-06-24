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
  const [argsOpen, setArgsOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(simplify?.hideResultDetails ? false : false)

  const { call, result, status } = toolCall
  const risk = call.risk ?? 'safe'
  const hasArgs = Object.keys(call.args).length > 0
  const { hideMetadata, hideResultDetails } = simplify || {}

  return (
    <div
      className={`meso-tool meso-tool--${status} meso-tool--risk-${risk}${className ? ` ${className}` : ''}`}
      data-testid={testId ?? 'meso-tool-call-block'}
    >
      <div className="meso-tool__header">
        <StatusIcon status={toolCallStatusToIcon(status)} size={14} className="meso-tool__status-icon" />
        <span className="meso-tool__name">{call.name}</span>
        {call.provider && PROVIDER_LABEL[call.provider] && (
          <span className={`meso-tool__provider meso-tool__provider--${call.provider}`}>
            {PROVIDER_LABEL[call.provider]}
          </span>
        )}
        {call.annotations?.open_world && (
          <span className="meso-tool__annotation" title="此工具会访问外部网络">🌐</span>
        )}
        {risk !== 'safe' && (
          <span className={`meso-tool__risk meso-tool__risk--${risk}`}>
            {RISK_LABEL[risk]}
          </span>
        )}
        {!hideMetadata && result?.duration_ms !== undefined && (
          <span className="meso-tool__duration">{result.duration_ms}ms</span>
        )}
        {!hideMetadata && hasArgs && (
          <button
            className="meso-tool__toggle"
            onClick={() => setArgsOpen(o => !o)}
            aria-expanded={argsOpen}
            aria-label={argsOpen ? '折叠参数' : '展开参数'}
          >
            {argsOpen ? '▾' : '▸'} 参数
          </button>
        )}
        {hideMetadata && hasArgs && result?.metadata?.resultCount !== undefined && (
          <span className="meso-tool__summary">— {result.metadata.resultCount} 项</span>
        )}
      </div>

      {!hideMetadata && argsOpen && hasArgs && (
        <pre className="meso-tool__args">
          {JSON.stringify(call.args, null, 2)}
        </pre>
      )}

      {status === 'awaiting_confirm' && onConfirm && onCancel && (
        <ConfirmGate
          toolCall={call}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}

      {(status === 'done' || status === 'error') && result && !hideResultDetails && (
        <div className="meso-tool__result">
          <button
            className="meso-tool__toggle"
            onClick={() => setResultOpen(o => !o)}
            aria-expanded={resultOpen}
            aria-label={resultOpen ? '折叠结果' : '展开结果'}
          >
            {resultOpen ? '▾' : '▸'} {status === 'error' ? '错误' : '结果'}
          </button>
          {resultOpen && (
            <pre className={`meso-tool__output${status === 'error' ? ' meso-tool__output--error' : ''}`}>
              {status === 'error' ? result.error : result.output}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
