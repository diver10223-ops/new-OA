import { http } from './http';
export const leaveApi = {
    list: (params) => http.get('/leave-applications', { params }),
    detail: (id) => http.get(`/leave-applications/${id}`),
    create: (form) => http.post('/leave-applications', form),
    update: (id, form) => http.put(`/leave-applications/${id}`, form),
    remove: (id) => http.delete(`/leave-applications/${id}`),
    submit: (id) => http.post(`/leave-applications/${id}/submit`),
    withdraw: (id) => http.post(`/leave-applications/${id}/withdraw`),
};
export const approvalApi = {
    tasks: (completed, params = {}) => http.get(`/approval/tasks/${completed ? 'completed' : 'pending'}`, { params }),
    detail: (id) => http.get(`/approval/instances/${id}`),
    decide: (id, approve, comment) => http.post(`/approval/tasks/${id}/${approve ? 'approve' : 'reject'}`, { comment }),
};
