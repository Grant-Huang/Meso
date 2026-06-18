import { useState, useEffect } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'

let _hlPromise: Promise<Highlighter> | null = null
function getHighlighter() {
  if (!_hlPromise) {
    _hlPromise = createHighlighter({ themes: ['vitesse-dark'], langs: ['json'] })
  }
  return _hlPromise
}

type AppId = 'general' | 'docreview' | 'codeassist'

const APPS = [
  {
    id: 'general' as AppId,
    name: '通用对话',
    desc: '全能助手，支持聊天、分析、写作。无特定知识库，依赖长期记忆召回。',
    iconColor: 'rgba(61,107,82,0.13)',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7l-4 3V6a1 1 0 0 1 1-1z" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinejoin="round"/><path d="M7 9h8M7 12h5" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  },
  {
    id: 'docreview' as AppId,
    name: '文档审查',
    desc: '专注文档结构、合规性检查，绑定内部规范知识库，支持焦点模式。',
    iconColor: 'rgba(47,125,74,.1)',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="4" y="2" width="14" height="18" rx="2" stroke="var(--color-success)" strokeWidth="1.6"/><path d="M8 7h6M8 10h6M8 13h4" stroke="var(--color-success)" strokeWidth="1.4" strokeLinecap="round"/><circle cx="16" cy="16" r="4" fill="var(--color-bg-white)" stroke="var(--color-success)" strokeWidth="1.4"/><path d="M14.5 16l1 1 2-2" stroke="var(--color-success)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'codeassist' as AppId,
    name: '代码助手',
    desc: '代码审查、重构建议，绑定项目代码知识库及工具集，最小化工具栏。',
    iconColor: 'rgba(61,107,82,0.09)',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M7 8l-4 3 4 3M15 8l4 3-4 3M13 6l-4 10" stroke="var(--color-accent-dark)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
]

const MANIFESTS: Record<AppId, object> = {
  general: {
    schema_version: '1.0',
    id: 'general',
    name: '通用对话',
    icon: 'chat',
    skill: { system_prompt: '你是一个全能 AI 助手，支持聊天、分析、写作。' },
    tools: [
      'web_search',                  // 内置工具 ID
      './tools/calculator.json',     // 外部工具文件路径
    ],
    memory: { recall_categories: ['preference', 'project', 'fact'], recall_top_k: 5 },
  },
  docreview: {
    schema_version: '1.0',
    id: 'doc-review',
    name: '文档审查',
    icon: 'file-search',
    ui: { composer_placeholder: '上传文档或输入审查要求…', split_mode_default: true },
    skill: { system_prompt: '你是一个专业的合同审查助手，关注法律风险和合规性。' },
    tools: [
      'search_knowledge',            // 内置工具 ID
      './tools/extract-entities.json', // 外部工具文件路径
      {                              // 内联 ToolDefinition
        schema_version: '1.0',
        id: 'docreview.export_docx',
        name: '导出 Word',
        version: '1.0.0',
        description: '将审查结果导出为 .docx',
        provider: 'local',
        risk: 'write',
        input_schema: { type: 'object', properties: { findings: { type: 'array' } }, required: ['findings'] },
      },
    ],
    knowledge: { enabled: true, index_dirs: ['legal-templates', 'company-policies'] },
    memory: { recall_categories: ['preference', 'project'], recall_top_k: 3 },
  },
  codeassist: {
    schema_version: '1.0',
    id: 'code-assist',
    name: '代码助手',
    icon: 'code',
    ui: { composer_placeholder: '粘贴代码或描述问题…' },
    skill: { system_prompt: '你是一名资深工程师，专注代码审查、重构建议与文档生成。' },
    tools: [
      'run_code',                    // 内置工具 ID
      './tools/git-diff.json',       // 外部工具文件路径
      './tools/search-docs.json',
    ],
    knowledge: { enabled: true, index_dirs: ['project_codebase'] },
    memory: { recall_categories: ['preference', 'project'], recall_top_k: 5 },
  },
}


function JsonViewer({ data }: { data: object }) {
  const json = JSON.stringify(data, null, 2)
  const mono = '"SF Mono","Fira Code",monospace'
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    let active = true
    getHighlighter().then(hl => {
      if (!active) return
      const highlighted = hl.codeToHtml(json, {
        lang: 'json',
        theme: 'vitesse-dark',
        transformers: [{ pre: node => { node.properties['style'] = 'background:transparent;margin:0;padding:0;' } }],
      })
      setHtml(highlighted)
    })
    return () => { active = false }
  }, [json])

  return (
    <div style={{ background: 'var(--color-code-bg)', borderRadius: 10, padding: '20px 24px', fontFamily: mono, fontSize: 12, lineHeight: 1.85, overflowX: 'auto' }}
      dangerouslySetInnerHTML={{ __html: html || `<pre style="margin:0;color:#c8d5cb;white-space:pre">${json}</pre>` }}
    />
  )
}

const ToolbarIcon = ({ path }: { path: React.ReactNode }) => (
  <button style={{ background: 'none', border: 'none', padding: 5, borderRadius: 6, cursor: 'default', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">{path}</svg>
  </button>
)

const ActiveTag = ({ label, color }: { label: string; color?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'default', fontSize: 11, fontWeight: 500, fontFamily: 'inherit', background: color ? `rgba(47,125,74,.1)` : 'rgba(61,107,82,0.10)', color: color || 'var(--color-accent)' }}>
    {label}
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </span>
)

const TOOLBARS: Record<AppId, React.ReactNode> = {
  general: (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <ToolbarIcon path={<><path d="M3 10V12.5C3 13.33 3.67 14 4.5 14H9.5C10.33 14 11 13.33 11 12.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M7 2v8M4.5 4.5L7 2l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></>} />
      <ActiveTag label="知识库" />
      <ActiveTag label="工具" />
      <div style={{ flex: 1 }} />
      <button style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'default', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M10 1L1 4.5l4 1.5 1.5 4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
        发送
      </button>
    </div>
  ),
  docreview: (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <ToolbarIcon path={<><path d="M3 10V12.5C3 13.33 3.67 14 4.5 14H9.5C10.33 14 11 13.33 11 12.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M7 2v8M4.5 4.5L7 2l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></>} />
      <ActiveTag label="知识库" />
      <ActiveTag label="焦点" color="var(--color-success)" />
      <ActiveTag label="工具" />
      <div style={{ flex: 1 }} />
      <button style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'default', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M10 1L1 4.5l4 1.5 1.5 4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
        发送
      </button>
    </div>
  ),
  codeassist: (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <ToolbarIcon path={<><path d="M3 10V12.5C3 13.33 3.67 14 4.5 14H9.5C10.33 14 11 13.33 11 12.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M7 2v8M4.5 4.5L7 2l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></>} />
      <div style={{ flex: 1 }} />
      <button style={{ background: 'var(--color-accent-dark)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'default', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M10 1L1 4.5l4 1.5 1.5 4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
        发送
      </button>
    </div>
  ),
}

const PLACEHOLDERS: Record<AppId, string> = {
  general: '向 Meso 发送消息…',
  docreview: '上传文档或输入审查要求…',
  codeassist: '粘贴代码或描述问题…',
}

/** Plugin/App showcase */
export function PluginPage() {
  const [selected, setSelected] = useState<AppId>('general')

  const Section = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 14px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: 920, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="var(--color-accent)" strokeWidth="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="var(--color-accent)" strokeWidth="1.5" opacity=".6"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="var(--color-accent)" strokeWidth="1.5" opacity=".6"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="var(--color-accent)" strokeWidth="1.5" opacity=".4"/>
        </svg>
        应用插件
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 28 }}>App Manifest · 应用卡片 · Composer 工具栏变体</div>

      <Section label="1 · 应用选择" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {APPS.map(app => (
          <div
            key={app.id}
            onClick={() => setSelected(app.id)}
            style={{
              background: 'var(--color-bg-white)',
              border: `2px solid ${selected === app.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 12, padding: 20, cursor: 'pointer',
              boxShadow: selected === app.id ? '0 0 0 3px rgba(61,107,82,0.13)' : 'none',
              transition: 'border-color .2s, box-shadow .2s',
              userSelect: 'none',
              position: 'relative',
            }}
          >
            {selected === app.id && (
              <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(61,107,82,0.16)', color: 'var(--color-accent)' }}>当前</span>
            )}
            <div style={{ width: 44, height: 44, borderRadius: 10, background: app.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {app.icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{app.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{app.desc}</div>
          </div>
        ))}
      </div>

      <Section label="2 · App Manifest JSON" />
      <JsonViewer data={MANIFESTS[selected]} />

      <Section label="3 · Composer 工具栏变体" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {APPS.map(app => (
          <div key={app.id} style={{ background: 'var(--color-bg-white)', border: `1px solid ${selected === app.id ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s' }}>
            <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {app.name}
              {selected === app.id && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-accent)', fontWeight: 600, background: 'rgba(61,107,82,0.10)', borderRadius: 4, padding: '2px 8px' }}>当前</span>}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '8px 10px', background: 'var(--color-bg-elevated)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, minHeight: 40 }}>
                {PLACEHOLDERS[app.id]}
              </div>
              <div style={{ paddingTop: 6, borderTop: '1px solid var(--color-border-light)' }}>
                {TOOLBARS[app.id]}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}
