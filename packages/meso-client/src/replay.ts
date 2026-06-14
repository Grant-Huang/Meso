import {
  parseSSELine,
  applyEvent,
  createInitialStreamState,
  type StreamState,
} from '@meso.ai/types'

/** Replay a fixture string (one SSE line per row) into a final StreamState. */
export function replayTurn(fixture: string): StreamState {
  const lines = fixture.split('\n')
  return lines.reduce<StreamState>(
    (state, line) => {
      const event = parseSSELine(line)
      return event ? applyEvent(state, event) : state
    },
    { ...createInitialStreamState(), status: 'streaming' },
  )
}
