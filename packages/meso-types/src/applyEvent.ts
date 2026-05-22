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

    case 'stage': {
      const { name, state: stageState } = event.payload
      return {
        ...state,
        stages: [
          ...state.stages.filter(s => s.name !== name),
          { name, state: stageState },
        ],
      }
    }

    case 'memory':
      return { ...state, memorySnippets: event.payload.snippets }

    case 'memory_saved':
      return { ...state, memorySaved: [...state.memorySaved, event.payload] }

    case 'soul':
      return { ...state, activeSoul: event.payload }

    case 'skill_active':
      return { ...state, activeSkill: event.payload }

    case 'tool_call': {
      const { id } = event.payload
      return {
        ...state,
        toolCallOrder: state.toolCallOrder.includes(id)
          ? state.toolCallOrder
          : [...state.toolCallOrder, id],
        toolCalls: {
          ...state.toolCalls,
          [id]: { call: event.payload, status: 'pending' },
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

    case 'think':
      return {
        ...state,
        thinkContent: state.thinkContent + event.payload.delta,
        thinkDone: event.payload.done ?? false,
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

    case 'done':
      return { ...state, status: 'done' }

    case 'error':
      return {
        ...state,
        status: 'error',
        errorMessage: event.payload.message,
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
