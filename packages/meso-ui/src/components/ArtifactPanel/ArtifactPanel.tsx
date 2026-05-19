import { useState } from 'react'
import './ArtifactPanel.css'

export type ArtifactType = 'code' | 'html' | 'mermaid'

export interface ArtifactPanelProps {
  type: ArtifactType
  content: string
  language?: string
  /** Whether content is still streaming in */
  streaming?: boolean
  /** Called when user clicks the copy button */
  onCopy?: (content: string) => void
  /** Called when user clicks download. If not provided, default browser download is triggered. */
  onDownload?: (content: string) => void
}

export function ArtifactPanel({ type, content, language = 'plaintext', streaming = false, onCopy, onDownload }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(content)
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload(content)
      return
    }
    const ext = type === 'html' ? 'html' : type === 'mermaid' ? 'md' : (language || 'txt')
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `artifact.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const tabs: ArtifactType[] = type === 'html' ? ['html', 'code'] : [type]

  return (
    <div className="meso-artifact">
      <div className="meso-artifact__header">
        <div className="meso-artifact__tabs">
          {tabs.map((t) => (
            <span key={t} className="meso-artifact__tab meso-artifact__tab--active">
              {tabLabel(t, language)}
            </span>
          ))}
        </div>
        {streaming && <span className="meso-artifact__streaming-badge">生成中…</span>}
        <button
          className="meso-artifact__download-btn"
          onClick={handleDownload}
          title="下载"
          aria-label="下载文件"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11"/>
          </svg>
        </button>
        <button
          className="meso-artifact__copy-btn"
          onClick={handleCopy}
          title="复制"
          aria-label="复制代码"
        >
          {copied ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,8 6,12 13,4"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="8" height="9" rx="1.5"/>
              <path d="M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4"/>
            </svg>
          )}
        </button>
      </div>

      <div className="meso-artifact__body">
        {type === 'html' ? (
          <iframe
            className="meso-artifact__preview"
            srcDoc={content}
            sandbox="allow-scripts"
            title="HTML 预览"
          />
        ) : (
          <pre className="meso-artifact__code">
            <code>{content}</code>
            {streaming && <span className="meso-artifact__cursor" aria-hidden="true">▋</span>}
          </pre>
        )}
      </div>
    </div>
  )
}

function tabLabel(type: ArtifactType, language: string): string {
  if (type === 'html') return 'HTML 预览'
  if (type === 'mermaid') return '图表'
  return language || 'Code'
}
