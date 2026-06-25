/**
 * Demo icon set — Lucide-style inline SVG (viewBox 0 0 24 24, stroke=currentColor).
 * Centralised here so all demo pages share one consistent icon vocabulary.
 */

interface IconProps {
  size?: number
  className?: string
}

const base = (size = 16, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  xmlns: 'http://www.w3.org/2000/svg',
  className,
  'aria-hidden': true,
})

export function CheckIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <polyline points="20,6 9,17 4,12" />
    </svg>
  )
}

export function AlertTriangleIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function PlayIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <polygon points="6,4 20,12 6,20 6,4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PauseIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function RotateCcwIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <polyline points="2,4 2,10 8,10" />
      <path d="M2.51 15a9 9 0 1 0 2.13-9.36L2 10" />
    </svg>
  )
}

export function SquareIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13,6 19,12 13,18" />
    </svg>
  )
}

export function FactoryIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M2 20h20V9l-6 4V9l-6 4V4H6v16" />
      <path d="M2 20h20" />
    </svg>
  )
}

export function ClipboardIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M9 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3" />
    </svg>
  )
}

export function SatelliteDishIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 19a14 14 0 0 1 0-14" />
      <path d="M9 19a10 10 0 0 1 0-10" />
      <path d="M13 19a6 6 0 0 1 0-6" />
      <circle cx="13" cy="19" r="1" fill="currentColor" />
    </svg>
  )
}

export function PackageIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 2 2 7v10l10 5 10-5V7L12 2z" />
      <path d="M2 7l10 5 10-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

export function BuildingIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  )
}

export function PlugIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 2v6M15 2v6" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0V8z" />
      <path d="M12 17v5" />
    </svg>
  )
}

export function PaletteIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2v-1a2 2 0 0 1 2-2h1a3 3 0 0 0 3-3 10 10 0 0 0-10-10z" />
    </svg>
  )
}

export function BrainIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9.5 2a2.5 2.5 0 0 0-2.5 2.5v.5a2.5 2.5 0 0 0-2 4 2.5 2.5 0 0 0 1 4.5 2.5 2.5 0 0 0 3.5 2.5V4.5A2.5 2.5 0 0 0 9.5 2z" />
      <path d="M14.5 2a2.5 2.5 0 0 1 2.5 2.5v.5a2.5 2.5 0 0 1 2 4 2.5 2.5 0 0 1-1 4.5 2.5 2.5 0 0 1-3.5 2.5V4.5A2.5 2.5 0 0 1 14.5 2z" />
    </svg>
  )
}

export function TheaterIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 9a9 9 0 0 1 18 0v9a2 2 0 0 1-2 2h-3v-7h-3v7H7v-7H4v5a2 2 0 0 1-1-2V9z" />
    </svg>
  )
}

export function GearIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
