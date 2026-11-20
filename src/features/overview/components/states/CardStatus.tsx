import { Loader2, AlertTriangle } from 'lucide-react'

export function CardLoading({ label = 'Syncing live feed…' }: { label?: string }) {
  return (
    <div className="h-full min-h-[120px] flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
      <Loader2 size={18} className="animate-spin text-[var(--accent-blue)]" />
      <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
    </div>
  )
}

export function CardError({ message = 'Failed to load data' }: { message?: string }) {
  const friendly = /permission|insufficient/i.test(message)
    ? 'Firestore permission denied — check security rules for this collection.'
    : /unavailable|network|timeout|offline/i.test(message)
      ? 'Connection lost — Firestore is unreachable. Retrying automatically…'
      : message
  return (
    <div className="h-full min-h-[120px] flex flex-col items-center justify-center gap-1.5 text-center px-4">
      <AlertTriangle size={18} className="text-rose-400" />
      <span className="text-[11px] font-mono text-rose-300 max-w-xs">{friendly}</span>
      {friendly !== message && (
        <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest break-all max-w-xs">
          {message}
        </span>
      )}
    </div>
  )
}
