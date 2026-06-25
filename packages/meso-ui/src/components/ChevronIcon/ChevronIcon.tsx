import './ChevronIcon.css'

export interface ChevronIconProps {
  /** true → points down (expanded), false → points right (collapsed) */
  open: boolean
  size?: number
  className?: string
  'aria-label'?: string
}

export function ChevronIcon({
  open,
  size = 16,
  className,
  'aria-label': ariaLabel,
}: ChevronIconProps) {
  return (
    <svg
      className={`meso-chevron-icon${open ? ' meso-chevron-icon--open' : ''}${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel ?? (open ? '展开' : '折叠')}
    >
      {/* open → chevron-down; closed → chevron-right */}
      {open ? <polyline points="6,9 12,15 18,9" /> : <polyline points="9,6 15,12 9,18" />}
    </svg>
  )
}
