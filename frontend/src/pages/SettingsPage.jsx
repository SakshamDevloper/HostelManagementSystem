import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Bell, Shield, Monitor } from 'lucide-react'

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-primary" /> Appearance
          </h3>

          <div className="flex items-center justify-between p-3 rounded-lg bg-base-200">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-warning" />}
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-base-content/60">{darkMode ? 'Dark theme active' : 'Light theme active'}</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={darkMode} onChange={toggleTheme} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Bell size={16} className="text-primary" /> Notifications
          </h3>
          <p className="text-sm text-base-content/60 mb-3">Manage your notification preferences (coming soon)</p>
          {['Payment reminders', 'Complaint updates', 'Announcements', 'Leave status'].map(item => (
            <div key={item} className="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
              <span className="text-sm">{item}</span>
              <input type="checkbox" className="toggle toggle-sm" defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Shield size={16} className="text-primary" /> Account
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-base-200">
              <div>
                <p className="text-sm font-medium">Session Management</p>
                <p className="text-xs text-base-content/60">Logged in with JWT cookie authentication</p>
              </div>
              <span className="badge badge-xs badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
