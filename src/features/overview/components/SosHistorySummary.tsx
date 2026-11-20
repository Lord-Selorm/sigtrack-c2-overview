import { useState, useEffect } from 'react'
import { Siren, MapPin, Clock, User, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { SosHistoryItem } from '../types/overview.types'
import { formatDate, formatDateTime } from '../utils/formatters'
import { SummaryCard } from './SummaryCard'
import { EmptyState } from './states/EmptyState'
import { CardLoading, CardError } from './states/CardStatus'
import { CardPagination } from './CardPagination'
import { HighlightText } from './HighlightText'

interface SosHistorySummaryProps {
  sosHistory: SosHistoryItem[]
  activeCount: number
  resolvedCount: number
  isLoading?: boolean
  error?: string | null
  onResetFilters?: () => void
  isFiltered?: boolean
  pageSize?: number
  searchQuery?: string
}

type SosStatusFilter = 'all' | 'active' | 'resolved' | 'cancelled'

const CLOSED_STATUSES = ['resolved', 'closed', 'complete', 'completed', 'cancelled', 'canceled']

function normalizedStatus(status: string): Exclude<SosStatusFilter, 'all'> {
  const value = (status || 'active').toLowerCase()
  if (value.includes('cancel')) return 'cancelled'
  if (CLOSED_STATUSES.includes(value)) return 'resolved'
  return 'active'
}

const statusPillClasses: Record<string, string> = {
  active: 'badge-danger text-[10px] font-mono',
  resolved: 'badge-normal text-[10px] font-mono',
  cancelled: 'badge-muted text-[10px] font-mono',
}

export function SosHistorySummary({
  sosHistory,
  activeCount,
  resolvedCount,
  isLoading = false,
  error = null,
  onResetFilters,
  isFiltered = false,
  pageSize = 10,
  searchQuery = '',
}: SosHistorySummaryProps) {
  const [statusFilter, setStatusFilter] = useState<SosStatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)

  const statusCounts = sosHistory.reduce<Record<Exclude<SosStatusFilter, 'all'>, number>>(
    (acc, item) => {
      acc[normalizedStatus(item.status)] += 1
      return acc
    },
    { active: 0, resolved: 0, cancelled: 0 }
  )

  const displayedSos = statusFilter === 'all'
    ? sosHistory
    : sosHistory.filter((item) => normalizedStatus(item.status) === statusFilter)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, sosHistory.length])

  const pagedSos = displayedSos.slice((page - 1) * pageSize, page * pageSize)
  const tiles = [
    { label: 'TOTAL SOS', value: sosHistory.length, valueClass: 'text-[var(--text-primary)]', border: 'border-[var(--border-color)]' },
    { label: 'ACTIVE', value: activeCount, valueClass: 'text-rose-400', border: 'border-rose-500/30' },
    { label: 'RESOLVED', value: resolvedCount, valueClass: 'text-emerald-400', border: 'border-emerald-500/30' },
  ]
  const filters = [
    { id: 'all' as const, label: 'All', count: sosHistory.length },
    { id: 'active' as const, label: 'Active', count: statusCounts.active },
    { id: 'resolved' as const, label: 'Resolved', count: statusCounts.resolved },
    { id: 'cancelled' as const, label: 'Cancelled', count: statusCounts.cancelled },
  ]

  return (
    <SummaryCard
      title="SOS History"
      icon={Siren}
      accentColor="text-rose-400"
      badge={activeCount > 0
        ? <span className="badge-danger text-[11px] font-mono px-2 py-0.5 animate-pulse">{activeCount} active</span>
        : <span className="badge-muted text-[11px] font-mono px-2 py-0.5">{sosHistory.length} records</span>}
      footer={<CardPagination currentPage={page} totalItems={displayedSos.length} pageSize={pageSize} onPageChange={setPage} moduleName="SOS History" />}
    >
      <div className="grid grid-cols-3 gap-2 mb-3 font-mono">
        {tiles.map((tile) => (
          <div key={tile.label} className={`p-2 rounded bg-[var(--bg-primary)] border ${tile.border} text-center`}>
            <div className={`text-lg font-bold ${tile.valueClass}`}>{tile.value}</div>
            <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 font-mono">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatusFilter(filter.id)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors uppercase ${
              statusFilter === filter.id
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {isLoading ? (
        <CardLoading label="Monitoring SOS beacons…" />
      ) : error ? (
        <CardError message={error} />
      ) : displayedSos.length === 0 ? (
        <EmptyState
          message={isFiltered ? 'No matching SOS records' : 'No SOS history recorded'}
          subMessage="SOS activations and emergency history will appear here."
          onResetFilters={isFiltered ? onResetFilters : undefined}
        />
      ) : (
        <div className="space-y-1.5 font-mono">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 rounded">
            <span className="col-span-2">Status</span>
            <span className="col-span-3">Unit / Personnel</span>
            <span className="col-span-3">Incident</span>
            <span className="col-span-2">Location</span>
            <span className="col-span-2 text-right">Date</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]/60">
            {pagedSos.map((sos) => {
              const isExpanded = expandedId === sos.id
              const status = normalizedStatus(sos.status)
              return (
                <div key={sos.id} className="p-2.5 data-row-hover-effect rounded transition-colors cursor-pointer" onClick={() => setExpandedId((prev) => (prev === sos.id ? null : sos.id))}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-[13px]">
                    <div className="sm:col-span-2"><span className={statusPillClasses[status]}>{status}</span></div>
                    <div className="sm:col-span-3 min-w-0">
                      <div className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1">
                        <User size={11} className="text-rose-400 shrink-0" />
                        <span className="truncate"><HighlightText text={sos.personnelName || sos.unit || sos.teamName || 'Personnel'} query={searchQuery} /></span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5"><HighlightText text={sos.unit || sos.teamName || sos.command || '—'} query={searchQuery} /></div>
                    </div>
                    <div className="sm:col-span-3 text-[var(--text-secondary)] truncate text-[11px]"><HighlightText text={sos.incident || sos.message || '—'} query={searchQuery} /></div>
                    <div className="sm:col-span-2 text-[var(--text-secondary)] flex items-center gap-1 truncate text-xs">
                      <MapPin size={11} className="text-rose-400 shrink-0" />
                      <span className="truncate"><HighlightText text={sos.location || sos.coordinates || '—'} query={searchQuery} /></span>
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-end gap-1.5 text-[var(--text-muted)] text-[10px]">
                      <span className="flex items-center gap-1 truncate"><Clock size={10} className="shrink-0" />{formatDate(sos.createdAt || sos.dateTime)}</span>
                      <button type="button" className="text-[var(--text-muted)] hover:text-rose-400 p-0.5">{isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/90 p-2.5 rounded text-xs space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1"><AlertCircle size={11} className="text-amber-400" /> SOS Message:</span>
                        <p className="text-[var(--text-primary)] whitespace-pre-line mt-1 bg-black/40 p-2 rounded text-[11px]">{sos.message || sos.incident || 'No message recorded'}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[var(--border-color)]/40 text-[10px]">
                        <div><span className="text-[var(--text-muted)] uppercase">Triggered:</span> <span className="text-[var(--text-secondary)] font-semibold">{formatDateTime(sos.createdAt || sos.dateTime)}</span></div>
                        <div><span className="text-[var(--text-muted)] uppercase">By:</span> <span className="text-[var(--text-secondary)] font-semibold">{sos.personnelName || sos.triggeredBy || 'Unknown'}</span></div>
                        <div><span className="text-[var(--text-muted)] uppercase">Status:</span> <span className="text-[var(--text-secondary)] font-semibold uppercase">{status}</span></div>
                      </div>
                      {(sos.command || sos.unit || sos.teamName || sos.coordinates || sos.resolvedAt) && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] border-t border-[var(--border-color)]/40 pt-2">
                          {sos.command && <div><span className="text-[var(--text-muted)] uppercase">Command:</span> <span className="text-[var(--text-secondary)] font-semibold">{sos.command}</span></div>}
                          {(sos.unit || sos.teamName) && <div><span className="text-[var(--text-muted)] uppercase">Unit:</span> <span className="text-[var(--text-secondary)] font-semibold">{sos.unit || sos.teamName}</span></div>}
                          {sos.coordinates && <div><span className="text-[var(--text-muted)] uppercase">Coords:</span> <span className="text-[var(--text-secondary)] font-semibold">{sos.coordinates}</span></div>}
                          {sos.resolvedAt && <div><span className="text-[var(--text-muted)] uppercase">Closed:</span> <span className="text-[var(--text-secondary)] font-semibold">{formatDateTime(sos.resolvedAt)}</span></div>}
                        </div>
                      )}
                      {(sos.heartRate || sos.speedKmh || sos.mode || sos.activityLabel || sos.accuracy || sos.altitude || sos.bearing || sos.userEmail) && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] border-t border-[var(--border-color)]/40 pt-2">
                          {sos.userEmail && <div className="col-span-2 sm:col-span-4"><span className="text-[var(--text-muted)] uppercase">Operator:</span> <span className="text-[var(--text-secondary)] font-semibold">{sos.userEmail}</span></div>}
                          {sos.heartRate && <div><span className="text-[var(--text-muted)] uppercase">Heart Rate:</span> <span className="text-[var(--text-secondary)] font-semibold">{sos.heartRate} bpm</span></div>}
                          {sos.speedKmh && <div><span className="text-[var(--text-muted)] uppercase">Speed:</span> <span className="text-[var(--text-secondary)] font-semibold">{Number(sos.speedKmh).toFixed(1)} km/h</span></div>}
                          {(sos.mode || sos.activityLabel) && <div><span className="text-[var(--text-muted)] uppercase">Mode:</span> <span className="text-[var(--text-secondary)] font-semibold">{[sos.mode, sos.activityLabel].filter(Boolean).join(' · ')}</span></div>}
                          {sos.accuracy && <div><span className="text-[var(--text-muted)] uppercase">Accuracy:</span> <span className="text-[var(--text-secondary)] font-semibold">±{Number(sos.accuracy).toFixed(0)} m</span></div>}
                          {sos.altitude && <div><span className="text-[var(--text-muted)] uppercase">Altitude:</span> <span className="text-[var(--text-secondary)] font-semibold">{Number(sos.altitude).toFixed(0)} m</span></div>}
                          {sos.bearing && <div><span className="text-[var(--text-muted)] uppercase">Bearing:</span> <span className="text-[var(--text-secondary)] font-semibold">{Number(sos.bearing).toFixed(0)}°</span></div>}
                        </div>
                      )}
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
