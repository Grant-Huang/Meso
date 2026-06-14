import { useState } from 'react'
import type { ResourceReadState } from '../../runtime'
import { StatusIcon } from '../StatusIcon'
import { resourceReadStatusToIcon } from '../../utils/statusMapping'
import './ResourceReadBlock.css'

export interface ResourceReadBlockProps {
  resourceRead: ResourceReadState
  className?: string
}

export function ResourceReadBlock({ resourceRead, className }: ResourceReadBlockProps) {
  const [contentOpen, setContentOpen] = useState(false)
  const { read, content, status } = resourceRead

  const label = read.name ?? read.uri
  const server = read.server

  return (
    <div className={`meso-resource meso-resource--${status}${className ? ` ${className}` : ''}`}>
      <div className="meso-resource__header">
        <StatusIcon status={resourceReadStatusToIcon(status)} size={13} className="meso-resource__status-icon" />

        <span className="meso-resource__uri" title={read.uri}>{label}</span>

        {server && <span className="meso-resource__server">{server}</span>}

        {content?.duration_ms !== undefined && (
          <span className="meso-resource__duration">{content.duration_ms}ms</span>
        )}

        {(status === 'done' || status === 'error') && content && (
          <button
            className="meso-resource__toggle"
            onClick={() => setContentOpen(o => !o)}
            aria-expanded={contentOpen}
            aria-label={contentOpen ? '折叠内容' : '展开内容'}
          >
            {contentOpen ? '▾' : '▸'} {status === 'error' ? '错误' : '内容'}
          </button>
        )}
      </div>

      {contentOpen && content && (
        <div className="meso-resource__content">
          {status === 'error' ? (
            <pre className="meso-resource__text meso-resource__text--error">{content.error}</pre>
          ) : (
            content.contents.map((item, i) => (
              <div key={i}>
                {item.type === 'text' && (
                  <pre className="meso-resource__text">{item.text}</pre>
                )}
                {item.type === 'image' && item.data && (
                  <img
                    className="meso-resource__image"
                    src={`data:${item.mime_type ?? 'image/png'};base64,${item.data}`}
                    alt="resource"
                  />
                )}
                {item.type === 'blob' && (
                  <span className="meso-resource__blob-label">
                    [{item.mime_type ?? 'binary'}]
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
