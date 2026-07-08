import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmClass = 'btn-error' }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-base-content/60">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={onConfirm} className={`btn btn-sm ${confirmClass}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
