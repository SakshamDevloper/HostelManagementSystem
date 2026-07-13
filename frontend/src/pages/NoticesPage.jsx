import { useState, useEffect, useRef } from 'react'
import { Plus, ClipboardList, Megaphone, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { getNotices, createNotice, updateNotice, deleteNotice } from '../services/noticeService'

const priorityColors = { low: 'badge-ghost', normal: 'badge-info', high: 'badge-warning', urgent: 'badge-error' }
const priorityIcons = { low: ClipboardList, normal: Megaphone, high: Bell, urgent: Bell }

export default function NoticesPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', targetAudience: 'all' })
  const isAdmin = user?.role === 'admin' || user?.role === 'staff'
  const submittingRef = useRef(false)

  const fetchNotices = async () => {
    try {
      const { data } = await getNotices({ isActive: true })
      setNotices(data.data || [])
    } catch { toast.error('Failed to load notices') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNotices() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      if (editing) {
        await updateNotice(editing, form)
        toast.success('Notice updated')
      } else {
        await createNotice(form)
        toast.success('Notice posted')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ title: '', content: '', priority: 'normal', targetAudience: 'all' })
      fetchNotices()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { submittingRef.current = false; setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return
    try {
      await deleteNotice(id)
      toast.success('Notice deleted')
      fetchNotices()
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Notices</h1>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setForm({ title: '', content: '', priority: 'normal', targetAudience: 'all' }); setShowModal(true) }} className="btn btn-primary btn-sm">
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {notices.length === 0 ? (
        <EmptyState title="No notices" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notices.map(n => {
            const Icon = priorityIcons[n.priority] || ClipboardList
            return (
              <div key={n._id} className={`card bg-base-100 border shadow-sm ${n.priority === 'urgent' ? 'border-error/30 bg-error/5' : 'border-base-300'}`}>
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={n.priority === 'urgent' ? 'text-error' : 'text-primary'} />
                      <h3 className="font-semibold text-sm">{n.title}</h3>
                      <span className={`badge badge-xs ${priorityColors[n.priority] || 'badge-ghost'}`}>{n.priority}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-base-content/40">{new Date(n.createdAt).toLocaleDateString()}</span>
                      {isAdmin && (
                        <>
                          <button onClick={() => { setEditing(n._id); setForm({ title: n.title, content: n.content, priority: n.priority, targetAudience: n.targetAudience }); setShowModal(true) }} className="btn btn-ghost btn-xs">Edit</button>
                          <button onClick={() => handleDelete(n._id)} className="btn btn-ghost btn-xs text-error">Del</button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{n.content}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-base-200 text-xs text-base-content/40">
                    <span>By {n.postedBy?.name || 'Unknown'}</span>
                    <span className="badge badge-xs badge-ghost">{n.targetAudience}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Notice' : 'Post Notice'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Title</span></label><input required className="input input-bordered input-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Content</span></label><textarea required className="textarea textarea-bordered text-sm h-32" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Priority</span></label><select className="select select-bordered select-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Target Audience</span></label><select className="select select-bordered select-sm" value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}><option value="all">All</option><option value="students">Students</option><option value="staff">Staff</option></select></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Posting...' : editing ? 'Update' : 'Post'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
