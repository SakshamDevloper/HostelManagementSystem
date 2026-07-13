import { useState, useEffect, useRef } from 'react'
import { Plus, CalendarClock, Printer } from 'lucide-react'
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
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '', destination: '', guardianContact: '' })
  const canManage = user?.role === 'admin' || user?.role === 'staff'
  const fetchingRef = useRef(false)
  const submittingRef = useRef(false)

  const fetchLeaves = async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const { data } = await getLeaves(params)
      setLeaves(data.data || [])
    } catch { toast.error('Failed to load leaves') }
    finally { setLoading(false); fetchingRef.current = false }
  }

  useEffect(() => { fetchLeaves() }, [filterStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      await createLeave(form)
      toast.success('Leave request submitted')
      setShowModal(false)
      setForm({ fromDate: '', toDate: '', reason: '', destination: '', guardianContact: '' })
      fetchLeaves()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit') }
    finally { submittingRef.current = false; setSubmitting(false) }
  }

  const handleStatus = async (id, status) => {
    try {
      await updateLeaveStatus(id, { status })
      toast.success(`Leave ${status}`)
      fetchLeaves()
    } catch (err) { toast.error('Failed to update') }
  }

  const handlePrint = (leave) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html><head><title>Leave Application</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 40px; max-width: 700px; margin: auto; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 5px; }
        .subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 30px; }
        .line { display: flex; padding: 6px 0; }
        .label { width: 160px; font-weight: bold; }
        .value { flex: 1; border-bottom: 1px solid #999; padding: 0 8px; }
        .status { text-align: center; margin: 30px 0; padding: 12px; border: 2px solid #000; font-size: 16px; font-weight: bold; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
        .sig { text-align: center; width: 200px; }
        .sig-line { border-top: 1px solid #000; padding-top: 4px; margin-top: 50px; font-size: 12px; }
        hr { border: none; border-top: 2px dashed #999; margin: 30px 0; }
        .footer { text-align: center; font-size: 11px; color: #888; margin-top: 40px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>🏢 HOSTEL LEAVE APPLICATION</h1>
      <p class="subtitle">${document.title} — Leave / Outpass Form</p>
      <hr/>
      <div class="line"><span class="label">Student Name:</span><span class="value">${leave.student?.user?.name || 'N/A'}</span></div>
      <div class="line"><span class="label">Student ID:</span><span class="value">${leave.student?.studentId || 'N/A'}</span></div>
      <div class="line"><span class="label">From Date:</span><span class="value">${new Date(leave.fromDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
      <div class="line"><span class="label">To Date:</span><span class="value">${new Date(leave.toDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
      <div class="line"><span class="label">Total Days:</span><span class="value">${Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)</span></div>
      <div class="line"><span class="label">Reason:</span><span class="value">${leave.reason}</span></div>
      <div class="line"><span class="label">Going To (Destination):</span><span class="value">${leave.destination || 'N/A'}</span></div>
      <div class="line"><span class="label">Guardian Contact:</span><span class="value">${leave.guardianContact || 'N/A'}</span></div>
      <div class="line"><span class="label">Applied On:</span><span class="value">${new Date(leave.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="status" style="color: ${leave.status === 'approved' ? 'green' : leave.status === 'rejected' ? 'red' : 'orange'}">
        STATUS: ${leave.status.toUpperCase()}
      </div>
      ${leave.remarks ? `<div class="line"><span class="label">Admin Remarks:</span><span class="value">${leave.remarks}</span></div>` : ''}
      <div class="signatures">
        <div class="sig"><div class="sig-line">Student Signature</div></div>
        <div class="sig"><div class="sig-line">Warden / Staff Signature</div></div>
      </div>
      <div class="footer">This is a computer-generated document. ${new Date().toLocaleDateString()}</div>
      <script>window.print()</script>
    </body></html>`)
    printWindow.document.close()
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Leave / Outpass</h1>
        {!canManage && <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> Apply Leave</button>}
      </div>

      <select className="select select-bordered select-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {leaves.length === 0 ? (
        <EmptyState title="No leave requests" action={!canManage ? <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> Apply Leave</button> : undefined} />
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
            {l.status !== 'pending' && (
              <button onClick={() => handlePrint(l)} className="btn btn-ghost btn-xs mt-1 text-primary"><Printer size={12} /> Print</button>
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
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
