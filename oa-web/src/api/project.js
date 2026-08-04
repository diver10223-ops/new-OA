import { http } from './http';
export const projectApi = {
    list: (params) => http.get('/project-applications', { params }),
    detail: (id) => http.get(`/project-applications/${id}`),
    create: (form) => http.post('/project-applications', form),
    update: (id, form) => http.put(`/project-applications/${id}`, form),
    remove: (id) => http.delete(`/project-applications/${id}`),
    submit: (id) => http.post(`/project-applications/${id}/submit`),
    withdraw: (id) => http.post(`/project-applications/${id}/withdraw`),
    close: (id) => http.post(`/project-applications/${id}/close`),
};
