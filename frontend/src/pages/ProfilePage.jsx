import { useState } from 'react'
import { User, Mail, Phone, Shield, Save, Camera, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function ProfilePage() {
  const { user, loadUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const { data } = await api.post('/api/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      await api.put('/api/auth/profile', { photo: data.data?.url || data.url })
      toast.success('Photo updated')
      loadUser()
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/api/auth/profile', form)
      toast.success('Profile updated')
      setEditing(false)
      loadUser()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setSaving(true)
    try {
      await api.put('/api/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPassword(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {user?.photo ? (
                <div className="avatar">
                  <div className="w-20 rounded-full">
                    <img src={user.photo} alt="Profile" />
                  </div>
                </div>
              ) : (
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-20 h-20 text-3xl">
                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 btn btn-circle btn-xs btn-primary">
                <Camera size={12} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-base-content/60 capitalize">{user?.role}</p>
              <p className="text-xs text-base-content/40 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="divider" />

          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-sm flex items-center gap-2"><User size={14} /> Name</span></label>
                <input
                  className="input input-bordered input-sm"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-sm flex items-center gap-2"><Mail size={14} /> Email</span></label>
                <input className="input input-bordered input-sm" value={user?.email || ''} disabled />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-sm flex items-center gap-2"><Phone size={14} /> Phone</span></label>
                <input
                  className="input input-bordered input-sm"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-sm flex items-center gap-2"><Shield size={14} /> Role</span></label>
                <input className="input input-bordered input-sm" value={user?.role || ''} disabled />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              {editing ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="btn btn-primary btn-sm gap-2">
                    {saving ? <span className="loading loading-spinner loading-xs" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setEditing(true)} className="btn btn-primary btn-sm gap-2">
                  <Camera size={14} /> Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-2 text-sm font-semibold mb-4"
          >
            <Lock size={16} className="text-primary" />
            Change Password
          </button>

          {showPassword && (
            <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
              <div className="form-control">
                <label className="label py-0.5"><span className="label-text text-xs">Current Password</span></label>
                <input type="password" required className="input input-bordered input-sm" value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-0.5"><span className="label-text text-xs">New Password</span></label>
                  <input type="password" required className="input input-bordered input-sm" value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label py-0.5"><span className="label-text text-xs">Confirm Password</span></label>
                  <input type="password" required className="input input-bordered input-sm" value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm gap-2">
                {saving ? <span className="loading loading-spinner loading-xs" /> : <Lock size={14} />}
                Change Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
