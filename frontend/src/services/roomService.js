import api from './api'
export const getRooms = (params) => api.get('/api/rooms', { params })
export const getRoom = (id) => api.get(`/api/rooms/${id}`)
export const createRoom = (data) => api.post('/api/rooms', data)
export const updateRoom = (id, data) => api.put(`/api/rooms/${id}`, data)
export const deleteRoom = (id) => api.delete(`/api/rooms/${id}`)
export const allocateRoom = (id, data) => api.put(`/api/rooms/${id}/allocate`, data)
export const vacateRoom = (id, data) => api.put(`/api/rooms/${id}/vacate`, data)
export const updateInventory = (id, data) => api.put(`/api/rooms/${id}/inventory`, data)
