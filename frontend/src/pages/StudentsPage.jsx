import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Upload, MoreVertical, UserMinus, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getStudents, createStudent, updateStudent, deleteStudent, checkoutStudent, bulkImport } from '../services/studentService'

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', phone: '', studentId: '', gender: 'male' })
  const [bulkCsv, setBulkCsv] = useState('')

  const fetchStudents = async () => {
    try {
      const { data } = await getStudents({ search, limit: 100 })
      setStudents(data.data || [])
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      if (editing) {
        await updateStudent(editing, form)
        toast.success('Student updated')
      } else {
        await createStudent(form)
        toast.success('Student created')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', email: '', password: 'password123', phone: '', studentId: '', gender: 'male' })
      fetchStudents()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteStudent(confirmDelete)
      toast.success('Student deactivated')
      setConfirmDelete(null)
      fetchStudents()
    } catch (err) { toast.error('Failed to deactivate') }
  }

  const handleCheckout = async (id) => {
    try {
      await checkoutStudent(id)
      toast.success('Student checked out')
      fetchStudents()
    } catch (err) { toast.error('Checkout failed') }
  }

  const handleBulkImport = async () => {
    try {
      const rows = bulkCsv.trim().split('\n').map(line => {
        const [name, email, studentId, phone] = line.split(',')
        return { name: name?.trim(), email: email?.trim(), studentId: studentId?.trim(), phone: phone?.trim() }
      })
      const { data } = await bulkImport({ students: rows })
      toast.success(`Created: ${data.created}, Failed: ${data.failed}`)
      setShowBulk(false)
      setBulkCsv('')
      fetchStudents()
    } catch (err) { toast.error('Import failed') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBulk(true)} className="btn btn-ghost btn-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: 'password123', phone: '', studentId: '', gender: 'male' }); setShowModal(true) }} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="join flex-1 max-w-sm">
          <div className="join-item flex items-center pl-3 text-base-content/40"><Search size={16} /></div>
          <input type="text" placeholder="Search by student ID..." className="input input-bordered input-sm join-item w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="No students found"
          description={search ? 'Try a different search term' : 'Add your first student to get started'}
          action={<button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: 'password123', phone: '', studentId: '', gender: 'male' }); setShowModal(true) }} className="btn btn-primary btn-sm"><Plus size={16} /> Add Student</button>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Contact</th>
                <th>Room</th>
                <th>Status</th>
                <th>Check In</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="hover cursor-pointer" onClick={() => navigate(`/students/${s._id}`)}>
                  <td>
                    <div className="flex items-center gap-2">
                      {s.user?.photo ? (
                        <div className="avatar">
                          <div className="w-7 rounded-full">
                            <img src={s.user.photo} alt="" />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-7 h-7 text-xs">
                            <span>{s.user?.name?.charAt(0) || 'S'}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{s.user?.name}</p>
                        <p className="text-xs text-base-content/60">{s.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{s.studentId}</td>
                  <td className="text-sm">{s.user?.phone || '-'}</td>
                  <td className="text-sm">{s.room?.roomNumber || '-'}</td>
                  <td>
                    <span className={`badge badge-sm ${s.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/60">{s.checkInDate ? new Date(s.checkInDate).toLocaleDateString() : '-'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="dropdown dropdown-end">
                      <button className="btn btn-ghost btn-xs btn-square"><MoreVertical size={14} /></button>
                      <div className="dropdown-content bg-base-100 border border-base-300 rounded-box shadow-lg p-1 w-36">
                        <button onClick={() => navigate(`/students/${s._id}`)} className="btn btn-ghost btn-xs justify-start w-full gap-2"><Eye size={12} /> View</button>
                        <button onClick={() => { setEditing(s._id); setForm({ name: s.user?.name || '', email: s.user?.email || '', password: '', phone: s.user?.phone || '', studentId: s.studentId, gender: s.gender || 'male' }); setShowModal(true) }} className="btn btn-ghost btn-xs justify-start w-full gap-2"><Edit size={12} /> Edit</button>
                        {s.status === 'active' && <button onClick={() => handleCheckout(s._id)} className="btn btn-ghost btn-xs justify-start w-full gap-2"><UserMinus size={12} /> Checkout</button>}
                        <button onClick={() => setConfirmDelete(s._id)} className="btn btn-ghost btn-xs justify-start w-full gap-2 text-error"><Trash2 size={12} /> Deactivate</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Name</span></label><input required className="input input-bordered input-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Student ID</span></label><input required className="input input-bordered input-sm" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Email</span></label><input type="email" required className="input input-bordered input-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Phone</span></label><input className="input input-bordered input-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Gender</span></label><select className="select select-bordered select-sm" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            {!editing && <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Password</span></label><input className="input input-bordered input-sm" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="Bulk Import Students" size="lg">
        <p className="text-xs text-base-content/60 mb-3">Enter one student per line: <code className="bg-base-200 px-1 rounded">name, email, studentId, phone</code></p>
        <textarea className="textarea textarea-bordered w-full h-48 text-sm font-mono" value={bulkCsv} onChange={e => setBulkCsv(e.target.value)} placeholder={`John Doe, john@example.com, STU001, 1234567890\nJane Doe, jane@example.com, STU002, 9876543210`} />
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={() => setShowBulk(false)} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={handleBulkImport} className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Importing...' : 'Import'}</button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Deactivate Student?" message="This will deactivate the student account and vacate their room." confirmText="Deactivate" />
    </div>
  )
}
