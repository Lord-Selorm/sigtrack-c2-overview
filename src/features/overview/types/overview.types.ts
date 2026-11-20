// ─── Authentication & Session Types ────────────────────────────────────────

export interface OrgSession {
  organizationDocId: string
  organizationName: string
  teamId: string
  teamName: string
  levelId: number
  levelName: string
}

export interface FeaturePrivilege {
  enableReporting: boolean
  enableEventLogging: boolean
  enableSitrep: boolean
  enableOperations: boolean
  [key: string]: boolean
}

// ─── 1. SITREP Types ───────────────────────────────────────────────────────

export interface SitrepItem {
  id: string
  serialNumber?: number | string
  organisation: string
  command: string
  unit: string
  location: string
  incident: string
  action: string
  remark: string
  dateTime: string
  createdAt: string
  senderId: string
  info: string[]
}

export interface SitrepSummaryData {
  items: SitrepItem[]
  totalCount: number
}

// ─── 2. Operations Types ───────────────────────────────────────────────────

export type OperationStatus = 'Active' | 'Dormant' | 'Completed' | string
export type OperationType = 'Internal' | 'External' | string

export interface OperationItem {
  id: string
  ser: number
  typeOfOps: string
  status: OperationStatus
  operationType: OperationType
  comdUnit: string[]
  deplLoc: string[]
  description: string
  organisation: string
  organisations: string[]
  createdAt: string
  updatedAt: string
}

export interface OperationsSummaryData {
  items: OperationItem[]
  total: number
  active: number
  internal: number
  external: number
}

// ─── 3. Logging (Signal Messaging / Battle Logs) Types ─────────────────────

export type LogStatus = 'low' | 'medium' | 'high' | 'pending' | string
export type LogPrecedence = 'routine' | 'priority' | 'immediate' | 'flash' | string

export interface BattleLogItem {
  id: string
  command: string
  unit: string
  location: string
  incident: string
  action: string
  remark: string
  status: LogStatus
  precedence: LogPrecedence | number
  securityClassification?: string
  drafterName?: string
  drafterAppointment?: string
  drafterTel?: string
  dateTime: string
  createdAt: string
  operation?: string
  organisation: string
  organisations: string[]
}

export interface LoggingSummaryData {
  items: BattleLogItem[]
  totalCount: number
  statusCounts: Record<string, number>
}

// ─── 4. Reports (Correspondence) Types ─────────────────────────────────────

export interface ReportReply {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: string
}

export interface ReportItem {
  id: string
  organisation: string
  organisations?: string[]
  subject: string
  from: string
  originator: string
  to: string | string[]
  info?: string[]
  content: string
  read: boolean
  senderId?: string
  createdAt: string
  replies?: ReportReply[]
}

export interface ReportsSummaryData {
  inbox: ReportItem[]
  sent: ReportItem[]
  all: ReportItem[]
  unreadCount: number
  totalCount: number
}

// ─── 5. SOS History Types ──────────────────────────────────────────────────

export type SosStatus = 'active' | 'resolved' | 'cancelled' | 'pending' | string

export interface SosHistoryItem {
  id: string
  organisation: string
  organisations: string[]
  teamId: string
  teamName: string
  command: string
  unit: string
  personnelName: string
  triggeredBy: string
  location: string
  coordinates: string
  latitude: string
  longitude: string
  incident: string
  message: string
  status: SosStatus
  dateTime: string
  createdAt: string
  updatedAt: string
  resolvedAt: string
  // Live beacon telemetry (staging-SOS schema)
  callSign?: string
  userEmail?: string
  heartRate?: string
  speedKmh?: string
  mode?: string
  activityLabel?: string
  accuracy?: string
  bearing?: string
  altitude?: string
}

export interface SosHistorySummaryData {
  items: SosHistoryItem[]
  totalCount: number
  activeCount: number
  resolvedCount: number
}

// ─── Filter Types ──────────────────────────────────────────────────────────

export type TimeRangeFilter = '24h' | '7d' | '30d' | 'all' | 'custom'
export type ModuleViewFilter = 'all' | 'sitrep' | 'operations' | 'logging' | 'reports' | 'sos'

export interface DateRangeFilter {
  startDate: string
  endDate: string
}

export interface OverviewFilterState {
  searchQuery: string
  timeRange: TimeRangeFilter
  dateRange?: DateRangeFilter
  moduleView: ModuleViewFilter
}

// ─── Shared UI State Types ─────────────────────────────────────────────────

export interface SectionAsyncState<T> {
  data: T
  isLoading: boolean
  error: string | null
  reload?: () => void
}
