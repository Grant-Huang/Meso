import type { SSEEvent } from './protocol'
import type { StreamState } from './streamState'

/**
 * Extract unique ID from event for logging purposes.
 */
function extractEventId(event: SSEEvent): string {
  const payload = event.payload as Record<string, unknown>
  switch (event.type) {
    case 'tool_call':
      return (payload.id as string) ?? 'unknown'
    case 'tool_result':
      return (payload.tool_call_id as string) ?? 'unknown'
    case 'resource_read':
      return (payload.id as string) ?? 'unknown'
    case 'resource_content':
      return (payload.resource_read_id as string) ?? 'unknown'
    case 'artifact':
      return (payload.id as string) ?? 'unknown'
    case 'phase':
      return (payload.id as string) ?? 'unknown'
    case 'workflow_node':
      return (payload.node_id as string) ?? 'unknown'
    case 'text':
      return `text-${extractEventMetadata(event).textChunkIndex}`
    case 'extension':
      return `ext-${(payload.name as string) ?? 'unknown'}`
    default:
      return event.type
  }
}

/**
 * Extract metadata and state for event logging.
 */
function extractEventMetadata(event: SSEEvent): {
  textChunkIndex: number
  [key: string]: unknown
} {
  const payload = event.payload as Record<string, unknown>
  return {
    textChunkIndex: 0, // will be updated when processing text events
    ...payload,
  }
}

/**
 * Record event to eventLog and handle special cases (text chunks).
 */
function recordEvent(
  nextState: StreamState,
  event: SSEEvent,
  eventId: string,
): StreamState {
  const eventEntry = {
    timestamp: nextState.eventLog.length,
    type: event.type as SSEEvent['type'],
    id: eventId,
    data: (event.payload as Record<string, unknown>) ?? {},
  }

  // Special handling for text events: also track in textChunks
  if (event.type === 'text' && typeof (event.payload as any)?.delta === 'string') {
    const delta = (event.payload as any).delta
    const textChunkId = `text-${nextState.textChunks.length}`
    return {
      ...nextState,
      eventLog: [...nextState.eventLog, { ...eventEntry, id: textChunkId }],
      textChunks: [
        ...nextState.textChunks,
        {
          id: textChunkId,
          delta,
          position: nextState.eventLog.length,
        },
      ],
    }
  }

  return {
    ...nextState,
    eventLog: [...nextState.eventLog, eventEntry],
  }
}

/**
 * Pure state machine reducer.
 * Apply one SSE event to the current StreamState and return the next state.
 * Does not mutate the input state.
 *
 * Supports narration field: if any event payload has narration?: string,
 * it is automatically converted to a text event and applied first.
 * This enables "who executes, who describes" design pattern.
 */
export function applyEvent(state: StreamState, event: SSEEvent): StreamState {
  // ── Auto-forward narration → text (self-describing events) ──
  // If the event carries narration (orchestrator's context-aware description),
  // emit it as a text event before processing the event itself.
  const payload = event.payload as Record<string, unknown>
  if (payload && typeof payload.narration === 'string' && payload.narration.length > 0) {
    state = applyEvent(state, {
      type: 'text',
      schema_version: '1.0',
      payload: { delta: payload.narration + '\n\n' },
    })
  }

  let nextState: StreamState

  switch (event.type) {
    case 'capabilities':
      nextState = { ...state, availableCapabilities: event.payload }
      break

    case 'memory':
      nextState = { ...state, memorySnippets: event.payload.snippets }
      break

    case 'memory_saved':
      nextState = { ...state, memorySaved: [...state.memorySaved, event.payload] }
      break

    case 'soul':
      nextState = { ...state, activeSoul: event.payload }
      break

    case 'skill_active':
      nextState = { ...state, activeSkill: event.payload }
      break

    case 'tool_call': {
      const { id, groupId, groupKind, risk, requires_confirm } = event.payload
      const needsConfirm = requires_confirm === true || risk === 'destructive' || risk === 'write'
      const status = needsConfirm ? 'awaiting_confirm' : 'pending'
      nextState = {
        ...state,
        toolCallOrder: state.toolCallOrder.includes(id)
          ? state.toolCallOrder
          : [...state.toolCallOrder, id],
        toolCalls: {
          ...state.toolCalls,
          [id]: { call: event.payload, status, groupId, groupKind },
        },
      }
      break
    }

    case 'tool_status': {
      const { id, status } = event.payload
      const existing = state.toolCalls[id]
      if (!existing) return state
      nextState = {
        ...state,
        toolCalls: {
          ...state.toolCalls,
          [id]: { ...existing, status },
        },
      }
      break
    }

    case 'tool_result': {
      const { tool_call_id } = event.payload
      const existing = state.toolCalls[tool_call_id]
      const status = event.payload.error ? 'error' : 'done'
      nextState = {
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
      break
    }

    case 'resource_read': {
      const { id } = event.payload
      nextState = {
        ...state,
        resourceReadOrder: state.resourceReadOrder.includes(id)
          ? state.resourceReadOrder
          : [...state.resourceReadOrder, id],
        resourceReads: {
          ...state.resourceReads,
          [id]: { read: event.payload, status: 'pending' },
        },
      }
      break
    }

    case 'resource_content': {
      const { resource_read_id } = event.payload
      const existing = state.resourceReads[resource_read_id]
      const status = event.payload.error ? 'error' : 'done'
      nextState = {
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
      break
    }

    case 'think': {
      const { delta, done, phase_id } = event.payload
      if (phase_id) {
        const existingPhase = state.phases[phase_id]
        if (!existingPhase) return state
        nextState = {
          ...state,
          phases: {
            ...state.phases,
            [phase_id]: {
              ...existingPhase,
              thinkContent: existingPhase.thinkContent + delta,
            },
          },
        }
      } else {
        nextState = {
          ...state,
          thinkContent: state.thinkContent + delta,
          thinkDone: done ?? false,
        }
      }
      break
    }

    case 'phase': {
      const { id, name, state: phaseState, body, pinned_think, started_at, ended_at } = event.payload
      const existing = state.phases[id]
      nextState = {
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
      break
    }

    case 'text': {
      nextState = { ...state, textContent: state.textContent + event.payload.delta }
      break
    }

    case 'artifact': {
      const { id, lang, delta, done } = event.payload
      const existing = state.artifacts[id]
      const artifactOrder = state.artifactOrder.includes(id)
        ? state.artifactOrder
        : [...state.artifactOrder, id]
      nextState = {
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
      break
    }

    case 'workflow_node': {
      const { run_id, node_id, parent_id, name, state: nodeState, started_at, duration_ms, metadata } = event.payload
      const existingRun = state.workflowRuns[run_id] ?? { run_id, nodes: {}, nodeOrder: [] }
      const nodeOrder = existingRun.nodeOrder.includes(node_id)
        ? existingRun.nodeOrder
        : [...existingRun.nodeOrder, node_id]
      nextState = {
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
      break
    }

    case 'done':
      nextState = { ...state, status: 'done' }
      break

    case 'error':
      nextState = {
        ...state,
        status: 'error',
        errorMessage: event.payload.message,
        errorCode: event.payload.code ?? null,
      }
      break

    case 'extension': {
      const { name } = event.payload
      nextState = {
        ...state,
        extensions: {
          ...state.extensions,
          [name]: [...(state.extensions[name] ?? []), event],
        },
        extensionLog: [...state.extensionLog, event],
      }
      break
    }

    default:
      return state
  }

  // Record event to eventLog and handle textChunks
  const eventId = extractEventId(event)
  return recordEvent(nextState, event, eventId)
}
