import { useState, useEffect } from 'react'
import { Mail, Inbox, Send, Clock, User, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import type { ReportItem } from '../types/overview.types'
import { formatDate } from '../utils/formatters'
import { SummaryCard } from './SummaryCard'
import { EmptyState } from './states/EmptyState'
import { CardLoading, CardError } from './states/CardStatus'
import { CardPagination } from './CardPagination'
import { HighlightText } from './HighlightText'

interface ReportsSummaryProps {
  inbox: ReportItem[]
  sent: ReportItem[]
  all: ReportItem[]
  unreadCount: number
  isLoading?: boolean
  error?: string | null
  onResetFilters?: () => void
  isFiltered?: boolean
  pageSize?: number
  searchQuery?: string
}

export function ReportsSummary({
  inbox,
  sent,
  all,
  unreadCount,
  isLoading = false,
  error = null,
  onResetFilters,
  isFiltered = false,
  pageSize = 10,
  searchQuery = '',
}: ReportsSummaryProps) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'all'>('inbox')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)

  const currentList = activeTab === 'inbox' ? inbox : activeTab === 'sent' ? sent : all

  useEffect(() => {
    setPage(1)
  }, [activeTab, currentList.length])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const pagedReports = currentList.slice((page - 1) * pageSize, page * pageSize)

  return (
    <SummaryCard
      title="Reports (Correspondence)"
      icon={Mail}
      accentColor="text-purple-400"
      badge={
        unreadCount > 0 ? (
          <span className="badge-warning text-[10px] font-mono px-2 py-0.5 animate-pulse">{unreadCount} unread</span>
        ) : (
          <span className="badge-muted text-[10px] font-mono px-2 py-0.5">{inbox.length} in / {sent.length} out</span>
        )
      }
      footer={
        <CardPagination
          currentPage={page}
          totalItems={currentList.length}
          pageSize={pageSize}
          onPageChange={setPage}
          moduleName="Reports"
        />
      }
    >
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 border-b border-[var(--border-color)] pb-2 font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${
            activeTab === 'inbox'
              ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50 font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Inbox size={12} />
          <span>Inbox ({inbox.length})</span>
          {unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${
            activeTab === 'sent'
              ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50 font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Send size={12} />
          <span>Sent ({sent.length})</span>
        </button>

        {all.length > inbox.length + sent.length && (
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Mail size={12} />
            <span>All ({all.length})</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <CardLoading label="Syncing reports…" />
      ) : error ? (
        <CardError message={error} />
      ) : currentList.length === 0 ? (
        <EmptyState
          message={activeTab === 'inbox' ? 'Inbox is empty' : activeTab === 'sent' ? 'No sent reports' : 'No correspondence'}
          subMessage="Formal correspondence filed in Reports will appear here."
          onResetFilters={isFiltered ? onResetFilters : undefined}
        />
      ) : (
        <div className="space-y-1.5 font-mono">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 rounded">
            <span className="col-span-5">Subject</span>
            <span className="col-span-3">From / Originator</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Date</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]/60">
            {pagedReports.map((r) => {
              const isExpanded = expandedId === r.id
              const replyCount = r.replies?.length ?? 0

              return (
                <div
                  key={r.id}
                  className={`p-2.5 rounded transition-colors cursor-pointer ${
                    !r.read
                      ? 'bg-purple-950/20 border-l-2 border-l-purple-400 hover:bg-purple-950/30'
                      : 'data-row-hover-effect'
                  }`}
                  onClick={() => toggleExpand(r.id)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-[13px]">
                    <div className="sm:col-span-5 font-bold text-[var(--text-primary)] flex items-center gap-2 truncate">
                      <Mail size={13} className={`shrink-0 ${!r.read ? 'text-purple-400' : 'text-[var(--text-muted)]'}`} />
                      <span className="truncate"><HighlightText text={r.subject || '(Untitled report)'} query={searchQuery} /></span>
                      {replyCount > 0 && (
                        <span className="badge-muted text-[9px] px-1 py-0 flex items-center gap-0.5 shrink-0">
                          <MessageSquare size={8} /> {replyCount}
                        </span>
                      )}
                    </div>

                    <div className="sm:col-span-3 text-[var(--text-secondary)] text-[11px] truncate flex items-center gap-1">
                      <User size={10} className="text-[var(--text-muted)] shrink-0" />
                      <span className="truncate font-semibold"><HighlightText text={r.from || r.originator || 'Unknown'} query={searchQuery} /></span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className={r.read ? 'badge-muted text-[10px]' : 'badge-warning text-[10px]'}>
                        {r.read ? 'Read' : 'New Unread'}
                      </span>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-1.5 text-[var(--text-muted)] text-[10px]">
                      <span className="flex items-center gap-1 truncate">
                        <Clock size={10} className="shrink-0" />
                        {formatDate(r.createdAt)}
                      </span>
                      <button type="button" className="text-[var(--text-muted)] hover:text-purple-400 p-0.5">
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/90 p-2.5 rounded text-xs space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Report Message:</span>
                        <div className="text-[var(--text-primary)] whitespace-pre-line mt-1 bg-black/40 p-2 rounded text-[11px]">
                          {r.content || 'No text content provided.'}
                        </div>
                      </div>

                      {replyCount > 0 && (
                        <div className="pt-2 border-t border-[var(--border-color)]/40 space-y-1">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Replies ({replyCount}):</span>
                          {r.replies?.map((rep) => (
                            <div key={rep.id} className="bg-black/30 p-2 rounded text-[10px] text-[var(--text-secondary)]">
                              <span className="font-bold text-purple-300">{rep.from}</span>: {rep.content}
                            </div>
                          ))}
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
