import api from './api'
export const getAttendance = (params) => api.get('/api/attendance', { params })
export const markAttendance = (data) => api.post('/api/attendance', data)
export const bulkMarkAttendance = (data) => api.post('/api/attendance/bulk', data)
export const getAttendanceSummary = (params) => api.get('/api/attendance/summary', { params })
