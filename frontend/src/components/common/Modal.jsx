import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className={`bg-base-100 rounded-2xl shadow-2xl w-full ${sizes[size]}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-square">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
