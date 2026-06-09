import { useEffect, useRef, useState } from 'react'

export interface FoldStateOptions {
  /** System-computed open state (auto-collapse result, streaming default, etc.) */
  system: boolean
  /**
   * When true, resets any user override so the component follows `system` again.
   * Typically fired when a new conversation turn starts (streaming resets).
   * Default false.
   */
  resetOnTurnStart?: boolean
}

export interface FoldState {
  /** Resolved open state: user intent takes priority over system default */
  open: boolean
  /** Programmatically set open state and lock user intent */
  setOpen: (value: boolean) => void
  /** Toggle between open/closed, locking user intent */
  toggle: () => void
  /** Clear user intent, restoring system default */
  clearIntent: () => void
  /** Whether the user has explicitly set an intent */
  hasUserIntent: boolean
}

/**
 * Manages fold/collapse state that respects user intent over system defaults.
 *
 * Usage:
 *   const fold = useFoldState({ system: isStreaming })
 *   <button onClick={fold.toggle}>...</button>
 *   {fold.open && <Body />}
 */
export function useFoldState({
  system,
  resetOnTurnStart = false,
}: FoldStateOptions): FoldState {
  const [userIntent, setUserIntent] = useState<boolean | null>(null)
  const prevSystem = useRef(system)

  useEffect(() => {
    if (resetOnTurnStart && !prevSystem.current && system) {
      setUserIntent(null)
    }
    prevSystem.current = system
  }, [system, resetOnTurnStart])

  const open = userIntent !== null ? userIntent : system

  return {
    open,
    setOpen: (value: boolean) => setUserIntent(value),
    toggle: () => setUserIntent(v => (v !== null ? !v : !system)),
    clearIntent: () => setUserIntent(null),
    hasUserIntent: userIntent !== null,
  }
}
