import type { ToolCallPayload, ToolRisk } from '../../runtime'
import './ConfirmGate.css'

export interface ConfirmGateProps {
  toolCall: ToolCallPayload
  onConfirm: (toolCallId: string) => void
  onCancel: (toolCallId: string) => void
}

const RISK_COPY: Record<NonNullable<ToolRisk>, { label: string; confirmText: string }> = {
  safe:        { label: '只读操作',   confirmText: '确认' },
  write:       { label: '写入操作',   confirmText: '确认执行' },
  destructive: { label: '危险操作',   confirmText: '确认执行（不可撤销）' },
}

export function ConfirmGate({ toolCall, onConfirm, onCancel }: ConfirmGateProps) {
  const risk = toolCall.risk ?? 'safe'
  const copy = RISK_COPY[risk]
  const hasArgs = Object.keys(toolCall.args).length > 0

  return (
    <div className={`meso-confirm-gate meso-confirm-gate--${risk}`} role="alertdialog" aria-label="工具执行确认">
      <div className="meso-confirm-gate__icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 6v5M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="meso-confirm-gate__body">
        <div className="meso-confirm-gate__title">
          <span className={`meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${risk}`}>{copy.label}</span>
          <code className="meso-confirm-gate__tool-name">{toolCall.name}</code>
        </div>

        {hasArgs && (
          <pre className="meso-confirm-gate__args">
            {JSON.stringify(toolCall.args, null, 2)}
          </pre>
        )}

        <div className="meso-confirm-gate__actions">
          <button
            className="meso-confirm-gate__btn meso-confirm-gate__btn--cancel"
            onClick={() => onCancel(toolCall.id)}
          >
            取消
          </button>
          <button
            className={`meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${risk}`}
            onClick={() => onConfirm(toolCall.id)}
          >
            {copy.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
