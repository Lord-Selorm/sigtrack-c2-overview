import { FileText, Target, BookOpen, Mail, Siren, AlertTriangle } from 'lucide-react'

interface MetricsBannerProps {
  sitrepCount: number
  operationsCount: number
  activeOperations: number
  loggingCount: number
  highPriorityLogs: number
  reportsCount: number
  unreadReports: number
  sosCount: number
  activeSosCount: number
}

interface StatCell {
  label: string
  value: number
  sub?: string
  subValue?: number
  icon: React.ElementType
  accent: string
  accentBg: string
  alert?: boolean
}

export function MetricsBanner({
  sitrepCount,
  operationsCount,
  activeOperations,
  loggingCount,
  highPriorityLogs,
  reportsCount,
  unreadReports,
  sosCount,
  activeSosCount,
}: MetricsBannerProps) {
  const stats: StatCell[] = [
    {
      label: 'SITREPs',
      value: sitrepCount,
      sub: sitrepCount === 1 ? 'report' : 'reports',
      icon: FileText,
      accent: 'text-sky-400',
      accentBg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Operations',
      value: operationsCount,
      sub: `${activeOperations} active`,
      subValue: activeOperations,
      icon: Target,
      accent: 'text-amber-400',
      accentBg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Battle Logs',
      value: loggingCount,
      sub: highPriorityLogs > 0 ? `${highPriorityLogs} HIGH` : 'events',
      subValue: highPriorityLogs,
      icon: BookOpen,
      accent: highPriorityLogs > 0 ? 'text-rose-400' : 'text-emerald-400',
      accentBg: highPriorityLogs > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
      alert: highPriorityLogs > 0,
    },
    {
      label: 'Reports',
      value: reportsCount,
      sub: unreadReports > 0 ? `${unreadReports} unread` : 'signals',
      subValue: unreadReports,
      icon: Mail,
      accent: unreadReports > 0 ? 'text-blue-400' : 'text-purple-400',
      accentBg: unreadReports > 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'SOS Alerts',
      value: sosCount,
      sub: activeSosCount > 0 ? `${activeSosCount} ACTIVE` : 'history',
      subValue: activeSosCount,
      icon: Siren,
      accent: activeSosCount > 0 ? 'text-rose-400' : 'text-[var(--text-secondary)]',
      accentBg: activeSosCount > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[var(--bg-tertiary)]/40 border-[var(--border-color)]',
      alert: activeSosCount > 0,
    },
  ]

  return (
    <div className="shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div className="flex items-stretch divide-x divide-[var(--border-color)] overflow-x-auto">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex-1 flex items-center gap-3 px-4 lg:px-6 py-3 hover:bg-[var(--bg-tertiary)]/5 transition-colors min-w-[104px] sm:min-w-0 group"
            >
              {/* Icon box */}
              <div className={`p-2 rounded-lg border shrink-0 ${s.accentBg} transition-colors group-hover:border-opacity-40`}>
                <Icon size={15} className={s.accent} />
              </div>

              {/* Values */}
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] font-mono truncate">
                  {s.label}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold leading-none font-mono ${s.accent}`}>
                    {s.value}
                  </span>
                  {s.sub && (
                    <span className={`text-[10px] font-mono ${s.alert ? 'text-rose-400 font-bold animate-pulse' : 'text-[var(--text-muted)'} flex items-center gap-0.5 truncate`}>
                      {s.alert && <AlertTriangle size={9} className="shrink-0" />}
                      {s.sub}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
