import { type ReactNode } from 'react'
import { ThinkBlock } from '../ThinkBlock'
import { StageTimeline } from '../StageTimeline'
import { ToolCallBlock } from '../ToolCallBlock'
import { WorkflowTimeline } from '../WorkflowTimeline'
import { StatusIcon } from '../StatusIcon'
import { ResourceReadBlock } from '../ResourceReadBlock'
import { useFoldState } from '../../hooks/useFoldState'
import { phaseRecordToStage } from '../../runtime'
import type { StreamState, ToolCallState, PhaseRecord } from '../../runtime'
import { groupToolCalls } from '../../utils/groupToolCalls'
import { phaseStateToIcon } from '../../utils/statusMapping'
import './ProcessTrace.css'

export interface SimplifyOptions {
  // ← OLD (backward compatibility)
  hideMetadata?: boolean
  hideResultDetails?: boolean
  compact?: boolean

  // ← NEW: Explicit verbosity level (overrides old properties)
  verbosity?: 'compact' | 'standard' | 'detailed'

  // ← NEW: Fine-grained controls
  showDuration?: boolean
  showProvider?: boolean
  showRiskLevel?: boolean
  showExecutionTimeline?: boolean
  defaultParamsCollapsed?: boolean
  defaultOutputCollapsed?: boolean
  defaultMetadataCollapsed?: boolean
}

export interface ProcessTraceProps {
  stream: StreamState
  streaming?: boolean
  turnStreaming?: boolean
  defaultCollapsed?: boolean
  className?: string
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  renderToolCall?: (toolCall: ToolCallState) => ReactNode
  renderPhase?: (phase: PhaseRecord) => ReactNode
  renderWorkflow?: (stream: StreamState) => ReactNode
  simplify?: SimplifyOptions
}

function buildSummary(stream: StreamState): string {
  const total = stream.toolCallOrder.length + stream.workflowRunOrder.reduce(
    (n, id) => n + (stream.workflowRuns[id]?.nodeOrder.length ?? 0), 0,
  )
  const errors = stream.toolCallOrder.filter(id => stream.toolCalls[id]?.status === 'error').length
    + stream.workflowRunOrder.reduce((n, id) => {
        const run = stream.workflowRuns[id]
        if (!run) return n
        return n + run.nodeOrder.filter(nid => run.nodes[nid]?.state === 'error').length
      }, 0)
  const parts: string[] = []
  if (stream.phaseOrder.length > 0) parts.push(`${stream.phaseOrder.length} 阶段`)
  if (total > 0) parts.push(`${total} 步`)
  if (errors > 0) parts.push(`${errors} 项失败`)
  return parts.length > 0 ? parts.join(' · ') : '执行过程'
}

function renderDefaultPhase(phase: PhaseRecord, streaming: boolean): ReactNode {
  const hasThink = Boolean(phase.thinkContent || phase.pinnedThink)
  return (
    <div className="meso-process-trace__phase" data-testid={`meso-phase-${phase.id}`}>
      <div className="meso-process-trace__phase-header">
        <StatusIcon status={phaseStateToIcon(phase.state)} size={14} />
        <span className="meso-process-trace__phase-name">{phase.name}</span>
      </div>
      {hasThink && (
        <ThinkBlock
          content={phase.thinkContent}
          pinnedContent={phase.pinnedThink}
          streaming={streaming && phase.state === 'running'}
          collapseWhen="never"
          defaultOpen={true}
        />
      )}
      {phase.body && (
        <div className="meso-process-trace__phase-body">{phase.body}</div>
      )}
    </div>
  )
}

export function ProcessTrace({
  stream,
  streaming = false,
  turnStreaming = false,
  defaultCollapsed = false,
  className,
  onToolConfirm,
  onToolCancel,
  renderToolCall,
  renderPhase,
  renderWorkflow,
  simplify,
}: ProcessTraceProps) {
  const fold = useFoldState({
    system: !defaultCollapsed,
    resetOnTurnStart: turnStreaming,
  })

  const hasContent =
    !!stream.thinkContent ||
    stream.phaseOrder.length > 0 ||
    stream.memorySnippets.length > 0 ||
    stream.resourceReadOrder.length > 0 ||
    stream.toolCallOrder.length > 0 ||
    stream.workflowRunOrder.length > 0

  if (!hasContent) return null

  const summary = buildSummary(stream)
  const workflowRuns = stream.workflowRunOrder
    .map(id => stream.workflowRuns[id])
    .filter(Boolean)
  const toolGroups = groupToolCalls(stream)
  const phaseStages = stream.phaseOrder
    .map(id => stream.phases[id])
    .filter(Boolean)
    .map(phaseRecordToStage)

  return (
    <div
      className={`meso-process-trace${className ? ` ${className}` : ''}`}
      data-testid="meso-process-trace"
    >
      <button
        className="meso-process-trace__header"
        onClick={fold.toggle}
        aria-expanded={fold.open}
        aria-label={fold.open ? '折叠执行过程' : '展开执行过程'}
      >
        <svg
          className={`meso-process-trace__chevron${fold.open ? ' meso-process-trace__chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 14 14"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="3,5 7,9 11,5"/>
        </svg>
        <span className="meso-process-trace__summary">{summary}</span>
        {streaming && <span className="meso-process-trace__dot" aria-label="执行中" />}
      </button>

      {fold.open && (
        <div className="meso-process-trace__body">
          {phaseStages.length > 0 && (
            <StageTimeline compact stages={phaseStages} />
          )}

          {stream.memorySnippets.length > 0 && (
            <div className="meso-memory-chips">
              {stream.memorySnippets.map((snippet, i) => (
                <span key={i} className="meso-memory-chip" title={snippet.content}>
                  [{snippet.category}] {snippet.content}
                </span>
              ))}
            </div>
          )}

          {stream.thinkContent && (
            <ThinkBlock
              content={stream.thinkContent}
              streaming={streaming && !stream.thinkDone}
              collapseWhen="never"
              defaultOpen={true}
              turnStreaming={turnStreaming}
            />
          )}

          {stream.phaseOrder.length > 0 && (
            <div className="meso-process-trace__phases">
              {stream.phaseOrder.map(phaseId => {
                const phase = stream.phases[phaseId]
                if (!phase) return null
                const custom = renderPhase?.(phase)
                if (custom !== undefined && custom !== null) {
                  return <div key={phaseId}>{custom}</div>
                }
                return (
                  <div key={phaseId}>
                    {renderDefaultPhase(phase, streaming)}
                  </div>
                )
              })}
            </div>
          )}

          {stream.resourceReadOrder.length > 0 && (
            <div className="meso-process-trace__resources">
              {stream.resourceReadOrder.map(id => {
                const rr = stream.resourceReads[id]
                if (!rr) return null
                return <ResourceReadBlock key={id} resourceRead={rr} />
              })}
            </div>
          )}

          {toolGroups.length > 0 && (
            <div className="meso-process-trace__tools">
              {toolGroups.map(group => (
                <div
                  key={group.key}
                  className={`meso-process-trace__tool-group${group.groupId ? ' meso-process-trace__tool-group--grouped' : ''}`}
                  data-group-id={group.groupId}
                  data-group-kind={group.groupKind}
                >
                  {group.groupId && (
                    <div className="meso-process-trace__tool-group-label">
                      {group.groupKind ?? 'group'}: {group.groupId}
                    </div>
                  )}
                  {group.ids.map(id => {
                    const tc = stream.toolCalls[id]
                    if (!tc) return null
                    const custom = renderToolCall?.(tc)
                    if (custom !== undefined && custom !== null) {
                      return <div key={id}>{custom}</div>
                    }
                    return (
                      <ToolCallBlock
                        key={id}
                        toolCall={tc}
                        onConfirm={onToolConfirm}
                        onCancel={onToolCancel}
                        simplify={simplify}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {workflowRuns.length > 0 && (
            renderWorkflow?.(stream) ?? <WorkflowTimeline runs={workflowRuns} />
          )}
        </div>
      )}
    </div>
  )
}
