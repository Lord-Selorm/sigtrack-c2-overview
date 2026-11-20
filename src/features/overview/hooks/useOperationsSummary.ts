import { useState, useEffect, useMemo } from 'react'
import type { DateRangeFilter, OperationItem, TimeRangeFilter } from '../types/overview.types'
import { subscribeOperations } from '../services/overviewService'
import { matchesQuery, isWithinTimeRange } from '../utils/filterUtils'
import { MOCK_OVERVIEW_DATA } from '@/lib/mockData'

interface UseOperationsSummaryOptions {
  orgId?: string
  useMock?: boolean
  searchQuery?: string
  timeRange?: TimeRangeFilter
  dateRange?: DateRangeFilter
}

export function useOperationsSummary({
  orgId,
  useMock = false,
  searchQuery = '',
  timeRange = 'all',
  dateRange,
}: UseOperationsSummaryOptions) {
  const [rawItems, setRawItems] = useState<OperationItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(!useMock)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (useMock) {
      setRawItems(MOCK_OVERVIEW_DATA.operations.all as unknown as OperationItem[])
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

    const unsubscribe = subscribeOperations(
      orgId,
      (items) => {
        setRawItems(items)
        setLastSyncedAt(new Date())
        setIsLoading(false)
      },
      (err) => {
        setError(err.message || 'Failed to load Operations')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [orgId, useMock])

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const unitsText = item.comdUnit.join(' ')
      const locsText = item.deplLoc.join(' ')
      const matchesSearch = matchesQuery(
        searchQuery,
        item.typeOfOps,
        item.status,
        item.operationType,
        item.description,
        unitsText,
        locsText
      )
      const matchesTime = isWithinTimeRange(item.createdAt || item.updatedAt, timeRange, dateRange)
      return matchesSearch && matchesTime
    })
  }, [rawItems, searchQuery, timeRange, dateRange])

  const stats = useMemo(() => {
    const active = filteredItems.filter((op) => (op.status || 'Active') === 'Active').length
    const internal = filteredItems.filter((op) => (op.operationType || 'Internal') === 'Internal').length
    const external = filteredItems.filter((op) => op.operationType === 'External').length
    return { active, internal, external }
  }, [filteredItems])

  return {
    items: filteredItems,
    total: filteredItems.length,
    active: stats.active,
    internal: stats.internal,
    external: stats.external,
    rawCount: rawItems.length,
    isLoading,
    error,
    lastSyncedAt,
  }
}
