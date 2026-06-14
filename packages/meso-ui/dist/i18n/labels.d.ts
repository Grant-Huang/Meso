export type MesoLocale = 'zh-CN' | 'en-US';
export interface MesoLabels {
    statusRunning: string;
    statusDone: string;
    statusError: string;
    statusPending: string;
    statusWarning: string;
    processTraceSummary: string;
    processTraceExecuting: string;
    foldExpand: string;
    foldCollapse: string;
    toolConfirm: string;
    toolCancel: string;
    stageProgress: string;
    workflowProgress: string;
    emptyChat: string;
}
export declare const zhCNLabels: MesoLabels;
export declare const enUSLabels: MesoLabels;
export declare const defaultLabelsByLocale: Record<MesoLocale, MesoLabels>;
