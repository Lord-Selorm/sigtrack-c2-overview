import type { DateRangeFilter, TimeRangeFilter } from '../types/overview.types'

function parseDateBoundary(value: string, endOfDay = false): number | null {
  if (!value) return null
  const hasTime = value.includes('T')
  const date = hasTime
    ? new Date(value)
    : new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`)
  const time = date.getTime()
  return isNaN(time) ? null : time
}

function timestampToTime(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime()
    return isNaN(time) ? null : time
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date.getTime()
  }

  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date.getTime()
  }

  if (value && typeof value === 'object') {
    const candidate = value as {
      toDate?: () => Date
      toMillis?: () => number
      seconds?: number
      _seconds?: number
    }

    if (typeof candidate.toMillis === 'function') {
      const time = candidate.toMillis()
      return isNaN(time) ? null : time
    }

    if (typeof candidate.toDate === 'function') {
      const date = candidate.toDate()
      return isNaN(date.getTime()) ? null : date.getTime()
    }

    const seconds = candidate.seconds ?? candidate._seconds
    if (typeof seconds === 'number') {
      return seconds * 1000
    }
  }

  return null
}

/** Check if timestamp is within selected time range */
export function isWithinTimeRange(
  timestamp: unknown,
  range: TimeRangeFilter,
  dateRange?: DateRangeFilter
): boolean {
  if (range === 'all' || !timestamp) return true

  const time = timestampToTime(timestamp)
  if (time === null) return true // Fallback to keep item if date cannot be parsed

  if (range === 'custom') {
    let startValue = dateRange?.startDate || ''
    let endValue = dateRange?.endDate || ''
    if (startValue && endValue && startValue > endValue) {
      const temp = startValue
      startValue = endValue
      endValue = temp
    }

    const start = parseDateBoundary(startValue, false)
    const end = parseDateBoundary(endValue, true)
    if (start === null && end === null) return true
    return (start === null || time >= start) && (end === null || time <= end)
  }

  const now = Date.now()
  const diffHours = (now - time) / (1000 * 60 * 60)

  switch (range) {
    case '24h':
      return diffHours <= 24
    case '7d':
      return diffHours <= 24 * 7
    case '30d':
      return diffHours <= 24 * 30
    default:
      return true
  }
}

/** Check if text includes keyword query case-insensitively */
export function matchesQuery(query: string, ...fields: (string | undefined | null)[]): boolean {
  if (!query || !query.trim()) return true
  const lowerQuery = query.toLowerCase().trim()
  return fields.some((field) => field && field.toLowerCase().includes(lowerQuery))
}
