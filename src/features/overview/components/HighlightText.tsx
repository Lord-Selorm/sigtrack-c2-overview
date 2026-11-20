interface HighlightTextProps {
  text: string
  query?: string
  className?: string
}

/** Renders text with case-insensitive matches of `query` wrapped in <mark>. */
export function HighlightText({ text, query, className }: HighlightTextProps) {
  const q = (query ?? '').trim()
  if (!q || !text) return <span className={className}>{text}</span>

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  const lower = q.toLowerCase()

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <mark key={i} className="bg-amber-400/40 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}
