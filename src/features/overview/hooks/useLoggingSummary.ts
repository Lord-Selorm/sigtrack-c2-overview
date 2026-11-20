import { useState, useEffect, useMemo } from 'react'
import type { BattleLogItem, DateRangeFilter, TimeRangeFilter } from '../types/overview.types'
import { subscribeBattleLogs } from '../services/overviewService'
import { matchesQuery, isWithinTimeRange } from '../utils/filterUtils'
import { MOCK_OVERVIEW_DATA } from '@/lib/mockData'

interface UseLoggingSummaryOptions {
  orgId?: string
  useMock?: boolean
  searchQuery?: string
  timeRange?: TimeRangeFilter
  dateRange?: DateRangeFilter
}

export function useLoggingSummary({
  orgId,
  useMock = false,
  searchQuery = '',
  timeRange = 'all',
  dateRange,
}: UseLoggingSummaryOptions) {
  const [rawItems, setRawItems] = useState<BattleLogItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(!useMock)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (useMock) {
      setRawItems(MOCK_OVERVIEW_DATA.battleLogs as unknown as BattleLogItem[])
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

    const unsubscribe = subscribeBattleLogs(
      orgId,
      (items) => {
        setRawItems(items)
        setLastSyncedAt(new Date())
        setIsLoading(false)
      },
      (err) => {
        setError(err.message || 'Failed to load Battle Logs')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [orgId, useMock])

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const matchesSearch = matchesQuery(
        searchQuery,
        item.command,
        item.unit,
        item.location,
        item.incident,
        item.action,
        item.remark,
        String(item.precedence),
        item.status
      )
      const matchesTime = isWithinTimeRange(item.createdAt || item.dateTime, timeRange, dateRange)
      return matchesSearch && matchesTime
    })
  }, [rawItems, searchQuery, timeRange, dateRange])

  const statusCounts = useMemo(() => {
    return filteredItems.reduce<Record<string, number>>((acc, l) => {
      const key = (l.status || 'pending').toLowerCase()
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [filteredItems])

  return {
    items: filteredItems,
    totalCount: filteredItems.length,
    statusCounts,
    rawCount: rawItems.length,
    isLoading,
    error,
    lastSyncedAt,
  }
}
