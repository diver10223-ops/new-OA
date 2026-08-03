import { http } from './http'

export interface LeaveForm { leaveType: string; startTime: string; endTime: string; reason: string }
export const leaveApi = {
  list: (params: Record<string, unknown>) => http.get('/leave-applications', { params }),
  detail: (id: number) => http.get(`/leave-applications/${id}`),
  create: (form: LeaveForm) => http.post('/leave-applications', form),
  update: (id: number, form: LeaveForm) => http.put(`/leave-applications/${id}`, form),
  remove: (id: number) => http.delete(`/leave-applications/${id}`),
  submit: (id: number) => http.post(`/leave-applications/${id}/submit`),
  withdraw: (id: number) => http.post(`/leave-applications/${id}/withdraw`),
}
export const approvalApi = {
  tasks: (completed: boolean, params = {}) => http.get(`/approval/tasks/${completed ? 'completed' : 'pending'}`, { params }),
  detail: (id: number) => http.get(`/approval/instances/${id}`),
  decide: (id: number, approve: boolean, comment: string) => http.post(`/approval/tasks/${id}/${approve ? 'approve' : 'reject'}`, { comment }),
}
