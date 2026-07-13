import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Moon, Sun, LogOut, User, Settings, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useSocket } from '../../context/SocketContext'
import api from '../../services/api'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/api/notifications/unread-count')
      setUnreadCount(data.count)
    } catch { }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  useEffect(() => {
    if (!socket) return
    const handler = () => { fetchUnreadCount() }
    const urgentHandler = () => { fetchUnreadCount() }
    socket.on('notification:new', handler)
    socket.on('announcement:urgent', urgentHandler)
    return () => {
      socket.off('notification:new', handler)
      socket.off('announcement:urgent', urgentHandler)
    }
  }, [socket, fetchUnreadCount])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = async (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    try {
      const [studentsRes] = await Promise.all([
        api.get(`/api/students?search=${q}&limit=5`),
      ])
      setSearchResults(studentsRes.data.data || [])
    } catch { setSearchResults([]) }
  }

  const openNotifications = async () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      try {
        const { data } = await api.get('/api/notifications')
        setNotifications(data.data || [])
      } catch { }
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { }
  }

  return (
    <header className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={onMenuClick} className="btn btn-ghost btn-sm btn-square lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-semibold truncate">Hostel Management</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden md:flex items-center">
          <button onClick={() => setShowSearch(!showSearch)} className="btn btn-ghost btn-sm text-base-content/60">
            <Search size={16} />
            <span className="text-xs ml-1 hidden lg:inline">Search (Ctrl+K)</span>
          </button>
        </div>

        <button onClick={() => setShowSearch(true)} className="btn btn-ghost btn-sm btn-square md:hidden">
          <Search size={18} />
        </button>

        {showSearch && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-16 sm:pt-20" onClick={() => { setShowSearch(false); setSearchResults([]) }}>
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg mx-3 p-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 border-b border-base-300 pb-3">
                <Search size={18} className="text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search students, rooms, staff..."
                  className="input input-ghost w-full text-sm focus:outline-none"
                  value={searchQuery}
                  onChange={handleSearch}
                  autoFocus
                />
                <kbd className="text-xs text-base-content/40 border border-base-300 px-1.5 py-0.5 rounded hidden sm:inline">ESC</kbd>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                  {searchResults.map(student => (
                    <button
                      key={student._id}
                      className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg w-full text-left"
                      onClick={() => { navigate(`/students/${student._id}`); setShowSearch(false) }}
                    >
                      {student.user?.photo ? (
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img src={student.user.photo} alt="" />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-8 h-8 text-xs">
                            <span>{student.user?.name?.charAt(0) || 'S'}</span>
                          </div>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{student.user?.name}</p>
                        <p className="text-xs text-base-content/60 truncate">{student.studentId} — {student.room?.roomNumber || 'No room'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={toggleTheme} className="btn btn-ghost btn-sm btn-square">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="dropdown dropdown-end">
          <button onClick={openNotifications} className="btn btn-ghost btn-sm btn-square relative">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="badge badge-error badge-xs absolute -top-0.5 -right-0.5">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="dropdown-content card card-compact bg-base-100 shadow-xl border border-base-300 w-72 sm:w-80 mt-2 right-0">
              <div className="card-body p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button onClick={markAllRead} className="btn btn-ghost btn-xs text-primary">Mark all read</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {notifications.length === 0 && (
                    <p className="text-xs text-base-content/50 text-center py-4">No notifications</p>
                  )}
                  {notifications.map(n => (
                    <button
                      key={n._id}
                      className={`flex items-start gap-2 p-2 rounded-lg w-full text-left text-sm ${n.isRead ? '' : 'bg-primary/5'}`}
                      onClick={() => navigate(n.link || '#')}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-base-300' : 'bg-primary'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{n.title}</p>
                        <p className="text-xs text-base-content/60 truncate">{n.message}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost btn-sm btn-circle">
            {user?.photo ? (
              <div className="avatar">
                <div className="w-7 rounded-full">
                  <img src={user.photo} alt="" />
                </div>
              </div>
            ) : (
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-7 h-7 text-xs">
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
              </div>
            )}
          </button>
          <div className="dropdown-content card card-compact bg-base-100 shadow-xl border border-base-300 w-48 mt-2 right-0">
            <div className="card-body p-2">
              <div className="px-2 py-1 text-xs text-base-content/60 truncate">{user?.email}</div>
              <button onClick={() => navigate('/profile')} className="btn btn-ghost btn-sm justify-start gap-2">
                <User size={14} /> Profile
              </button>
              <button onClick={() => navigate('/settings')} className="btn btn-ghost btn-sm justify-start gap-2">
                <Settings size={14} /> Settings
              </button>
              <div className="divider my-1" />
              <button onClick={logout} className="btn btn-ghost btn-sm justify-start gap-2 text-error">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
