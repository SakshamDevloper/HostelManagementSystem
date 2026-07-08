import { useState } from 'react'
import { FileText, Download, Users, CreditCard, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const reports = [
  { key: 'students', label: 'Students Report', icon: Users, description: 'Export all students with room and status details', endpoint: '/api/exports/students' },
  { key: 'payments', label: 'Payments Report', icon: CreditCard, description: 'Export payments with date range filter', endpoint: '/api/exports/payments' },
  { key: 'complaints', label: 'Complaints Report', icon: AlertTriangle, description: 'Export complaints by status', endpoint: '/api/exports/complaints' },
]

export default function ReportsPage() {
  const [loading, setLoading] = useState(null)
  const [filters, setFilters] = useState({ from: '', to: '', status: '' })

  const handleExport = async (report) => {
    setLoading(report.key)
    try {
      const params = {}
      if (report.key === 'payments') {
        if (filters.from) params.from = filters.from
        if (filters.to) params.to = filters.to
      }
      if (report.key === 'complaints' && filters.status) params.status = filters.status

      const response = await api.get(report.endpoint, {
        params,
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${report.key}-report.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${report.label} downloaded`)
    } catch { toast.error('Export failed') }
    finally { setLoading(null) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Exports</h1>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-5">
          <h3 className="font-semibold mb-1">Filters</h3>
          <p className="text-xs text-base-content/60 mb-3">Apply filters before exporting</p>
          <div className="flex gap-3 flex-wrap">
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">From Date</span></label><input type="date" className="input input-bordered input-sm" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">To Date</span></label><input type="date" className="input input-bordered input-sm" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /></div>
            <div className="form-control"><label className="label py-0.5"><span className="label-text text-xs">Status</span></label><select className="select select-bordered select-sm" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="resolved">Resolved</option></select></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(r => (
          <div key={r.key} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <r.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold">{r.label}</h3>
              <p className="text-sm text-base-content/60 mt-1 mb-4">{r.description}</p>
              <button
                onClick={() => handleExport(r)}
                disabled={loading === r.key}
                className="btn btn-primary btn-sm gap-2"
              >
                {loading === r.key ? <span className="loading loading-spinner loading-xs" /> : <Download size={14} />}
                {loading === r.key ? 'Exporting...' : 'Export XLSX'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
