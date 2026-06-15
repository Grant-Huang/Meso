import { useCallback, useRef, useState } from 'react'
import { createInitialStreamState, applyEvent } from '@meso.ai/types'
import type { StreamState, StreamStatus, SSEEvent } from '@meso.ai/ui'

export interface LlmMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface UseLeanStreamOptions {
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

const SYS_NAMES: Record<string, string> = {
  mes: 'MES 现场',
  mom: 'MOM 历史',
  erp: 'ERP 工单',
  plm: 'PLM 工艺',
  kb: '精益 KB',
}

const DIAGNOSE_SYSTEM_PROMPT = `你是一位资深的精益生产顾问。基于现场取证数据（MES/MOM/ERP/PLM）和精益知识库，对产线 OEE 异常进行诊断。

输出要求：
1. 直接输出 HTML 片段（不要 <!DOCTYPE>、<html>、<body> 包裹）
2. 使用 <h2>、<h3>、<p>、<ul>、<li>、<table> 等语义化标签
3. 结构：诊断结论 → 根因分析（含数据引用）→ 改善建议（TPM/SMED/物料改善等）
4. 必须引用具体数据（如"点胶机#2 故障 28 分钟，可用率下降 4.2pp"）
5. 用工业术语，不要泛泛而谈
6. 改善建议要可执行（含责任班组、时间节点）`

// ── 数据建模（真实工业结构） ─────────────────────────────────────────────

function extractLineName(complaint: string): string {
  const m1 = complaint.match(/([A-Za-z])\s*装配线/) || complaint.match(/([A-Za-z])\s*线/)
  if (m1) return `${m1[1].toUpperCase()}装配线`
  const m2 = complaint.match(/(\d+)\s*号线/)
  if (m2) return `${m2[1]}号装配线`
  return 'A装配线'
}

interface MesData {
  line: string
  shift: string
  oee_now: number
  availability: number
  performance: number
  quality: number
  downtime_reasons: Array<{ reason: string; minutes: number; count: number }>
  target_oee: number
}

function buildMesData(line: string): MesData {
  return {
    line,
    shift: '白班',
    oee_now: 71.2,
    availability: 88.5,
    performance: 82.1,
    quality: 97.8,
    downtime_reasons: [
      { reason: '设备换模', minutes: 45, count: 3 },
      { reason: '物料待料', minutes: 30, count: 2 },
      { reason: '设备故障-点胶机#2', minutes: 28, count: 1 },
    ],
    target_oee: 85.0,
  }
}

interface MomData {
  line: string
  trend: Array<{ date: string; oee: number; a: number; p: number; q: number }>
  degradation_days: number
  drop_points: number
}

function buildMomData(line: string): MomData {
  return {
    line,
    trend: [
      { date: '06-08', oee: 86.1, a: 94.0, p: 92.0, q: 99.2 },
      { date: '06-09', oee: 84.5, a: 93.0, p: 91.0, q: 99.5 },
      { date: '06-10', oee: 82.3, a: 91.5, p: 90.0, q: 99.6 },
      { date: '06-11', oee: 78.9, a: 90.0, p: 87.5, q: 99.8 },
      { date: '06-12', oee: 75.2, a: 89.0, p: 84.0, q: 99.7 },
      { date: '06-13', oee: 73.0, a: 88.8, p: 82.5, q: 98.9 },
      { date: '06-14', oee: 71.2, a: 88.5, p: 82.1, q: 97.8 },
    ],
    degradation_days: 7,
    drop_points: 14.9,
  }
}

interface ErpData {
  work_orders: Array<{ wo: string; product: string; qty_plan: number; qty_actual: number; defect: number; status: string }>
  delayed_count: number
  root_hint: string
}

function buildErpData(_line: string): ErpData {
  return {
    work_orders: [
      { wo: 'WO-2026-0412', product: '模块X v3', qty_plan: 1200, qty_actual: 980, defect: 22, status: '进行中' },
      { wo: 'WO-2026-0413', product: '模块Y v2', qty_plan: 800, qty_actual: 0, defect: 0, status: '待产（被阻塞）' },
    ],
    delayed_count: 1,
    root_hint: '点胶机#2 故障导致 WO-0412 WIP 堆积，WO-0413 无法开工',
  }
}

interface PlmData {
  sop_id: string
  version: string
  params: Array<{ name: string; target: number; unit: string; tolerance: string }>
  last_revision: string
}

function buildPlmData(_line: string): PlmData {
  return {
    sop_id: 'SOP-A-DISPENSE-2024',
    version: 'v2.3',
    params: [
      { name: '点胶压力', target: 0.35, unit: 'MPa', tolerance: '±0.02' },
      { name: '点胶速度', target: 80, unit: 'mm/s', tolerance: '±5' },
      { name: '固化温度', target: 120, unit: '℃', tolerance: '±5' },
    ],
    last_revision: '2024-11-15',
  }
}

function buildKbResult(line: string): string {
  return JSON.stringify({
    query: `OEE下降 根因 ${line}`,
    hits: [
      { id: 'kb-tpm', title: 'TPM 全员生产维护 - 设备零故障路径', score: 0.93 },
      { id: 'kb-smed', title: 'SMED 快速换模八步法', score: 0.88 },
      { id: 'kb-5s', title: '5S 与物料配送 Kaizen', score: 0.81 },
    ],
  })
}

function buildCitations(line: string) {
  const safe = encodeURIComponent(line)
  return {
    sources: [
      { system: 'mes', name: `${line} 当班 OEE 实时`, uri: `mes://realtime/${safe}`, score: 1.0 },
      { system: 'mom', name: `${line} 7 天 OEE 趋势`, uri: `mom://history/${safe}?days=7`, score: 1.0 },
      { system: 'erp', name: `${line} 工单差异`, uri: `erp://workorders/${safe}`, score: 1.0 },
      { system: 'plm', name: `${line} 点胶工艺 SOP`, uri: `plm://sop/${safe}/dispense`, score: 1.0 },
      { system: 'kb', name: '精益方法论 TPM/SMED/5S', uri: 'kb://lean/methodology', score: 0.88 },
    ],
  }
}

function buildOeeTable(mom: MomData) {
  return {
    headers: ['日期', 'OEE(%)', '可用率(%)', '表现率(%)', '质量(%)', '备注'],
    rows: mom.trend.map((d, i) => [
      d.date,
      d.oee.toFixed(1),
      d.a.toFixed(1),
      d.p.toFixed(1),
      d.q.toFixed(1),
      i === mom.trend.length - 1 ? '⬇ 当前' : (d.oee < 80 ? '⬇ 偏低' : ''),
    ]),
  }
}

function buildDashboardHtml(mes: MesData, mom: MomData): string {
  const oeeValues = mom.trend.map(d => d.oee)
  const aValues = mom.trend.map(d => d.a)
  const pValues = mom.trend.map(d => d.p)
  const qValues = mom.trend.map(d => d.q)
  const labels = mom.trend.map(d => d.date)
  const downtimeLabels = mes.downtime_reasons.map(r => r.reason)
  const downtimeValues = mes.downtime_reasons.map(r => r.minutes)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; margin: 0; padding: 16px; background: #f7f8fa; color: #1a1a1a; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .header h1 { font-size: 16px; margin: 0; font-weight: 600; }
  .header .meta { font-size: 11px; color: #666; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
  .kpi { background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #ececec; }
  .kpi .label { font-size: 11px; color: #888; margin-bottom: 4px; }
  .kpi .value { font-size: 20px; font-weight: 700; }
  .kpi .value.danger { color: #e74c3c; }
  .kpi .value.warn { color: #f39c12; }
  .kpi .sub { font-size: 10px; color: #aaa; margin-top: 2px; }
  .chart-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 8px; }
  .chart-box { background: #fff; border-radius: 8px; padding: 12px; border: 1px solid #ececec; }
  .chart-box h3 { font-size: 12px; margin: 0 0 8px; color: #555; font-weight: 600; }
  canvas { max-height: 220px; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: #ffe0e0; color: #c0392b; }
</style>
</head>
<body>
  <div class="header">
    <h1>${mes.line} OEE 看板</h1>
    <div class="meta">班次：${mes.shift} · 目标 OEE：${mes.target_oee}%</div>
  </div>

  <div class="kpis">
    <div class="kpi"><div class="label">OEE</div><div class="value danger">${mes.oee_now}%</div><div class="sub">⬇ ${mom.drop_points}pp vs 上周</div></div>
    <div class="kpi"><div class="label">可用率</div><div class="value warn">${mes.availability}%</div><div class="sub">目标 ≥ 95%</div></div>
    <div class="kpi"><div class="label">表现率</div><div class="value warn">${mes.performance}%</div><div class="sub">目标 ≥ 95%</div></div>
    <div class="kpi"><div class="label">质量</div><div class="value">${mes.quality}%</div><div class="sub">达标</div></div>
  </div>

  <div class="chart-row">
    <div class="chart-box">
      <h3>OEE 7 天趋势（A/P/Q 分解）</h3>
      <canvas id="trend"></canvas>
    </div>
    <div class="chart-box">
      <h3>当班停机分类（分钟）</h3>
      <canvas id="downtime"></canvas>
    </div>
  </div>

<script>
const labels = ${JSON.stringify(labels)};
new Chart(document.getElementById('trend'), {
  type: 'line',
  data: {
    labels,
    datasets: [
      { label: 'OEE', data: ${JSON.stringify(oeeValues)}, borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)', tension: 0.3, fill: true },
      { label: '可用率', data: ${JSON.stringify(aValues)}, borderColor: '#3498db', tension: 0.3 },
      { label: '表现率', data: ${JSON.stringify(pValues)}, borderColor: '#f39c12', tension: 0.3 },
      { label: '质量', data: ${JSON.stringify(qValues)}, borderColor: '#27ae60', tension: 0.3 },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } },
    scales: { y: { min: 65, max: 100, ticks: { font: { size: 10 }, callback: v => v + '%' } }, x: { ticks: { font: { size: 10 } } } },
  },
});
new Chart(document.getElementById('downtime'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(downtimeLabels)},
    datasets: [{ label: '停机(分钟)', data: ${JSON.stringify(downtimeValues)}, backgroundColor: ['#e74c3c', '#f39c12', '#9b59b6'], borderRadius: 4 }],
  },
  options: {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } },
  },
});
</script>
</body>
</html>`
}

function buildUnderstandThink(complaint: string, line: string): string[] {
  return [
    `车间主管报告：${complaint}\n`,
    `关键信息：产线 = ${line}，OEE 出现明显下滑。\n`,
    `需要从多个系统取证：MES 看当前状态、MOM 看趋势、ERP 看工单执行、PLM 看工艺参数，再结合精益知识库定位根因。`,
  ]
}

function buildDiagnosePrompt(complaint: string, line: string, mes: MesData, mom: MomData, erp: ErpData, plm: PlmData): string {
  return `请针对以下产线异常进行 OEE 诊断。

【诊断对象】产线：${line}
【用户投诉】
${complaint}

【取证数据 - MES 现场】
产线：${mes.line}（${mes.shift}）
当前 OEE：${mes.oee_now}%（目标 ${mes.target_oee}%）
可用率 ${mes.availability}% / 表现率 ${mes.performance}% / 质量 ${mes.quality}%
停机分类：
${mes.downtime_reasons.map(r => `  - ${r.reason}：${r.minutes} 分钟（${r.count} 次）`).join('\n')}

【取证数据 - MOM 7 天趋势】
降解天数：${mom.degradation_days} 天，累计下降 ${mom.drop_points}pp
${mom.trend.map(d => `  ${d.date}：OEE ${d.oee}%（A${d.a}/P${d.p}/Q${d.q}）`).join('\n')}

【取证数据 - ERP 工单】
${erp.work_orders.map(w => `  ${w.wo} ${w.product}：计划 ${w.qty_plan}，实际 ${w.qty_actual}，不良 ${w.defect}（${w.status}）`).join('\n')}
延误工单：${erp.delayed_count} 个
根因提示：${erp.root_hint}

【取证数据 - PLM 工艺 SOP】
${plm.sop_id}（${plm.version}，最后修订 ${plm.last_revision}）
${plm.params.map(p => `  ${p.name}：${p.target}${p.unit}（公差 ${p.tolerance}）`).join('\n')}

【精益知识库匹配】
TPM（设备零故障）、SMED（快速换模）、5S（物料配送 Kaizen）

请生成 HTML 诊断报告，突出：可用率瓶颈（点胶机故障 + 换模）、表现率瓶颈（WIP 堆积）、改善措施（含责任班组与时间节点）。`
}

const CAPABILITIES_PAYLOAD = {
  tools: [
    { name: 'search_knowledge', description: '精益知识库检索', provider: 'builtin' as const, risk: 'safe' as const },
    { name: 'create_work_order', description: '创建现场作业派工单', provider: 'local' as const, risk: 'write' as const },
  ],
  skills: [
    { id: 'oee-diagnosis', name: 'OEE 诊断', focus_points: [{ id: 'evidence', name: '多源取证' }, { id: 'root_cause', name: '根因定位' }, { id: 'kaizen', name: '改善建议' }] },
  ],
  resources: [
    { uri: 'mes://realtime/*', name: 'MES 现场实时数据', server: 'mes-srv' },
    { uri: 'mom://history/*', name: 'MOM 历史趋势', server: 'mom-srv' },
    { uri: 'erp://workorders/*', name: 'ERP 工单', server: 'erp-srv' },
    { uri: 'plm://sop/*', name: 'PLM 工艺参数', server: 'plm-srv' },
  ],
  mcp_servers: [
    { name: 'mes-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'mom-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'erp-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'plm-srv', capabilities: ['resources'] as Array<'resources'> },
  ],
}

/**
 * useLeanStream — 精益生产 OEE 诊断编排器。
 *
 * 接真实 LLM 生成 HTML 诊断报告，其余事件（capabilities/soul/skill/memory/phase/
 * think/resource/tool/workflow/citation/memory_saved）按 OEE 诊断故事剧本注入。
 * 4 轮 MCP 资源读取（MES/MOM/ERP/PLM）+ KB 检索 + 3 个 artifact（HTML报告/OEE表格/看板）。
 */
export function useLeanStream() {
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
    opts: UseLeanStreamOptions,
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

  const send = useCallback(async (complaint: string, opts: UseLeanStreamOptions) => {
    abortRef.current?.abort()
    pendingConfirmRef.current?.reject()
    pendingConfirmRef.current = null

    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState({ ...createInitialStreamState(), status: 'streaming' })

    const line = extractLineName(complaint)
    const t = Date.now()

    try {
      // ── 幕一：顾问激活 + 意图理解 ──
      emit(ev({ type: 'capabilities', payload: CAPABILITIES_PAYLOAD }))
      await delay(150)
      emit(ev({ type: 'soul', payload: { id: 'lean-advisor', name: '精益顾问', version: '1.0.0', traits: ['务实', '数据驱动', '根因导向'] } }))
      await delay(120)
      emit(ev({ type: 'skill_active', payload: { id: 'oee-diagnosis', name: 'OEE 诊断', version: '1.0', provider: 'mcp', focus: ['evidence', 'root_cause', 'kaizen'] } }))
      await delay(100)

      emit(ev({ type: 'phase', payload: { id: 'understand', name: '理解投诉', state: 'running', started_at: t } }))
      await delay(120)
      for (const seg of buildUnderstandThink(complaint, line)) {
        if (ctrl.signal.aborted) return
        emit(ev({ type: 'think', payload: { delta: seg, done: false } }))
        await delay(300)
      }
      emit(ev({ type: 'think', payload: { delta: '', done: true } }))
      emit(ev({ type: 'phase', payload: { id: 'understand', name: '理解投诉', state: 'done', ended_at: t + 300 } }))

      // ── 幕二：多系统取证 ──
      emit(ev({ type: 'phase', payload: { id: 'evidence', name: '多系统取证', state: 'running', started_at: t + 300 } }))

      // workflow DAG：coordinator + 4 个并行取证节点
      emit(ev({ type: 'workflow_node', payload: { run_id: 'diag', node_id: 'coordinator', name: '取证协调', state: 'active', started_at: t } }))
      for (const sys of ['mes', 'mom', 'erp', 'plm']) {
        emit(ev({ type: 'workflow_node', payload: { run_id: 'diag', node_id: sys, parent_id: 'coordinator', name: SYS_NAMES[sys], state: 'active', started_at: t } }))
      }

      const mes = buildMesData(line)
      const mom = buildMomData(line)
      const erp = buildErpData(line)
      const plm = buildPlmData(line)

      // 4 轮 MCP 资源读取
      const mcpFetches: Array<[string, string, string, object]> = [
        ['rr1', `mes://realtime/${line}`, 'mes-srv', mes],
        ['rr2', `mom://history/${line}?days=7`, 'mom-srv', mom],
        ['rr3', `erp://workorders/${line}`, 'erp-srv', erp],
        ['rr4', `plm://sop/${line}/dispense`, 'plm-srv', plm],
      ]

      const nodeMetadata: Record<string, Record<string, unknown>> = {
        mes: { oee: mes.oee_now },
        mom: { days: mom.degradation_days, drop: mom.drop_points },
        erp: { delayed: erp.delayed_count },
        plm: { params: plm.params.length },
      }

      for (const [rid, uri, server, data] of mcpFetches) {
        if (ctrl.signal.aborted) return
        emit(ev({ type: 'resource_read', payload: { id: rid, uri, server } }))
        await delay(80)
        emit(ev({ type: 'resource_content', payload: {
          resource_read_id: rid,
          contents: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
          duration_ms: 280 + Math.floor(Math.random() * 120),
        } }))
        await delay(120)
      }

      // KB 检索（tool_call safe）
      if (ctrl.signal.aborted) return
      emit(ev({ type: 'tool_call', payload: { id: 'tc1', name: 'search_knowledge', args: { query: `OEE下降 根因 ${line}` }, risk: 'safe', provider: 'builtin' } }))
      emit(ev({ type: 'tool_status', payload: { id: 'tc1', status: 'running' } }))
      await delay(400)

      // workflow 节点完成
      const durations: Record<string, number> = { mes: 380, mom: 420, erp: 320, plm: 290 }
      for (const sys of ['mes', 'mom', 'erp', 'plm']) {
        emit(ev({ type: 'workflow_node', payload: { run_id: 'diag', node_id: sys, parent_id: 'coordinator', name: SYS_NAMES[sys], state: 'done', duration_ms: durations[sys], metadata: nodeMetadata[sys] } }))
      }
      emit(ev({ type: 'workflow_node', payload: { run_id: 'diag', node_id: 'coordinator', name: '取证协调', state: 'done', duration_ms: 510 } }))

      emit(ev({ type: 'tool_result', payload: { tool_call_id: 'tc1', output: buildKbResult(line), duration_ms: 400 } }))

      // citation（4 数据源 + KB）
      emit(ev({ type: 'extension', payload: { name: 'citation', version: '1.0', data: buildCitations(line) } }))

      emit(ev({ type: 'phase', payload: { id: 'evidence', name: '多系统取证', state: 'done', pinned_think: `取证完成：OEE 7 连降（${mom.drop_points}pp），点胶机#2 故障 ${mes.downtime_reasons[2].minutes} 分钟 + 换模频繁 + 物料待料，WO-0412 WIP 堆积` } }))

      // ── 幕三：综合诊断 + 多产物 ──
      emit(ev({ type: 'phase', payload: { id: 'diagnose', name: '综合诊断', state: 'running' } }))
      emit(ev({ type: 'text', payload: { delta: `基于 4 个系统（MES/MOM/ERP/PLM）的取证数据与精益知识库，针对 ${line} 的 OEE 异常诊断如下：\n\n` } }))

      // artifact 1: HTML 诊断报告（LLM 流式生成）
      await streamLlm([
        { role: 'system', content: DIAGNOSE_SYSTEM_PROMPT },
        { role: 'user', content: buildDiagnosePrompt(complaint, line, mes, mom, erp, plm) },
      ], opts, ctrl.signal, delta => {
        emit(ev({ type: 'artifact', payload: { id: 'report', lang: 'html', delta, done: false } }))
      })
      emit(ev({ type: 'artifact', payload: { id: 'report', lang: 'html', delta: '', done: true } }))

      // artifact 2: OEE 数据明细 table（一次性）
      if (ctrl.signal.aborted) return
      emit(ev({ type: 'artifact', payload: { id: 'oee-table', lang: 'table', delta: JSON.stringify(buildOeeTable(mom)), done: true } }))

      // artifact 3: 看板 HTML（一次性，含 Chart.js CDN）
      emit(ev({ type: 'artifact', payload: { id: 'dashboard', lang: 'html', delta: buildDashboardHtml(mes, mom), done: true } }))

      emit(ev({ type: 'phase', payload: { id: 'diagnose', name: '综合诊断', state: 'done' } }))

      // 派工确认门（write 风险，演示 requires_confirm 触发条件）
      emit(ev({ type: 'phase', payload: { id: 'dispatch', name: '现场作业派工', state: 'running' } }))
      emit(ev({ type: 'tool_call', payload: { id: 'tc2', name: 'create_work_order', args: { line, title: `${line} OEE 异常专项改善`, priority: 'high' }, risk: 'write', provider: 'local' } }))

      // 暂停等待用户确认
      await new Promise<void>((resolve, reject) => {
        pendingConfirmRef.current = { resolve, reject }
      })

      emit(ev({ type: 'tool_status', payload: { id: 'tc2', status: 'running' } }))
      await delay(500)
      if (ctrl.signal.aborted) return
      emit(ev({ type: 'tool_result', payload: { tool_call_id: 'tc2', output: `已创建派工单 WO-2026-0420，已通知 ${mes.shift}班长与设备组、工艺组`, duration_ms: 500 } }))
      emit(ev({ type: 'phase', payload: { id: 'dispatch', name: '现场作业派工', state: 'done' } }))
      emit(ev({ type: 'memory_saved', payload: { id: 'case1', category: 'oee-case', preview: `${line} OEE 诊断：点胶机故障+换模频繁+物料待料，已派工` } }))

      emit(ev({ type: 'done', payload: {} }))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      emit(ev({ type: 'error', payload: { message: (err as Error).message || '操作已取消' } }))
    }
  }, [emit, streamLlm])

  return { state, send, abort, reset, confirmTool, cancelTool }
}

export { SYS_NAMES }
