import { useState } from 'react'
import type { WorkflowRunState, WorkflowNodeRecord } from '@meso.ai/types'
import { StatusIcon } from '../StatusIcon'
import type { StatusIconStatus } from '../StatusIcon'
import './WorkflowTimeline.css'

export interface WorkflowTimelineProps {
  /** One or more workflow runs to render. Use workflowRunOrder for deterministic order. */
  runs: WorkflowRunState[]
  /** Show run_id label when multiple runs are present. Default true. */
  showRunId?: boolean
  /** When true, render nothing. Allows parent to hide timeline without unmounting. */
  hidden?: boolean
}

// ── Tree structure ──────────────────────────────────────────────────

type TreeItem =
  | { kind: 'node';     node: WorkflowNodeRecord; isLast: boolean }
  | { kind: 'parallel'; nodes: WorkflowNodeRecord[]; isLast: boolean }

function buildTree(run: WorkflowRunState): TreeItem[] {
  const { nodes, nodeOrder } = run

  // Map parent_id → children ids
  const childrenOf = new Map<string | null, string[]>()
  for (const id of nodeOrder) {
    const node = nodes[id]
    if (!node) continue
    const key = node.parent_id ?? null
    if (!childrenOf.has(key)) childrenOf.set(key, [])
    childrenOf.get(key)!.push(id)
  }

  // Any parent with 2+ children → those children are parallel siblings
  const parallelGroupOf = new Map<string, string[]>()
  for (const [, siblings] of childrenOf) {
    if (siblings.length > 1) {
      for (const id of siblings) parallelGroupOf.set(id, siblings)
    }
  }

  const result: TreeItem[] = []
  const seen = new Set<string>()

  for (const id of nodeOrder) {
    if (seen.has(id)) continue
    const node = nodes[id]
    if (!node) continue

    const siblings = parallelGroupOf.get(id)
    if (siblings) {
      const siblingNodes = siblings
        .map(sid => nodes[sid])
        .filter((n): n is WorkflowNodeRecord => !!n)
      for (const s of siblingNodes) seen.add(s.node_id)
      result.push({ kind: 'parallel', nodes: siblingNodes, isLast: false })
    } else {
      seen.add(id)
      result.push({ kind: 'node', node, isLast: false })
    }
  }

  if (result.length > 0) {
    result[result.length - 1] = { ...result[result.length - 1], isLast: true }
  }
  return result
}

// ── Shared helpers ──────────────────────────────────────────────────

function workflowNodeStateToIcon(state: WorkflowNodeRecord['state']): StatusIconStatus {
  switch (state) {
    case 'active': return 'running'
    case 'done': return 'done'
    case 'error': return 'error'
    case 'skipped': return 'warning'
  }
}

function NodeIcon({ state }: { state: WorkflowNodeRecord['state'] }) {
  return (
    <StatusIcon
      status={workflowNodeStateToIcon(state)}
      size={12}
      className={`meso-wf-node__icon meso-wf-node__icon--${state}`}
    />
  )
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// ── Sequential node row ─────────────────────────────────────────────

interface NodeRowProps {
  node: WorkflowNodeRecord
  isLast: boolean
}

function NodeRow({ node, isLast }: NodeRowProps) {
  const [expanded, setExpanded] = useState(false)
  const hasMetadata = node.metadata && Object.keys(node.metadata).length > 0

  return (
    <div className={`meso-wf-node meso-wf-node--${node.state}`}>
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
        {node.state === 'error' && !!node.metadata?.error && (
          <div className="meso-wf-node__error">{String(node.metadata.error)}</div>
        )}
        {expanded && hasMetadata && (
          <pre className="meso-wf-node__meta">{JSON.stringify(node.metadata, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}

// ── Parallel group ──────────────────────────────────────────────────

interface ParallelGroupProps {
  nodes: WorkflowNodeRecord[]
  isLast: boolean
}

function ParallelGroup({ nodes, isLast }: ParallelGroupProps) {
  return (
    <div className="meso-wf-parallel">
      {/* Branch cards */}
      <div className="meso-wf-parallel__row">
        {nodes.map((node, idx) => (
          <div key={node.node_id} className={`meso-wf-parallel__branch meso-wf-parallel__branch--${node.state}`}>
            <div className="meso-wf-parallel__branch-dot">
              <NodeIcon state={node.state} />
            </div>
            <div className="meso-wf-parallel__branch-body">
              <div className="meso-wf-parallel__branch-label">并行分支 {String.fromCharCode(65 + idx)}</div>
              <code className="meso-wf-node__name">{node.name}</code>
              {node.state === 'error' && !!node.metadata?.error && (
                <div className="meso-wf-node__error">{String(node.metadata.error)}</div>
              )}
              {node.duration_ms !== undefined && (
                <span className="meso-wf-node__duration" style={{ display: 'block', marginTop: 2 }}>
                  {formatDuration(node.duration_ms)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Merge connector + vertical line to next item */}
      {!isLast && <div className="meso-wf-parallel__merge" />}
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────

export function WorkflowTimeline({ runs, showRunId = true, hidden }: WorkflowTimelineProps) {
  if (runs.length === 0) return null
  if (hidden) return null
  const multiRun = runs.length > 1

  return (
    <div className="meso-wf" role="status" aria-label="工作流进度">
      {runs.map(run => {
        const items = buildTree(run)
        return (
          <div key={run.run_id} className="meso-wf-run">
            {multiRun && showRunId && (
              <div className="meso-wf-run__label">{run.run_id}</div>
            )}
            {items.map((item, idx) =>
              item.kind === 'parallel' ? (
                <ParallelGroup key={`parallel-${idx}`} nodes={item.nodes} isLast={item.isLast} />
              ) : (
                <NodeRow key={item.node.node_id} node={item.node} isLast={item.isLast} />
              )
            )}
          </div>
        )
      })}
    </div>
  )
}
