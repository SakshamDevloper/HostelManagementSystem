import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  loading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
    case 'USER_LOADED':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'AUTH_ERROR':
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      dispatch({ type: 'USER_LOADED', payload: data.user })
    } catch {
      dispatch({ type: 'AUTH_ERROR', payload: null })
    }
  }

  const login = async (email, password) => {
    dispatch({ type: 'LOADING' })
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch { }
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
