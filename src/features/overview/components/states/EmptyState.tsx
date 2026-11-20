import { ShieldAlert } from 'lucide-react'

interface EmptyStateProps {
  message?: string
  subMessage?: string
  onResetFilters?: () => void
}

export function EmptyState({
  message = 'No records found',
  subMessage = 'No operational entries recorded under current parameters.',
  onResetFilters,
}: EmptyStateProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] mb-2.5">
        <ShieldAlert size={18} />
      </div>
      <p className="text-xs font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
        {message}
      </p>
      {subMessage && (
        <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1 max-w-xs">
          {subMessage}
        </p>
      )}
      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-3 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
