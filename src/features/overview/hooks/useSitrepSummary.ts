import { useState, useEffect, useMemo } from 'react'
import type { DateRangeFilter, SitrepItem, TimeRangeFilter } from '../types/overview.types'
import { subscribeSitreps } from '../services/overviewService'
import { matchesQuery, isWithinTimeRange } from '../utils/filterUtils'
import { MOCK_OVERVIEW_DATA } from '@/lib/mockData'

interface UseSitrepSummaryOptions {
  orgId?: string
  useMock?: boolean
  searchQuery?: string
  timeRange?: TimeRangeFilter
  dateRange?: DateRangeFilter
}

export function useSitrepSummary({
  orgId,
  useMock = false,
  searchQuery = '',
  timeRange = 'all',
  dateRange,
}: UseSitrepSummaryOptions) {
  const [rawItems, setRawItems] = useState<SitrepItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(!useMock)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (useMock) {
      setRawItems(MOCK_OVERVIEW_DATA.sitreps as SitrepItem[])
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

    const unsubscribe = subscribeSitreps(
      orgId,
      (items) => {
        setRawItems(items)
        setLastSyncedAt(new Date())
        setIsLoading(false)
      },
      (err) => {
        setError(err.message || 'Failed to load SITREPs')
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
        item.remark
      )
      const matchesTime = isWithinTimeRange(item.createdAt || item.dateTime, timeRange, dateRange)
      return matchesSearch && matchesTime
    })
  }, [rawItems, searchQuery, timeRange, dateRange])

  return {
    items: filteredItems,
    totalCount: filteredItems.length,
    rawCount: rawItems.length,
    isLoading,
    error,
    lastSyncedAt,
  }
}
