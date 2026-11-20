import { useEffect, useRef, useState } from 'react'
import { Wifi, WifiOff, Clock, Settings, ChevronDown, RefreshCw, Sun, Moon } from 'lucide-react'
import type { DateRangeFilter, OrgSession, TimeRangeFilter } from '../../types/overview.types'
import { getMilitaryDTG } from '../../utils/formatters'
import logoUrl from '@/assets/sigtrack-logo.png'

interface OverviewHeaderProps {
  session: OrgSession
  lastUpdated: Date | null
  isLive: boolean
  timeRange: TimeRangeFilter
  onTimeRangeChange: (v: TimeRangeFilter) => void
  dateRange: DateRangeFilter
  onDateRangeChange: (range: DateRangeFilter) => void
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onResetFilters: () => void
  extraControls?: React.ReactNode
}

const TIME_OPTIONS: { label: string; value: TimeRangeFilter }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
  { label: 'Custom Range', value: 'custom' },
]

function relativeTime(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 5) return 'now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function OverviewHeader({
  session,
  lastUpdated,
  isLive,
  timeRange,
  onTimeRangeChange,
  dateRange,
  onDateRangeChange,
  theme,
  onThemeToggle,
  onResetFilters,
  extraControls,
}: OverviewHeaderProps) {
  const dtg = getMilitaryDTG()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!settingsOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [settingsOpen])

  return (
    <header className="h-14 shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 lg:px-6 flex items-center justify-between gap-3 z-10">
      {/* LEFT: Logo + Org Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={logoUrl}
            alt="SigTrack"
            className="h-10 w-auto object-contain bg-transparent brightness-110 contrast-125 drop-shadow-lg"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="text-[15px] font-bold tracking-widest text-[var(--text-primary)] uppercase font-sans hidden sm:block">
            SIGTRACK
          </span>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-[var(--border-color)]" />

        {/* Overview label */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--accent-blue)] font-bold">
            Overview
          </span>
        </div>

        {/* Divider */}
        <div className="hidden lg:block h-6 w-px bg-[var(--border-color)]" />

        {/* Org + Team Pills */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-600/15 text-blue-300 border border-blue-600/30 truncate max-w-[180px]">
            {session.organizationName}
          </span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] truncate max-w-[130px]">
            {session.teamName}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-color)]">
            LVL {session.levelName}
          </span>
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Time Range Filter */}
        <div className="relative hidden sm:block">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as TimeRangeFilter)}
            className="appearance-none text-[11px] font-mono bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-[var(--accent-blue)]/50 hover:border-[var(--bg-tertiary)] transition-colors cursor-pointer"
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {/* Custom Date Range */}
        {timeRange === 'custom' && (
          <div className="hidden sm:flex items-center gap-1.5 font-mono">
            <input
              type="date"
              value={dateRange.startDate}
              max={dateRange.endDate || undefined}
              onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
              className="text-[11px] font-mono bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[var(--accent-blue)]/50 [color-scheme:dark]"
              aria-label="Start date"
            />
            <span className="text-[10px] text-[var(--text-muted)] uppercase">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              min={dateRange.startDate || undefined}
              onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
              className="text-[11px] font-mono bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[var(--accent-blue)]/50 [color-scheme:dark]"
              aria-label="End date"
            />
          </div>
        )}

        {/* Live/Mock Toggle */}
        {extraControls}

        {/* DTG Clock */}
        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[var(--border-color)] font-mono">
          <Clock size={12} className="text-[var(--accent-blue)]/70" />
          <div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest leading-none">ZULU</div>
            <div className="text-[11px] font-bold text-[var(--accent-blue)] tracking-wider">{dtg}</div>
          </div>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-mono">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isLive ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'
            }`}
          />
          {isLive ? (
            <span
              className="text-blue-400 font-semibold text-[11px] flex items-center gap-1"
              title={lastUpdated ? `Last sync ${lastUpdated.toLocaleTimeString()}` : 'Waiting for first sync…'}
            >
              <Wifi size={11} /> LIVE
              {lastUpdated && (
                <span className="text-[var(--text-muted)] font-normal hidden sm:inline">· {relativeTime(lastUpdated)}</span>
              )}
            </span>
          ) : (
            <span className="text-[var(--text-muted)] font-semibold text-[11px] flex items-center gap-1">
              <WifiOff size={11} /> OFF
            </span>
          )}
        </div>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label="Settings"
            aria-expanded={settingsOpen}
            className={`p-2 rounded-lg transition-colors border ${
              settingsOpen
                ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)] border-[var(--border-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/10 border-transparent hover:border-[var(--border-color)]'
            }`}
          >
            <Settings size={16} />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-11 w-64 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-1.5 z-50 max-h-[80vh] overflow-y-auto">
              {/* Identity */}
              <div className="flex items-center gap-3 px-2.5 py-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white border-2 border-blue-500/40 shrink-0">
                  {(session.teamName || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[var(--text-primary)] truncate">{session.teamName}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{session.organizationName}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-600/15 text-blue-300 border border-blue-600/30">
                      LVL {session.levelName}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      isLive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-color)]'
                    }`}>
                      {isLive ? 'LINK LIVE' : 'LINK OFF'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[var(--border-color)] mx-1 my-1" />

              {/* Session details */}
              <div className="px-2.5 py-1.5 space-y-1.5">
                {[
                  ['ORGANIZATION', session.organizationName],
                  ['TEAM', session.teamName],
                  ['COMMAND LEVEL', `LVL ${session.levelName}`],
                  ['ORG ID', session.organizationDocId.slice(0, 10) + '…'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] truncate max-w-[170px]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[var(--border-color)] mx-1 my-1" />

              {/* Appearance */}
              <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Appearance
              </div>
              <div className="grid grid-cols-2 gap-1 px-1 pb-1.5">
                {([
                  { value: 'dark' as const, label: 'Dark mode', Icon: Moon },
                  { value: 'light' as const, label: 'Light mode', Icon: Sun },
                ]).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (value !== theme) onThemeToggle()
                    }}
                    aria-label={label}
                    title={label}
                    className={`flex items-center justify-center py-2 rounded-md border transition-colors ${
                      theme === value
                        ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] border-[var(--accent-blue)]/40'
                        : 'text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>

              <div className="h-px bg-[var(--border-color)] mx-1 mb-1" />

              {/* Actions */}
              <button
                type="button"
                onClick={() => {
                  onResetFilters()
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] font-mono rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <RefreshCw size={12} />
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false)
                  window.location.reload()
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] font-mono rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <RefreshCw size={12} />
                Refresh Dashboard
              </button>

              <div className="px-2.5 py-1.5 mt-1 text-[9px] font-mono text-[var(--text-muted)] text-center border-t border-[var(--border-color)]">
                SIGTRAK C2 OVERVIEW · v0.1.0
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
