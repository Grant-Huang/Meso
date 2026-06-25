import { useCallback, useRef, useState } from 'react'
import { createInitialStreamState, applyEvent } from '@meso.ai/types'
import type { StreamState, StreamStatus, SSEEvent } from '@meso.ai/ui'

export interface LlmMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface UseFullStreamOptions {
  baseUrl: string
  model: string
  apiKey: string
}

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

type EventSeed = {
  [K in SSEEvent['type']]: { type: K; payload: Extract<SSEEvent, { type: K }>['payload'] }
}[SSEEvent['type']]

function ev(e: EventSeed): SSEEvent {
  return { ...e, schema_version: '1.0' } as SSEEvent
}

const REPORT_SYSTEM_PROMPT = `你是一位严谨的研究分析师。请基于用户给定的主题和上下文，用中文撰写一份结构化的 Markdown 研究报告。

报告格式要求：
1. 一级标题：研究主题
2. "## 摘要"：2-3 句话概括核心结论
3. "## 关键发现"：3-5 个要点，每点用 "**加粗标题**" 开头
4. "## 分析"：对要点的深入展开
5. "## 结论与建议"：可操作的建议

总长度 400-600 字，语言精炼，避免空话。直接输出 Markdown，不要包裹在代码块里。`

// ── 基于 topic 的内容生成器 ──────────────────────────────────────────────

function buildMemorySnippets(topic: string) {
  return [
    { category: 'preference', content: `用户近期关注：${topic}相关议题` },
    { category: 'project', content: '当前项目：Meso 流式 LLM UI 平台' },
    { category: 'fact', content: `用户偏好：结构化、带引用来源的深度分析` },
  ]
}

function buildPlanThink(topic: string): string[] {
  return [
    `用户希望深入研究"${topic}"。\n`,
    `我需要从多个维度收集信息：\n`,
    `1. 内部知识库是否有相关文档？\n`,
    `2. MCP 资源服务器能否提供权威资料？\n`,
    `3. 网络上是否有最新的讨论和实践？\n`,
    `整合三个来源后，再进行交叉验证和结构化输出。`,
  ]
}

function buildMcpContent(topic: string): string {
  return `【MCP 资源摘要】\n主题：${topic}\n\n` +
    `根据 research-srv 提供的文档索引，找到 2 篇高度相关的内部资料。\n` +
    `核心要点包括：该领域的技术演进路径、主流方案的对比维度、以及业界共识与争议点。\n` +
    `建议在报告中突出"成熟度评估"和"选型建议"两个章节。`
}

function buildKbResult(topic: string): string {
  return JSON.stringify({
    query: topic,
    total_hits: 8,
    top_results: [
      { id: 'kb-1', title: `${topic}：技术综述`, score: 0.94 },
      { id: 'kb-2', title: `${topic} 实践案例集`, score: 0.89 },
      { id: 'kb-3', title: `${topic} 的未来趋势`, score: 0.82 },
    ],
  })
}

function buildCitations(topic: string) {
  const safe = encodeURIComponent(topic)
  return {
    sources: [
      { id: 's1', title: `${topic}：权威技术综述`, url: `https://research.example.com/${safe}/overview`, score: 0.94 },
      { id: 's2', title: `${topic} 实践案例与最佳实践`, url: `https://research.example.com/${safe}/practices`, score: 0.89 },
      { id: 's3', title: `${topic} 行业趋势报告 2026`, url: `https://research.example.com/${safe}/trends`, score: 0.82 },
    ],
  }
}

function buildReportPrompt(topic: string): string {
  return `请针对以下主题撰写一份研究报告：

主题：${topic}

已采集的上下文：
- MCP 资源：找到 2 篇内部权威资料，要点为技术演进路径、主流方案对比、业界共识与争议
- 知识库：命中 8 条相关结果，top3 综合评分 0.82-0.94
- 网络抓取：5 个高质量页面，覆盖最新讨论

请基于上述信息生成结构化报告，突出"成熟度评估"和"选型建议"。`
}

function slug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'report'
}

const CAPABILITIES_PAYLOAD = {
  tools: [
    { name: 'web_search', description: '知识库与网络搜索', provider: 'builtin' as const, risk: 'safe' as const },
    { name: 'publish_doc', description: '发布报告到团队空间', provider: 'local' as const, risk: 'destructive' as const },
  ],
  skills: [
    { id: 'deep_research', name: '深度研究', focus_points: [{ id: 'multi_source', name: '多源汇总' }, { id: 'citation', name: '引用溯源' }] },
  ],
  resources: [
    { uri: 'research://docs/*', name: '内部研究文档', server: 'research-srv' },
  ],
  mcp_servers: [
    { name: 'research-srv', capabilities: ['resources', 'tools'] as Array<'resources' | 'tools'> },
  ],
}

/**
 * useFullStream — 深度研究助手编排器。
 *
 * 接真实 LLM 生成报告正文，其余事件（capabilities/soul/skill/memory/phase/
 * think/resource/tool/workflow/citation/memory_saved）按研究故事剧本注入，
 * 用一个连贯叙事展现 Meso 协议全部 18 种事件类型。
 */
export function useFullStream() {
  const [state, setState] = useState<StreamState>(createInitialStreamState)
  const abortRef = useRef<AbortController | null>(null)
  const pendingConfirmRef = useRef<{ resolve: () => void; reject: () => void } | null>(null)

  const emit = useCallback((e: SSEEvent) => {
    setState(prev => applyEvent(prev, e))
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    pendingConfirmRef.current?.reject()
    pendingConfirmRef.current = null
    setState(prev => ({ ...prev, status: 'idle' as StreamStatus }))
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    pendingConfirmRef.current?.reject()
    pendingConfirmRef.current = null
    setState(createInitialStreamState())
  }, [])

  const confirmTool = useCallback(() => {
    pendingConfirmRef.current?.resolve()
    pendingConfirmRef.current = null
  }, [])

  const cancelTool = useCallback(() => {
    pendingConfirmRef.current?.reject()
    pendingConfirmRef.current = null
  }, [])

  const streamLlm = useCallback(async (
    messages: LlmMessage[],
    opts: UseFullStreamOptions,
    signal: AbortSignal,
    onDelta: (delta: string) => void,
  ) => {
    const resp = await fetch(`${opts.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages,
        stream: true,
      }),
      signal,
    })

    if (!resp.ok) {
      const text = await resp.text()
      throw new Error(`HTTP ${resp.status}: ${text.slice(0, 200)}`)
    }

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') return
        let parsed: unknown
        try { parsed = JSON.parse(data) } catch { continue }
        const chunk = parsed as { choices?: Array<{ delta?: { content?: string } }> }
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) onDelta(delta)
      }
    }
  }, [])

  const send = useCallback(async (topic: string, opts: UseFullStreamOptions) => {
    abortRef.current?.abort()
    pendingConfirmRef.current?.reject()
    pendingConfirmRef.current = null

    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState({ ...createInitialStreamState(), status: 'streaming' })

    const t = Date.now()

    try {
      // ── 幕一：开场激活 ──
      emit(ev({ type: 'capabilities', payload: CAPABILITIES_PAYLOAD }))
      await delay(150)
      emit(ev({ type: 'soul', payload: { id: 'sage', name: '智者', version: '1.2.0', traits: ['严谨', '好奇', '多源求证'] } }))
      await delay(120)
      emit(ev({ type: 'skill_active', payload: { id: 'deep_research', name: '深度研究', version: '1.0', provider: 'mcp', server: 'research-srv', focus: ['multi_source', 'citation'] } }))
      await delay(100)

      // ── 幕二：多源采集 ──
      // 2a 召回记忆
      emit(ev({ type: 'phase', payload: { id: 'recall', name: '召回记忆', state: 'running', started_at: t } }))
      await delay(200)
      emit(ev({ type: 'memory', payload: { snippets: buildMemorySnippets(topic) } }))
      await delay(150)
      emit(ev({ type: 'phase', payload: { id: 'recall', name: '召回记忆', state: 'done', ended_at: t + 350 } }))

      // 2b 分析计划（per-phase think + pinned_think 防闪烁）
      emit(ev({ type: 'phase', payload: { id: 'analyze', name: '分析研究计划', state: 'running', started_at: t + 350 } }))
      await delay(120)
      const thinkParts = buildPlanThink(topic)
      for (const seg of thinkParts) {
        if (ctrl.signal.aborted) return
        emit(ev({ type: 'think', payload: { delta: seg, done: false, phase_id: 'analyze' } }))
        await delay(300)
      }
      emit(ev({ type: 'think', payload: { delta: '', done: true, phase_id: 'analyze' } }))
      emit(ev({ type: 'phase', payload: { id: 'analyze', name: '分析研究计划', state: 'done', pinned_think: thinkParts.join(''), ended_at: t + 350 + thinkParts.length * 300 } }))

      // 2c 多源并行采集（workflow DAG + resource + tool）
      // narration 字段由编排层填写，UI 自动转发为 text 事件
      emit(ev({ type: 'phase', payload: {
        id: 'collect',
        name: '多源采集',
        state: 'running',
        started_at: t + 350 + thinkParts.length * 300,
        narration: `现在开始从多个来源采集关于"${topic}"的信息。`
      } }))

      // workflow: orchestrator + 3 个并行采集节点
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'orchestrator', name: '采集编排', state: 'active', started_at: t } }))
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'mcp_fetch', parent_id: 'orchestrator', name: 'MCP 文档', state: 'active', started_at: t } }))
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'kb_search', parent_id: 'orchestrator', name: 'KB 检索', state: 'active', started_at: t } }))
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'web_fetch', parent_id: 'orchestrator', name: '网页抓取', state: 'active', started_at: t } }))

      // 第一步：MCP 资源 + web_search 工具
      emit(ev({ type: 'resource_read', payload: { id: 'rr1', uri: `research://docs/${slug(topic)}`, server: 'research-srv' } }))
      emit(ev({ type: 'tool_call', payload: { id: 'tc1', name: 'web_search', args: { query: topic }, risk: 'safe', provider: 'builtin' } }))
      emit(ev({ type: 'tool_status', payload: { id: 'tc1', status: 'running' } }))

      await delay(450)

      if (ctrl.signal.aborted) return
      emit(ev({ type: 'resource_content', payload: {
        resource_read_id: 'rr1',
        contents: [{ type: 'text', text: buildMcpContent(topic) }],
        duration_ms: 430,
        narration: `MCP 返回 2400 字`
      } }))
      emit(ev({ type: 'tool_result', payload: {
        tool_call_id: 'tc1',
        output: buildKbResult(topic),
        metadata: { resultCount: 8 },
        duration_ms: 450,
        narration: `知识库命中 8 条`
      } }))

      // workflow 节点完成
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'mcp_fetch', name: 'MCP 文档', parent_id: 'orchestrator', state: 'done', duration_ms: 430, metadata: { chars: 2400 } } }))
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'kb_search', name: 'KB 检索', parent_id: 'orchestrator', state: 'done', duration_ms: 450, metadata: { hits: 8 } } }))
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'web_fetch', name: '网页抓取', parent_id: 'orchestrator', state: 'done', duration_ms: 510, metadata: { pages: 5 }, narration: `网页抓取 5 页` } }))
      emit(ev({ type: 'workflow_node', payload: { run_id: 'r1', node_id: 'orchestrator', name: '采集编排', state: 'done', duration_ms: 510 } }))

      // citation（extension 事件）
      emit(ev({ type: 'extension', payload: { name: 'citation', version: '1.0', data: buildCitations(topic) } }))

      emit(ev({ type: 'phase', payload: { id: 'collect', name: '多源采集', state: 'done', pinned_think: 'MCP 返回 2400 字，KB 命中 8 条，网页抓取 5 页' } }))

      // ── 幕三：综合生成 ──
      emit(ev({ type: 'phase', payload: {
        id: 'synthesize',
        name: '综合生成',
        state: 'running',
        narration: `现在根据采集到的信息生成结构化研究报告：`
      } }))

      // 真实 LLM 生成报告 markdown → artifact 流式
      await streamLlm([
        { role: 'system', content: REPORT_SYSTEM_PROMPT },
        { role: 'user', content: buildReportPrompt(topic) },
      ], opts, ctrl.signal, delta => {
        emit(ev({ type: 'artifact', payload: { id: 'report', lang: 'markdown', delta, done: false } }))
      })
      emit(ev({ type: 'artifact', payload: { id: 'report', lang: 'markdown', delta: '', done: true } }))
      emit(ev({ type: 'phase', payload: { id: 'synthesize', name: '综合生成', state: 'done' } }))

      // 发布确认门（destructive）
      emit(ev({ type: 'phase', payload: { id: 'publish', name: '发布报告', state: 'running' } }))
      emit(ev({ type: 'tool_call', payload: { id: 'tc2', name: 'publish_doc', args: { title: `${topic} 研究报告`, visibility: 'team' }, risk: 'destructive', provider: 'local' } }))

      // 暂停等待用户确认
      await new Promise<void>((resolve, reject) => {
        pendingConfirmRef.current = { resolve, reject }
      })

      // 确认后
      emit(ev({ type: 'tool_status', payload: { id: 'tc2', status: 'running' } }))
      await delay(500)
      if (ctrl.signal.aborted) return
      emit(ev({ type: 'tool_result', payload: { tool_call_id: 'tc2', output: `已发布到团队空间，链接：https://team.example.com/reports/${slug(topic)}`, duration_ms: 500 } }))
      emit(ev({ type: 'phase', payload: { id: 'publish', name: '发布报告', state: 'done' } }))
      emit(ev({ type: 'memory_saved', payload: { id: 'mem1', category: 'research', preview: `完成"${topic}"深度研究并发布` } }))

      // ── 收尾总结陈词（闭环回顾，动态生成） ──
      emit(ev({ type: 'text', payload: { delta: `\n\n---\n\n**研究完成**：围绕「${topic}」已走完「记忆召回 → 多源采集（MCP / 知识库 / 网页）→ 综合生成 → 发布」全流程，结构化研究报告已生成并发布到团队空间。如需就某个方向深入展开，告诉我即可继续追加研究。` } }))

      emit(ev({ type: 'done', payload: {} }))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      emit(ev({ type: 'error', payload: { message: (err as Error).message || '操作已取消' } }))
    }
  }, [emit, streamLlm])

  return { state, send, abort, reset, confirmTool, cancelTool }
}
