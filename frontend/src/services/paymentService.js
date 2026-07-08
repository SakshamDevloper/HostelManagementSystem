import api from './api'
export const getPayments = (params) => api.get('/api/payments', { params })
export const getPayment = (id) => api.get(`/api/payments/${id}`)
export const createPayment = (data) => api.post('/api/payments', data)
export const updatePayment = (id, data) => api.put(`/api/payments/${id}`, data)
export const getDues = () => api.get('/api/payments/dues')
export const getStudentPayments = (studentId) => api.get(`/api/payments/student/${studentId}`)
