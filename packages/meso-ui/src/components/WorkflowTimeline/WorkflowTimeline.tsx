import { useState } from 'react'
import type { WorkflowRunState, WorkflowNodeRecord } from '@meso/types'
import './WorkflowTimeline.css'

export interface WorkflowTimelineProps {
  /** One or more workflow runs to render. Use workflowRunOrder for deterministic order. */
  runs: WorkflowRunState[]
  /** Show run_id label when multiple runs are present. Default true. */
  showRunId?: boolean
}

function NodeIcon({ state }: { state: WorkflowNodeRecord['state'] }) {
  if (state === 'done') {
    return (
      <svg className="meso-wf-node__icon meso-wf-node__icon--done" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1.5,6.5 4.5,9.5 10.5,3"/>
      </svg>
    )
  }
  if (state === 'error') {
    return (
      <svg className="meso-wf-node__icon meso-wf-node__icon--error" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="2" y1="2" x2="10" y2="10"/>
        <line x1="10" y1="2" x2="2" y2="10"/>
      </svg>
    )
  }
  if (state === 'skipped') {
    return (
      <svg className="meso-wf-node__icon meso-wf-node__icon--skipped" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="2" y1="6" x2="10" y2="6"/>
      </svg>
    )
  }
  // active
  return <span className="meso-wf-node__spinner" aria-hidden="true" />
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

interface NodeRowProps {
  node: WorkflowNodeRecord
  depth: number
  isLast: boolean
}

function NodeRow({ node, depth, isLast }: NodeRowProps) {
  const [expanded, setExpanded] = useState(false)
  const hasMetadata = node.metadata && Object.keys(node.metadata).length > 0

  return (
    <div className={`meso-wf-node meso-wf-node--${node.state}`} style={{ '--meso-wf-depth': depth } as React.CSSProperties}>
      <div className="meso-wf-node__track">
        <div className="meso-wf-node__dot">
          <NodeIcon state={node.state} />
        </div>
        {!isLast && <div className="meso-wf-node__line" />}
      </div>
      <div className="meso-wf-node__body">
        <div className="meso-wf-node__header">
          <code className="meso-wf-node__name">{node.name}</code>
          {node.duration_ms !== undefined && (
            <span className="meso-wf-node__duration">{formatDuration(node.duration_ms)}</span>
          )}
          {hasMetadata && (
            <button
              className="meso-wf-node__expand"
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? '收起详情' : '展开详情'}
            >
              <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : undefined }}>
                <polyline points="2,3.5 5,6.5 8,3.5"/>
              </svg>
            </button>
          )}
        </div>
        {expanded && hasMetadata && (
          <pre className="meso-wf-node__meta">{JSON.stringify(node.metadata, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}

function buildTree(run: WorkflowRunState): Array<{ node: WorkflowNodeRecord; depth: number }> {
  const { nodes, nodeOrder } = run
  const depthMap = new Map<string, number>()
  const result: Array<{ node: WorkflowNodeRecord; depth: number }> = []

  for (const id of nodeOrder) {
    const node = nodes[id]
    if (!node) continue
    const depth = node.parent_id ? (depthMap.get(node.parent_id) ?? 0) + 1 : 0
    depthMap.set(id, depth)
    result.push({ node, depth })
  }
  return result
}

export function WorkflowTimeline({ runs, showRunId = true }: WorkflowTimelineProps) {
  if (runs.length === 0) return null
  const multiRun = runs.length > 1

  return (
    <div className="meso-wf" role="status" aria-label="工作流进度">
      {runs.map(run => {
        const rows = buildTree(run)
        return (
          <div key={run.run_id} className="meso-wf-run">
            {multiRun && showRunId && (
              <div className="meso-wf-run__label">{run.run_id}</div>
            )}
            {rows.map(({ node, depth }, idx) => (
              <NodeRow
                key={node.node_id}
                node={node}
                depth={depth}
                isLast={idx === rows.length - 1}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
