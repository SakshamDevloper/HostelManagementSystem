import { useState, useEffect } from 'react'
import { Plus, UserCheck, LogOut, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { getVisitors, createVisitor, checkoutVisitor } from '../services/visitorService'

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({ name: '', contact: '', vehicle: '', purpose: '', visitingStudent: '', visitingRoom: '' })

  const fetchVisitors = async () => {
    try {
      const params = { date }
      if (search) params.search = search
      const { data } = await getVisitors(params)
      setVisitors(data.data || [])
    } catch { toast.error('Failed to load visitors') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchVisitors() }, [date, search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createVisitor(form)
      toast.success('Visitor logged in')
      setShowModal(false)
      setForm({ name: '', contact: '', vehicle: '', purpose: '', visitingStudent: '', visitingRoom: '' })
      fetchVisitors()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleCheckout = async (id) => {
    try {
      await checkoutVisitor(id)
      toast.success('Visitor checked out')
      fetchVisitors()
    } catch { toast.error('Checkout failed') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Visitor Log</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> New Visitor</button>
      </div>

      <div className="flex items-center gap-2">
        <input type="date" className="input input-bordered input-sm" value={date} onChange={e => setDate(e.target.value)} />
        <div className="join flex-1 max-w-xs">
          <div className="join-item flex items-center pl-3 text-base-content/40"><Search size={14} /></div>
          <input type="text" placeholder="Search visitor..." className="input input-bordered input-sm join-item w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {visitors.length === 0 ? (
        <EmptyState title="No visitors" action={<button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm"><Plus size={16} /> New Visitor</button>} />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm table-zebra">
            <thead>
              <tr><th>Pass No</th><th>Name</th><th>Contact</th><th>Purpose</th><th>In Time</th><th>Out Time</th><th>Visiting</th><th></th></tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v._id}>
                  <td className="text-xs font-mono">{v.passNo}</td>
                  <td className="text-sm font-medium">{v.name}</td>
                  <td className="text-sm">{v.contact || '-'}</td>
                  <td className="text-sm">{v.purpose}</td>
                  <td className="text-xs">{new Date(v.inTime).toLocaleTimeString()}</td>
                  <td>{v.outTime ? <span className="text-xs">{new Date(v.outTime).toLocaleTimeString()}</span> : <span className="badge badge-xs badge-success">Inside</span>}</td>
                  <td className="text-xs">{v.visitingStudent?.user?.name || v.visitingRoom || '-'}</td>
                  <td>{!v.outTime && <button onClick={() => handleCheckout(v._id)} className="btn btn-ghost btn-xs"><LogOut size={14} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Visitor Entry">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Name</span></label><input required className="input input-bordered input-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Contact</span></label><input className="input input-bordered input-sm" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Vehicle</span></label><input className="input input-bordered input-sm" value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Purpose</span></label><input required className="input input-bordered input-sm" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Visiting Room</span></label><input className="input input-bordered input-sm" value={form.visitingRoom} onChange={e => setForm({ ...form, visitingRoom: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Log Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
