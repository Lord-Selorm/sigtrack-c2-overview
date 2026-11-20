import { useState, useEffect, useMemo } from 'react'
import type { DateRangeFilter, ReportItem, TimeRangeFilter } from '../types/overview.types'
import { subscribeReports } from '../services/overviewService'
import { matchesQuery, isWithinTimeRange } from '../utils/filterUtils'
import { MOCK_OVERVIEW_DATA } from '@/lib/mockData'

interface UseReportsSummaryOptions {
  orgId?: string
  teamId?: string
  useMock?: boolean
  searchQuery?: string
  timeRange?: TimeRangeFilter
  dateRange?: DateRangeFilter
}

export function useReportsSummary({
  orgId,
  teamId,
  useMock = false,
  searchQuery = '',
  timeRange = 'all',
  dateRange,
}: UseReportsSummaryOptions) {
  const [rawItems, setRawItems] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(!useMock)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (useMock) {
      setRawItems(MOCK_OVERVIEW_DATA.reports.all as unknown as ReportItem[])
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

    const unsubscribe = subscribeReports(
      orgId,
      (items) => {
        setRawItems(items)
        setLastSyncedAt(new Date())
        setIsLoading(false)
      },
      (err) => {
        setError(err.message || 'Failed to load Reports')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [orgId, useMock])

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const matchesSearch = matchesQuery(
        searchQuery,
        item.subject,
        item.content,
        item.from,
        item.originator,
        Array.isArray(item.to) ? item.to.join(' ') : item.to
      )
      const matchesTime = isWithinTimeRange(item.createdAt, timeRange, dateRange)
      return matchesSearch && matchesTime
    })
  }, [rawItems, searchQuery, timeRange, dateRange])

  // Partition into inbox, sent, and calculate unread count.
  // Real reports address teams via `to: [staging-teams/<id>]` refs — match on doc id.
  const partition = useMemo(() => {
    const isSent = (r: ReportItem) => {
      if (!teamId) return false
      if (r.senderId === teamId || r.from === teamId || r.originator === teamId) return true
      const targets = Array.isArray(r.to) ? r.to : [r.to]
      return targets.some(
        (t) => typeof t === 'string' && (t === teamId || t.endsWith(`/${teamId}`))
      )
    }

    const sent = filteredItems.filter(isSent)
    const inbox = filteredItems.filter((r) => !isSent(r))
    const unreadCount = inbox.filter((r) => !r.read).length

    return { inbox, sent, unreadCount }
  }, [filteredItems, teamId])

  return {
    all: filteredItems,
    inbox: partition.inbox,
    sent: partition.sent,
    unreadCount: partition.unreadCount,
    totalCount: filteredItems.length,
    rawCount: rawItems.length,
    isLoading,
    error,
    lastSyncedAt,
  }
}
