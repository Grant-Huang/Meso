import './StatusIcon.css'

export type StatusIconStatus = 'running' | 'done' | 'error' | 'pending' | 'warning'

export interface StatusIconProps {
  status: StatusIconStatus
  size?: number
  className?: string
  'aria-label'?: string
}

const LABELS: Record<StatusIconStatus, string> = {
  running: '进行中',
  done:    '完成',
  error:   '失败',
  pending: '等待',
  warning: '警告',
}

export function StatusIcon({
  status,
  size = 16,
  className,
  'aria-label': ariaLabel,
}: StatusIconProps) {
  const label = ariaLabel ?? LABELS[status]

  return (
    <span
      className={`meso-status-icon meso-status-icon--${status}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      {status === 'running' && (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" className="meso-status-icon__spin" />
          <circle cx="8" cy="8" r="2.5" fill="currentColor" className="meso-status-icon__pulse" />
        </svg>
      )}
      {status === 'done' && (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <polyline points="4.5,8 7,10.5 11.5,5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'error' && (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      {status === 'pending' && (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
      {status === 'warning' && (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <line x1="8" y1="5" x2="8" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11.5" r="0.75" fill="white" />
        </svg>
      )}
    </span>
  )
}
