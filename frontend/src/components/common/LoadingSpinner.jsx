export default function LoadingSpinner({ fullScreen = true }) {
  const content = (
    <div className="flex items-center justify-center gap-3">
      <span className="loading loading-spinner loading-md text-primary"></span>
      <span className="text-sm text-base-content/60">Loading...</span>
    </div>
  )
  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center bg-base-200">{content}</div>
  }
  return <div className="flex items-center justify-center py-12">{content}</div>
}
