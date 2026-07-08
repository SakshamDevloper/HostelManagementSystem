import api from './api'
export const getComplaints = (params) => api.get('/api/complaints', { params })
export const createComplaint = (data) => api.post('/api/complaints', data)
export const updateComplaintStatus = (id, data) => api.put(`/api/complaints/${id}/status`, data)
export const addFeedback = (id, data) => api.put(`/api/complaints/${id}/feedback`, data)
