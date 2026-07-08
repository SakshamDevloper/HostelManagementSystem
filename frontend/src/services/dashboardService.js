import api from './api'
export const getStats = () => api.get('/api/dashboard/stats')
export const getOccupancy = () => api.get('/api/dashboard/occupancy')
export const getRevenue = () => api.get('/api/dashboard/revenue')
export const getActivity = () => api.get('/api/dashboard/activity')
export const getUpcoming = () => api.get('/api/dashboard/upcoming')
