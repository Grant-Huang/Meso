import type { SSEEvent } from './protocol'
import type { StreamState } from './streamState'

/**
 * Pure state machine reducer.
 * Apply one SSE event to the current StreamState and return the next state.
 * Does not mutate the input state.
 */
export function applyEvent(state: StreamState, event: SSEEvent): StreamState {
  switch (event.type) {
    case 'capabilities':
      return { ...state, availableCapabilities: event.payload }

    case 'memory':
      return { ...state, memorySnippets: event.payload.snippets }

    case 'memory_saved':
      return { ...state, memorySaved: [...state.memorySaved, event.payload] }

    case 'soul':
      return { ...state, activeSoul: event.payload }

    case 'skill_active':
      return { ...state, activeSkill: event.payload }

    case 'tool_call': {
      const { id, groupId, groupKind, risk, requires_confirm } = event.payload
      const needsConfirm = requires_confirm === true || risk === 'destructive' || risk === 'write'
      const status = needsConfirm ? 'awaiting_confirm' : 'pending'
      return {
        ...state,
        toolCallOrder: state.toolCallOrder.includes(id)
          ? state.toolCallOrder
          : [...state.toolCallOrder, id],
        toolCalls: {
          ...state.toolCalls,
          [id]: { call: event.payload, status, groupId, groupKind },
        },
      }
    }

    case 'tool_status': {
      const { id, status } = event.payload
      const existing = state.toolCalls[id]
      if (!existing) return state
      return {
        ...state,
        toolCalls: {
          ...state.toolCalls,
          [id]: { ...existing, status },
        },
      }
    }

    case 'tool_result': {
      const { tool_call_id } = event.payload
      const existing = state.toolCalls[tool_call_id]
      const status = event.payload.error ? 'error' : 'done'
      return {
        ...state,
        toolCalls: {
          ...state.toolCalls,
          [tool_call_id]: {
            call: existing?.call ?? { id: tool_call_id, name: '(unknown)', args: {} },
            result: event.payload,
            status,
            groupId: existing?.groupId,
            groupKind: existing?.groupKind,
          },
        },
      }
    }

    case 'resource_read': {
      const { id } = event.payload
      return {
        ...state,
        resourceReadOrder: state.resourceReadOrder.includes(id)
          ? state.resourceReadOrder
          : [...state.resourceReadOrder, id],
        resourceReads: {
          ...state.resourceReads,
          [id]: { read: event.payload, status: 'pending' },
        },
      }
    }

    case 'resource_content': {
      const { resource_read_id } = event.payload
      const existing = state.resourceReads[resource_read_id]
      const status = event.payload.error ? 'error' : 'done'
      return {
        ...state,
        resourceReads: {
          ...state.resourceReads,
          [resource_read_id]: {
            read: existing?.read ?? { id: resource_read_id, uri: '(unknown)' },
            content: event.payload,
            status,
          },
        },
      }
    }

    case 'think': {
      const { delta, done, phase_id } = event.payload
      if (phase_id) {
        const existingPhase = state.phases[phase_id]
        if (!existingPhase) return state
        return {
          ...state,
          phases: {
            ...state.phases,
            [phase_id]: {
              ...existingPhase,
              thinkContent: existingPhase.thinkContent + delta,
            },
          },
        }
      }
      return {
        ...state,
        thinkContent: state.thinkContent + delta,
        thinkDone: done ?? false,
      }
    }

    case 'phase': {
      const { id, name, state: phaseState, body, pinned_think, started_at, ended_at } = event.payload
      const existing = state.phases[id]
      return {
        ...state,
        phaseOrder: state.phaseOrder.includes(id)
          ? state.phaseOrder
          : [...state.phaseOrder, id],
        phases: {
          ...state.phases,
          [id]: {
            id,
            name,
            state: phaseState,
            thinkContent: existing?.thinkContent ?? '',
            pinnedThink: pinned_think ?? existing?.pinnedThink,
            body: body ?? existing?.body,
            startedAt: started_at ?? existing?.startedAt,
            endedAt: ended_at ?? existing?.endedAt,
          },
        },
      }
    }

    case 'text':
      return { ...state, textContent: state.textContent + event.payload.delta }

    case 'artifact': {
      const { id, lang, delta, done } = event.payload
      const existing = state.artifacts[id]
      const artifactOrder = state.artifactOrder.includes(id)
        ? state.artifactOrder
        : [...state.artifactOrder, id]
      return {
        ...state,
        artifactOrder,
        artifacts: {
          ...state.artifacts,
          [id]: {
            id,
            lang,
            content: (existing?.content ?? '') + delta,
            done: done ?? false,
          },
        },
      }
    }

    case 'workflow_node': {
      const { run_id, node_id, parent_id, name, state: nodeState, started_at, duration_ms, metadata } = event.payload
      const existingRun = state.workflowRuns[run_id] ?? { run_id, nodes: {}, nodeOrder: [] }
      const nodeOrder = existingRun.nodeOrder.includes(node_id)
        ? existingRun.nodeOrder
        : [...existingRun.nodeOrder, node_id]
      return {
        ...state,
        workflowRunOrder: state.workflowRunOrder.includes(run_id)
          ? state.workflowRunOrder
          : [...state.workflowRunOrder, run_id],
        workflowRuns: {
          ...state.workflowRuns,
          [run_id]: {
            run_id,
            nodes: {
              ...existingRun.nodes,
              [node_id]: { node_id, run_id, parent_id, name, state: nodeState, started_at, duration_ms, metadata },
            },
            nodeOrder,
          },
        },
      }
    }

    case 'done':
      return { ...state, status: 'done' }

    case 'error':
      return {
        ...state,
        status: 'error',
        errorMessage: event.payload.message,
        errorCode: event.payload.code ?? null,
      }

    case 'extension': {
      const { name } = event.payload
      return {
        ...state,
        extensions: {
          ...state.extensions,
          [name]: [...(state.extensions[name] ?? []), event],
        },
        extensionLog: [...state.extensionLog, event],
      }
    }

    default:
      return state
  }
}
