import { useState, useEffect, useRef } from 'react'
import { Check, X, Clock, AlertCircle, Users, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { getAttendance, markAttendance, bulkMarkAttendance, getAttendanceSummary } from '../services/attendanceService'
import { getStudents } from '../services/studentService'

const statusColors = { present: 'badge-success', absent: 'badge-error', leave: 'badge-warning', late: 'badge-info' }

export default function AttendancePage() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [view, setView] = useState('daily')
  const [markMode, setMarkMode] = useState(false)

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff'
  const fetchingRef = useRef(false)

  const fetchData = async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      if (view === 'daily') {
        const [recRes, stuRes] = await Promise.all([
          getAttendance({ date: selectedDate }),
          getStudents({ limit: 100 }),
        ])
        setRecords(recRes.data.data || [])
        setStudents(stuRes.data.data || [])
      } else {
        const sumRes = await getAttendanceSummary({ month: selectedMonth, year: selectedYear })
        setSummary(sumRes.data.data || [])
      }
    } catch { toast.error('Failed to load attendance') }
    finally { setLoading(false); fetchingRef.current = false }
  }

  useEffect(() => { fetchData() }, [view, selectedDate, selectedMonth, selectedYear])

  const getRecordStatus = (studentId) => records.find(r => r.student?._id === studentId)?.status || null

  const handleMark = async (studentId, status) => {
    try {
      await markAttendance({ studentId, date: selectedDate, status })
      toast.success(`Marked ${status}`)
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleMarkAllPresent = async () => {
    const unmarked = students.filter(s => !getRecordStatus(s._id))
    if (unmarked.length === 0) return toast.error('All students already marked')
    try {
      const records = unmarked.map(s => ({ studentId: s._id, date: selectedDate, status: 'present' }))
      await bulkMarkAttendance({ records })
      toast.success(`Marked ${unmarked.length} students present`)
      fetchData()
    } catch (err) { toast.error('Failed to mark all') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <div className="flex gap-2">
          {isAdminOrStaff && (
            <button onClick={() => setMarkMode(!markMode)} className={`btn btn-sm ${markMode ? 'btn-primary' : 'btn-ghost'}`}>
              {markMode ? 'Done Marking' : 'Mark Attendance'}
            </button>
          )}
          <select className="select select-bordered select-xs" value={view} onChange={e => setView(e.target.value)}>
            <option value="daily">Daily View</option>
            <option value="monthly">Monthly Summary</option>
          </select>
        </div>
      </div>

      {view === 'daily' ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <input type="date" className="input input-bordered input-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            <div className="text-xs text-base-content/40 flex items-center gap-1"><Users size={14} /> {students.length} students</div>
            {markMode && (
              <button onClick={handleMarkAllPresent} className="btn btn-ghost btn-xs text-success">
                <CheckCheck size={14} /> Mark All Present
              </button>
            )}
          </div>

          {students.length === 0 ? (
            <EmptyState title="No students found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>ID</th>
                    <th>Status</th>
                    {markMode && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s._id}>
                      <td className="font-medium">{s.user?.name}</td>
                      <td className="text-sm text-base-content/60">{s.studentId}</td>
                      <td>
                        {getRecordStatus(s._id) ? (
                          <span className={`badge badge-xs ${statusColors[getRecordStatus(s._id)]}`}>{getRecordStatus(s._id)}</span>
                        ) : (
                          <span className="text-xs text-base-content/40">Not marked</span>
                        )}
                      </td>
                      {markMode && (
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => handleMark(s._id, 'present')} className={`btn btn-ghost btn-xs ${getRecordStatus(s._id) === 'present' ? 'text-success' : ''}`}><Check size={14} /></button>
                            <button onClick={() => handleMark(s._id, 'absent')} className={`btn btn-ghost btn-xs ${getRecordStatus(s._id) === 'absent' ? 'text-error' : ''}`}><X size={14} /></button>
                            <button onClick={() => handleMark(s._id, 'late')} className={`btn btn-ghost btn-xs ${getRecordStatus(s._id) === 'late' ? 'text-info' : ''}`}><Clock size={14} /></button>
                            <button onClick={() => handleMark(s._id, 'leave')} className={`btn btn-ghost btn-xs ${getRecordStatus(s._id) === 'leave' ? 'text-warning' : ''}`}><AlertCircle size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <select className="select select-bordered select-xs" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select className="select select-bordered select-xs" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {summary.length === 0 ? (
            <EmptyState title="No attendance data for this month" />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Leave</th>
                    <th>Late</th>
                    <th>Total</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map(s => (
                    <tr key={s._id?._id || s._id}>
                      <td className="font-medium">{s._id?.user?.name}</td>
                      <td><span className="badge badge-xs badge-success">{s.present}</span></td>
                      <td><span className="badge badge-xs badge-error">{s.absent}</span></td>
                      <td><span className="badge badge-xs badge-warning">{s.leave}</span></td>
                      <td><span className="badge badge-xs badge-info">{s.late}</span></td>
                      <td>{s.total}</td>
                      <td>{s.total > 0 ? Math.round((s.present / s.total) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
