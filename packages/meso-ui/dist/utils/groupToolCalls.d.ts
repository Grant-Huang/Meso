import type { StreamState } from '../runtime';
export interface ToolCallGroup {
    key: string;
    groupId?: string;
    groupKind?: string;
    ids: string[];
}
/** Group tool calls by groupId/groupKind; ungrouped calls each get their own group. */
export declare function groupToolCalls(stream: StreamState): ToolCallGroup[];
