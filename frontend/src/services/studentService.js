import api from './api'
export const getStudents = (params) => api.get('/api/students', { params })
export const getStudent = (id) => api.get(`/api/students/${id}`)
export const createStudent = (data) => api.post('/api/students', data)
export const updateStudent = (id, data) => api.put(`/api/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/api/students/${id}`)
export const checkoutStudent = (id) => api.put(`/api/students/${id}/checkout`)
export const bulkImport = (data) => api.post('/api/students/bulk', data)
