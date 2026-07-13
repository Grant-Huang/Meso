import type { StreamState } from '../../runtime';
/**
 * Render item produced by walking eventLog. Consecutive text deltas are
 * coalesced into a single text run so prose flows naturally and Markdown can
 * be rendered on a complete run, while tool/artifact cards break the runs to
 * preserve interleaving (context-blend).
 */
export type BlendItem = {
    kind: 'text';
    key: string;
    text: string;
} | {
    kind: 'tool';
    key: string;
    id: string;
} | {
    kind: 'artifact';
    key: string;
    id: string;
} | {
    kind: 'resource';
    key: string;
    id: string;
} | {
    kind: 'extension';
    key: string;
    index: number;
};
/**
 * Walk the stream's eventLog and produce a flat list of blend items that
 * preserve the original arrival order while coalescing consecutive text
 * deltas and deduplicating artifact events.
 *
 * Why dedup artifacts: a single artifact emits multiple `artifact` events
 * (one per streaming delta plus a final done:true). Each event lands in
 * eventLog, so without dedup the same `artifact-<id>` key would be produced
 * multiple times and React warns about duplicate keys. The artifact's
 * accumulated content already lives in `stream.artifacts[id]`, so a single
 * panel per id is correct.
 */
export declare function buildBlendItems(stream: StreamState, hiddenArtifactLangs?: string[]): BlendItem[];
