import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, UserCheck, CreditCard, AlertTriangle, Clock } from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getStudent, checkoutStudent } from '../services/studentService'
import { getStudentPayments } from '../services/paymentService'
import { getLeaves } from '../services/leaveService'
import toast from 'react-hot-toast'

export default function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, pRes, lRes] = await Promise.all([
          getStudent(id), getStudentPayments(id), getLeaves({ studentId: id }),
        ])
        setStudent(sRes.data.data)
        setPayments(pRes.data.data || [])
        setLeaves(lRes.data.data || [])
      } catch { toast.error('Student not found'); navigate('/students') }
      finally { setLoading(false) }
    }
    fetch()
  }, [id])

  const handleCheckout = async () => {
    if (!confirm('Check out this student?')) return
    try {
      await checkoutStudent(id)
      toast.success('Student checked out')
      const { data } = await getStudent(id)
      setStudent(data.data)
    } catch { toast.error('Checkout failed') }
  }

  if (loading) return <LoadingSpinner fullScreen={false} />
  if (!student) return null

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/students')} className="btn btn-ghost btn-sm gap-2">
        <ArrowLeft size={16} /> Back to Students
      </button>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-16 h-16 text-xl">
                  {student.user?.name?.charAt(0) || 'S'}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">{student.user?.name}</h2>
                <p className="text-sm text-base-content/60">{student.studentId}</p>
                <span className={`badge badge-sm mt-1 ${student.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>{student.status}</span>
              </div>
            </div>
            {student.status === 'active' && (
              <button onClick={handleCheckout} className="btn btn-outline btn-sm btn-warning gap-2">
                <UserCheck size={14} /> Check Out
              </button>
            )}
          </div>

          <div className="divider mt-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm"><Mail size={14} className="text-base-content/40" /> {student.user?.email}</div>
            <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-base-content/40" /> {student.user?.phone || 'N/A'}</div>
            <div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-base-content/40" /> DOB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
            <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-base-content/40" /> {student.address || 'No address'}</div>
            <div className="flex items-center gap-2 text-sm"><Shield size={14} className="text-base-content/40" /> Gender: {student.gender}</div>
            <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-base-content/40" /> Check In: {student.checkInDate ? new Date(student.checkInDate).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-primary" />
            <h3 className="font-semibold">Guardian Information</h3>
          </div>
          {student.guardian?.name ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-base-content/40">Name:</span> {student.guardian.name}</div>
              <div><span className="text-base-content/40">Phone:</span> {student.guardian.phone || 'N/A'}</div>
              <div><span className="text-base-content/40">Email:</span> {student.guardian.email || 'N/A'}</div>
            </div>
          ) : (
            <p className="text-sm text-base-content/40">No guardian information</p>
          )}
        </div>
      </div>

      <div className="tabs tabs-bordered">
        <button className={`tab tab-sm ${tab === 'overview' ? 'tab-active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab tab-sm ${tab === 'payments' ? 'tab-active' : ''}`} onClick={() => setTab('payments')}>Payments</button>
        <button className={`tab tab-sm ${tab === 'leaves' ? 'tab-active' : ''}`} onClick={() => setTab('leaves')}>Leaves</button>
      </div>

      {tab === 'overview' && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-3"><CreditCard size={14} className="text-primary" /><h3 className="font-semibold">Payment Summary</h3></div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-base-200 rounded-lg text-center">
                <p className="text-xs text-base-content/60">Total Paid</p>
                <p className="text-lg font-bold text-success">₹{payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-base-200 rounded-lg text-center">
                <p className="text-xs text-base-content/60">Payments</p>
                <p className="text-lg font-bold">{payments.length}</p>
              </div>
              <div className="p-3 bg-base-200 rounded-lg text-center">
                <p className="text-xs text-base-content/60">Pending</p>
                <p className="text-lg font-bold text-warning">{payments.filter(p => p.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            {payments.length === 0 ? (
              <p className="text-sm text-base-content/60 text-center py-4">No payments recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Receipt</th>
                      <th>Amount</th>
                      <th>Month/Year</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td className="text-xs font-mono">{p.receiptNo}</td>
                        <td className="text-sm font-medium">₹{p.totalAmount?.toLocaleString()}</td>
                        <td className="text-sm">{p.month}/{p.year}</td>
                        <td className="text-sm capitalize">{p.type}</td>
                        <td><span className={`badge badge-sm ${p.status === 'paid' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>{p.status}</span></td>
                        <td className="text-xs text-base-content/60">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'leaves' && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            {leaves.length === 0 ? (
              <p className="text-sm text-base-content/60 text-center py-4">No leave requests</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l._id}>
                        <td className="text-sm">{new Date(l.fromDate).toLocaleDateString()}</td>
                        <td className="text-sm">{new Date(l.toDate).toLocaleDateString()}</td>
                        <td className="text-sm">{l.reason}</td>
                        <td><span className={`badge badge-sm ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
