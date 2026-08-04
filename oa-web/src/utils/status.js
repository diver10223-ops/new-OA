const statusTypes = {
    APPROVED: 'success',
    EFFECTIVE: 'success',
    ESTABLISHED: 'success',
    CLOSED: 'info',
    PENDING: 'warning',
    SUBMITTED: 'warning',
    REJECTED: 'danger',
    CANCELLED: 'info',
    DRAFT: 'info',
};
const labels = { APPROVED: '已通过', EFFECTIVE: '已生效', ESTABLISHED: '已立项', CLOSED: '已结项', PENDING: '审批中', SUBMITTED: '审批中', REJECTED: '已拒绝', CANCELLED: '已撤回', WITHDRAWN: '已撤回', DRAFT: '草稿' };
export function statusLabel(status) { return labels[status] ?? status; }
/** Shared mapping for consistent Element Plus status tags across business modules. */
export function statusType(status) {
    return statusTypes[status] ?? 'info';
}
