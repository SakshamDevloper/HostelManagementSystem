import { useState, useEffect } from 'react'
import { Plus, CalendarClock } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { getLeaves, createLeave, updateLeaveStatus } from '../services/leaveService'

const statusColors = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-error', expired: 'badge-ghost' }

export default function LeavesPage() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '', destination: '', guardianContact: '' })

  const canManage = user?.role === 'admin' || user?.role === 'staff'

  const fetchLeaves = async () => {
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const { data } = await getLeaves(params)
      setLeaves(data.data || [])
    } catch { toast.error('Failed to load leaves') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeaves() }, [filterStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createLeave(form)
      toast.success('Leave request submitted')
      setShowModal(false)
      setForm({ fromDate: '', toDate: '', reason: '', destination: '', guardianContact: '' })
      fetchLeaves()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit') }
  }

  const handleStatus = async (id, status) => {
    try {
      await updateLeaveStatus(id, { status })
      toast.success(`Leave ${status}`)
      fetchLeaves()
    } catch (err) { toast.error('Failed to update') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Leave / Outpass</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> Apply Leave</button>
      </div>

      <select className="select select-bordered select-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {leaves.length === 0 ? (
        <EmptyState title="No leave requests" action={<button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> Apply Leave</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leaves.map(l => (
            <div key={l._id} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={16} className="text-primary" />
                    <span className={`badge badge-xs ${statusColors[l.status] || 'badge-ghost'}`}>{l.status}</span>
                  </div>
                  <span className="text-xs text-base-content/40">{new Date(l.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><span className="text-xs text-base-content/60">From:</span> {new Date(l.fromDate).toLocaleDateString()}</div>
                  <div><span className="text-xs text-base-content/60">To:</span> {new Date(l.toDate).toLocaleDateString()}</div>
                  <div className="col-span-2"><span className="text-xs text-base-content/60">Reason:</span> {l.reason}</div>
                  <div className="col-span-2"><span className="text-xs text-base-content/60">Student:</span> {l.student?.user?.name}</div>
                </div>
                {l.status === 'pending' && canManage && (
                  <div className="flex gap-1 mt-3 pt-2 border-t border-base-200">
                    <button onClick={() => handleStatus(l._id, 'approved')} className="btn btn-ghost btn-xs text-success">Approve</button>
                    <button onClick={() => handleStatus(l._id, 'rejected')} className="btn btn-ghost btn-xs text-error">Reject</button>
                  </div>
                )}
                {l.remarks && <p className="text-xs text-base-content/60 mt-2">Remarks: {l.remarks}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply Leave">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">From Date</span></label><input type="date" required className="input input-bordered input-sm" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">To Date</span></label><input type="date" required className="input input-bordered input-sm" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} /></div>
          </div>
          <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Reason</span></label><textarea required className="textarea textarea-bordered text-sm h-20" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Destination</span></label><input className="input input-bordered input-sm" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Guardian Contact</span></label><input className="input input-bordered input-sm" value={form.guardianContact} onChange={e => setForm({ ...form, guardianContact: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
