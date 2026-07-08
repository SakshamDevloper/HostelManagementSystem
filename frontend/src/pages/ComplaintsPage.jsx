import { useState, useEffect } from 'react'
import { Plus, AlertTriangle, Search } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { getComplaints, createComplaint, updateComplaintStatus, addFeedback } from '../services/complaintService'

const categoryIcons = { plumbing: '💧', electrical: '⚡', furniture: '🪑', cleanliness: '🧹', noise: '🔊', security: '🔒', other: '📋' }
const statusColors = { pending: 'badge-warning', inProgress: 'badge-info', resolved: 'badge-success', rejected: 'badge-error' }

export default function ComplaintsPage() {
  const { socket } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ category: 'plumbing', description: '' })
  const [feedbackForm, setFeedbackForm] = useState({ id: null, feedback: '', feedbackRating: 5 })

  const fetchComplaints = async () => {
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const { data } = await getComplaints(params)
      setComplaints(data.data || [])
    } catch { toast.error('Failed to load complaints') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchComplaints() }, [filterStatus])

  useEffect(() => {
    if (!socket) return
    socket.on('complaint:new', fetchComplaints)
    socket.on('complaint:statusChange', fetchComplaints)
    return () => {
      socket.off('complaint:new', fetchComplaints)
      socket.off('complaint:statusChange', fetchComplaints)
    }
  }, [socket])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createComplaint(form)
      toast.success('Complaint submitted')
      setShowModal(false)
      setForm({ category: 'plumbing', description: '' })
      fetchComplaints()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit') }
  }

  const handleStatus = async (id, status) => {
    try {
      await updateComplaintStatus(id, { status })
      toast.success(`Complaint ${status}`)
      fetchComplaints()
    } catch (err) { toast.error('Failed to update') }
  }

  const handleFeedback = async (e) => {
    e.preventDefault()
    try {
      await addFeedback(feedbackForm.id, { feedback: feedbackForm.feedback, feedbackRating: feedbackForm.feedbackRating })
      toast.success('Feedback submitted')
      setFeedbackForm({ id: null, feedback: '', feedbackRating: 5 })
      fetchComplaints()
    } catch (err) { toast.error('Failed to submit feedback') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Complaints</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> New Complaint</button>
      </div>

      <select className="select select-bordered select-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="inProgress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>

      {complaints.length === 0 ? (
        <EmptyState title="No complaints found" action={<button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> New Complaint</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {complaints.map(c => (
            <div key={c._id} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[c.category] || '📋'}</span>
                    <div>
                      <span className="text-sm font-medium capitalize">{c.category}</span>
                      <span className={`badge badge-xs ml-2 ${statusColors[c.status] || 'badge-ghost'}`}>{c.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-base-content/40">{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <p className="text-sm mt-2">{c.description}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-base-200">
                  <span className="text-xs text-base-content/60">{c.student?.user?.name}</span>
                  <div className="flex gap-1">
                    {c.status === 'pending' && <button onClick={() => handleStatus(c._id, 'inProgress')} className="btn btn-ghost btn-xs">Start</button>}
                    {['pending', 'inProgress'].includes(c.status) && <button onClick={() => handleStatus(c._id, 'resolved')} className="btn btn-ghost btn-xs text-success">Resolve</button>}
                    {c.status === 'resolved' && !c.feedback && (
                      <button onClick={() => setFeedbackForm({ id: c._id, feedback: '', feedbackRating: 5 })} className="btn btn-ghost btn-xs text-primary">Feedback</button>
                    )}
                  </div>
                </div>
                {c.feedback && (
                  <div className="mt-2 p-2 bg-base-200 rounded-lg text-xs">
                    <p className="text-base-content/60">Feedback: {c.feedback}</p>
                    {c.feedbackRating && <p className="text-warning">{'★'.repeat(c.feedbackRating)}{'☆'.repeat(5 - c.feedbackRating)}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit Complaint">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Category</span></label>
            <select className="select select-bordered select-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="furniture">Furniture</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="noise">Noise</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Description</span></label>
            <textarea required className="textarea textarea-bordered text-sm h-24" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!feedbackForm.id} onClose={() => setFeedbackForm({ id: null, feedback: '', feedbackRating: 5 })} title="Submit Feedback">
        <form onSubmit={handleFeedback} className="space-y-3">
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Rating</span></label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} type="button" onClick={() => setFeedbackForm({ ...feedbackForm, feedbackRating: r })} className={`text-lg ${r <= feedbackForm.feedbackRating ? 'text-warning' : 'text-base-300'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Feedback</span></label>
            <textarea className="textarea textarea-bordered text-sm h-20" value={feedbackForm.feedback} onChange={e => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFeedbackForm({ id: null, feedback: '', feedbackRating: 5 })} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
