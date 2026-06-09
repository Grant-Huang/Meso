export interface FoldStateOptions {
    /** System-computed open state (auto-collapse result, streaming default, etc.) */
    system: boolean;
    /**
     * When true, resets any user override so the component follows `system` again.
     * Typically fired when a new conversation turn starts (streaming resets).
     * Default false.
     */
    resetOnTurnStart?: boolean;
}
export interface FoldState {
    /** Resolved open state: user intent takes priority over system default */
    open: boolean;
    /** Programmatically set open state and lock user intent */
    setOpen: (value: boolean) => void;
    /** Toggle between open/closed, locking user intent */
    toggle: () => void;
    /** Clear user intent, restoring system default */
    clearIntent: () => void;
    /** Whether the user has explicitly set an intent */
    hasUserIntent: boolean;
}
/**
 * Manages fold/collapse state that respects user intent over system defaults.
 *
 * Usage:
 *   const fold = useFoldState({ system: isStreaming })
 *   <button onClick={fold.toggle}>...</button>
 *   {fold.open && <Body />}
 */
export declare function useFoldState({ system, resetOnTurnStart, }: FoldStateOptions): FoldState;
