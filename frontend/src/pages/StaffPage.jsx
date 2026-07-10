import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, UsersRound } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { getStaff, createStaff, updateStaff, deleteStaff } from '../services/staffService'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [filterDesignation, setFilterDesignation] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', phone: '', staffId: '', designation: 'warden', salary: '', shift: 'general' })

  const fetchStaff = async () => {
    try {
      const params = { search }
      if (filterDesignation) params.designation = filterDesignation
      const { data } = await getStaff(params)
      setStaff(data.data || [])
    } catch { toast.error('Failed to load staff') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStaff() }, [search, filterDesignation])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateStaff(editing, form)
        toast.success('Staff updated')
      } else {
        await createStaff(form)
        toast.success('Staff created')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', email: '', password: 'password123', phone: '', staffId: '', designation: 'warden', salary: '', shift: 'general' })
      fetchStaff()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
  }

  const handleDelete = async () => {
    try {
      await deleteStaff(confirmDelete)
      toast.success('Staff deleted')
      setConfirmDelete(null)
      fetchStaff()
    } catch { toast.error('Failed to delete') }
  }

  const editItem = (s) => {
    setEditing(s._id)
    setForm({
      name: s.user?.name || '',
      email: s.user?.email || '',
      password: '',
      phone: s.user?.phone || '',
      staffId: s.staffId,
      designation: s.designation,
      salary: s.salary?.toString() || '',
      shift: s.shift,
    })
    setShowModal(true)
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: 'password123', phone: '', staffId: '', designation: 'warden', salary: '', shift: 'general' }); setShowModal(true) }} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="join flex-1 max-w-xs">
          <div className="join-item flex items-center pl-3 text-base-content/40"><Search size={14} /></div>
          <input type="text" placeholder="Search staff..." className="input input-bordered input-sm join-item w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select select-bordered select-xs" value={filterDesignation} onChange={e => setFilterDesignation(e.target.value)}>
          <option value="">All Designations</option>
          <option value="warden">Warden</option>
          <option value="cleaner">Cleaner</option>
          <option value="security">Security</option>
          <option value="maintenance">Maintenance</option>
          <option value="admin">Admin</option>
          <option value="accountant">Accountant</option>
        </select>
      </div>

      {staff.length === 0 ? (
        <EmptyState title="No staff" action={<button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> Add Staff</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staff.map(s => (
            <div key={s._id} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {s.user?.photo ? (
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img src={s.user.photo} alt="" />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar placeholder">
                        <div className="bg-secondary text-secondary-content rounded-full w-10 h-10 text-sm">
                          <span>{s.user?.name?.charAt(0) || 'S'}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{s.user?.name}</h3>
                      <p className="text-xs text-base-content/60">{s.staffId}</p>
                      <span className="badge badge-xs badge-primary mt-1">{s.designation}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editItem(s)} className="btn btn-ghost btn-xs"><Edit size={12} /></button>
                    <button onClick={() => setConfirmDelete(s._id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div><span className="text-base-content/60">Email:</span> {s.user?.email}</div>
                  <div><span className="text-base-content/60">Phone:</span> {s.user?.phone || '-'}</div>
                  <div><span className="text-base-content/60">Salary:</span> ₹{s.salary?.toLocaleString() || '-'}</div>
                  <div><span className="text-base-content/60">Shift:</span> {s.shift}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Staff' : 'Add Staff'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Name</span></label><input required className="input input-bordered input-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Staff ID</span></label><input required className="input input-bordered input-sm" value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Email</span></label><input type="email" required className="input input-bordered input-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Phone</span></label><input className="input input-bordered input-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Designation</span></label><select className="select select-bordered select-sm" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}><option value="warden">Warden</option><option value="cleaner">Cleaner</option><option value="security">Security</option><option value="maintenance">Maintenance</option><option value="admin">Admin</option><option value="accountant">Accountant</option></select></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Shift</span></label><select className="select select-bordered select-sm" value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}><option value="general">General</option><option value="morning">Morning</option><option value="evening">Evening</option><option value="night">Night</option></select></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Salary (₹)</span></label><input type="number" className="input input-bordered input-sm" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
            {!editing && <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Password</span></label><input className="input input-bordered input-sm" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Staff?" message="This will deactivate the staff account." confirmText="Delete" />
    </div>
  )
}
