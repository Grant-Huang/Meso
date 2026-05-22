import { useState, useEffect, useRef } from 'react'
import './ArtifactPanel.css'

export type ArtifactType = 'code' | 'html' | 'mermaid' | 'markdown' | 'table'

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
  /**
   * Async Mermaid renderer. Receives the source string, returns an SVG string.
   * Called once streaming is complete. If absent, a placeholder is shown.
   */
  renderMermaid?: (source: string) => Promise<string>
  /**
   * Syntax highlighter. Receives (code, lang), returns an HTML string.
   * Called once streaming is complete. Falls back to plain text if absent.
   * Must return sanitized HTML.
   */
  highlightCode?: (code: string, lang: string) => string
  /**
   * Markdown renderer. Used when type='markdown'.
   * Must return sanitized HTML.
   */
  renderMarkdown?: (source: string) => string
}

interface TableData {
  headers: string[]
  rows: (string | number)[][]
}

function parseTable(content: string): TableData | null {
  try {
    const data = JSON.parse(content)
    if (Array.isArray(data.headers) && Array.isArray(data.rows)) return data as TableData
    return null
  } catch {
    return null
  }
}

export function ArtifactPanel({
  type,
  content,
  language = 'plaintext',
  streaming = false,
  onCopy,
  onDownload,
  renderMermaid,
  highlightCode,
  renderMarkdown,
}: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<ArtifactType>(type)
  const [mermaidSvg, setMermaidSvg] = useState<string | null>(null)
  const [mermaidError, setMermaidError] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null)
  const prevContentRef = useRef<string>('')

  // Reset tab when type changes
  useEffect(() => { setActiveTab(type) }, [type])

  // Render Mermaid once streaming is done
  useEffect(() => {
    if (type !== 'mermaid' || streaming || !renderMermaid || content === prevContentRef.current) return
    prevContentRef.current = content
    setMermaidSvg(null)
    setMermaidError(false)
    renderMermaid(content)
      .then(svg => setMermaidSvg(svg))
      .catch(() => setMermaidError(true))
  }, [type, streaming, content, renderMermaid])

  // Apply syntax highlight once streaming is done
  useEffect(() => {
    if (type !== 'code' || streaming || !highlightCode) return
    if (content === prevContentRef.current && highlightedCode) return
    prevContentRef.current = content
    setHighlightedCode(highlightCode(content, language))
  }, [type, streaming, content, language, highlightCode, highlightedCode])

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(content)
  }

  const handleDownload = () => {
    if (onDownload) { onDownload(content); return }
    const extMap: Record<ArtifactType, string> = {
      html: 'html', mermaid: 'md', markdown: 'md', table: 'json', code: language || 'txt',
    }
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `artifact.${extMap[type]}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const tabs: ArtifactType[] = type === 'html' ? ['html', 'code'] : [type]

  return (
    <div className="meso-artifact">
      <div className="meso-artifact__header">
        <div className="meso-artifact__tabs">
          {tabs.map((t) => (
            <span
              key={t}
              className={`meso-artifact__tab${activeTab === t ? ' meso-artifact__tab--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {tabLabel(t, language)}
            </span>
          ))}
        </div>
        {streaming && <span className="meso-artifact__streaming-badge">生成中…</span>}
        <button className="meso-artifact__download-btn" onClick={handleDownload} title="下载" aria-label="下载文件">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11"/>
          </svg>
        </button>
        <button className="meso-artifact__copy-btn" onClick={handleCopy} title="复制" aria-label="复制代码">
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
        {activeTab === 'html' && (
          <iframe className="meso-artifact__preview" srcDoc={content} sandbox="allow-scripts" title="HTML 预览" />
        )}

        {activeTab === 'mermaid' && (
          <>
            {streaming && (
              <pre className="meso-artifact__code">
                <code>{content}</code>
                <span className="meso-artifact__cursor" aria-hidden="true">▋</span>
              </pre>
            )}
            {!streaming && mermaidSvg && (
              <div
                className="meso-artifact__mermaid"
                dangerouslySetInnerHTML={{ __html: mermaidSvg }}
              />
            )}
            {!streaming && !mermaidSvg && !mermaidError && !renderMermaid && (
              <div className="meso-artifact__mermaid-placeholder">
                <span>图表预览需要集成 Mermaid 渲染器</span>
                <pre className="meso-artifact__code" style={{ flex: 1 }}>
                  <code>{content}</code>
                </pre>
              </div>
            )}
            {!streaming && mermaidError && (
              <div className="meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error">
                <span>图表渲染失败，请检查语法</span>
                <pre className="meso-artifact__code" style={{ flex: 1 }}>
                  <code>{content}</code>
                </pre>
              </div>
            )}
            {!streaming && !mermaidSvg && !mermaidError && renderMermaid && (
              <div className="meso-artifact__mermaid-placeholder">
                <span>渲染中…</span>
              </div>
            )}
          </>
        )}

        {activeTab === 'markdown' && (
          <>
            {renderMarkdown ? (
              <div
                className="meso-artifact__markdown"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : (
              <pre className="meso-artifact__code">
                <code>{content}</code>
                {streaming && <span className="meso-artifact__cursor" aria-hidden="true">▋</span>}
              </pre>
            )}
          </>
        )}

        {activeTab === 'table' && (
          <TableArtifact content={content} streaming={streaming} />
        )}

        {(activeTab === 'code' || (activeTab === 'html' && false)) && (
          <pre className="meso-artifact__code">
            {highlightedCode && !streaming ? (
              <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            ) : (
              <code>{content}</code>
            )}
            {streaming && <span className="meso-artifact__cursor" aria-hidden="true">▋</span>}
          </pre>
        )}
      </div>
    </div>
  )
}

function TableArtifact({ content, streaming }: { content: string; streaming: boolean }) {
  const data = parseTable(content)
  if (!data) {
    return (
      <pre className="meso-artifact__code">
        <code>{content}</code>
        {streaming && <span className="meso-artifact__cursor" aria-hidden="true">▋</span>}
      </pre>
    )
  }
  return (
    <div className="meso-artifact__table-wrap">
      <table className="meso-artifact__table">
        <thead>
          <tr>{data.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => <td key={c}>{String(cell)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function tabLabel(type: ArtifactType, language: string): string {
  if (type === 'html') return 'HTML 预览'
  if (type === 'mermaid') return '图表'
  if (type === 'markdown') return 'Markdown'
  if (type === 'table') return '表格'
  return language || 'Code'
}
