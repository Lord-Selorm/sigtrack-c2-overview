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

// ─── 1. SITREP (Situation Reports) ─────────────────────────────────────────
// Table: S/N | Date/Time | Command | Unit | Location | Incident | Action Taken | Remark | INFO

export interface Sitrep {
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

// ─── 2. Reports (Correspondence & Messaging) ───────────────────────────────
// Tabs: Compose | Inbox | Sent (with read/unread, replies, attachments)

export interface Report {
  id: string
  organisation: string
  subject: string
  from: string
  originator: string
  to: string[]
  info: string[]
  content: string
  read: boolean
  senderId: string
  createdAt: string
  replies?: ReportReply[]
}

export interface ReportReply {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: string
}

// ─── 3. Operations (Operations Registry) ───────────────────────────────────
// Metrics: TOTAL OPS | ACTIVE | INTERNAL | EXTERNAL
// Table: SER | TYPE OF OPS | STATUS | TYPE | COMD/UNIT | DEPL LOC | ACTIONS

export type OperationStatus = 'Active' | 'Dormant' | 'Completed' | string
export type OperationType = 'Internal' | 'External' | string

export interface Operation {
  id: string
  organisation: string
  organisations: string[]
  typeOfOps: string
  status: OperationStatus
  operationType: OperationType
  comdUnit: string[]
  deplLoc: string[]
  ser: number
  description: string
  createdAt: string
  updatedAt: string
}

// ─── 4. Logging (Signal Messaging / Battle Logs) ───────────────────────────
// Table: Incident | Command | Unit | Location | Action | Status (low/med/high) | Precedence

export type LogStatus = 'low' | 'medium' | 'high' | 'pending' | string
export type LogPrecedence = 'routine' | 'priority' | 'immediate' | 'flash' | string

export interface BattleLog {
  id: string
  organisation: string
  organisations: string[]
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
  participants?: string[]
}

// ─── Aggregate Overview Data ───────────────────────────────────────────────

export interface OverviewData {
  sitreps: Sitrep[]
  reports: {
    inbox: Report[]
    sent: Report[]
    all: Report[]
    unreadCount: number
  }
  operations: {
    all: Operation[]
    active: number
    internal: number
    external: number
  }
  battleLogs: BattleLog[]
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
