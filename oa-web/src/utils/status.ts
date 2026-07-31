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

/** Shared mapping for consistent Element Plus status tags across business modules. */
export function statusType(status: string): StatusType {
  return statusTypes[status] ?? 'info'
}
