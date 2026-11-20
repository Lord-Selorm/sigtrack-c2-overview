import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { Database, Sparkles, RefreshCw, Download, Siren, X } from 'lucide-react'
import { useAuthSession } from '@/hooks/useAuthSession'
import type { DateRangeFilter, SosHistoryItem, TimeRangeFilter } from '../types/overview.types'
import { useSitrepSummary } from '../hooks/useSitrepSummary'
import { useOperationsSummary } from '../hooks/useOperationsSummary'
import { useLoggingSummary } from '../hooks/useLoggingSummary'
import { useReportsSummary } from '../hooks/useReportsSummary'
import { useSosHistorySummary } from '../hooks/useSosHistorySummary'

import { OverviewHeader } from './header/OverviewHeader'
import { MetricsBanner } from './MetricsBanner'
import { FullDashboardSkeleton } from './states/LoadingState'
import { CardLoading } from './states/CardStatus'
import { SectionNavigator, type SectionType } from './SectionNavigator'
import { playSosAlertSound } from '../utils/alertSound'
import { downloadCsv } from '../utils/exportCsv'

// Tab modules are code-split — each chunk loads only when its tab is opened.
const SitrepSummary = lazy(() => import('./SitrepSummary').then((m) => ({ default: m.SitrepSummary })))
const OperationsSummary = lazy(() => import('./OperationsSummary').then((m) => ({ default: m.OperationsSummary })))
const LoggingSummary = lazy(() => import('./LoggingSummary').then((m) => ({ default: m.LoggingSummary })))
const ReportsSummary = lazy(() => import('./ReportsSummary').then((m) => ({ default: m.ReportsSummary })))
const SosHistorySummary = lazy(() => import('./SosHistorySummary').then((m) => ({ default: m.SosHistorySummary })))
import logoUrl from '@/assets/sigtrack-logo.png'

export interface OverviewPageProps {
  organizationId?: string
  organizationName?: string
  teamId?: string
  teamName?: string
  levelId?: number
  levelName?: string
  initialMockMode?: boolean
}

export function OverviewPage({
  organizationId,
  organizationName,
  teamId,
  teamName,
  levelId,
  levelName,
  initialMockMode = false,
}: OverviewPageProps) {
  const [useMock, setUseMock] = useState<boolean>(initialMockMode)
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all')
  const [dateRange, setDateRange] = useState<DateRangeFilter>({ startDate: '', endDate: '' })
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentSection, setCurrentSection] = useState<SectionType>('operations')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sigtrack-theme')
    return saved === 'light' || saved === 'dark' ? saved : 'dark'
  })
  const searchRef = useRef<HTMLInputElement>(null)
  const [sosAlert, setSosAlert] = useState<SosHistoryItem | null>(null)
  const [, setSyncTick] = useState(0)

  // Re-render every 5s so the header's last-sync time stays fresh
  useEffect(() => {
    const t = setInterval(() => setSyncTick((n) => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const handleSosAlert = useCallback((item: SosHistoryItem) => {
    setSosAlert(item)
    playSosAlertSound()
  }, [])

  // Auto-dismiss the SOS toast after 20 seconds
  useEffect(() => {
    if (!sosAlert) return
    const t = setTimeout(() => setSosAlert(null), 20000)
    return () => clearTimeout(t)
  }, [sosAlert])

  // Global search shortcut: Ctrl+K / Cmd+K or "/" focuses the search bar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping = ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      } else if (e.key === '/' && !isTyping) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sigtrack-theme', theme)
  }, [theme])

  const { session: storedSession, isLoading: sessionLoading } = useAuthSession()

  const session = organizationId
    ? {
        organizationDocId: organizationId,
        organizationName: organizationName ?? 'Organization',
        teamId: teamId ?? '',
        teamName: teamName ?? 'Team',
        levelId: levelId ?? 0,
        levelName: levelName ?? 'HQ',
      }
    : storedSession ?? {
        organizationDocId: 'ic4uIYCiSHsqUlJT7wkN',
        organizationName: 'EX STORM SHIELD',
        teamId: 'feHBrHLQq4RMvFno4SN5',
        teamName: 'ARMY HQ',
        levelId: 0,
        levelName: 'HQ',
      }

  const sitrep = useSitrepSummary({ orgId: session.organizationDocId, useMock, searchQuery, timeRange, dateRange })
  const operations = useOperationsSummary({ orgId: session.organizationDocId, useMock, searchQuery, timeRange, dateRange })
  const logging = useLoggingSummary({ orgId: session.organizationDocId, useMock, searchQuery, timeRange, dateRange })
  const reports = useReportsSummary({ orgId: session.organizationDocId, teamId: session.teamId, useMock, searchQuery, timeRange, dateRange })
  const sosHistory = useSosHistorySummary({ orgId: session.organizationDocId, useMock, searchQuery, timeRange, dateRange, onSosAlert: handleSosAlert })

  const lastSync = [sitrep.lastSyncedAt, operations.lastSyncedAt, logging.lastSyncedAt, reports.lastSyncedAt, sosHistory.lastSyncedAt]
    .filter((d): d is Date => d !== null)
    .reduce<Date | null>((max, d) => (max === null || d > max ? d : max), null)

  const handleExportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    switch (currentSection) {
      case 'sitrep':
        downloadCsv(
          `sigtrack-sitrep-${stamp}.csv`,
          ['Serial', 'Date', 'Command', 'Unit', 'Location', 'Incident', 'Action', 'Remark'],
          sitrep.items.map((s, i) => [s.serialNumber ?? i + 1, s.dateTime || s.createdAt, s.command, s.unit, s.location, s.incident, s.action, s.remark])
        )
        break
      case 'operations':
        downloadCsv(
          `sigtrack-operations-${stamp}.csv`,
          ['Ser', 'Type of Ops', 'Status', 'Op Type', 'Command Units', 'Depl Locations', 'Description', 'Created'],
          operations.items.map((o) => [o.ser, o.typeOfOps, o.status, o.operationType, o.comdUnit.join('; '), o.deplLoc.join('; '), o.description, o.createdAt])
        )
        break
      case 'logging':
        downloadCsv(
          `sigtrack-incident-logs-${stamp}.csv`,
          ['Date', 'Precedence', 'Status', 'Command', 'Unit', 'Location', 'Incident', 'Action'],
          logging.items.map((l) => [l.createdAt || l.dateTime, l.precedence, l.status, l.command, l.unit, l.location, l.incident, l.action])
        )
        break
      case 'reports':
        downloadCsv(
          `sigtrack-reports-${stamp}.csv`,
          ['Date', 'From', 'To', 'Subject', 'Read', 'Content'],
          reports.all.map((r) => [r.createdAt, r.from || r.originator, Array.isArray(r.to) ? r.to.join('; ') : r.to, r.subject, r.read ? 'Yes' : 'No', r.content])
        )
        break
      case 'sos':
        downloadCsv(
          `sigtrack-sos-history-${stamp}.csv`,
          ['Activated', 'Personnel', 'Call Sign', 'Status', 'Unit', 'Location', 'Coordinates', 'Heart Rate', 'Speed (km/h)', 'Mode', 'Resolved'],
          sosHistory.items.map((s) => [s.createdAt || s.dateTime, s.personnelName, s.callSign ?? '', s.status, s.unit || s.teamName, s.location, s.coordinates, s.heartRate ?? '', s.speedKmh ?? '', s.mode ?? '', s.resolvedAt])
        )
        break
    }
  }

  if (sessionLoading) {
    return <FullDashboardSkeleton message="Connecting to SigTrak session..." />
  }

  const highLogs = logging.items.filter((l) => (l.status || '').toLowerCase() === 'high').length

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="relative h-dvh w-screen overflow-hidden font-sans select-none">
      {/* ── CONTENT LAYER (above watermark) ── */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col h-full">
      {/* ── TOP HEADER ── */}
      <OverviewHeader
        session={session}
        lastUpdated={lastSync}
        isLive={!useMock}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        theme={theme}
        onThemeToggle={toggleTheme}
        onResetFilters={() => {
          setSearchQuery('')
          setTimeRange('all')
          setDateRange({ startDate: '', endDate: '' })
        }}
        extraControls={
          <div className="flex items-center gap-2">
            {/* Live/Mock Toggle */}
            <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUseMock(false)}
                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md transition-all font-mono ${
                  !useMock
                    ? 'bg-[var(--accent-blue)] text-white font-bold shadow'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                <Database size={11} /> <span className="hidden sm:inline">LIVE</span>
              </button>
              <button
                type="button"
                onClick={() => setUseMock(true)}
                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md transition-all font-mono ${
                  useMock
                    ? 'bg-[var(--accent-amber)] text-white font-bold shadow'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                <Sparkles size={11} /> <span className="hidden sm:inline">MOCK</span>
              </button>
            </div>
          </div>
        }
      />

      {/* ── METRICS BANNER ── */}
      <MetricsBanner
        sitrepCount={sitrep.items.length}
        operationsCount={operations.items.length}
        activeOperations={operations.active}
        loggingCount={logging.items.length}
        highPriorityLogs={highLogs}
        reportsCount={reports.totalCount}
        unreadReports={reports.unreadCount}
        sosCount={sosHistory.totalCount}
        activeSosCount={sosHistory.activeCount}
      />

      {/* ── SEARCH FILTER BAR ── */}
      <div className="shrink-0 px-4 lg:px-6 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(''); e.currentTarget.blur() } }}
              placeholder="Search all modules (unit, incident, command, location)...  [Ctrl+K]"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded px-3 py-1.5 font-mono placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <span className="text-xs">×</span>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              {([
                ['OPS', operations.items.length, 'operations'],
                ['LOGS', logging.items.length, 'logging'],
                ['SITREP', sitrep.items.length, 'sitrep'],
                ['RPTS', reports.totalCount, 'reports'],
                ['SOS', sosHistory.items.length, 'sos'],
              ] as const).map(([label, count, section]) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setCurrentSection(section)}
                  title={`Jump to ${label} (${count} matches)`}
                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                    currentSection === section
                      ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] border-[var(--accent-blue)]/40 font-bold'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {label} <span className="text-[var(--text-primary)] font-bold">{count}</span>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            title="Export current view as CSV"
            className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded border bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--accent-blue)]/40 transition-colors shrink-0"
          >
            <Download size={11} /> CSV
          </button>
        </div>
      </div>

      {/* ── SECTION NAVIGATOR ── */}
      <SectionNavigator currentSection={currentSection} onSectionChange={setCurrentSection} />

      {/* ── SINGLE SECTION CONTENT (NO SCROLL) ── */}
      <main className="flex-1 min-h-0 overflow-hidden px-4 lg:px-6 py-4">
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
              <CardLoading label="Loading module…" />
            </div>
          }
        >
        {currentSection === 'sitrep' && (
          <SitrepSummary sitreps={sitrep.items} isLoading={sitrep.isLoading} error={sitrep.error} isFiltered={false} searchQuery={searchQuery} />
        )}

        {currentSection === 'operations' && (
          <OperationsSummary
            operations={operations.items}
            active={operations.active}
            internal={operations.internal}
            external={operations.external}
            isLoading={operations.isLoading}
            error={operations.error}
            isFiltered={false}
            searchQuery={searchQuery}
          />
        )}

        {currentSection === 'logging' && (
          <LoggingSummary
            battleLogs={logging.items}
            statusCounts={logging.statusCounts}
            isLoading={logging.isLoading}
            error={logging.error}
            isFiltered={false}
            searchQuery={searchQuery}
          />
        )}

        {currentSection === 'reports' && (
          <ReportsSummary
            inbox={reports.inbox}
            sent={reports.sent}
            all={reports.all}
            unreadCount={reports.unreadCount}
            isLoading={reports.isLoading}
            error={reports.error}
            isFiltered={false}
            searchQuery={searchQuery}
          />
        )}

        {currentSection === 'sos' && (
          <SosHistorySummary
            sosHistory={sosHistory.items}
            activeCount={sosHistory.activeCount}
            resolvedCount={sosHistory.resolvedCount}
            isLoading={sosHistory.isLoading}
            error={sosHistory.error}
            isFiltered={false}
            searchQuery={searchQuery}
          />
        )}
        </Suspense>
      </main>

      {/* Footer refresh note */}
      <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-[var(--text-muted)] font-mono border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <RefreshCw size={11} />
        <span>Live Firestore sync · staging-sigtrackweb · {session.organizationName}</span>
      </div>

      {/* ── SOS ACTIVATION ALERT TOAST ── */}
      {sosAlert && (
        <div className="fixed bottom-4 right-4 z-[100] w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-rose-500/60 bg-[var(--bg-secondary)] shadow-2xl shadow-rose-500/20 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-rose-600/90">
            <Siren size={14} className="text-white animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-white font-mono tracking-wider">SOS ACTIVATED</span>
            <button
              type="button"
              onClick={() => setSosAlert(null)}
              className="ml-auto text-white/80 hover:text-white p-0.5"
              aria-label="Dismiss alert"
            >
              <X size={13} />
            </button>
          </div>
          <div className="px-3 py-2.5 space-y-1 text-[11px] font-mono">
            <div className="text-[var(--text-primary)] font-bold text-[13px]">
              {sosAlert.personnelName || sosAlert.callSign || 'Unknown personnel'}
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Call sign: <span className="text-[var(--text-primary)]">{sosAlert.callSign || '—'}</span></span>
              <span>{sosAlert.createdAt ? new Date(sosAlert.createdAt).toLocaleTimeString() : ''}</span>
            </div>
            {(sosAlert.coordinates || sosAlert.location) && (
              <div className="text-[var(--text-secondary)] truncate">
                {sosAlert.coordinates || sosAlert.location}
              </div>
            )}
            {sosAlert.heartRate && (
              <div className="text-rose-400">HR {sosAlert.heartRate} bpm{sosAlert.speedKmh ? ` · ${Number(sosAlert.speedKmh).toFixed(1)} km/h` : ''}</div>
            )}
            <button
              type="button"
              onClick={() => { setCurrentSection('sos'); setSosAlert(null) }}
              className="mt-1 w-full text-center text-[10px] font-bold text-rose-300 border border-rose-500/40 rounded py-1 hover:bg-rose-500/10 transition-colors"
            >
              OPEN SOS HISTORY
            </button>
          </div>
        </div>
      )}

      </div>{/* /content layer */}

      {/* Background watermark logo — behind all content */}
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 m-auto h-[62vh] w-auto object-contain opacity-[0.07] select-none"
      />
    </div>
  )
}
