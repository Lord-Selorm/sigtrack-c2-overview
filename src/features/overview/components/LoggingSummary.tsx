import { useState, useEffect } from 'react'
import { BookOpen, AlertCircle, Clock, MapPin, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import type { BattleLogItem } from '../types/overview.types'
import { formatDate } from '../utils/formatters'
import { SummaryCard } from './SummaryCard'
import { EmptyState } from './states/EmptyState'
import { CardLoading, CardError } from './states/CardStatus'
import { CardPagination } from './CardPagination'
import { HighlightText } from './HighlightText'

interface LoggingSummaryProps {
  battleLogs: BattleLogItem[]
  statusCounts: Record<string, number>
  isLoading?: boolean
  error?: string | null
  onResetFilters?: () => void
  isFiltered?: boolean
  pageSize?: number
  searchQuery?: string
}

const statusPillClasses: Record<string, string> = {
  high: 'badge-danger text-[10px] font-mono',
  medium: 'badge-warning text-[10px] font-mono',
  low: 'badge-normal text-[10px] font-mono',
  pending: 'badge-muted text-[10px] font-mono',
}

const precedenceClasses: Record<string, string> = {
  flash: 'text-rose-400 font-bold',
  immediate: 'text-orange-400 font-bold',
  priority: 'text-amber-400 font-semibold',
  routine: 'text-[var(--text-secondary)]',
}

export function LoggingSummary({
  battleLogs,
  statusCounts,
  isLoading = false,
  error = null,
  onResetFilters,
  isFiltered = false,
  pageSize = 10,
  searchQuery = '',
}: LoggingSummaryProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)

  const displayedLogs = filterStatus === 'all'
    ? battleLogs
    : battleLogs.filter((l) => (l.status || 'pending').toLowerCase() === filterStatus)

  useEffect(() => {
    setPage(1)
  }, [filterStatus, battleLogs.length])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const pagedLogs = displayedLogs.slice((page - 1) * pageSize, page * pageSize)

  return (
    <SummaryCard
      title="Logging (Signal Messaging)"
      icon={BookOpen}
      accentColor="text-emerald-400"
      badge={
        battleLogs.length > 0 ? (
          <span className="badge-normal text-[11px] font-mono px-2 py-0.5">{battleLogs.length} logged</span>
        ) : (
          <span className="badge-muted text-[11px] font-mono px-2 py-0.5">0 events</span>
        )
      }
      footer={
        <CardPagination
          currentPage={page}
          totalItems={displayedLogs.length}
          pageSize={pageSize}
          onPageChange={setPage}
          moduleName="Signal Messaging"
        />
      }
    >
      {/* Severity Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 font-mono">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
            filterStatus === 'all'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
          }`}
        >
          All ({battleLogs.length})
        </button>
        {['high', 'medium', 'low', 'pending'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors uppercase ${
              filterStatus === st
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}
          >
            {st} ({statusCounts[st] ?? 0})
          </button>
        ))}
      </div>

      {isLoading ? (
        <CardLoading label="Syncing signal logs…" />
      ) : error ? (
        <CardError message={error} />
      ) : displayedLogs.length === 0 ? (
        <EmptyState
          message={isFiltered ? 'No matching logs' : 'No battle logs recorded'}
          subMessage="Incidents logged in Signal Messaging will appear here."
          onResetFilters={isFiltered ? onResetFilters : undefined}
        />
      ) : (
        <div className="space-y-1.5 font-mono">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 rounded">
            <span className="col-span-2">Precedence</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3">Command &amp; Unit</span>
            <span className="col-span-3">Incident Summary</span>
            <span className="col-span-2 text-right">Date</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]/60">
            {pagedLogs.map((log) => {
              const isExpanded = expandedId === log.id
              const statusKey = (log.status || 'pending').toLowerCase()
              const precKey = String(log.precedence || 'routine').toLowerCase()

              return (
                <div
                  key={log.id}
                  className="p-2.5 data-row-hover-effect rounded transition-colors cursor-pointer"
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-[13px]">
                    <div className="sm:col-span-2 uppercase text-[10px]">
                      <span className={precedenceClasses[precKey] ?? 'text-[var(--text-secondary)]'}>
                        {log.precedence || 'ROUTINE'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className={statusPillClasses[statusKey] ?? 'badge-muted text-[10px]'}>
                        {statusKey}
                      </span>
                    </div>

                    <div className="sm:col-span-3 min-w-0">
                      <div className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1">
                        <Shield size={11} className="text-emerald-400 shrink-0" />
                        <span className="truncate"><HighlightText text={log.unit || log.command || 'Unit'} query={searchQuery} /></span>
                      </div>
                      {log.location && (
                        <div className="text-[10px] text-[var(--text-muted)] truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={9} className="text-rose-400 shrink-0" />
                          <span className="truncate"><HighlightText text={log.location} query={searchQuery} /></span>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 text-[var(--text-secondary)] truncate text-[11px]">
                      <HighlightText text={log.incident || log.action || '—'} query={searchQuery} />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-1.5 text-[var(--text-muted)] text-[10px]">
                      <span className="flex items-center gap-1 truncate">
                        <Clock size={10} className="shrink-0" />
                        {formatDate(log.createdAt || log.dateTime)}
                      </span>
                      <button type="button" className="text-[var(--text-muted)] hover:text-emerald-400 p-0.5">
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/90 p-2.5 rounded text-xs space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle size={11} className="text-amber-400" /> Full Incident:
                        </span>
                        <p className="text-[var(--text-primary)] whitespace-pre-line mt-1 bg-black/40 p-2 rounded text-[11px]">
                          {log.incident || 'None recorded'}
                        </p>
                      </div>

                      {log.action && (
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Action Taken:</span>
                          <p className="text-emerald-400 mt-0.5 text-[11px]">{log.action}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[var(--border-color)]/40 text-[10px]">
                        <div><span className="text-[var(--text-muted)] uppercase">Class:</span> <span className="text-[var(--text-secondary)] font-semibold">{log.securityClassification || 'Restricted'}</span></div>
                        {log.drafterName && <div><span className="text-[var(--text-muted)] uppercase">Drafter:</span> <span className="text-[var(--text-secondary)] font-semibold">{log.drafterName}</span></div>}
                        {log.drafterTel && <div><span className="text-[var(--text-muted)] uppercase">Tel:</span> <span className="text-[var(--text-secondary)] font-semibold">{log.drafterTel}</span></div>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SummaryCard>
  )
}
