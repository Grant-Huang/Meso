import { useState } from 'react'

export interface Session {
  id: string
  title: string
  lastTime: string
}

interface SessionListProps {
  sessions: Session[]
  activeId: string | undefined
  onSelect: (id: string) => void
  onNew: () => void
}

export function SessionList({ sessions, activeId, onSelect, onNew }: SessionListProps) {
  const [search, setSearch] = useState('')

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 10px 6px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索会话…"
          style={{
            width: '100%',
            padding: '6px 10px',
            background: 'var(--color-bg-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--color-text)',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ padding: '4px 10px 8px' }}>
        <button
          onClick={onNew}
          style={{
            width: '100%',
            padding: '7px 12px',
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          + 新对话
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
        {filtered.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: s.id === activeId ? 'var(--nav-active-bg)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              textAlign: 'left',
              color: s.id === activeId ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
              fontSize: 13,
              fontFamily: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => {
              if (s.id !== activeId)
                (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'
            }}
            onMouseLeave={e => {
              if (s.id !== activeId)
                (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <span style={{
              fontWeight: s.id === activeId ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {s.title || '新对话'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {s.lastTime}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
            无匹配会话
          </p>
        )}
      </div>
    </div>
  )
}
