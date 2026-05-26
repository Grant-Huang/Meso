import React, { useRef, useEffect } from 'react'
import './ChatComposer.css'

export interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop?: () => void
  streaming?: boolean
  disabled?: boolean
  placeholder?: string
  /** Left side slot — attach buttons, upload, etc. */
  leadingSlot?: React.ReactNode
  /** Right side actions. If omitted, default send/stop button is rendered. */
  trailingActions?: React.ReactNode
  /** Max textarea rows before scrolling. Default 8. */
  maxRows?: number
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  streaming = false,
  disabled = false,
  placeholder = '输入消息… (Ctrl+Enter 发送，Enter 换行)',
  leadingSlot,
  trailingActions,
  maxRows = 8,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineHeight = 22 // px — matches CSS

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, lineHeight * maxRows) + 'px'
  }

  useEffect(resize, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (!disabled && !streaming && value.trim()) onSubmit()
    }
  }

  const canSend = !disabled && !streaming && value.trim().length > 0

  const defaultTrailing = (
    <button
      className={`meso-composer__send${streaming ? ' meso-composer__send--stop' : ''}`}
      onClick={streaming ? onStop : onSubmit}
      disabled={streaming ? false : !canSend}
      aria-label={streaming ? '停止生成' : '发送'}
      title={streaming ? '停止生成' : 'Ctrl+Enter'}
    >
      {streaming ? (
        /* Stop square */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
        </svg>
      ) : (
        /* Send arrow */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5,12 12,5 19,12"/>
        </svg>
      )}
    </button>
  )

  return (
    <div className="meso-composer">
      <div className="meso-composer__box">
        <textarea
          ref={textareaRef}
          className="meso-composer__textarea"
          value={value}
          onChange={e => { onChange(e.target.value); resize() }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled && !streaming}
          aria-label="消息输入框"
        />
        <div className="meso-composer__toolbar">
          <div className="meso-composer__leading">{leadingSlot}</div>
          <span className="meso-composer__hint">
            {value.length > 0 && `${value.length} 字`}
          </span>
          <div className="meso-composer__trailing">
            {trailingActions ?? defaultTrailing}
          </div>
        </div>
      </div>
    </div>
  )
}
