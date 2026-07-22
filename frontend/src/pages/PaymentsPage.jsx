import { useState, useEffect } from 'react'
import { Plus, Search, CreditCard, DollarSign, Printer, Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { getPayments, createPayment, getDues } from '../services/paymentService'
import { getStudents } from '../services/studentService'

export default function PaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [dues, setDues] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDues, setShowDues] = useState(false)
  const [students, setStudents] = useState([])
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ student: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), type: 'rent', paymentMethod: 'cash', notes: '' })
  const canRecord = ['admin', 'staff', 'warden'].includes(user?.role)

  const fetchPayments = async () => {
    try {
      const params = {}
      if (filterMonth) params.month = filterMonth
      if (filterYear) params.year = filterYear
      if (filterStatus) params.status = filterStatus
      const [pRes, dRes] = await Promise.all([getPayments(params), getDues()])
      setPayments(pRes.data.data || [])
      setDues(dRes.data.data || [])
    } catch { toast.error('Failed to load payments') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPayments() }, [filterMonth, filterYear, filterStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await createPayment({ ...form, amount: parseFloat(form.amount) })
      toast.success('Payment recorded')
      setShowModal(false)
      setForm({ student: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), type: 'rent', paymentMethod: 'cash', notes: '' })
      fetchPayments()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to record payment') }
    finally { setSubmitting(false) }
  }

  const openAddPayment = async () => {
    setShowModal(true)
    try {
      const { data } = await getStudents({ status: 'active', limit: 200 })
      setStudents(data.data || [])
    } catch { }
  }

  const handlePrint = (payment) => {
    const printWin = window.open('', '_blank')
    printWin.document.write(`
      <html><head><title>Receipt ${payment.receiptNo}</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:400px;margin:auto}table{width:100%;border-collapse:collapse}td{padding:6px 0}hr{border:none;border-top:1px dashed #ccc}</style>
      </head><body>
      <h2 style="text-align:center;">Payment Receipt</h2>
      <hr>
      <table><tr><td>Receipt No:</td><td><b>${payment.receiptNo}</b></td></tr>
      <tr><td>Student:</td><td><b>${payment.student?.user?.name || ''}</b></td></tr>
      <tr><td>Amount:</td><td><b>₹${payment.totalAmount?.toLocaleString()}</b></td></tr>
      <tr><td>Type:</td><td>${payment.type}</td></tr>
      <tr><td>Month/Year:</td><td>${payment.month}/${payment.year}</td></tr>
      <tr><td>Date:</td><td>${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : ''}</td></tr>
      <tr><td>Method:</td><td>${payment.paymentMethod}</td></tr></table>
      <hr>
      <p style="text-align:center;font-size:12px;color:#666;">Thank you for your payment</p>
      <script>window.print();window.close();</script></body></html>
    `)
    printWin.document.close()
  }

  if (loading) return <LoadingSpinner fullScreen={false} />

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDues(!showDues)} className="btn btn-ghost btn-sm relative">
            <DollarSign size={16} /> Dues
            {dues.length > 0 && <span className="badge badge-error badge-xs ml-1">{dues.length}</span>}
          </button>
          {canRecord && <button onClick={openAddPayment} className="btn btn-primary btn-sm"><Plus size={16} /> Record Payment</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-100 border border-base-300 rounded-lg p-3"><div className="stat-title text-xs">Total Collected</div><div className="stat-value text-lg text-success">₹{totalPaid.toLocaleString()}</div></div>
        <div className="stat bg-base-100 border border-base-300 rounded-lg p-3"><div className="stat-title text-xs">Transactions</div><div className="stat-value text-lg">{payments.length}</div></div>
        <div className="stat bg-base-100 border border-base-300 rounded-lg p-3"><div className="stat-title text-xs">Pending Dues</div><div className="stat-value text-lg text-warning">{dues.length}</div></div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select className="select select-bordered select-xs" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <select className="select select-bordered select-xs" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="select select-bordered select-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {showDues && (
        <div className="card bg-base-100 border border-warning/30 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><DollarSign size={14} className="text-warning" /> Pending Dues</h3>
            {dues.length === 0 ? <p className="text-xs text-base-content/60 py-2">No pending dues!</p> : (
              <div className="space-y-1 mt-2">
                {dues.map(d => (
                  <div key={d._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg text-sm">
                    <span>{d.student?.user?.name} — {d.receiptNo || `${d.month}/${d.year}`}</span>
                    <span className="font-semibold text-warning">₹{d.totalAmount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <EmptyState title="No payments" action={canRecord ? <button onClick={openAddPayment} className="btn btn-primary btn-sm"><Plus size={16} /> Record Payment</button> : undefined} />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm table-zebra">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Type</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td className="text-xs font-mono">{p.receiptNo}</td>
                  <td className="text-sm">{p.student?.user?.name || 'N/A'}</td>
                  <td className="text-sm font-medium">₹{p.totalAmount?.toLocaleString()}</td>
                  <td className="text-xs">{p.month}/{p.year}</td>
                  <td className="text-xs capitalize">{p.type}</td>
                  <td className="text-xs">{p.paymentMethod}</td>
                  <td><span className={`badge badge-xs ${p.status === 'paid' ? 'badge-success' : p.status === 'overdue' ? 'badge-error' : 'badge-warning'}`}>{p.status}</span></td>
                  <td className="text-xs text-base-content/60">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
                  <td><button onClick={() => handlePrint(p)} className="btn btn-ghost btn-xs" title="Print receipt"><Printer size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label py-0.5"><span className="label-text text-xs">Student</span></label>
            <select required className="select select-bordered select-sm" value={form.student} onChange={e => setForm({ ...form, student: e.target.value })}>
              <option value="">Select student...</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Amount (₹)</span></label><input type="number" required className="input input-bordered input-sm" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Type</span></label><select className="select select-bordered select-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="rent">Rent</option><option value="deposit">Deposit</option><option value="fine">Fine</option><option value="other">Other</option></select></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Month</span></label><input type="number" min="1" max="12" required className="input input-bordered input-sm" value={form.month} onChange={e => setForm({ ...form, month: parseInt(e.target.value) })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Year</span></label><input type="number" required className="input input-bordered input-sm" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Method</span></label><select className="select select-bordered select-sm" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}><option value="cash">Cash</option><option value="bankTransfer">Bank Transfer</option><option value="online">Online</option><option value="cheque">Cheque</option></select></div>
          </div>
          <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Notes</span></label><input className="input input-bordered input-sm" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Recording...' : 'Record'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
