import {
  collection,
  doc,
  onSnapshot,
  or,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { matchesOrg, arrayContainsOrg, serializeValue, serializeDateValue, serializeArray } from '../utils/formatters'
import { getTeamDirectory, resolveTeamName } from './teamDirectory'
import type {
  SitrepItem,
  OperationItem,
  BattleLogItem,
  ReportItem,
} from '../types/overview.types'

// Org docs live in staging-config; records reference them via DocumentReference.
const ORG_COLLECTION = 'staging-config'

/** Query scoped to records belonging to the org (single ref or organisations[] array). */
function orgScopedQuery(orgId: string, collectionName: string) {
  const orgRef = doc(db, ORG_COLLECTION, orgId)
  return query(
    collection(db, collectionName),
    or(
      where('organisation', '==', orgRef),
      where('organisations', 'array-contains', orgRef)
    )
  )
}

/** Map Firestore doc to SitrepItem */
function docToSitrep(id: string, data: Record<string, unknown>): SitrepItem {
  return {
    id,
    organisation: serializeValue(data.organisation),
    command: serializeValue(data.command),
    unit: serializeValue(data.unit),
    location: serializeValue(data.location),
    incident: serializeValue(data.incident),
    action: serializeValue(data.action),
    remark: serializeValue(data.remark),
    dateTime: serializeDateValue(data.dateTime),
    createdAt: serializeDateValue(data.createdAt ?? data.dateTime),
    senderId: serializeValue(data.senderId),
    info: serializeArray(data.info),
  }
}

/** Subscribe to SITREPs */
export function subscribeSitreps(
  orgId: string,
  onChange: (items: SitrepItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    orgScopedQuery(orgId, 'staging-sitreps'),
    async (snap) => {
      const directory = await getTeamDirectory()
      const items = snap.docs
        .map((d) => {
          const item = docToSitrep(d.id, d.data() as Record<string, unknown>)
          return {
            ...item,
            command: resolveTeamName(item.command, directory),
            unit: resolveTeamName(item.unit, directory),
          }
        })
        .filter((s) => matchesOrg(s.organisation, orgId))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      onChange(items)
    },
    (err) => onError?.(err)
  )
}

/** Map Firestore doc to OperationItem */
function docToOperation(id: string, data: Record<string, unknown>): OperationItem {
  return {
    id,
    ser: Number(data.ser) || 0,
    typeOfOps: serializeValue(data.typeOfOps) || 'Operation',
    status: serializeValue(data.status) || 'Active',
    operationType: serializeValue(data.operationType) || 'Internal',
    comdUnit: serializeArray(data.comdUnit),
    deplLoc: serializeArray(data.deplLoc),
    description: serializeValue(data.description),
    organisation: serializeValue(data.organisation),
    organisations: serializeArray(data.organisations),
    createdAt: serializeDateValue(data.createdAt),
    updatedAt: serializeDateValue(data.updatedAt),
  }
}

/** Subscribe to Operations */
export function subscribeOperations(
  orgId: string,
  onChange: (items: OperationItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    orgScopedQuery(orgId, 'staging-operations'),
    (snap) => {
      const items = snap.docs
        .map((d) => docToOperation(d.id, d.data() as Record<string, unknown>))
        .filter((op) => matchesOrg(op.organisation, orgId) || arrayContainsOrg(op.organisations, orgId))
        .sort((a, b) => a.ser - b.ser)
      onChange(items)
    },
    (err) => onError?.(err)
  )
}

/** Map Firestore doc to BattleLogItem */
function docToBattleLog(id: string, data: Record<string, unknown>): BattleLogItem {
  return {
    id,
    command: serializeValue(data.command),
    unit: serializeValue(data.unit),
    location: serializeValue(data.location),
    incident: serializeValue(data.incident),
    action: serializeValue(data.action),
    remark: serializeValue(data.remark),
    status: serializeValue(data.status) || 'pending',
    precedence: serializeValue(data.precedence) || 'routine',
    securityClassification: serializeValue(data.securityClassification) || 'Restricted',
    drafterName: serializeValue(data.drafterName),
    drafterAppointment: serializeValue(data.drafterAppointment),
    drafterTel: serializeValue(data.drafterTel),
    dateTime: serializeValue(data.dateTime),
    createdAt: serializeDateValue(data.createdAt ?? data.dateTime),
    organisation: serializeValue(data.organisation),
    organisations: serializeArray(data.organisations),
  }
}

/** Subscribe to Battle Logs */
export function subscribeBattleLogs(
  orgId: string,
  onChange: (items: BattleLogItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    orgScopedQuery(orgId, 'staging-battle-logs'),
    async (snap) => {
      const directory = await getTeamDirectory()
      const items = snap.docs
        .map((d) => {
          const item = docToBattleLog(d.id, d.data() as Record<string, unknown>)
          return {
            ...item,
            command: resolveTeamName(item.command, directory),
            unit: resolveTeamName(item.unit, directory),
          }
        })
        .filter((l) => matchesOrg(l.organisation, orgId) || arrayContainsOrg(l.organisations, orgId))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      onChange(items)
    },
    (err) => onError?.(err)
  )
}

/** Map Firestore doc to ReportItem */
function docToReport(id: string, data: Record<string, unknown>): ReportItem {
  return {
    id,
    subject: serializeValue(data.subject),
    content: serializeValue(data.content),
    from: serializeValue(data.from) || serializeValue(data.originator),
    originator: serializeValue(data.originator) || serializeValue(data.from),
    to: Array.isArray(data.to) ? serializeArray(data.to) : serializeValue(data.to),
    createdAt: serializeDateValue(data.createdAt),
    read: Boolean(data.read),
    senderId: serializeValue(data.senderId),
    info: serializeArray(data.info),
    organisation: serializeValue(data.organisation),
    organisations: serializeArray(data.organisations),
    replies: Array.isArray(data.replies) ? (data.replies as ReportItem['replies']) : [],
  }
}

/** Subscribe to Reports */
export function subscribeReports(
  orgId: string,
  onChange: (items: ReportItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    orgScopedQuery(orgId, 'staging-reports'),
    (snap) => {
      const items = snap.docs
        .map((d) => docToReport(d.id, d.data() as Record<string, unknown>))
        .filter((r) => matchesOrg(r.organisation, orgId) || arrayContainsOrg(r.organisations, orgId))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      onChange(items)
    },
    (err) => onError?.(err)
  )
}
