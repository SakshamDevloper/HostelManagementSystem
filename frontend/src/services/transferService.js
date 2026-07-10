import api from './api'
export const getTransfers = (params) => api.get('/api/transfers', { params })
export const getTransfer = (id) => api.get(`/api/transfers/${id}`)
export const createTransfer = (data) => api.post('/api/transfers', data)
export const updateTransferStatus = (id, data) => api.put(`/api/transfers/${id}/status`, data)
