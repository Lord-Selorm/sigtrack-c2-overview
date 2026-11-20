import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface CardPaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  moduleName?: string
  onViewAll?: () => void
}

export function CardPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  moduleName,
  onViewAll,
}: CardPaginationProps) {
  if (totalItems === 0) return null

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="shrink-0 px-3 py-2 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/90 flex items-center justify-between gap-2 text-xs font-mono select-none">
      {/* Left: Range and Count */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] text-[var(--text-secondary)] truncate">
          Showing <strong className="text-[var(--text-primary)]">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-emerald-400">{totalItems.toLocaleString()}</strong>
        </span>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="hidden sm:inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 ml-1.5 transition-colors"
            title={`Open dedicated ${moduleName || 'module'} page`}
          >
            <span>View all in {moduleName}</span>
            <ExternalLink size={10} />
          </button>
        )}
      </div>

      {/* Right: Prev / Next Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-[var(--text-muted)] mr-1 hidden sm:inline">
          {currentPage}/{totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500/50 hover:text-[var(--text-primary)] transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500/50 hover:text-[var(--text-primary)] transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
