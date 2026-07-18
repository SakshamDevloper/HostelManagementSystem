import api from './api'
export const getMenu = (params) => api.get('/api/mess-menu', { params })
export const getWeekMenu = (params) => api.get('/api/mess-menu/week', { params })
export const createMenu = (data) => api.post('/api/mess-menu', data)
export const bulkCreateMenu = (data) => api.post('/api/mess-menu/bulk', data)
export const updateMenu = (id, data) => api.put(`/api/mess-menu/${id}`, data)
export const deleteMenu = (id) => api.delete(`/api/mess-menu/${id}`)
