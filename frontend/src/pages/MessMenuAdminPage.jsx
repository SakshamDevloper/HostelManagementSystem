import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Upload, UtensilsCrossed, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { getWeekMenu, createMenu, updateMenu, deleteMenu, bulkCreateMenu } from '../services/messMenuService'

const meals = ['Breakfast', 'Lunch', 'Dinner']
const messes = ['North', 'South']

function formatDate(dateStr) {
  return new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

const emptyForm = { mess: 'South', date: todayString(), meal: 'Breakfast', items: '', notes: '' }

export default function MessMenuAdminPage() {
  const [menuData, setMenuData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterMess, setFilterMess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkJson, setBulkJson] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const fetchingRef = useRef(false)

  const fetchMenu = async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const params = {}
      if (filterMess) params.mess = filterMess
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 3)
      params.startDate = startDate.toISOString().split('T')[0]
      const { data } = await getWeekMenu(params)
      setMenuData(data.data || [])
    } catch { toast.error('Failed to load menu') }
    finally { fetchingRef.current = false; setLoading(false) }
  }

  useEffect(() => { fetchMenu() }, [filterMess])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (entry) => {
    setEditing(entry)
    setForm({
      mess: entry.mess,
      date: entry.date.split('T')[0],
      meal: entry.meal,
      items: entry.items.join('\n'),
      notes: entry.notes || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        mess: form.mess,
        date: form.date,
        meal: form.meal,
        items: form.items.split('\n').map(s => s.trim()).filter(Boolean),
        notes: form.notes,
      }
      if (editing) {
        await updateMenu(editing._id, payload)
        toast.success('Menu updated')
      } else {
        await createMenu(payload)
        toast.success('Menu created')
      }
      setShowModal(false)
      fetchMenu()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMenu(deleteTarget._id)
      toast.success('Menu deleted')
      setDeleteTarget(null)
      fetchMenu()
    } catch (err) { toast.error('Failed to delete') }
  }

  const handleBulkUpload = async () => {
    setBulkSubmitting(true)
    try {
      let entries
      try { entries = JSON.parse(bulkJson) }
      catch { toast.error('Invalid JSON format'); setBulkSubmitting(false); return }
      if (!entries.entries && !Array.isArray(entries)) {
        toast.error('JSON must contain an "entries" array or be an array')
        setBulkSubmitting(false)
        return
      }
      const payload = Array.isArray(entries) ? { entries } : entries
      await bulkCreateMenu(payload)
      toast.success('Bulk upload successful')
      setShowBulkModal(false)
      setBulkJson('')
      fetchMenu()
    } catch (err) { toast.error(err.response?.data?.message || 'Bulk upload failed') }
    finally { setBulkSubmitting(false) }
  }

  const generateTemplate = () => {
    const template = {
      entries: [
        { mess: 'South', date: '2026-07-24', meal: 'Breakfast', items: ['Item 1', 'Item 2'], notes: '' },
        { mess: 'South', date: '2026-07-24', meal: 'Lunch', items: ['Item 1', 'Item 2'], notes: '' },
        { mess: 'North', date: '2026-07-24', meal: 'Breakfast', items: ['Item 1', 'Item 2'], notes: '' },
      ],
    }
    setBulkJson(JSON.stringify(template, null, 2))
  }

  const grouped = menuData.reduce((acc, entry) => {
    const key = entry.date.split('T')[0]
    if (!acc[key]) acc[key] = {}
    if (!acc[key][entry.mess]) acc[key][entry.mess] = {}
    acc[key][entry.mess][entry.meal] = entry
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <UtensilsCrossed size={22} /> Mess Menu Management
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="select select-bordered select-xs" value={filterMess} onChange={e => setFilterMess(e.target.value)}>
            <option value="">All Mess</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
          <button onClick={() => setShowBulkModal(true)} className="btn btn-ghost btn-xs"><Upload size={14} /> Bulk</button>
          <button onClick={openCreate} className="btn btn-primary btn-xs"><Plus size={14} /> Add Entry</button>
        </div>
      </div>

      {menuData.length === 0 ? (
        <EmptyState title="No menu entries" action={<button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={16} /> Add Entry</button>} />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra table-xs w-full">
            <thead>
              <tr>
                <th className="text-xs">Date</th>
                <th className="text-xs">Mess</th>
                <th className="text-xs">Breakfast</th>
                <th className="text-xs">Lunch</th>
                <th className="text-xs">Dinner</th>
                <th className="text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDates.map(date => (
                messes.map(mess => {
                  const dayGroup = grouped[date]?.[mess]
                  if (!dayGroup) return null
                  return (
                    <tr key={`${date}-${mess}`}>
                      <td className="text-xs whitespace-nowrap">{formatDate(date)}</td>
                      <td>
                        <span className={`badge badge-xs ${mess === 'South' ? 'badge-error' : 'badge-primary'}`}>{mess}</span>
                      </td>
                      {meals.map(meal => {
                        const entry = dayGroup[meal]
                        return (
                          <td key={meal} className="text-xs max-w-xs">
                            {entry ? (
                              <div className="space-y-0.5">
                                <ul className="list-disc list-inside">
                                  {entry.items?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                                {entry.notes && <p className="text-warning italic text-[10px]">{entry.notes}</p>}
                              </div>
                            ) : (
                              <span className="text-base-content/30 italic">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="text-right">
                        <div className="flex gap-1 justify-end">
                          {dayGroup.Breakfast && (
                            <button onClick={() => openEdit(dayGroup.Breakfast)} className="btn btn-ghost btn-xs btn-square text-info">
                              <Pencil size={12} />
                            </button>
                          )}
                          {dayGroup.Lunch && (
                            <button onClick={() => openEdit(dayGroup.Lunch)} className="btn btn-ghost btn-xs btn-square text-info">
                              <Pencil size={12} />
                            </button>
                          )}
                          {dayGroup.Dinner && (
                            <button onClick={() => openEdit(dayGroup.Dinner)} className="btn btn-ghost btn-xs btn-square text-info">
                              <Pencil size={12} />
                            </button>
                          )}
                          {dayGroup.Breakfast && (
                            <button onClick={() => setDeleteTarget(dayGroup.Breakfast)} className="btn btn-ghost btn-xs btn-square text-error">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Menu Entry' : 'Add Menu Entry'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="form-control">
              <label className="label py-0.5"><span className="label-text text-xs">Mess</span></label>
              <select className="select select-bordered select-sm" value={form.mess} onChange={e => setForm({ ...form, mess: e.target.value })}>
                {messes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label py-0.5"><span className="label-text text-xs">Date</span></label>
              <input type="date" className="input input-bordered input-sm" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-control">
              <label className="label py-0.5"><span className="label-text text-xs">Meal</span></label>
              <select className="select select-bordered select-sm" value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value })}>
                {meals.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Items (one per line)</span></label>
            <textarea required className="textarea textarea-bordered text-sm h-28" value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder="Aloo Kurma&#10;Roti&#10;Rice" />
          </div>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Notes (optional)</span></label>
            <input className="input input-bordered input-sm" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Butter milk limited to 1 per person" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Upload Menu">
        <div className="space-y-3">
          <p className="text-xs text-base-content/60">Paste a JSON array of menu entries. Each entry needs <code className="bg-base-200 px-1 rounded">mess</code>, <code className="bg-base-200 px-1 rounded">date</code>, <code className="bg-base-200 px-1 rounded">meal</code>, and <code className="bg-base-200 px-1 rounded">items</code>.</p>
          <button onClick={generateTemplate} className="btn btn-ghost btn-xs"><Download size={12} /> Use Template</button>
          <textarea className="textarea textarea-bordered text-sm w-full h-48 font-mono" value={bulkJson} onChange={e => setBulkJson(e.target.value)} placeholder='[{"mess":"South","date":"2026-07-24","meal":"Breakfast","items":["Item 1","Item 2"]}]' />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowBulkModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button onClick={handleBulkUpload} className="btn btn-primary btn-sm" disabled={bulkSubmitting || !bulkJson.trim()}>{bulkSubmitting ? 'Uploading...' : 'Upload'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Menu Entry" message={`Delete ${deleteTarget?.mess} ${deleteTarget?.meal} on ${deleteTarget ? formatDate(deleteTarget.date) : ''}?`} />
    </div>
  )
}
