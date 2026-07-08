import api from './api'
export const login = (email, password) => api.post('/api/auth/login', { email, password })
export const logout = () => api.post('/api/auth/logout')
export const getMe = () => api.get('/api/auth/me')
export const updateProfile = (data) => api.put('/api/auth/profile', data)
export const changePassword = (data) => api.put('/api/auth/password', data)
