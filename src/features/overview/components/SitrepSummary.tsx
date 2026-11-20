import { useState, useEffect } from 'react'
import { FileText, MapPin, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import type { SitrepItem } from '../types/overview.types'
import { formatDateTimeOrRaw } from '../utils/formatters'
import { parseSitrepMessage } from '../utils/sitrepParser'
import { SummaryCard } from './SummaryCard'
import { EmptyState } from './states/EmptyState'
import { CardLoading, CardError } from './states/CardStatus'
import { CardPagination } from './CardPagination'
import { HighlightText } from './HighlightText'

interface SitrepSummaryProps {
  sitreps: SitrepItem[]
  isLoading?: boolean
  error?: string | null
  onResetFilters?: () => void
  isFiltered?: boolean
  pageSize?: number
  searchQuery?: string
}

export function SitrepSummary({
  sitreps,
  isLoading = false,
  error = null,
  onResetFilters,
  isFiltered = false,
  pageSize = 10,
  searchQuery = '',
}: SitrepSummaryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)

  // Reset to page 1 when data changes or filters are applied
  useEffect(() => {
    setPage(1)
  }, [sitreps.length])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const displayedSitreps = sitreps.slice((page - 1) * pageSize, page * pageSize)

  return (
    <SummaryCard
      title="SITREP (Situation Reports)"
      icon={FileText}
      accentColor="text-sky-400"
      badge={
        sitreps.length > 0 ? (
          <span className="badge-normal text-[11px] font-mono px-2 py-0.5">{sitreps.length} reports</span>
        ) : (
          <span className="badge-muted text-[11px] font-mono px-2 py-0.5">0 filed</span>
        )
      }
      footer={
        <CardPagination
          currentPage={page}
          totalItems={sitreps.length}
          pageSize={pageSize}
          onPageChange={setPage}
          moduleName="SITREP"
        />
      }
    >
      {isLoading ? (
        <CardLoading label="Syncing SITREPs…" />
      ) : error ? (
        <CardError message={error} />
      ) : sitreps.length === 0 ? (
        <EmptyState
          message={isFiltered ? 'No matching SITREPs' : 'No SITREPs filed'}
          subMessage={
            isFiltered
              ? 'Try widening your search keyword or time range.'
              : 'Reports filed by units and commands will appear here in real-time.'
          }
          onResetFilters={isFiltered ? onResetFilters : undefined}
        />
      ) : (
        <div className="space-y-1.5 font-mono">
          {/* Responsive Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 rounded">
            <span className="col-span-1">S/N</span>
            <span className="col-span-3">Date / Time</span>
            <span className="col-span-3">Command &amp; Unit</span>
            <span className="col-span-2">Location</span>
            <span className="col-span-3">Incident / Action</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[var(--border-color)]/60">
            {displayedSitreps.map((s, index) => {
              const isExpanded = expandedId === s.id
              const serial = s.serialNumber ?? (page - 1) * pageSize + index + 1
              const parsed = parseSitrepMessage(s.incident)

              return (
                <div
                  key={s.id}
                  className="p-2.5 data-row-hover-effect rounded transition-colors cursor-pointer"
                  onClick={() => toggleExpand(s.id)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start text-[13px]">
                    <div className="sm:col-span-1 font-bold text-sky-400 text-xs">
                      #{serial}
                    </div>

                    <div className="sm:col-span-3 text-[var(--text-secondary)] text-[11px]">
                      {formatDateTimeOrRaw(s.dateTime || s.createdAt)}
                    </div>

                    <div className="sm:col-span-3 min-w-0">
                      <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate text-xs">
                        <Shield size={12} className="text-sky-400 shrink-0" />
                        <span className="truncate"><HighlightText text={s.unit || s.command || 'Unit'} query={searchQuery} /></span>
                      </div>
                      {s.command && s.command !== s.unit && (
                        <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                          Cmd: <HighlightText text={s.command} query={searchQuery} />
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2 text-[var(--text-secondary)] flex items-center gap-1 truncate text-xs">
                      <MapPin size={11} className="text-rose-400 shrink-0" />
                      <span className="truncate"><HighlightText text={s.location || '—'} query={searchQuery} /></span>
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-between gap-1 min-w-0">
                      <div className="text-[var(--text-secondary)] truncate text-[11px]">
                        <HighlightText text={parsed.points[0] || parsed.title || s.action || '—'} query={searchQuery} />
                      </div>
                      <button
                        type="button"
                        className="text-[var(--text-muted)] hover:text-sky-400 shrink-0 p-0.5"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/90 p-2.5 rounded text-xs space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Incident Details:
                        </span>
                        {parsed.points.length > 0 || parsed.headers.length > 0 || parsed.title ? (
                          <div className="mt-1 space-y-1.5">
                            {parsed.title && (
                              <div className="text-[11px] font-bold text-sky-300">{parsed.title}</div>
                            )}
                            {parsed.headers.length > 0 && (
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                                {parsed.headers.map((h) => (
                                  <span key={h.label}>
                                    <span className="text-[var(--text-muted)] uppercase">{h.label}:</span>{' '}
                                    <span className="text-[var(--text-secondary)] font-semibold">{h.value}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            {parsed.points.length > 0 && (
                              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-[var(--text-primary)]">
                                {parsed.points.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ol>
                            )}
                            {parsed.body.map((line, i) => (
                              <p key={i} className="text-[11px] text-[var(--text-secondary)]">{line}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[var(--text-primary)] mt-0.5 whitespace-pre-line text-[11px]">
                            {s.incident || 'None reported'}
                          </p>
                        )}
                      </div>

                      {s.action && (
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Action Taken:
                          </span>
                          <p className="text-emerald-400 mt-0.5 text-[11px]">{s.action}</p>
                        </div>
                      )}

                      {s.remark && (
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Remarks:
                          </span>
                          <p className="text-[var(--text-secondary)] mt-0.5 text-[11px]">{s.remark}</p>
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
