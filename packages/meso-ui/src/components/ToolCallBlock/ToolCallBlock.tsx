import { useState } from 'react'
import type { ToolCallState, ToolRisk, CapabilityProvider } from '../../runtime'
import { ConfirmGate } from '../ConfirmGate'
import './ToolCallBlock.css'

export interface ToolCallBlockProps {
  toolCall: ToolCallState
  /** Called when user approves a tool awaiting confirmation. */
  onConfirm?: (toolCallId: string) => void
  /** Called when user cancels a tool awaiting confirmation. */
  onCancel?: (toolCallId: string) => void
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

export function ToolCallBlock({ toolCall, onConfirm, onCancel }: ToolCallBlockProps) {
  const [argsOpen, setArgsOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)

  const { call, result, status } = toolCall
  const risk = call.risk ?? 'safe'
  const hasArgs = Object.keys(call.args).length > 0

  return (
    <div className={`meso-tool meso-tool--${status} meso-tool--risk-${risk}`}>
      <div className="meso-tool__header">
        <StatusIcon status={status} />
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
        {result?.duration_ms !== undefined && (
          <span className="meso-tool__duration">{result.duration_ms}ms</span>
        )}
        {hasArgs && (
          <button
            className="meso-tool__toggle"
            onClick={() => setArgsOpen(o => !o)}
            aria-expanded={argsOpen}
            aria-label={argsOpen ? '折叠参数' : '展开参数'}
          >
            {argsOpen ? '▾' : '▸'} 参数
          </button>
        )}
      </div>

      {argsOpen && hasArgs && (
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

      {(status === 'done' || status === 'error') && result && (
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

function StatusIcon({ status }: { status: ToolCallState['status'] }) {
  switch (status) {
    case 'pending':
    case 'running':
      return <span className="meso-tool__spinner" aria-label="执行中" />
    case 'awaiting_confirm':
      return (
        <svg className="meso-tool__icon meso-tool__icon--warn" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="等待确认">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 4v4M7 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    case 'done':
      return (
        <svg className="meso-tool__icon meso-tool__icon--done" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="完成">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <polyline points="4,7 6,9.5 10,4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'error':
      return (
        <svg className="meso-tool__icon meso-tool__icon--error" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="失败">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
  }
}
