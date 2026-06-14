export type MesoLocale = 'zh-CN' | 'en-US'

export interface MesoLabels {
  statusRunning: string
  statusDone: string
  statusError: string
  statusPending: string
  statusWarning: string
  processTraceSummary: string
  processTraceExecuting: string
  foldExpand: string
  foldCollapse: string
  toolConfirm: string
  toolCancel: string
  stageProgress: string
  workflowProgress: string
  emptyChat: string
}

export const zhCNLabels: MesoLabels = {
  statusRunning: '进行中',
  statusDone: '完成',
  statusError: '失败',
  statusPending: '等待',
  statusWarning: '警告',
  processTraceSummary: '执行过程',
  processTraceExecuting: '执行中',
  foldExpand: '展开',
  foldCollapse: '折叠',
  toolConfirm: '确认',
  toolCancel: '取消',
  stageProgress: '处理进度',
  workflowProgress: '工作流进度',
  emptyChat: '发送消息开始对话',
}

export const enUSLabels: MesoLabels = {
  statusRunning: 'Running',
  statusDone: 'Done',
  statusError: 'Failed',
  statusPending: 'Pending',
  statusWarning: 'Warning',
  processTraceSummary: 'Execution trace',
  processTraceExecuting: 'Executing',
  foldExpand: 'Expand',
  foldCollapse: 'Collapse',
  toolConfirm: 'Confirm',
  toolCancel: 'Cancel',
  stageProgress: 'Progress',
  workflowProgress: 'Workflow progress',
  emptyChat: 'Send a message to start',
}

export const defaultLabelsByLocale: Record<MesoLocale, MesoLabels> = {
  'zh-CN': zhCNLabels,
  'en-US': enUSLabels,
}
