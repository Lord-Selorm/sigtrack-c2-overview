import { useState, useEffect } from 'react'
import { Target, MapPin, Shield, Layers, ChevronDown, ChevronUp } from 'lucide-react'
import type { OperationItem } from '../types/overview.types'
import { SummaryCard } from './SummaryCard'
import { EmptyState } from './states/EmptyState'
import { CardLoading, CardError } from './states/CardStatus'
import { CardPagination } from './CardPagination'
import { HighlightText } from './HighlightText'

interface OperationsSummaryProps {
  operations: OperationItem[]
  active: number
  internal: number
  external: number
  isLoading?: boolean
  error?: string | null
  onResetFilters?: () => void
  isFiltered?: boolean
  pageSize?: number
  searchQuery?: string
}

const statusBadgeClasses: Record<string, string> = {
  Active: 'badge-normal text-[10px] font-mono',
  Dormant: 'badge-warning text-[10px] font-mono',
  Completed: 'badge-muted text-[10px] font-mono',
}

export function OperationsSummary({
  operations,
  active,
  internal,
  external,
  isLoading = false,
  error = null,
  onResetFilters,
  isFiltered = false,
  pageSize = 10,
  searchQuery = '',
}: OperationsSummaryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    setPage(1)
  }, [operations.length])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const displayedOps = operations.slice((page - 1) * pageSize, page * pageSize)

  return (
    <SummaryCard
      title="Operations (Registry)"
      icon={Target}
      accentColor="text-amber-400"
      badge={
        active > 0 ? (
          <span className="badge-normal text-[11px] font-mono px-2 py-0.5">{active} active</span>
        ) : (
          <span className="badge-muted text-[11px] font-mono px-2 py-0.5">0 active</span>
        )
      }
      footer={
        <CardPagination
          currentPage={page}
          totalItems={operations.length}
          pageSize={pageSize}
          onPageChange={setPage}
          moduleName="Operations"
        />
      }
    >
      {/* 4 Operations KPI Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono">
        <div className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-center">
          <div className="text-lg font-bold text-[var(--text-primary)]">{operations.length}</div>
          <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">TOTAL OPS</div>
        </div>
        <div className="p-2 rounded bg-[var(--bg-primary)] border border-emerald-500/30 text-center">
          <div className="text-lg font-bold text-emerald-400">{active}</div>
          <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">ACTIVE</div>
        </div>
        <div className="p-2 rounded bg-[var(--bg-primary)] border border-sky-500/30 text-center">
          <div className="text-lg font-bold text-sky-400">{internal}</div>
          <div className="text-[9px] text-sky-500 font-bold uppercase tracking-wider">INTERNAL</div>
        </div>
        <div className="p-2 rounded bg-[var(--bg-primary)] border border-amber-500/30 text-center">
          <div className="text-lg font-bold text-amber-400">{external}</div>
          <div className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">EXTERNAL</div>
        </div>
      </div>

      {isLoading ? (
        <CardLoading label="Syncing operations…" />
      ) : error ? (
        <CardError message={error} />
      ) : operations.length === 0 ? (
        <EmptyState
          message={isFiltered ? 'No matching operations' : 'No operations registered'}
          subMessage={
            isFiltered
              ? 'Try adjusting your search query or time range filter.'
              : 'Active and planned operations from the Operations Registry will appear here.'
          }
          onResetFilters={isFiltered ? onResetFilters : undefined}
        />
      ) : (
        <div className="space-y-1.5 font-mono">
          {/* Responsive Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 rounded">
            <span className="col-span-1">SER</span>
            <span className="col-span-4">Type of Ops</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Type</span>
            <span className="col-span-3">Comd / Depl Loc</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[var(--border-color)]/60">
            {displayedOps.map((op, idx) => {
              const isExpanded = expandedId === op.id
              const serial = op.ser || (page - 1) * pageSize + idx + 1

              return (
                <div
                  key={op.id}
                  className="p-2.5 data-row-hover-effect rounded transition-colors cursor-pointer"
                  onClick={() => toggleExpand(op.id)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-[13px]">
                    <div className="sm:col-span-1 font-bold text-amber-400 text-xs">#{serial}</div>

                    <div className="sm:col-span-4 font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                      <Target size={13} className="text-amber-400 shrink-0" />
                      <span className="truncate"><HighlightText text={op.typeOfOps} query={searchQuery} /></span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className={statusBadgeClasses[op.status] ?? 'badge-muted text-[10px]'}>
                        {op.status || 'Active'}
                      </span>
                    </div>

                    <div className="sm:col-span-2 text-[var(--text-secondary)] text-[11px] flex items-center gap-1">
                      <Layers size={11} className="text-[var(--text-muted)] shrink-0" />
                      <span>{op.operationType || 'Internal'}</span>
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-between gap-1">
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        <HighlightText
                          text={
                            op.comdUnit.length > 0
                              ? op.comdUnit.slice(0, 2).join(', ')
                              : op.deplLoc.length > 0
                              ? op.deplLoc.slice(0, 2).join(', ')
                              : '—'
                          }
                          query={searchQuery}
                        />
                      </div>
                      <button
                        type="button"
                        className="text-[var(--text-muted)] hover:text-amber-400 p-0.5 shrink-0"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/90 p-2.5 rounded text-xs space-y-2">
                      {op.description && (
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Description:
                          </span>
                          <p className="text-[var(--text-secondary)] mt-0.5 text-[11px]">{op.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <Shield size={11} className="text-amber-400" />
                            Command / Units:
                          </span>
                          <p className="text-[var(--text-secondary)] text-[11px] mt-0.5">
                            {op.comdUnit.length > 0 ? op.comdUnit.join(', ') : 'None assigned'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <MapPin size={11} className="text-rose-400" />
                            Deployment Locations:
                          </span>
                          <p className="text-[var(--text-secondary)] text-[11px] mt-0.5">
                            {op.deplLoc.length > 0 ? op.deplLoc.join(', ') : 'None listed'}
                          </p>
                        </div>
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
