import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DoorOpen, CreditCard, AlertTriangle, Clock, UserCheck, DollarSign, BedDouble } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getStats, getRevenue, getActivity, getUpcoming, getOccupancy } from '../services/dashboardService'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [activities, setActivities] = useState([])
  const [upcoming, setUpcoming] = useState({ upcomingCheckouts: [], pendingPayments: [] })
  const [occupancyData, setOccupancyData] = useState([])
  const [loading, setLoading] = useState(true)
  const isAdmin = user?.role === 'admin'
  const isStaff = user?.role === 'staff'
  const canViewAll = isAdmin || isStaff

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, revRes, actRes, upRes, occRes] = await Promise.all([
        getStats(), getRevenue(), getActivity(), getUpcoming(), getOccupancy(),
      ])
      setStats(statsRes.data.data)
      setRevenue(revRes.data.data || [])
      setActivities(actRes.data.data || [])
      setUpcoming(upRes.data.data || { upcomingCheckouts: [], pendingPayments: [] })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </div>

      {canViewAll ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} subtitle={`${stats?.activeStudents || 0} active`} />
            <StatCard title="Rooms" value={stats?.totalRooms || 0} icon={DoorOpen} subtitle={`${stats?.occupiedRooms || 0} occupied`} />
            <StatCard title="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} subtitle="Total collected" />
            <StatCard title="Pending Complaints" value={stats?.pendingComplaints || 0} icon={AlertTriangle} subtitle="Open complaints" />
            <StatCard title="Occupancy" value={`${stats?.occupancyRate || 0}%`} icon={BedDouble} subtitle={`${stats?.occupiedRooms || 0}/${stats?.totalRooms || 0} rooms`} />
            <StatCard title="Staff" value={stats?.totalStaff || 0} icon={UserCheck} subtitle="Active staff" />
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <h3 className="font-semibold mb-4">Revenue (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={250}>
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
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Payments" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={CreditCard} subtitle="Total paid" />
          <StatCard title="Pending Dues" value={stats?.pendingComplaints || 0} icon={AlertTriangle} subtitle="Pending payments" />
          <StatCard title="Occupancy" value={`${stats?.occupancyRate || 0}%`} icon={BedDouble} subtitle="Hostel occupancy" />
          <StatCard title="Staff" value={stats?.totalStaff || 0} icon={UserCheck} subtitle="Active staff" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h3 className="font-semibold mb-4">Occupancy by Room Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={occupancyData.map(o => ({ name: o._id, value: o.occupied }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {occupancyData.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7'][i % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(value, entry) => `${value}: ${entry.payload?.value ?? 0}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h3 className="font-semibold mb-4">Room Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fallback-bc, oklch(var(--bc)/0.1))" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="var(--fallback-bc, oklch(var(--bc)/0.3))" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--fallback-bc, oklch(var(--bc)/0.3))" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--fallback-b1, oklch(var(--b1)))', border: '1px solid var(--fallback-bc, oklch(var(--bc)/0.2))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="total" name="Total Rooms" fill="oklch(var(--p))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="occupied" name="Occupied" fill="oklch(var(--s))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {canViewAll && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
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
            <div className="card-body p-5">
              <h3 className="font-semibold mb-4">Upcoming Checkouts & Dues</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {upcoming.upcomingCheckouts?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-warning mb-2 flex items-center gap-1"><Clock size={12} /> Checkouts this week</p>
                    {upcoming.upcomingCheckouts.map(s => (
                      <div key={s._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg mb-1">
                        <div>
                          <p className="text-sm font-medium">{s.user?.name}</p>
                          <p className="text-xs text-base-content/60">Room {s.room?.roomNumber}</p>
                        </div>
                        <span className="text-xs text-base-content/60">{new Date(s.checkOutDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {upcoming.pendingPayments?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-error mb-2 flex items-center gap-1"><DollarSign size={12} /> Pending Payments</p>
                    {upcoming.pendingPayments.map(p => (
                      <div key={p._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg mb-1">
                        <div>
                          <p className="text-sm font-medium">{p.student?.user?.name}</p>
                          <p className="text-xs text-base-content/60">{p.month}/{p.year}</p>
                        </div>
                        <span className="text-sm font-semibold text-error">₹{p.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(!upcoming.upcomingCheckouts?.length && !upcoming.pendingPayments?.length) && (
                  <p className="text-sm text-base-content/60 text-center py-4">All clear!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
