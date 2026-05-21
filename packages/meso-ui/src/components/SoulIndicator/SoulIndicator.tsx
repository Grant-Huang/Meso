import type { SoulPayload } from '../../runtime'
import './SoulIndicator.css'

export interface SoulIndicatorProps {
  soul: SoulPayload
  /** Compact mode: only show avatar, no name or traits. */
  compact?: boolean
}

export function SoulIndicator({ soul, compact = false }: SoulIndicatorProps) {
  const initial = soul.name.charAt(0)

  return (
    <div
      className={`meso-soul${compact ? ' meso-soul--compact' : ''}`}
      title={`${soul.name} v${soul.version}`}
      role="status"
      aria-label={`当前 Soul: ${soul.name}`}
    >
      <div className="meso-soul__avatar">
        {soul.avatar
          ? <img src={soul.avatar} alt={soul.name} className="meso-soul__img" />
          : <span className="meso-soul__initial">{initial}</span>
        }
      </div>

      {!compact && (
        <>
          <span className="meso-soul__name">{soul.name}</span>
          {soul.traits && soul.traits.length > 0 && (
            <div className="meso-soul__traits">
              {soul.traits.map(t => (
                <span key={t} className="meso-soul__trait">{t}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
