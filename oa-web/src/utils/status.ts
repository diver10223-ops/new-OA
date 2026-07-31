export type StatusType = 'success' | 'warning' | 'danger' | 'info'

const statusTypes: Record<string, StatusType> = {
  APPROVED: 'success',
  EFFECTIVE: 'success',
  PENDING: 'warning',
  SUBMITTED: 'warning',
  REJECTED: 'danger',
  CANCELLED: 'info',
  DRAFT: 'info',
}
const labels: Record<string, string> = { APPROVED:'已通过', EFFECTIVE:'已生效', PENDING:'审批中', SUBMITTED:'审批中', REJECTED:'已拒绝', CANCELLED:'已撤回', WITHDRAWN:'已撤回', DRAFT:'草稿' }
export function statusLabel(status: string): string { return labels[status] ?? status }

/** Shared mapping for consistent Element Plus status tags across business modules. */
export function statusType(status: string): StatusType {
  return statusTypes[status] ?? 'info'
}
