const bgMap = {
  primary: 'bg-primary/10',
  info: 'bg-info/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  error: 'bg-error/10',
}

const textMap = {
  primary: 'text-primary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}

export default function StatCard({ title, value, icon: Icon, color = 'primary', subtitle, trend }) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-base-content/60 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-base-content/40 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl ${bgMap[color] || 'bg-primary/10'} flex items-center justify-center`}>
            <Icon size={20} className={`${textMap[color] || 'text-primary'}`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-success' : 'text-error'}`}>
            <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
            <span className="text-base-content/40">vs last month</span>
          </div>
        )}
      </div>
    </div>
  )
}
