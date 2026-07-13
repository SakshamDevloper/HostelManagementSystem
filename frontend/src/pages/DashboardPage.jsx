import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DoorOpen, CreditCard, AlertTriangle, Clock, UserCheck, DollarSign, BedDouble } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getStats, getRevenue, getActivity, getUpcoming, getOccupancy } from '../services/dashboardService'

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7']

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [activities, setActivities] = useState([])
  const [upcoming, setUpcoming] = useState({ recentCheckouts: [], pendingPayments: [] })
  const [occupancyData, setOccupancyData] = useState([])
  const [loading, setLoading] = useState(true)
  const canViewAll = ['admin', 'staff', 'warden'].includes(user?.role)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, revRes, actRes, upRes, occRes] = await Promise.all([
        getStats(), getRevenue(), getActivity(), getUpcoming(), getOccupancy(),
      ])
      setStats(statsRes.data.data)
      setRevenue(revRes.data.data || [])
      setActivities(actRes.data.data || [])
      setUpcoming(upRes.data.data || { recentCheckouts: [], pendingPayments: [] })
      setOccupancyData(occRes.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!socket) return
    const refresh = () => fetchData()
    socket.on('student:checkin', refresh)
    socket.on('student:checkout', refresh)
    socket.on('payment:received', refresh)
    socket.on('complaint:new', refresh)
    socket.on('room:statusChange', refresh)
    return () => {
      socket.off('student:checkin', refresh)
      socket.off('student:checkout', refresh)
      socket.off('payment:received', refresh)
      socket.off('complaint:new', refresh)
      socket.off('room:statusChange', refresh)
    }
  }, [socket, fetchData])

  if (loading) return <LoadingSpinner fullScreen={false} />

  const revenueData = revenue.map(r => ({
    month: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][r._id.month - 1]} ${r._id.year}`,
    amount: r.total,
  }))

  const colorMap = {
    create: 'text-success',
    update: 'text-info',
    delete: 'text-error',
    login: 'text-primary',
    checkout: 'text-warning',
    allocate: 'text-info',
  }

  const roleBadge = {
    admin: 'badge-error',
    staff: 'badge-info',
    warden: 'badge-warning',
    student: 'badge-success',
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-base-content/60">
            Welcome back, <span className="font-medium">{user?.name}</span>
            <span className={`badge badge-xs ml-2 ${roleBadge[user?.role] || 'badge-ghost'}`}>{user?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </div>

      {canViewAll ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            <StatCard title="Students" value={stats?.totalStudents || 0} icon={Users} subtitle={`${stats?.activeStudents || 0} active`} />
            <StatCard title="Rooms" value={stats?.totalRooms || 0} icon={DoorOpen} subtitle={`${stats?.occupiedRooms || 0} occupied`} />
            <StatCard title="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="success" subtitle="Total collected" />
            <StatCard title="Occupancy" value={`${stats?.occupancyRate || 0}%`} icon={BedDouble} subtitle={`${stats?.occupiedRooms || 0}/${stats?.totalRooms || 0}`} />
            <StatCard title="Pending" value={stats?.pendingComplaints || 0} icon={AlertTriangle} color="warning" subtitle="Complaints" />
            <StatCard title="Staff" value={stats?.totalStaff || 0} icon={UserCheck} subtitle="Active staff" />
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4 sm:p-5">
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Revenue (Last 6 Months)</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--fallback-bc, oklch(var(--bc)/0.1))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--fallback-bc, oklch(var(--bc)/0.3))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--fallback-bc, oklch(var(--bc)/0.3))" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--fallback-b1, oklch(var(--b1)))', border: '1px solid var(--fallback-bc, oklch(var(--bc)/0.2))', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="amount" stroke="oklch(var(--p))" strokeWidth={2} dot={{ fill: 'oklch(var(--p))', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <StatCard title="My Payments" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={CreditCard} color="success" subtitle="Total paid" />
          <StatCard title="Pending Dues" value={stats?.pendingComplaints || 0} icon={AlertTriangle} color="error" subtitle="Pending payments" />
          <StatCard title="Occupancy" value={`${stats?.occupancyRate || 0}%`} icon={BedDouble} subtitle="Hostel occupancy" />
          <StatCard title="Staff" value={stats?.totalStaff || 0} icon={UserCheck} subtitle="Active staff" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 sm:p-5">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Occupancy by Room Type</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={occupancyData.map(o => ({ name: o._id, value: o.occupied }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {occupancyData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={(value, entry) => `${value}: ${entry.payload?.value ?? 0}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 sm:p-5">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Room Distribution</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--fallback-bc, oklch(var(--bc)/0.1))" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="var(--fallback-bc, oklch(var(--bc)/0.3))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--fallback-bc, oklch(var(--bc)/0.3))" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--fallback-b1, oklch(var(--b1)))', border: '1px solid var(--fallback-bc, oklch(var(--bc)/0.2))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill="oklch(var(--p))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="occupied" name="Occupied" fill="oklch(var(--s))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {canViewAll && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4 sm:p-5">
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Recent Activity</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {activities.length === 0 && <p className="text-sm text-base-content/60 text-center py-4">No activity yet</p>}
                {activities.map((act) => (
                  <div key={act._id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${colorMap[act.action] || 'text-base-content/40'}`} style={{ backgroundColor: 'currentColor' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">{act.user?.name || 'System'}</span>
                        {' '}{act.action}d{' '}
                        <span className="font-medium lowercase">{act.resource}</span>
                      </p>
                      <p className="text-xs text-base-content/40">{new Date(act.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4 sm:p-5">
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Checkouts & Pending Dues</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {upcoming.recentCheckouts?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-warning mb-2 flex items-center gap-1"><Clock size={12} /> Recent Checkouts</p>
                    {upcoming.recentCheckouts.map(s => (
                      <div key={s._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg mb-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{s.user?.name}</p>
                          <p className="text-xs text-base-content/60">Room {s.room?.roomNumber}</p>
                        </div>
                        <span className="text-xs text-base-content/60 ml-2">{new Date(s.checkOutDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {upcoming.pendingPayments?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-error mb-2 flex items-center gap-1"><DollarSign size={12} /> Pending Payments</p>
                    {upcoming.pendingPayments.map(p => (
                      <div key={p._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg mb-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{p.student?.user?.name}</p>
                          <p className="text-xs text-base-content/60">{p.month}/{p.year}</p>
                        </div>
                        <span className="text-sm font-semibold text-error ml-2">₹{p.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(!upcoming.recentCheckouts?.length && !upcoming.pendingPayments?.length) && (
                  <p className="text-sm text-base-content/60 text-center py-4">No pending items — all clear!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
