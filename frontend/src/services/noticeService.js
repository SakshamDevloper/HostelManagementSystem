import api from './api'
export const getNotices = (params) => api.get('/api/notices', { params })
export const createNotice = (data) => api.post('/api/notices', data)
export const updateNotice = (id, data) => api.put(`/api/notices/${id}`, data)
export const deleteNotice = (id) => api.delete(`/api/notices/${id}`)
