import { useCallback, useRef, useState } from 'react'
import { createInitialStreamState, applyEvent } from '@meso.ai/types'
import type { StreamState, StreamStatus, SSEEvent, ResourceContentItem } from '@meso.ai/ui'

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
  acquire: '智能采集',
  kb: '精益 KB',
  'lean-kb': '精益 KB',
  edgeos: '边缘OS',
}

const DIAGNOSE_SYSTEM_PROMPT = `你是一位资深的精益生产顾问。基于现场取证数据（MES/MOM/ERP/PLM/智能采集）和精益知识库，对产线 OEE 异常进行诊断。

输出要求：
1. 直接输出 HTML 片段（不要 <!DOCTYPE>、<html>、<body> 包裹）
2. 使用 <h2>、<h3>、<p>、<ul>、<li>、<table> 等语义化标签
3. 结构：诊断结论 → 根因分析（含数据引用）→ 改善建议（TPM/SMED/物料改善等）
4. 必须引用具体数据（如"点胶机#2 故障 28 分钟，可用率下降 4.2pp"）
5. 用工业术语，不要泛泛而谈
6. 改善建议要可执行（含责任班组、时间节点）`

// ── 数据建模（真实工业结构） ─────────────────────────────────────────────

const round1 = (n: number) => Math.round(n * 10) / 10

function extractLineName(complaint: string): string {
  const m1 = complaint.match(/([A-Za-z])\s*装配线/) || complaint.match(/([A-Za-z])\s*线/)
  if (m1) return `${m1[1].toUpperCase()}装配线`
  const m2 = complaint.match(/(\d+)\s*号线/)
  if (m2) return `${m2[1]}号装配线`
  return 'A装配线'
}

// ── 投诉信号：解析投诉文本 → 结构化信号 ──────────────────────────────────

type AnomalyType = 'oee_drop' | 'equipment_failure' | 'quality_decline' | 'material_shortage' | 'changeover' | 'generic'
type Severity = 'mild' | 'moderate' | 'severe'
type Shift = '白班' | '夜班'

interface ComplaintSignal {
  line: string
  anomaly: AnomalyType
  severity: Severity
  shift: Shift
  /** 涉及的设备名（从文本提取，如"点胶机#2""贴片机"） */
  equipment: string
  /** 设备基础类型（去掉编号，如"点胶机""贴片机"） */
  equipmentType: string
  /** OEE 跌幅（pp） */
  oeeDrop: number
  /** 当前 OEE 推断值 */
  oeeNow: number
  /** 主要瓶颈指标 */
  bottleneck: 'availability' | 'performance' | 'quality'
}

const ANOMALY_LABELS: Record<AnomalyType, string> = {
  oee_drop: 'OEE 下降',
  equipment_failure: '设备故障',
  quality_decline: '质量下滑',
  material_shortage: '物料短缺',
  changeover: '换型频繁',
  generic: '综合效率异常',
}

function parseComplaint(complaint: string): ComplaintSignal {
  // 1. 产线名
  const line = extractLineName(complaint)

  // 2. 异常类型关键词匹配
  let anomaly: AnomalyType = 'generic'
  if (/故障|停机|报警|维修|损坏/.test(complaint)) anomaly = 'equipment_failure'
  else if (/质量|不良|缺陷|不良率|返工/.test(complaint)) anomaly = 'quality_decline'
  else if (/物料|待料|缺料|缺货|齐套/.test(complaint)) anomaly = 'material_shortage'
  else if (/换模|换线|切换|换型/.test(complaint)) anomaly = 'changeover'
  else if (/oee|综合效率|效率下降/.test(complaint.toLowerCase())) anomaly = 'oee_drop'

  // 3. 班次
  const shift: Shift = /夜班/.test(complaint) ? '夜班' : '白班'

  // 4. 设备提取（覆盖常见 SMT/组装设备）
  const equipMatch = complaint.match(/(点胶机|贴片机|回流焊|印刷机|AOI|SPI|注塑机|冲床|数控机床|激光|焊接机|测试机|包装机|切割机|打标机|组装机)(\d*|#?\d*)?/)
  const equipmentType = equipMatch ? equipMatch[1] : '主设备'
  const equipment = equipMatch ? `${equipMatch[1]}${equipMatch[2] ?? ''}` : '主设备'

  // 5. OEE 跌幅 + 当前值
  const dropMatch = complaint.match(/从\s*(\d+(?:\.\d+)?)\s*[%％]?\s*(?:跌|降|下)/)
  const toMatch = complaint.match(/(?:到|至|剩|跌到|降到)\s*(\d+(?:\.\d+)?)\s*[%％]?/)
  const declineMatch = complaint.match(/下降\s*(\d+(?:\.\d+)?)\s*[%％]?/)
  let oeeDrop: number
  let oeeNow: number
  if (dropMatch && toMatch) {
    oeeDrop = parseFloat(dropMatch[1]) - parseFloat(toMatch[1])
    oeeNow = parseFloat(toMatch[1])
  } else if (declineMatch) {
    oeeDrop = parseFloat(declineMatch[1])
    oeeNow = Math.max(55, 85 - oeeDrop)
  } else {
    oeeDrop = anomaly === 'quality_decline' ? 5 : anomaly === 'changeover' ? 8 : 12
    oeeNow = Math.max(55, 85 - oeeDrop)
  }

  // 6. 严重度
  let severity: Severity = 'moderate'
  if (oeeDrop >= 15 || /严重|紧急|停线|停产|瘫痪/.test(complaint)) severity = 'severe'
  else if (oeeDrop <= 5 && !/严重|紧急/.test(complaint)) severity = 'mild'

  // 7. 瓶颈指标
  const bottleneck: ComplaintSignal['bottleneck'] =
    anomaly === 'quality_decline' ? 'quality' :
    anomaly === 'equipment_failure' || anomaly === 'material_shortage' || anomaly === 'changeover' ? 'availability' :
    'performance'

  return { line, anomaly, severity, shift, equipment, equipmentType, oeeDrop: Math.max(2, oeeDrop), oeeNow, bottleneck }
}

// ── MES 现场 ────────────────────────────────────────────────────────────

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

function buildMesData(sig: ComplaintSignal): MesData {
  // 三指标：瓶颈指标吃掉 ~60% 跌幅，其余分摊到 95% 基线
  const totalDrop = 95 * 3 - sig.oeeNow
  const dropMap: Record<ComplaintSignal['bottleneck'], [number, number, number]> = {
    availability: [totalDrop * 0.6, totalDrop * 0.25, totalDrop * 0.15],
    performance: [totalDrop * 0.25, totalDrop * 0.6, totalDrop * 0.15],
    quality: [totalDrop * 0.15, totalDrop * 0.25, totalDrop * 0.6],
  }
  const [dA, dP, dQ] = dropMap[sig.bottleneck]

  // 停机原因按异常类型选
  const downtimeByAnomaly: Record<AnomalyType, MesData['downtime_reasons']> = {
    equipment_failure: [
      { reason: `设备故障-${sig.equipment}`, minutes: 35 + Math.round(sig.oeeDrop * 1.5), count: 2 },
      { reason: '设备换模', minutes: 30, count: 2 },
    ],
    material_shortage: [
      { reason: '物料待料', minutes: 50 + Math.round(sig.oeeDrop * 2), count: 3 },
      { reason: '物料质量退货', minutes: 20, count: 1 },
    ],
    changeover: [
      { reason: '设备换模', minutes: 60 + Math.round(sig.oeeDrop * 2.5), count: 4 },
      { reason: '首件调试', minutes: 25, count: 2 },
    ],
    quality_decline: [
      { reason: '工艺调整-参数优化', minutes: 30, count: 3 },
      { reason: `设备故障-${sig.equipment}`, minutes: 15, count: 1 },
    ],
    oee_drop: [
      { reason: `设备故障-${sig.equipment}`, minutes: 28, count: 1 },
      { reason: '设备换模', minutes: 45, count: 3 },
      { reason: '物料待料', minutes: 30, count: 2 },
    ],
    generic: [
      { reason: '设备换模', minutes: 40, count: 3 },
      { reason: '物料待料', minutes: 25, count: 2 },
    ],
  }

  return {
    line: sig.line,
    shift: sig.shift,
    oee_now: round1(sig.oeeNow),
    availability: round1(95 - dA),
    performance: round1(95 - dP),
    quality: round1(95 - dQ),
    downtime_reasons: downtimeByAnomaly[sig.anomaly],
    target_oee: 85.0,
  }
}

// ── MOM 历史 ────────────────────────────────────────────────────────────

interface MomData {
  line: string
  trend: Array<{ date: string; oee: number; a: number; p: number; q: number }>
  degradation_days: number
  drop_points: number
}

function buildMomData(sig: ComplaintSignal): MomData {
  const today = new Date()
  const start = sig.oeeNow + sig.oeeDrop
  // A/P/Q 基线 95，终点按瓶颈分配跌幅
  const totalDrop = 95 * 3 - sig.oeeNow
  const dropMap: Record<ComplaintSignal['bottleneck'], [number, number, number]> = {
    availability: [totalDrop * 0.6, totalDrop * 0.25, totalDrop * 0.15],
    performance: [totalDrop * 0.25, totalDrop * 0.6, totalDrop * 0.15],
    quality: [totalDrop * 0.15, totalDrop * 0.25, totalDrop * 0.6],
  }
  const [endDA, endDP, endDQ] = dropMap[sig.bottleneck]

  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const date = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const ratio = i / 6
    // 缓慢加速下降：前期慢、后期快
    const eased = ratio * ratio * 0.6 + ratio * 0.4
    return {
      date,
      oee: round1(start - sig.oeeDrop * eased),
      a: round1(95 - endDA * eased),
      p: round1(95 - endDP * eased),
      q: round1(95 - endDQ * eased),
    }
  })

  return {
    line: sig.line,
    trend,
    degradation_days: 7,
    drop_points: round1(sig.oeeDrop),
  }
}

// ── ERP 工单 ────────────────────────────────────────────────────────────

interface ErpData {
  work_orders: Array<{ wo: string; product: string; qty_plan: number; qty_actual: number; defect: number; status: string }>
  delayed_count: number
  root_hint: string
}

const PRODUCT_POOL = ['模块X v3', '模块Y v2', '控制器Z', '电源板A', '传感器S2', '连接器C1', '主板M4']

function buildErpData(sig: ComplaintSignal): ErpData {
  const lineSeed = sig.line.charCodeAt(0)
  const p1 = PRODUCT_POOL[lineSeed % PRODUCT_POOL.length]
  const p2 = PRODUCT_POOL[(lineSeed + 3) % PRODUCT_POOL.length]
  const woBase = 410 + (lineSeed % 10)
  const delayed = sig.severity === 'severe' ? 2 : 1

  const hintByAnomaly: Record<AnomalyType, string> = {
    equipment_failure: `${sig.equipment} 故障导致 WIP 堆积`,
    material_shortage: '物料齐套率不足，工单无法下发',
    changeover: '频繁换型导致排产碎片化',
    quality_decline: `${sig.equipment} 参数漂移，批量返工`,
    oee_drop: `${sig.equipment} 效率下降 + 换模频繁`,
    generic: '产能瓶颈导致排产延迟',
  }

  return {
    work_orders: [
      { wo: `WO-2026-0${woBase}2`, product: p1, qty_plan: 1200, qty_actual: 980, defect: 22, status: '进行中' },
      { wo: `WO-2026-0${woBase}3`, product: p2, qty_plan: 800, qty_actual: 0, defect: 0, status: '待产（被阻塞）' },
    ],
    delayed_count: delayed,
    root_hint: hintByAnomaly[sig.anomaly],
  }
}

// ── PLM 工艺 ────────────────────────────────────────────────────────────

interface PlmData {
  sop_id: string
  version: string
  params: Array<{ name: string; target: number; unit: string; tolerance: string }>
  last_revision: string
}

const PARAM_SETS: Record<string, PlmData['params']> = {
  点胶机: [
    { name: '点胶压力', target: 0.35, unit: 'MPa', tolerance: '±0.02' },
    { name: '点胶速度', target: 80, unit: 'mm/s', tolerance: '±5' },
    { name: '固化温度', target: 120, unit: '℃', tolerance: '±5' },
  ],
  贴片机: [
    { name: '贴装精度', target: 0.05, unit: 'mm', tolerance: '±0.01' },
    { name: '贴装速度', target: 12000, unit: 'CPH', tolerance: '±500' },
    { name: '吸真空度', target: -65, unit: 'kPa', tolerance: '±3' },
  ],
  回流焊: [
    { name: '峰值温度', target: 245, unit: '℃', tolerance: '±5' },
    { name: '链速', target: 80, unit: 'cm/min', tolerance: '±3' },
    { name: '升温斜率', target: 2.5, unit: '℃/s', tolerance: '±0.3' },
  ],
  印刷机: [
    { name: '刮刀压力', target: 12, unit: 'kg', tolerance: '±1' },
    { name: '脱模速度', target: 1.5, unit: 'mm/s', tolerance: '±0.2' },
    { name: '钢网清洗频率', target: 5, unit: '片/次', tolerance: '±1' },
  ],
  注塑机: [
    { name: '注射压力', target: 120, unit: 'MPa', tolerance: '±5' },
    { name: '保压时间', target: 8, unit: 's', tolerance: '±0.5' },
    { name: '模具温度', target: 60, unit: '℃', tolerance: '±3' },
  ],
  default: [
    { name: '主轴转速', target: 3000, unit: 'rpm', tolerance: '±100' },
    { name: '进给速度', target: 500, unit: 'mm/min', tolerance: '±20' },
    { name: '加工温度', target: 35, unit: '℃', tolerance: '±2' },
  ],
}

function buildPlmData(sig: ComplaintSignal): PlmData {
  const params = PARAM_SETS[sig.equipmentType] ?? PARAM_SETS.default
  const typeCode = sig.equipmentType === '主设备' ? 'GEN' : sig.equipmentType.toUpperCase().slice(0, 4).padEnd(4, 'X')
  return {
    sop_id: `SOP-${sig.line[0]}-${typeCode}-2024`,
    version: 'v2.3',
    params,
    last_revision: '2024-11-15',
  }
}

// ── KB 精益知识库 ───────────────────────────────────────────────────────

function buildKbResult(sig: ComplaintSignal): string {
  const KB_BY_ANOMALY: Record<AnomalyType, Array<{ id: string; title: string; score: number }>> = {
    equipment_failure: [
      { id: 'kb-tpm', title: 'TPM 全员生产维护 - 设备零故障路径', score: 0.93 },
      { id: 'kb-am', title: '自主保全 AM 八步展开', score: 0.87 },
      { id: 'kb-pm', title: 'PM 计划保全与 MTBF 优化', score: 0.82 },
    ],
    material_shortage: [
      { id: 'kb-5s', title: '5S 与物料配送 Kaizen', score: 0.91 },
      { id: 'kb-kanban', title: '看板拉动与水蜘蛛配送', score: 0.86 },
      { id: 'kb-kitting', title: '齐套配送与超市设计', score: 0.80 },
    ],
    changeover: [
      { id: 'kb-smed', title: 'SMED 快速换模八步法', score: 0.94 },
      { id: 'kb-quick', title: '内部作业转外部作业指南', score: 0.88 },
      { id: 'kb-setup', title: '首件调试标准化', score: 0.81 },
    ],
    quality_decline: [
      { id: 'kb-spc', title: 'SPC 统计过程控制 - 漂移预警', score: 0.92 },
      { id: 'kb-doe', title: 'DOE 试验设计 - 参数寻优', score: 0.86 },
      { id: 'kb-8d', title: '8D 根因分析与纠正措施', score: 0.83 },
    ],
    oee_drop: [
      { id: 'kb-tpm', title: 'TPM 全员生产维护 - 设备零故障路径', score: 0.93 },
      { id: 'kb-smed', title: 'SMED 快速换模八步法', score: 0.88 },
      { id: 'kb-5s', title: '5S 与物料配送 Kaizen', score: 0.81 },
    ],
    generic: [
      { id: 'kb-oee', title: 'OEE 六大损失分析法', score: 0.90 },
      { id: 'kb-vsm', title: '价值流图 VSM - 识别浪费', score: 0.84 },
      { id: 'kb-kaizen', title: 'Kaizen 持续改善循环', score: 0.80 },
    ],
  }
  return JSON.stringify({
    query: `${ANOMALY_LABELS[sig.anomaly]} 根因 ${sig.line}`,
    hits: KB_BY_ANOMALY[sig.anomaly],
  })
}

function buildCitations(sig: ComplaintSignal) {
  const safe = encodeURIComponent(sig.line)
  const typeCode = sig.equipmentType === '主设备' ? 'main' : sig.equipmentType
  return {
    sources: [
      { system: 'mes', name: `${sig.line} ${sig.shift} OEE 实时`, uri: `mes://realtime/${safe}`, score: 1.0 },
      { system: 'mom', name: `${sig.line} 7 天 OEE 趋势`, uri: `mom://history/${safe}?days=7`, score: 1.0 },
      { system: 'erp', name: `${sig.line} 工单差异`, uri: `erp://workorders/${safe}`, score: 1.0 },
      { system: 'plm', name: `${sig.line} ${sig.equipmentType} 工艺 SOP`, uri: `plm://sop/${safe}/${typeCode}`, score: 1.0 },
      { system: 'acquire', name: `${sig.equipment} 传感器实时状态`, uri: `acquire://devices/${safe}/${typeCode}`, score: 1.0 },
      { system: 'kb', name: `精益方法论（${ANOMALY_LABELS[sig.anomaly]}）`, uri: 'kb://lean/methodology', score: 0.88 },
    ],
  }
}

// ── 智能数据采集（IoT 传感器实时状态） ──────────────────────────────────

interface AcquireData {
  device: string
  sensors: Array<{ name: string; value: number; unit: string; threshold: number; status: 'normal' | 'warn' | 'alarm' }>
  health_score: number
  sampled_at: string
}

function buildAcquireData(sig: ComplaintSignal): AcquireData {
  // 传感器基线 + 异常类型驱动告警等级
  const dropRatio = Math.min(1, sig.oeeDrop / 20)
  const sensorSets: Record<AnomalyType, AcquireData['sensors']> = {
    equipment_failure: [
      { name: '振动幅值', value: round1(4.5 + dropRatio * 6), unit: 'mm/s', threshold: 7.1, status: dropRatio > 0.5 ? 'alarm' : 'warn' },
      { name: '主轴温度', value: round1(58 + dropRatio * 22), unit: '℃', threshold: 75, status: dropRatio > 0.5 ? 'alarm' : 'warn' },
      { name: '轴承电流', value: round1(12 + dropRatio * 4), unit: 'A', threshold: 16, status: 'normal' },
    ],
    quality_decline: [
      { name: '电流波动', value: round1(2.8 + dropRatio * 3), unit: 'A', threshold: 4.5, status: dropRatio > 0.4 ? 'alarm' : 'warn' },
      { name: '电压谐波', value: round1(3.2 + dropRatio * 2.5), unit: '%', threshold: 5.0, status: 'warn' },
      { name: '主轴温度', value: round1(62 + dropRatio * 8), unit: '℃', threshold: 75, status: 'normal' },
    ],
    material_shortage: [
      { name: '物料流速', value: round1(45 - dropRatio * 30), unit: 'pcs/min', threshold: 30, status: dropRatio > 0.5 ? 'alarm' : 'warn' },
      { name: '缓存区液位', value: round1(35 - dropRatio * 25), unit: '%', threshold: 15, status: 'warn' },
      { name: '主轴温度', value: round1(60), unit: '℃', threshold: 75, status: 'normal' },
    ],
    changeover: [
      { name: '换型计数', value: round1(4 + dropRatio * 6), unit: '次/班', threshold: 8, status: dropRatio > 0.5 ? 'alarm' : 'warn' },
      { name: '调试时长', value: round1(18 + dropRatio * 25), unit: 'min', threshold: 35, status: 'warn' },
      { name: '振动幅值', value: round1(3.2), unit: 'mm/s', threshold: 7.1, status: 'normal' },
    ],
    oee_drop: [
      { name: '振动幅值', value: round1(3.8 + dropRatio * 4), unit: 'mm/s', threshold: 7.1, status: 'warn' },
      { name: '主轴温度', value: round1(56 + dropRatio * 15), unit: '℃', threshold: 75, status: 'warn' },
      { name: '电流负载', value: round1(13 + dropRatio * 3), unit: 'A', threshold: 16, status: 'normal' },
    ],
    generic: [
      { name: '振动幅值', value: round1(3.5 + dropRatio * 2), unit: 'mm/s', threshold: 7.1, status: 'normal' },
      { name: '主轴温度', value: round1(58 + dropRatio * 8), unit: '℃', threshold: 75, status: 'normal' },
      { name: '电流负载', value: round1(12 + dropRatio * 2), unit: 'A', threshold: 16, status: 'normal' },
    ],
  }
  const alarmCount = sensorSets[sig.anomaly].filter(s => s.status === 'alarm').length
  const warnCount = sensorSets[sig.anomaly].filter(s => s.status === 'warn').length
  const healthScore = round1(95 - alarmCount * 12 - warnCount * 5 - dropRatio * 8)
  return {
    device: sig.equipment,
    sensors: sensorSets[sig.anomaly],
    health_score: Math.max(40, healthScore),
    sampled_at: new Date().toISOString(),
  }
}

// ── ResourceProvider 抽象层 ─────────────────────────────────────────────
//
// 把"资源服务器数据生成 + 读取"封装成可替换的抽象。
// MockResourceProvider 按 URI scheme 路由到对应 buildXxxData(sig)，
// 未来接入真实 MCP 只需替换此实现，send() 事件流零改动。

interface ResourceProvider {
  readResource(uri: string): Promise<ResourceContentItem[]>
}

class MockResourceProvider implements ResourceProvider {
  constructor(private sig: ComplaintSignal) {}

  async readResource(uri: string): Promise<ResourceContentItem[]> {
    const data = this.resolve(uri)
    return [{ type: 'text', text: JSON.stringify(data, null, 2) }]
  }

  private resolve(uri: string): object {
    if (uri.startsWith('mes://')) return buildMesData(this.sig)
    if (uri.startsWith('mom://')) return buildMomData(this.sig)
    if (uri.startsWith('erp://')) return buildErpData(this.sig)
    if (uri.startsWith('plm://')) return buildPlmData(this.sig)
    if (uri.startsWith('acquire://')) return buildAcquireData(this.sig)
    throw new Error(`未知资源 URI: ${uri}`)
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

function buildUnderstandThink(complaint: string, sig: ComplaintSignal): string[] {
  const bottleneckLabel = sig.bottleneck === 'availability' ? '可用率' : sig.bottleneck === 'performance' ? '表现率' : '质量'
  return [
    `车间主管报告：${complaint}\n`,
    `关键信息：产线 = ${sig.line}，异常类型 = ${ANOMALY_LABELS[sig.anomaly]}，涉及设备 = ${sig.equipment}，OEE 当前约 ${sig.oeeNow.toFixed(1)}%（较基线下降 ${sig.oeeDrop.toFixed(1)}pp），主瓶颈疑似 ${bottleneckLabel}。\n`,
    `需要从多个系统取证：MES 看当前状态、MOM 看趋势、ERP 看工单执行、PLM 看${sig.equipmentType}工艺参数、智能采集看${sig.equipment}传感器实时状态，再结合精益知识库定位根因。`,
  ]
}

function buildDiagnosePrompt(complaint: string, sig: ComplaintSignal, mes: MesData, mom: MomData, erp: ErpData, plm: PlmData, acquire: AcquireData): string {
  const focusHint =
    sig.bottleneck === 'availability' ? `可用率瓶颈（${sig.equipment} 故障/停机 + 换模）` :
    sig.bottleneck === 'performance' ? `表现率瓶颈（WIP 堆积、节拍损失）` :
    `质量瓶颈（${sig.equipment} 参数漂移、批量不良）`

  return `请针对以下产线异常进行 OEE 诊断。

【诊断对象】产线：${sig.line} · 异常类型：${ANOMALY_LABELS[sig.anomaly]} · 班次：${sig.shift}
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

【取证数据 - 智能采集（${acquire.device} 传感器实时）】
健康度评分：${acquire.health_score}（采样时间 ${acquire.sampled_at}）
${acquire.sensors.map(s => `  - ${s.name}：${s.value}${s.unit}（阈值 ${s.threshold}${s.unit}，状态 ${s.status}）`).join('\n')}

【精益知识库匹配】
${sig.anomaly === 'equipment_failure' ? 'TPM（设备零故障）、自主保全 AM、计划保全 PM' :
  sig.anomaly === 'material_shortage' ? '5S 与物料配送 Kaizen、看板拉动、齐套配送' :
  sig.anomaly === 'changeover' ? 'SMED 快速换模八步法、内部转外部作业、首件标准化' :
  sig.anomaly === 'quality_decline' ? 'SPC 统计过程控制、DOE 参数寻优、8D 根因分析' :
  sig.anomaly === 'oee_drop' ? 'TPM（设备零故障）、SMED（快速换模）、5S（物料配送）' :
  'OEE 六大损失分析、价值流图 VSM、Kaizen 持续改善'}

请生成 HTML 诊断报告，突出：${focusHint}、结合传感器异常数据定位物理根因、改善措施（含责任班组与时间节点）。`
}

const CAPABILITIES_PAYLOAD = {
  tools: [
    {
      name: 'search_knowledge',
      description: '精益知识库检索（方法论/案例库）',
      provider: 'mcp' as const,
      server: 'lean-kb-srv',
      risk: 'safe' as const,
      input_schema: {
        type: 'object' as const,
        properties: {
          query: { type: 'string', description: '检索关键词（异常类型/根因方向）' },
          top_k: { type: 'number', description: '返回条数（默认 3）' },
        },
        required: ['query'],
      },
    },
    {
      name: 'create_work_order',
      description: '创建现场作业派工单（通知班组）',
      provider: 'mcp' as const,
      server: 'lean-kb-srv',
      risk: 'write' as const,
      input_schema: {
        type: 'object' as const,
        properties: {
          line: { type: 'string', description: '产线名' },
          title: { type: 'string', description: '派工单标题' },
          priority: { type: 'string', enum: ['high', 'urgent'], description: '优先级' },
        },
        required: ['line', 'title'],
      },
    },
    {
      name: 'execute_edge_command',
      description: '向边缘智能 OS 下发设备执行指令（调参/降速/停线）',
      provider: 'mcp' as const,
      server: 'edgeos-srv',
      risk: 'destructive' as const,
      input_schema: {
        type: 'object' as const,
        properties: {
          device: { type: 'string', description: '目标设备' },
          command: { type: 'string', enum: ['adjust_params', 'reduce_speed', 'pause_line'], description: '指令类型' },
          params: { type: 'object', description: '指令参数（键值对）' },
          reason: { type: 'string', description: '下发原因' },
        },
        required: ['device', 'command'],
      },
    },
  ],
  skills: [
    { id: 'oee-diagnosis', name: 'OEE 诊断', focus_points: [{ id: 'evidence', name: '多源取证' }, { id: 'root_cause', name: '根因定位' }, { id: 'kaizen', name: '改善建议' }, { id: 'intervene', name: '现场干预' }] },
  ],
  resources: [
    { uri: 'mes://realtime/*', name: 'MES 现场实时数据', server: 'mes-srv' },
    { uri: 'mom://history/*', name: 'MOM 历史趋势', server: 'mom-srv' },
    { uri: 'erp://workorders/*', name: 'ERP 工单', server: 'erp-srv' },
    { uri: 'plm://sop/*', name: 'PLM 工艺参数', server: 'plm-srv' },
    { uri: 'acquire://devices/*', name: '智能采集设备状态', server: 'acquire-srv' },
  ],
  mcp_servers: [
    { name: 'mes-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'mom-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'erp-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'plm-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'acquire-srv', capabilities: ['resources'] as Array<'resources'> },
    { name: 'lean-kb-srv', capabilities: ['tools'] as Array<'tools'> },
    { name: 'edgeos-srv', capabilities: ['tools'] as Array<'tools'> },
  ],
}

/**
 * useLeanStream — 精益生产 OEE 诊断编排器。
 *
 * 接真实 LLM 生成 HTML 诊断报告，其余事件（capabilities/soul/skill/memory/phase/
 * think/resource/tool/workflow/citation/memory_saved）按 OEE 诊断故事剧本注入。
 * 4 幕：顾问激活 → 多源取证（5 轮 MCP 资源：MES/MOM/ERP/PLM/智能采集）→
 * 综合诊断 + 派工确认 → 现场干预（边缘 OS 下发指令）。
 * 7 个 MCP 服务器：5 resource-srv + lean-kb-srv(tools) + edgeos-srv(tools)。
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

    const sig = parseComplaint(complaint)
    const line = sig.line
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
      for (const seg of buildUnderstandThink(complaint, sig)) {
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
      for (const sys of ['mes', 'mom', 'erp', 'plm', 'acquire']) {
        emit(ev({ type: 'workflow_node', payload: { run_id: 'diag', node_id: sys, parent_id: 'coordinator', name: SYS_NAMES[sys], state: 'active', started_at: t } }))
      }

      // 取证数据（仍需直接持有以便拼 LLM prompt / 看板）
      const mes = buildMesData(sig)
      const mom = buildMomData(sig)
      const erp = buildErpData(sig)
      const plm = buildPlmData(sig)
      const acquire = buildAcquireData(sig)

      // ResourceProvider 抽象层：未来接入真实 MCP 只需替换 provider 实现
      const provider: ResourceProvider = new MockResourceProvider(sig)

      // 5 轮 MCP 资源读取（MES/MOM/ERP/PLM + 智能采集）
      const mcpUris: Array<[string, string, string]> = [
        ['rr1', `mes://realtime/${line}`, 'mes-srv'],
        ['rr2', `mom://history/${line}?days=7`, 'mom-srv'],
        ['rr3', `erp://workorders/${line}`, 'erp-srv'],
        ['rr4', `plm://sop/${line}/${sig.equipmentType}`, 'plm-srv'],
        ['rr5', `acquire://devices/${line}/${sig.equipmentType}`, 'acquire-srv'],
      ]

      const nodeMetadata: Record<string, Record<string, unknown>> = {
        mes: { oee: mes.oee_now },
        mom: { days: mom.degradation_days, drop: mom.drop_points },
        erp: { delayed: erp.delayed_count },
        plm: { params: plm.params.length },
        acquire: { health: acquire.health_score, alarms: acquire.sensors.filter(s => s.status === 'alarm').length },
      }

      for (const [rid, uri, server] of mcpUris) {
        if (ctrl.signal.aborted) return
        emit(ev({ type: 'resource_read', payload: { id: rid, uri, server } }))
        await delay(80)
        const contents = await provider.readResource(uri)
        emit(ev({ type: 'resource_content', payload: {
          resource_read_id: rid,
          contents,
          duration_ms: 280 + Math.floor(Math.random() * 120),
        } }))
        await delay(120)
      }

      // KB 检索（tool_call safe）
      if (ctrl.signal.aborted) return
      emit(ev({ type: 'tool_call', payload: { id: 'tc1', name: 'search_knowledge', args: { query: `${ANOMALY_LABELS[sig.anomaly]} 根因 ${line}` }, risk: 'safe', provider: 'mcp', server: 'lean-kb-srv' } }))
      emit(ev({ type: 'tool_status', payload: { id: 'tc1', status: 'running' } }))
      await delay(400)

      // workflow 节点完成
      const durations: Record<string, number> = { mes: 380, mom: 420, erp: 320, plm: 290, acquire: 340 }
      for (const sys of ['mes', 'mom', 'erp', 'plm', 'acquire']) {
        emit(ev({ type: 'workflow_node', payload: { run_id: 'diag', node_id: sys, parent_id: 'coordinator', name: SYS_NAMES[sys], state: 'done', duration_ms: durations[sys], metadata: nodeMetadata[sys] } }))
      }
      emit(ev({ type: 'workflow_node', payload: { run_id: 'diag', node_id: 'coordinator', name: '取证协调', state: 'done', duration_ms: 510 } }))

      emit(ev({ type: 'tool_result', payload: { tool_call_id: 'tc1', output: buildKbResult(sig), duration_ms: 400 } }))

      // citation（4 数据源 + KB）
      emit(ev({ type: 'extension', payload: { name: 'citation', version: '1.0', data: buildCitations(sig) } }))

      const topDowntime = mes.downtime_reasons[0]
      const alarmCount = acquire.sensors.filter(s => s.status === 'alarm').length
      emit(ev({ type: 'phase', payload: { id: 'evidence', name: '多系统取证', state: 'done', pinned_think: `取证完成：OEE 7 连降（${mom.drop_points}pp），${ANOMALY_LABELS[sig.anomaly]}为主，${topDowntime.reason} ${topDowntime.minutes} 分钟，${erp.root_hint}；${sig.equipment}健康度 ${acquire.health_score}${alarmCount > 0 ? `（${alarmCount} 项告警）` : ''}` } }))

      // ── 幕三：综合诊断 + 多产物 ──
      emit(ev({ type: 'phase', payload: { id: 'diagnose', name: '综合诊断', state: 'running' } }))
      emit(ev({ type: 'text', payload: { delta: `基于 5 个系统（MES/MOM/ERP/PLM/智能采集）的取证数据与精益知识库，针对 ${line}（${ANOMALY_LABELS[sig.anomaly]}）的 OEE 异常诊断如下：\n\n` } }))

      // artifact 1: HTML 诊断报告（LLM 流式生成）
      await streamLlm([
        { role: 'system', content: DIAGNOSE_SYSTEM_PROMPT },
        { role: 'user', content: buildDiagnosePrompt(complaint, sig, mes, mom, erp, plm, acquire) },
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
      emit(ev({ type: 'tool_call', payload: { id: 'tc2', name: 'create_work_order', args: { line, title: `${line} ${ANOMALY_LABELS[sig.anomaly]}专项改善`, priority: sig.severity === 'severe' ? 'urgent' : 'high' }, risk: 'write', provider: 'mcp', server: 'lean-kb-srv' } }))

      // 暂停等待用户确认
      await new Promise<void>((resolve, reject) => {
        pendingConfirmRef.current = { resolve, reject }
      })

      emit(ev({ type: 'tool_status', payload: { id: 'tc2', status: 'running' } }))
      await delay(500)
      if (ctrl.signal.aborted) return
      emit(ev({ type: 'tool_result', payload: { tool_call_id: 'tc2', output: `已创建派工单 WO-2026-0420，已通知 ${mes.shift}班长与设备组、工艺组`, duration_ms: 500 } }))
      emit(ev({ type: 'phase', payload: { id: 'dispatch', name: '现场作业派工', state: 'done' } }))

      // ── 幕四：现场干预（边缘智能 OS 下发执行指令） ──
      // 按 anomaly 选干预策略，severe 时降速/停机，其余调参
      const commandByAnomaly: Record<AnomalyType, { command: string; params: Record<string, unknown> }> = {
        equipment_failure: { command: 'adjust_params', params: { 主轴转速降比: '15%', 冷却液流量: '+10%' } },
        quality_decline: { command: 'adjust_params', params: { 工艺参数回调: '上版本', SPC预警阈值: '收紧2σ' } },
        material_shortage: { command: 'reduce_speed', params: { 线速: '降至70%', 投料节奏: '暂停30min' } },
        changeover: { command: 'adjust_params', params: { 换模流程: '切换SMED标准作业', 首件校验: '加严' } },
        oee_drop: { command: 'adjust_params', params: { 节拍: '回调标准CT', 换模间隔: '优化' } },
        generic: { command: 'adjust_params', params: { 线速: '微调-5%' } },
      }
      if (sig.severity === 'severe') commandByAnomaly.equipment_failure.command = 'pause_line'
      const edgeCmd = commandByAnomaly[sig.anomaly]

      emit(ev({ type: 'phase', payload: { id: 'intervene', name: '现场干预', state: 'running' } }))
      emit(ev({ type: 'tool_call', payload: {
        id: 'tc3',
        name: 'execute_edge_command',
        args: { device: sig.equipment, command: edgeCmd.command, params: edgeCmd.params, reason: `${ANOMALY_LABELS[sig.anomaly]}改善（健康度 ${acquire.health_score}）` },
        risk: 'destructive',
        provider: 'mcp',
        server: 'edgeos-srv',
      } }))

      // 暂停等待用户确认（destructive 风险 → 强确认门）
      await new Promise<void>((resolve, reject) => {
        pendingConfirmRef.current = { resolve, reject }
      })

      emit(ev({ type: 'tool_status', payload: { id: 'tc3', status: 'running' } }))
      await delay(600)
      if (ctrl.signal.aborted) return
      const effectMin = sig.severity === 'severe' ? 15 : 8
      emit(ev({ type: 'tool_result', payload: { tool_call_id: 'tc3', output: `边缘 OS 已确认，指令「${edgeCmd.command}」已下发至 ${sig.equipment}，预计 ${effectMin} 分钟生效`, duration_ms: 600 } }))
      emit(ev({ type: 'phase', payload: { id: 'intervene', name: '现场干预', state: 'done' } }))
      emit(ev({ type: 'memory_saved', payload: { id: 'case2', category: 'intervention', preview: `${line} ${ANOMALY_LABELS[sig.anomaly]}：已派工 + 边缘OS下发「${edgeCmd.command}」至${sig.equipment}` } }))

      emit(ev({ type: 'done', payload: {} }))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      emit(ev({ type: 'error', payload: { message: (err as Error).message || '操作已取消' } }))
    }
  }, [emit, streamLlm])

  return { state, send, abort, reset, confirmTool, cancelTool }
}

export { SYS_NAMES }
