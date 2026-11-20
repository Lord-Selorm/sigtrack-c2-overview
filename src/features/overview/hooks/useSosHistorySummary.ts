import { useState, useEffect, useMemo, useRef } from 'react'
import type { DateRangeFilter, SosHistoryItem, TimeRangeFilter } from '../types/overview.types'
import { subscribeSosHistory } from '../services/sosHistoryService'
import { matchesQuery, isWithinTimeRange } from '../utils/filterUtils'
import { MOCK_SOS_HISTORY } from '@/lib/mockData'

interface UseSosHistorySummaryOptions {
  orgId?: string
  useMock?: boolean
  searchQuery?: string
  timeRange?: TimeRangeFilter
  dateRange?: DateRangeFilter
  onSosAlert?: (item: SosHistoryItem) => void
}

const CLOSED_SOS_STATUSES = ['resolved', 'closed', 'complete', 'completed', 'cancelled', 'canceled']
// Only alert for activations fresh enough to still be actionable.
const SOS_ALERT_WINDOW_MS = 15 * 60 * 1000

export function useSosHistorySummary({
  orgId,
  useMock = false,
  searchQuery = '',
  timeRange = 'all',
  dateRange,
  onSosAlert,
}: UseSosHistorySummaryOptions) {
  const [rawItems, setRawItems] = useState<SosHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(!useMock)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const seenAlertIds = useRef<Set<string>>(new Set())
  const alertCallbackRef = useRef(onSosAlert)
  alertCallbackRef.current = onSosAlert

  useEffect(() => {
    if (useMock) {
      setRawItems(MOCK_SOS_HISTORY)
      setLastSyncedAt(new Date())
      setIsLoading(false)
      setError(null)
      return
    }

    if (!orgId) {
      setRawItems([])
      setLastSyncedAt(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const unsubscribe = subscribeSosHistory(
      orgId,
      (items) => {
        setRawItems(items)
        setLastSyncedAt(new Date())
        setIsLoading(false)
      },
      (err) => {
        setError(err.message || 'Failed to load SOS history')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [orgId, useMock])

  // Fire onSosAlert once per newly-seen active event whose activation is fresh.
  useEffect(() => {
    if (!onSosAlert) return
    const now = Date.now()
    for (const item of rawItems) {
      if (seenAlertIds.current.has(item.id)) continue
      seenAlertIds.current.add(item.id)
      const status = (item.status || '').toLowerCase()
      if (CLOSED_SOS_STATUSES.includes(status)) continue
      const activatedAt = new Date(item.createdAt || item.dateTime || '').getTime()
      if (Number.isNaN(activatedAt) || now - activatedAt > SOS_ALERT_WINDOW_MS) continue
      alertCallbackRef.current?.(item)
    }
  }, [rawItems, onSosAlert])

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const matchesSearch = matchesQuery(
        searchQuery,
        item.unit,
        item.teamName,
        item.command,
        item.personnelName,
        item.callSign,
        item.userEmail,
        item.triggeredBy,
        item.location,
        item.coordinates,
        item.incident,
        item.message,
        item.status
      )
      const matchesTime = isWithinTimeRange(item.createdAt || item.dateTime || item.updatedAt, timeRange, dateRange)
      return matchesSearch && matchesTime
    })
  }, [rawItems, searchQuery, timeRange, dateRange])

  const counts = useMemo(() => {
    const activeCount = filteredItems.filter((item) => {
      const status = (item.status || 'active').toLowerCase()
      return !['resolved', 'closed', 'complete', 'completed', 'cancelled', 'canceled'].includes(status)
    }).length
    const resolvedCount = filteredItems.filter((item) => {
      const status = (item.status || '').toLowerCase()
      return ['resolved', 'closed', 'complete', 'completed', 'cancelled', 'canceled'].includes(status)
    }).length
    return { activeCount, resolvedCount }
  }, [filteredItems])

  return {
    items: filteredItems,
    totalCount: filteredItems.length,
    activeCount: counts.activeCount,
    resolvedCount: counts.resolvedCount,
    rawCount: rawItems.length,
    isLoading,
    error,
    lastSyncedAt,
  }
}
