import api from './api'
export const getVisitors = (params) => api.get('/api/visitors', { params })
export const createVisitor = (data) => api.post('/api/visitors', data)
export const checkoutVisitor = (id) => api.put(`/api/visitors/${id}/checkout`)
