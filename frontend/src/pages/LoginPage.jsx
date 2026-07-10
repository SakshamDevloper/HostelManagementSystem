import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Hotel, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.success) setError(result.message)
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Hotel size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Hostel Management</h1>
            <p className="text-sm text-base-content/60 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="alert alert-error text-sm mb-4 py-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm">Email</span></label>
              <div>
                <input
                  type="email"
                  placeholder="admin@hostel.com"
                  className="input input-bordered input-sm w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm">Password</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered input-sm w-full pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-sm w-full" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <p className="text-xs font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-base-content/60">Admin: admin@hostel.com / admin123</p>
            <p className="text-xs text-base-content/60">Student: student@hostel.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
