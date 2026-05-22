import React, { useRef } from 'react'

interface ComposerProps {
  onSend: (text: string) => void
  disabled: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export function Composer({ onSend, disabled, placeholder = '输入消息… (Enter 发送，Shift+Enter 换行)', value, onChange }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!value.trim() || disabled) return
    onSend(value)
    onChange('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div style={{
      padding: '10px 16px 12px',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-bg)',
    }}>
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          background: 'var(--color-bg-white)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'border-color 0.15s',
        }}
        onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'}
        onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder={placeholder}
          rows={1}
          style={{
            width: '100%',
            resize: 'none',
            border: 'none',
            outline: 'none',
            padding: '10px 14px',
            background: 'transparent',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            fontSize: 14,
            lineHeight: 1.6,
            maxHeight: 200,
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '6px 10px',
          gap: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 'auto' }}>
            {value.length > 0 && `${value.length} 字`}
          </span>
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            style={{
              background: disabled || !value.trim() ? 'var(--color-border)' : 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '5px 14px',
              fontSize: 13,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.12s',
            }}
          >
            {disabled ? '生成中…' : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
