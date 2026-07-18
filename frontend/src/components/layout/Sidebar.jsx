import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, DoorOpen, CreditCard, AlertTriangle,
  LogOut, CalendarClock, UserCheck, ClipboardList, Bell,
  UsersRound, FileText, Settings, Activity, Menu, X, Hotel, ClipboardCheck, ArrowLeftRight, UtensilsCrossed
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'staff', 'student', 'parent', 'warden'] },
  { to: '/students', icon: Users, label: 'Students', roles: ['admin', 'staff', 'warden'] },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms', roles: ['admin', 'staff', 'warden'] },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers', roles: ['admin', 'student', 'warden'] },
  { to: '/payments', icon: CreditCard, label: 'Payments', roles: ['admin', 'staff', 'student', 'warden'] },
  { to: '/mess-menu', icon: UtensilsCrossed, label: 'Mess Menu', roles: ['admin', 'staff', 'student', 'warden'] },
  { to: '/mess-menu/manage', icon: UtensilsCrossed, label: 'Menu Editor', roles: ['admin', 'warden'] },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance', roles: ['student', 'warden'] },
  { to: '/complaints', icon: AlertTriangle, label: 'Complaints', roles: ['admin', 'staff', 'student', 'warden'] },
  { to: '/leaves', icon: CalendarClock, label: 'Leaves', roles: ['student', 'warden'] },
  { to: '/visitors', icon: UserCheck, label: 'Visitors', roles: ['admin', 'staff', 'warden', 'security'] },
  { to: '/notices', icon: ClipboardList, label: 'Notices', roles: ['admin', 'staff', 'student', 'parent', 'warden'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'staff', 'student', 'parent', 'warden'] },
  { to: '/staff', icon: UsersRound, label: 'Staff', roles: ['admin', 'warden'] },
  { to: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'warden'] },
  { to: '/audit-log', icon: Activity, label: 'Audit Log', roles: ['admin'] },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role))

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
      isActive
        ? 'bg-primary text-primary-content font-medium shadow-sm'
        : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
    }`

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-3 border-b border-base-300">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Hotel className="text-primary" size={22} />
            <span className="font-bold text-sm">Hostel HMS</span>
          </div>
        )}
        {collapsed && <Hotel className="text-primary mx-auto" size={22} />}
        <button onClick={() => { setCollapsed(!collapsed); if (mobileOpen && !collapsed) onClose?.() }} className="btn btn-ghost btn-xs btn-square hidden lg:flex">
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
        <button onClick={onClose} className="btn btn-ghost btn-xs btn-square lg:hidden">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.map(item => (
          <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/dashboard'} onClick={onClose}>
            <item.icon size={18} />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-base-300 space-y-1">
        <NavLink to="/profile" className={linkClass} onClick={onClose}>
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
        <NavLink to="/settings" className={linkClass} onClick={onClose}>
          <Settings size={18} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </NavLink>
        <button onClick={() => { logout(); onClose?.() }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base-content/70 hover:bg-error/10 hover:text-error w-full transition-colors duration-150">
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className={`h-screen bg-base-100 border-r border-base-300 flex-col transition-all duration-200 hidden lg:flex ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent}
      </aside>
      <aside className={`fixed top-0 left-0 h-screen bg-base-100 border-r border-base-300 flex-col transition-transform duration-200 z-30 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} w-72`}>
        {sidebarContent}
      </aside>
    </>
  )
}
