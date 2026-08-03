import { http } from './http'

export interface ProjectForm {
  projectName: string
  projectOwner: string
  plannedStartDate: string
  plannedEndDate: string
  budget: number
  summary: string
}

export const projectApi = {
  list: (params: Record<string, unknown>) => http.get('/project-applications', { params }),
  detail: (id: number) => http.get(`/project-applications/${id}`),
  create: (form: ProjectForm) => http.post('/project-applications', form),
  update: (id: number, form: ProjectForm) => http.put(`/project-applications/${id}`, form),
  remove: (id: number) => http.delete(`/project-applications/${id}`),
  submit: (id: number) => http.post(`/project-applications/${id}/submit`),
  withdraw: (id: number) => http.post(`/project-applications/${id}/withdraw`),
  close: (id: number) => http.post(`/project-applications/${id}/close`),
}
