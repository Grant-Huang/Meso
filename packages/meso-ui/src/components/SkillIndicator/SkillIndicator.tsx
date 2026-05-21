import type { SkillPayload, CapabilityProvider } from '../../runtime'
import './SkillIndicator.css'

export interface SkillIndicatorProps {
  skill: SkillPayload
}

const PROVIDER_LABEL: Partial<Record<CapabilityProvider, string>> = {
  mcp: 'MCP',
  api: 'API',
}

export function SkillIndicator({ skill }: SkillIndicatorProps) {
  const providerLabel = skill.provider ? PROVIDER_LABEL[skill.provider] : null

  return (
    <div
      className="meso-skill"
      title={skill.description ?? skill.name}
      role="status"
      aria-label={`当前技能: ${skill.name}`}
    >
      <svg className="meso-skill__icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 1L7.5 4.5H11L8 6.5L9 10L6 8L3 10L4 6.5L1 4.5H4.5L6 1Z"
              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>

      <span className="meso-skill__name">{skill.name}</span>

      {skill.focus && skill.focus.length > 0 && (
        <span className="meso-skill__focus">· {skill.focus.join(', ')}</span>
      )}

      {providerLabel && (
        <span className="meso-skill__provider">{providerLabel}</span>
      )}
    </div>
  )
}
