import { useState, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    try {
      const { data } = await getNotifications()
      setNotifications(data.data || [])
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch { }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('All marked as read')
    } catch { }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-ghost btn-sm gap-2">
            <CheckCheck size={16} /> Mark all read ({unread})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" icon={Bell} />
      ) : (
        <div className="space-y-1">
          {notifications.map(n => (
            <div key={n._id} className={`card border ${n.isRead ? 'bg-base-100 border-base-300' : 'bg-primary/5 border-primary/20'} shadow-sm`}>
              <div className="card-body p-3 flex-row items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? 'bg-base-300' : 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-base-content/60 mt-0.5">{n.message}</p>
                    <p className="text-xs text-base-content/40 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n._id)} className="btn btn-ghost btn-xs flex-shrink-0">Mark read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
