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
  const canManage = ['admin', 'staff', 'warden'].includes(user?.role)
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
      const payload = {
        ...form,
        fromDate: new Date(form.fromDate).toISOString(),
        toDate: new Date(form.toDate).toISOString(),
      }
      await createLeave(payload)
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
    const origin = window.location.origin
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
        .signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; }
        .sig { text-align: center; width: 200px; }
        .sig-line { border-top: 1px solid #000; padding-top: 4px; margin-top: 50px; font-size: 12px; }
        .sig-img { width: 120px; height: 40px; object-fit: contain; margin-bottom: 4px; }
        hr { border: none; border-top: 2px dashed #999; margin: 30px 0; }
        .footer { text-align: center; font-size: 11px; color: #888; margin-top: 40px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>HOSTEL LEAVE APPLICATION</h1>
      <p class="subtitle">Leave / Outpass Form</p>
      <hr/>
      <div class="line"><span class="label">Student Name:</span><span class="value">${leave.student?.user?.name || 'N/A'}</span></div>
      <div class="line"><span class="label">Student ID:</span><span class="value">${leave.student?.studentId || 'N/A'}</span></div>
      <div class="line"><span class="label">From:</span><span class="value">${new Date(leave.fromDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date(leave.fromDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="line"><span class="label">To:</span><span class="value">${new Date(leave.toDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date(leave.toDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="line"><span class="label">Duration:</span><span class="value">${(() => { const diffMs = new Date(leave.toDate) - new Date(leave.fromDate); const hrs = Math.round(diffMs / (1000 * 60 * 60)); return hrs < 24 ? hrs + ' hour(s)' : Math.ceil(hrs / 24) + ' day(s)'; })()}</span></div>
      <div class="line"><span class="label">Reason:</span><span class="value">${leave.reason}</span></div>
      <div class="line"><span class="label">Going To (Destination):</span><span class="value">${leave.destination || 'N/A'}</span></div>
      <div class="line"><span class="label">Guardian Contact:</span><span class="value">${leave.guardianContact || 'N/A'}</span></div>
      <div class="line"><span class="label">Applied On:</span><span class="value">${new Date(leave.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="status" style="color: ${leave.status === 'approved' ? 'green' : leave.status === 'rejected' ? 'red' : 'orange'}">
        STATUS: ${leave.status.toUpperCase()}
      </div>
      ${leave.remarks ? `<div class="line"><span class="label">Admin Remarks:</span><span class="value">${leave.remarks}</span></div>` : ''}
      <div class="signatures">
        <div class="sig"><img src="${origin}/SIGN_MINE_2.jpeg" alt="Signature" class="sig-img" /><div class="sig-line">Warden / Staff Signature</div></div>
        <div class="sig"><div class="sig-line">Student Signature</div></div>
      </div>
      <div class="footer">This is a computer-generated document. ${new Date().toLocaleDateString()}</div>
      <script>window.print()</script>
    </body></html>`)
    printWindow.document.close()
  }

  const handlePrintGatepass = (leave) => {
    const origin = window.location.origin
    const now = new Date()
    const dateTimeStr = now.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const photoUrl = leave.student?.user?.photo
      ? (leave.student.user.photo.startsWith('http') ? leave.student.user.photo : `${origin}${leave.student.user.photo}`)
      : null
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html><head><title>Gate Pass</title>
      <style>
        body { font-family: 'Mariam', 'Georgia', 'Times New Roman', serif; padding: 40px; max-width: 550px; margin: auto; border: 3px double #000; }
        .datetime { text-align: right; font-size: 11px; color: #666; margin-bottom: 4px; }
        h1 { text-align: center; font-size: 22px; margin-bottom: 2px; }
        .subtitle { text-align: center; font-size: 11px; color: #666; margin-bottom: 20px; }
        .header { display: flex; align-items: center; gap: 20px; margin-bottom: 15px; }
        .photo { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid #999; flex-shrink: 0; }
        .info { flex: 1; }
        .line { display: flex; padding: 4px 0; font-size: 14px; }
        .label { width: 130px; font-weight: bold; }
        .value { flex: 1; border-bottom: 1px solid #999; padding: 0 6px; }
        .auth { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #999; }
        .auth img { width: 100px; height: 35px; object-fit: contain; display: block; margin: 4px auto; }
        hr { border: none; border-top: 1px dashed #999; margin: 20px 0; }
        .footer { text-align: center; font-size: 10px; color: #888; margin-top: 25px; }
        .validity { text-align: center; font-size: 12px; margin: 15px 0; padding: 8px; border: 1px solid #999; background: #f5f5f5; }
        @media print { body { padding: 20px; border: 3px double #000; } }
      </style></head><body>
      <div class="datetime">Printed: ${dateTimeStr}</div>
      <h1>GATE PASS</h1>
      <p class="subtitle">Hostel Entry / Exit Permit</p>
      <hr/>
      <div class="header">
        ${photoUrl ? `<img src="${photoUrl}" alt="Student Photo" class="photo" />` : '<div class="photo" style="background:#eee; display:flex; align-items:center; justify-content:center; color:#999; font-size:28px;">?</div>'}
        <div class="info">
          <div class="line"><span class="label">Student Name:</span><span class="value">${leave.student?.user?.name || 'N/A'}</span></div>
          <div class="line"><span class="label">Student ID:</span><span class="value">${leave.student?.studentId || 'N/A'}</span></div>
        </div>
      </div>
      <div class="line"><span class="label">Destination:</span><span class="value">${leave.destination || 'N/A'}</span></div>
      <div class="line"><span class="label">Departure:</span><span class="value">${new Date(leave.fromDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at ${new Date(leave.fromDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="line"><span class="label">Return By:</span><span class="value">${new Date(leave.toDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at ${new Date(leave.toDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="line"><span class="label">Reason:</span><span class="value">${leave.reason}</span></div>
      <div class="line"><span class="label">Guardian:</span><span class="value">${leave.guardianContact || 'N/A'}</span></div>
      <div class="validity"><strong>Valid for exit & entry during above period</strong></div>
      <div class="auth">
        <strong>Authorized By</strong>
        <img src="${origin}/SIGN_MINE_2.jpeg" alt="Signature" />
        <div>Warden / Staff</div>
      </div>
      <div class="footer">Show this pass at the gate. ${new Date().toLocaleDateString()}</div>
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
                  <div><span className="text-xs text-base-content/60">From:</span> {new Date(l.fromDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  <div><span className="text-xs text-base-content/60">To:</span> {new Date(l.toDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
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
              <div className="flex gap-1 mt-1">
                <button onClick={() => handlePrint(l)} className="btn btn-ghost btn-xs text-primary"><Printer size={12} /> Print</button>
                {l.status === 'approved' && <button onClick={() => handlePrintGatepass(l)} className="btn btn-ghost btn-xs text-secondary"><Printer size={12} /> Gatepass</button>}
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
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Departure</span></label><input type="datetime-local" required className="input input-bordered input-sm" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Return By</span></label><input type="datetime-local" required className="input input-bordered input-sm" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} /></div>
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
