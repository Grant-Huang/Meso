import { type ReactNode, useState } from 'react'
import { ThinkBlock } from '../ThinkBlock'
import { StageTimeline } from '../StageTimeline'
import { ToolCallBlock } from '../ToolCallBlock'
import { WorkflowTimeline } from '../WorkflowTimeline'
import type { StreamState, ToolCallState } from '../../runtime'
import type { Stage } from '../StageTimeline'
import './ProcessTrace.css'

export interface ProcessTraceProps {
  /** The live or completed stream state to render. */
  stream: StreamState
  /** Whether the stream is still active. Controls ThinkBlock streaming mode. */
  streaming?: boolean
  /** Initial collapsed state of the outer summary header. Default false (expanded). */
  defaultCollapsed?: boolean
  /** Callback for tool confirm/cancel (forwarded to ToolCallBlock). */
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  /**
   * Optional render slot for custom stage body content.
   * Rendered below each stage chip in the StageTimeline area.
   * Return null/undefined to use default rendering.
   */
  renderStageBody?: (stage: Stage, streamStage: StreamState['stages'][number]) => ReactNode
  /**
   * Optional render slot that replaces the default ToolCallBlock for a specific call.
   * Return null/undefined to fall back to ToolCallBlock.
   */
  renderToolCall?: (toolCall: ToolCallState) => ReactNode
}

function buildSummary(stream: StreamState): string {
  const total = stream.toolCallOrder.length + stream.workflowRunOrder.reduce(
    (n, id) => n + (stream.workflowRuns[id]?.nodeOrder.length ?? 0), 0
  )
  const errors = stream.toolCallOrder.filter(id => stream.toolCalls[id]?.status === 'error').length
    + stream.workflowRunOrder.reduce((n, id) => {
        const run = stream.workflowRuns[id]
        if (!run) return n
        return n + run.nodeOrder.filter(nid => run.nodes[nid]?.state === 'error').length
      }, 0)
  const parts: string[] = []
  if (stream.phaseOrder.length > 0) parts.push(`${stream.phaseOrder.length} 阶段`)
  else if (stream.stages.length > 0) parts.push(`${stream.stages.length} 阶段`)
  if (total > 0) parts.push(`${total} 步`)
  if (errors > 0) parts.push(`${errors} 项失败`)
  return parts.length > 0 ? parts.join(' · ') : '执行过程'
}

export function ProcessTrace({
  stream,
  streaming = false,
  defaultCollapsed = false,
  onToolConfirm,
  onToolCancel,
  renderStageBody,
  renderToolCall,
}: ProcessTraceProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const hasContent =
    !!stream.thinkContent ||
    stream.stages.length > 0 ||
    stream.phaseOrder.length > 0 ||
    stream.toolCallOrder.length > 0 ||
    stream.workflowRunOrder.length > 0

  if (!hasContent) return null

  const summary = buildSummary(stream)
  const workflowRuns = stream.workflowRunOrder
    .map(id => stream.workflowRuns[id])
    .filter(Boolean)

  return (
    <div className="meso-process-trace">
      <button
        className="meso-process-trace__header"
        onClick={() => setCollapsed(v => !v)}
        aria-expanded={!collapsed}
      >
        <svg
          className={`meso-process-trace__chevron${collapsed ? '' : ' meso-process-trace__chevron--open'}`}
          width="14" height="14" viewBox="0 0 14 14"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="3,5 7,9 11,5"/>
        </svg>
        <span className="meso-process-trace__summary">{summary}</span>
        {streaming && <span className="meso-process-trace__dot" aria-label="执行中" />}
      </button>

      {!collapsed && (
        <div className="meso-process-trace__body">
          {stream.thinkContent && (
            <ThinkBlock
              content={stream.thinkContent}
              streaming={streaming && !stream.thinkDone}
              collapseWhen="never"
              defaultOpen={true}
            />
          )}

          {stream.stages.length > 0 && (
            <>
              <StageTimeline
                compact
                stages={stream.stages.map((s): Stage => ({
                  id: s.name,
                  label: s.name,
                  status: s.state === 'done' || s.state === 'error' ? 'done' : 'active',
                }))}
              />
              {renderStageBody && stream.stages.map(s => {
                const stage: Stage = { id: s.name, label: s.name, status: s.state === 'done' || s.state === 'error' ? 'done' : 'active' }
                const body = renderStageBody(stage, s)
                return body ? <div key={s.name} className="meso-process-trace__stage-body">{body}</div> : null
              })}
            </>
          )}

          {stream.toolCallOrder.length > 0 && (
            <div className="meso-process-trace__tools">
              {stream.toolCallOrder.map(id => {
                const tc = stream.toolCalls[id]
                if (!tc) return null
                const custom = renderToolCall?.(tc)
                if (custom !== undefined && custom !== null) return <div key={id}>{custom}</div>
                return (
                  <ToolCallBlock
                    key={id}
                    toolCall={tc}
                    onConfirm={onToolConfirm}
                    onCancel={onToolCancel}
                  />
                )
              })}
            </div>
          )}

          {workflowRuns.length > 0 && (
            <WorkflowTimeline runs={workflowRuns} />
          )}
        </div>
      )}
    </div>
  )
}
