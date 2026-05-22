import { useTheme } from '@meso/ui'

export function SidebarFooter() {
  const { theme, toggle } = useTheme()

  return (
    <div style={{
      padding: '10px 8px',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'var(--color-accent)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}>
        D
      </div>

      <span style={{
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        Demo User
      </span>

      <button
        onClick={toggle}
        title={theme === 'dark' ? '切换亮色' : '切换暗色'}
        style={{
          width: 28,
          height: 28,
          border: 'none',
          borderRadius: 6,
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}
      >
        {theme === 'dark' ? '☀' : '◑'}
      </button>
    </div>
  )
}
