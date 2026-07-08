import api from './api'
export const getLeaves = (params) => api.get('/api/leaves', { params })
export const createLeave = (data) => api.post('/api/leaves', data)
export const updateLeaveStatus = (id, data) => api.put(`/api/leaves/${id}/status`, data)
