import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import logoUrl from '@/assets/sigtrack-logo.png'

interface SummaryCardProps {
  title: string
  icon: LucideIcon
  accentColor?: string
  badge?: ReactNode
  children?: ReactNode
  footer?: ReactNode
}

export function SummaryCard({
  title,
  icon: Icon,
  accentColor = 'text-blue-400',
  badge,
  children,
  footer,
}: SummaryCardProps) {
  return (
    <div className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:border-[var(--bg-tertiary)] transition-colors flex flex-col h-full`}>
      {/* Card Header — matches real SigTrack panel headers */}
      <div className={`flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/60 shrink-0`}>
        <div className="flex items-center gap-2 min-w-0">
          {/* Accent left bar */}
          <div className={`w-0.5 h-4 rounded-full bg-current ${accentColor} shrink-0`} />
          <Icon size={14} className={`${accentColor} shrink-0`} />
          <span className={`text-[11px] font-bold font-mono uppercase tracking-widest truncate ${accentColor}`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {badge}
        </div>
      </div>

      {/* Card Body - scrollable */}
      <div className="relative flex-1 min-h-0 overflow-y-auto p-4">
        {/* In-card watermark */}
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 m-auto h-24 w-auto object-contain opacity-[0.07] select-none"
        />
        <div className="relative z-10">{children}</div>
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]/40 shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}
