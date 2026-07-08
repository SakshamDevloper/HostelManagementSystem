import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'No data found', description = 'There are no items to display.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mb-4">
        <Inbox size={28} className="text-base-content/40" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-base-content/60 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
