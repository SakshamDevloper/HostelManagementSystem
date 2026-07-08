import { useState, useEffect } from 'react'
import { Activity, Search, Filter } from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import api from '../services/api'

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ action: '', resource: '' })

  const fetchLogs = async () => {
    try {
      const params = { page, limit: 30, ...filters }
      const { data } = await api.get('/api/audit', { params })
      setLogs(data.data || [])
      setTotal(data.total || 0)
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLogs() }, [page, filters])

  const actionColors = {
    create: 'text-success',
    update: 'text-info',
    delete: 'text-error',
    login: 'text-primary',
    checkout: 'text-warning',
    allocate: 'text-info',
    updateStatus: 'text-secondary',
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity Audit Log</h1>
        <span className="text-xs text-base-content/60">{total} entries</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select className="select select-bordered select-xs" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })}>
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="checkout">Checkout</option>
          <option value="allocate">Allocate</option>
        </select>
        <select className="select select-bordered select-xs" value={filters.resource} onChange={e => setFilters({ ...filters, resource: e.target.value })}>
          <option value="">All Resources</option>
          <option value="student">Student</option>
          <option value="room">Room</option>
          <option value="payment">Payment</option>
          <option value="complaint">Complaint</option>
          <option value="notice">Notice</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <EmptyState title="No activity logs" />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm table-zebra">
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>Details</th><th>IP</th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td className="text-xs text-base-content/60">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="text-sm">{log.user?.name || 'System'}</td>
                  <td><span className={`text-xs font-medium capitalize ${actionColors[log.action] || ''}`}>{log.action}</span></td>
                  <td className="text-sm capitalize">{log.resource}</td>
                  <td className="text-xs text-base-content/60 max-w-xs truncate">{JSON.stringify(log.details)?.slice(0, 60) || '-'}</td>
                  <td className="text-xs font-mono text-base-content/40">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 30 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-ghost btn-sm">Previous</button>
          <span className="text-sm self-center">Page {page} of {Math.ceil(total / 30)}</span>
          <button disabled={page >= Math.ceil(total / 30)} onClick={() => setPage(p => p + 1)} className="btn btn-ghost btn-sm">Next</button>
        </div>
      )}
    </div>
  )
}
