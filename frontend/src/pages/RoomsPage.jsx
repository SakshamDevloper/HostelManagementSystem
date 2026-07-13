import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, BedDouble, MoreVertical, Edit, Trash2, DoorOpen, RotateCcw, Wrench } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getRooms, createRoom, updateRoom, deleteRoom, allocateRoom, vacateRoom } from '../services/roomService'
import { getStudents } from '../services/studentService'

export default function RoomsPage() {
  const { socket } = useSocket()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showAllocate, setShowAllocate] = useState(null)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [form, setForm] = useState({ roomNumber: '', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 3000, amenities: '', status: 'available' })

  const fetchRooms = useCallback(async () => {
    try {
      const params = { search }
      if (filterStatus) params.status = filterStatus
      const { data } = await getRooms(params)
      setRooms(data.data || [])
    } catch { toast.error('Failed to load rooms') }
    finally { setLoading(false) }
  }, [search, filterStatus])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  useEffect(() => {
    if (!socket) return
    socket.on('room:statusChange', fetchRooms)
    return () => socket.off('room:statusChange', fetchRooms)
  }, [socket, fetchRooms])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...form, amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean) }
      if (editing) {
        await updateRoom(editing, data)
        toast.success('Room updated')
      } else {
        await createRoom(data)
        toast.success('Room created')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ roomNumber: '', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 3000, amenities: '', status: 'available' })
      fetchRooms()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
  }

  const handleDelete = async () => {
    try {
      await deleteRoom(confirmDelete)
      toast.success('Room deleted')
      setConfirmDelete(null)
      fetchRooms()
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete room') }
  }

  const handleAllocate = async (roomId) => {
    if (!selectedStudent) return toast.error('Select a student')
    try {
      await allocateRoom(roomId, { studentId: selectedStudent })
      toast.success('Room allocated')
      setShowAllocate(null)
      setSelectedStudent('')
      fetchRooms()
    } catch (err) { toast.error(err.response?.data?.message || 'Allocation failed') }
  }

  const openAllocate = async (room) => {
    setShowAllocate(room)
    try {
      const { data } = await getStudents({ status: 'active', limit: 200 })
      setStudents(data.data || [])
    } catch { }
  }

  const roomTypeColors = { single: 'bg-primary/10 text-primary', double: 'bg-info/10 text-info', triple: 'bg-warning/10 text-warning', dormitory: 'bg-success/10 text-success' }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <button onClick={() => { setEditing(null); setForm({ roomNumber: '', floor: 1, roomType: 'single', capacity: 1, rentPerMonth: 3000, amenities: '', status: 'available' }); setShowModal(true) }} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Room
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="join flex-1 max-w-sm">
          <div className="join-item flex items-center pl-3 text-base-content/40"><Search size={16} /></div>
          <input type="text" placeholder="Search room number..." className="input input-bordered input-sm join-item w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select select-bordered select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map(room => {
          const freeSlots = room.capacity - (room.occupants?.length || 0)
          return (
            <div key={room._id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BedDouble size={18} className="text-primary" />
                    <h3 className="font-semibold">Room {room.roomNumber}</h3>
                  </div>
                  <div className="dropdown dropdown-end">
                    <button className="btn btn-ghost btn-xs btn-square"><MoreVertical size={14} /></button>
                    <div className="dropdown-content bg-base-100 border border-base-300 rounded-box shadow-lg p-1 w-36">
                      <button onClick={() => { setEditing(room._id); setForm({ roomNumber: room.roomNumber, floor: room.floor, roomType: room.roomType, capacity: room.capacity, rentPerMonth: room.rentPerMonth, amenities: (room.amenities || []).join(', '), status: room.status }); setShowModal(true) }} className="btn btn-ghost btn-xs justify-start w-full gap-2"><Edit size={12} /> Edit</button>
                      {room.status !== 'maintenance' && freeSlots > 0 && <button onClick={() => openAllocate(room)} className="btn btn-ghost btn-xs justify-start w-full gap-2"><DoorOpen size={12} /> Allocate</button>}
                      {room.status === 'maintenance' && <button onClick={async () => { await updateRoom(room._id, { status: 'available' }); fetchRooms(); toast.success('Room set to available') }} className="btn btn-ghost btn-xs justify-start w-full gap-2"><RotateCcw size={12} /> Set Available</button>}
                      <button onClick={() => setConfirmDelete(room._id)} className="btn btn-ghost btn-xs justify-start w-full gap-2 text-error"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge badge-xs ${room.status === 'available' ? 'badge-success' : room.status === 'occupied' ? 'badge-info' : 'badge-warning'}`}>{room.status}</span>
                  <span className={`badge badge-xs ${roomTypeColors[room.roomType]}`}>{room.roomType}</span>
                  {room.floor && <span className="badge badge-xs badge-ghost">Floor {room.floor}</span>}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-base-200">
                  <div>
                    <p className="text-xs text-base-content/60">Occupancy</p>
                    <p className="text-sm font-medium">{room.occupants?.length || 0}/{room.capacity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-base-content/60">Rent</p>
                    <p className="text-sm font-bold text-primary">₹{room.rentPerMonth}</p>
                  </div>
                </div>

                <div className="w-full bg-base-200 rounded-full h-1.5 mt-1">
                  <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${((room.occupants?.length || 0) / room.capacity) * 100}%` }} />
                </div>

                {room.occupants?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {room.occupants.map(o => (
                      <div key={o._id} className="text-xs text-base-content/60 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        {o.user?.name || o._id}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {rooms.length === 0 && (
        <EmptyState
          title="No rooms found"
          action={<button onClick={() => { setShowModal(true) }} className="btn btn-primary btn-sm"><Plus size={16} /> Add Room</button>}
        />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Room' : 'Add Room'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Room Number</span></label><input required className="input input-bordered input-sm" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Floor</span></label><input type="number" required className="input input-bordered input-sm" value={form.floor} onChange={e => setForm({ ...form, floor: parseInt(e.target.value) })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Room Type</span></label><select className="select select-bordered select-sm" value={form.roomType} onChange={e => setForm({ ...form, roomType: e.target.value, capacity: e.target.value === 'single' ? 1 : e.target.value === 'double' ? 2 : e.target.value === 'triple' ? 3 : 6 })}><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="dormitory">Dormitory</option></select></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Capacity</span></label><input type="number" required className="input input-bordered input-sm" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Rent/Month (₹)</span></label><input type="number" required className="input input-bordered input-sm" value={form.rentPerMonth} onChange={e => setForm({ ...form, rentPerMonth: parseInt(e.target.value) })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Status</span></label><select className="select select-bordered select-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option></select></div>
            <div className="form-control col-span-2"><label className="label py-0.5"><span className="label-text text-xs">Amenities (comma separated)</span></label><input className="input input-bordered input-sm" placeholder="AC, Desk, Chair, Fan" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showAllocate} onClose={() => { setShowAllocate(null); setSelectedStudent('') }} title={`Allocate Room ${showAllocate?.roomNumber || ''}`}>
        <div className="space-y-3">
          <p className="text-sm">Room: <strong>{showAllocate?.roomNumber}</strong> ({(showAllocate?.capacity || 0) - (showAllocate?.occupants?.length || 0)} slots available)</p>
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Select Student</span></label>
            <select className="select select-bordered select-sm" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">Choose a student...</option>
              {students.filter(s => !s.room).map(s => (
                <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowAllocate(null); setSelectedStudent('') }} className="btn btn-ghost btn-sm">Cancel</button>
            <button onClick={() => handleAllocate(showAllocate._id)} className="btn btn-primary btn-sm" disabled={!selectedStudent}>Allocate</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Room?" message="This cannot be undone. Room must be empty." confirmText="Delete" />
    </div>
  )
}
