import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, DoorOpen, CreditCard, AlertTriangle,
  LogOut, CalendarClock, UserCheck, ClipboardList, Bell,
  UsersRound, FileText, Settings, Activity, Menu, X, Hotel, ClipboardCheck, ArrowLeftRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'staff', 'student', 'parent'] },
  { to: '/students', icon: Users, label: 'Students', roles: ['admin', 'staff'] },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms', roles: ['admin', 'staff'] },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers', roles: ['admin', 'staff', 'student'] },
  { to: '/payments', icon: CreditCard, label: 'Payments', roles: ['admin', 'staff', 'student'] },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance', roles: ['admin', 'staff', 'student'] },
  { to: '/complaints', icon: AlertTriangle, label: 'Complaints', roles: ['admin', 'staff', 'student'] },
  { to: '/leaves', icon: CalendarClock, label: 'Leaves', roles: ['admin', 'staff', 'student'] },
  { to: '/visitors', icon: UserCheck, label: 'Visitors', roles: ['admin', 'staff', 'security'] },
  { to: '/notices', icon: ClipboardList, label: 'Notices', roles: ['admin', 'staff', 'student', 'parent'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'staff', 'student', 'parent'] },
  { to: '/staff', icon: UsersRound, label: 'Staff', roles: ['admin'] },
  { to: '/reports', icon: FileText, label: 'Reports', roles: ['admin'] },
  { to: '/audit-log', icon: Activity, label: 'Audit Log', roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role))

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
      isActive
        ? 'bg-primary text-primary-content font-medium shadow-sm'
        : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
    }`

  return (
    <aside className={`h-screen bg-base-100 border-r border-base-300 flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center justify-between p-3 border-b border-base-300">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Hotel className="text-primary" size={22} />
            <span className="font-bold text-sm">Hostel HMS</span>
          </div>
        )}
        {collapsed && <Hotel className="text-primary mx-auto" size={22} />}
        <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost btn-xs btn-square">
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.map(item => (
          <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/dashboard'}>
            <item.icon size={18} />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-base-300 space-y-1">
        <NavLink to="/profile" className={linkClass}>
          {user?.photo ? (
            <div className="avatar">
              <div className="w-6 rounded-full">
                <img src={user.photo} alt="" />
              </div>
            </div>
          ) : (
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-6 h-6 text-xs">
                <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </div>
          )}
          {!collapsed && <span className="text-sm truncate">{user?.name}</span>}
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <Settings size={18} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </NavLink>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base-content/70 hover:bg-error/10 hover:text-error w-full transition-colors duration-150">
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
