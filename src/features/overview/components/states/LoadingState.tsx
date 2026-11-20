import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading operational data...' }: LoadingStateProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
      <Loader2 size={22} className="text-[var(--accent-blue)] animate-spin mb-3" />
      <p className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">{message}</p>
    </div>
  )
}

export function FullDashboardSkeleton({ message = 'Connecting to SigTrak tactical feed...' }: LoadingStateProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono flex flex-col">
      {/* Skeleton Header */}
      <header className="h-14 shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] animate-pulse" />
          <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          <div className="h-4 w-16 bg-[var(--bg-tertiary)] rounded animate-pulse hidden md:block" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          <div className="h-7 w-16 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Skeleton Metrics Banner */}
      <div className="border-b border-[var(--border-color)] flex divide-x divide-[var(--border-color)]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-14 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              <div className="h-5 w-8 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <Loader2 size={28} className="text-[var(--accent-blue)] animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--accent-blue)] tracking-widest uppercase">SIGTRACK C2</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">{message}</p>
        </div>
      </div>
    </div>
  )
}
