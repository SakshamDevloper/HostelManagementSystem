import { useState, useEffect } from 'react'
import { ArrowLeftRight, Plus, Search, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { getTransfers, createTransfer, updateTransferStatus } from '../services/transferService'
import { getRooms } from '../services/roomService'
import { getStudents } from '../services/studentService'

export default function RoomTransfersPage() {
  const { user } = useAuth()
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [rooms, setRooms] = useState([])
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ student: '', fromRoom: '', toRoom: '', reason: '' })

  const fetchTransfers = async () => {
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await getTransfers(params)
      setTransfers(data.data || [])
    } catch { toast.error('Failed to load transfers') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTransfers() }, [statusFilter])

  const openCreateModal = async () => {
    setShowModal(true)
    try {
      const [roomsRes, studentsRes] = await Promise.all([
        getRooms({ status: 'occupied' }),
        getStudents({ status: 'active', limit: 200 }),
      ])
      setRooms(roomsRes.data.data || [])
      setStudents(studentsRes.data.data || [])
    } catch { }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (form.fromRoom === form.toRoom) {
      return toast.error('Source and destination rooms must be different')
    }
    setSubmitting(true)
    try {
      await createTransfer(form)
      toast.success('Transfer request created')
      setShowModal(false)
      setForm({ student: '', fromRoom: '', toRoom: '', reason: '' })
      fetchTransfers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create transfer') }
    finally { setSubmitting(false) }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTransferStatus(id, { status })
      toast.success(`Transfer ${status}`)
      fetchTransfers()
    } catch (err) { toast.error('Failed to update transfer') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  const statusBadge = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Room Transfers</h1>
        {(user?.role === 'admin' || user?.role === 'student') && (
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={16} /> New Transfer
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select className="select select-bordered select-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {transfers.length === 0 ? (
        <EmptyState
          title="No transfers found"
          description="Room transfers let students move between rooms"
          action={(user?.role === 'admin' || user?.role === 'student') ? <button onClick={openCreateModal} className="btn btn-primary btn-sm"><Plus size={16} /> New Transfer</button> : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Student</th>
                <th>From Room</th>
                <th>To Room</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(t => (
                <tr key={t._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {t.student?.user?.photo ? (
                        <div className="avatar">
                          <div className="w-7 rounded-full">
                            <img src={t.student.user.photo} alt="" />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-7 h-7 text-xs">
                            <span>{t.student?.user?.name?.charAt(0) || 'S'}</span>
                          </div>
                        </div>
                      )}
                      <span className="text-sm font-medium">{t.student?.user?.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-sm badge-ghost">{t.fromRoom?.roomNumber || '-'}</span></td>
                  <td><span className="badge badge-sm badge-ghost">{t.toRoom?.roomNumber || '-'}</span></td>
                  <td className="text-xs text-base-content/60 max-w-[200px] truncate">{t.reason || '-'}</td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge[t.status] || 'badge-ghost'}`}>{t.status}</span>
                  </td>
                  <td className="text-xs text-base-content/60">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    {t.status === 'pending' && user?.role === 'admin' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleStatusUpdate(t._id, 'approved')} className="btn btn-ghost btn-xs btn-square text-success" title="Approve">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => handleStatusUpdate(t._id, 'rejected')} className="btn btn-ghost btn-xs btn-square text-error" title="Reject">
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Room Transfer">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Student</span></label>
            <select required className="select select-bordered select-sm" value={form.student} onChange={e => {
              const s = students.find(s => s._id === e.target.value)
              setForm({ ...form, student: e.target.value, fromRoom: s?.room?._id || '' })
            }}>
              <option value="">Select student...</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId}) - Room {s.room?.roomNumber || 'N/A'}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">From Room</span></label>
            <input className="input input-bordered input-sm" value={form.fromRoom ? rooms.find(r => r._id === form.fromRoom)?.roomNumber || 'Auto-detected' : 'Auto'} disabled />
          </div>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Destination Room</span></label>
            <select required className="select select-bordered select-sm" value={form.toRoom} onChange={e => setForm({ ...form, toRoom: e.target.value })}>
              <option value="">Select destination room...</option>
              {rooms.filter(r => r._id !== form.fromRoom && r.status !== 'maintenance').map(r => (
                <option key={r._id} value={r._id}>{r.roomNumber} ({r.roomType}) - {r.capacity - (r.occupants?.length || 0)} slots free</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Reason for Transfer</span></label>
            <textarea className="textarea textarea-bordered text-sm" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Why does the student want to transfer?" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Submitting...' : 'Request Transfer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
