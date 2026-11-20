import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
        <AlertTriangle size={22} />
      </div>
      <p className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wide">
        Operational Sync Error
      </p>
      <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-emerald-500/60 hover:text-emerald-400 transition-colors"
        >
          <RefreshCw size={12} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  )
}
