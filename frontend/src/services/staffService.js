import api from './api'
export const getStaff = (params) => api.get('/api/staff', { params })
export const createStaff = (data) => api.post('/api/staff', data)
export const updateStaff = (id, data) => api.put(`/api/staff/${id}`, data)
export const deleteStaff = (id) => api.delete(`/api/staff/${id}`)
