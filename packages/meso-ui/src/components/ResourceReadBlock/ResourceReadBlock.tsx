import { useState } from 'react'
import type { ResourceReadState } from '../../runtime'
import './ResourceReadBlock.css'

export interface ResourceReadBlockProps {
  resourceRead: ResourceReadState
}

export function ResourceReadBlock({ resourceRead }: ResourceReadBlockProps) {
  const [contentOpen, setContentOpen] = useState(false)
  const { read, content, status } = resourceRead

  const label = read.name ?? read.uri
  const server = read.server

  return (
    <div className={`meso-resource meso-resource--${status}`}>
      <div className="meso-resource__header">
        <StatusIcon status={status} />

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

function StatusIcon({ status }: { status: ResourceReadState['status'] }) {
  switch (status) {
    case 'pending':
      return <span className="meso-resource__spinner" aria-label="读取中" />
    case 'done':
      return (
        <svg className="meso-resource__icon meso-resource__icon--done" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-label="完成">
          <path d="M2 7L5 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'error':
      return (
        <svg className="meso-resource__icon meso-resource__icon--error" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-label="失败">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )
  }
}
