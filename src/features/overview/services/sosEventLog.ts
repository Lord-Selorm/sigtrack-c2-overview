import { serializeDateValue, serializeValue } from '../utils/formatters.ts'
import type { SosHistoryItem } from '../types/overview.types'

// ─── SOS Event Log ──────────────────────────────────────────────────────────
// `staging-SOS` stores live beacon *state*, not events. To build a real SOS
// history we persist activation/resolution transitions in localStorage:
//   distressStatus normal/clear  → active/cancelled  = SOS ACTIVATED
//   active/cancelled           → normal/clear      = SOS RESOLVED
// State is tracked per beacon so history accumulates while the dashboard runs.

interface StoredSosEvent {
  id: string
  beaconId: string
  personnelName: string
  callSign: string
  userEmail: string
  userId: string
  organisations: string[]
  latitude: string
  longitude: string
  activatedAt: string
  resolvedAt: string
  cancelledAt: string
  status: 'active' | 'resolved' | 'cancelled'
  heartRate: string
  speedKmh: string
  mode: string
  activityLabel: string
  accuracy: string
  bearing: string
  altitude: string
}

type BeaconLevel = 'clear' | 'active' | 'cancelled'

const MAX_EVENTS = 500

const eventsKey = (orgId: string) => `sigtrack-sos-events:${orgId}`

// localStorage with an in-memory fallback for non-browser environments/tests.
const memoryStore = new Map<string, string>()
const storage: Pick<Storage, 'getItem' | 'setItem'> =
  typeof localStorage !== 'undefined'
    ? localStorage
    : {
        getItem: (key: string) => memoryStore.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memoryStore.set(key, value)
        },
      }

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — ignore
  }
}

function firstString(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = serializeValue(data[key])
    if (value) return value
  }
  return ''
}

function orgRefsOf(data: Record<string, unknown>): string[] {
  const values: unknown[] = []
  const single = data.organisation ?? data.organization ?? data.org
  const multi = data.organisations ?? data.organizations ?? data.orgs
  if (single !== undefined && single !== null) values.push(single)
  if (Array.isArray(multi)) values.push(...multi)
  return values.map(serializeValue).filter(Boolean)
}

/** Classify a beacon doc's distress level. */
function beaconLevel(data: Record<string, unknown>): BeaconLevel {
  const raw = (
    firstString(data, ['distressStatus', 'distress', 'sosStatus', 'emergencyStatus']) ||
    firstString(data, ['status', 'state', 'resolutionStatus'])
  ).toLowerCase()
  if (!raw) return 'clear'
  if (raw.includes('cancel')) return 'cancelled'
  if (['normal', 'resolved', 'closed', 'complete', 'completed', 'ok', 'safe', 'standby', 'inactive', 'clear'].includes(raw)) {
    return 'clear'
  }
  return 'active'
}

function beaconTimestamp(data: Record<string, unknown>): string {
  return (
    serializeDateValue(data.timestamp) ||
    serializeDateValue(data.createdAt) ||
    serializeDateValue(data.dateTime) ||
    serializeDateValue(data.triggeredAt) ||
    ''
  )
}

function snapshotVitals(data: Record<string, unknown>) {
  return {
    heartRate: firstString(data, ['heartRate', 'heart_rate', 'bpm']),
    speedKmh: firstString(data, ['speedKmh', 'speedKph', 'speed']),
    mode: firstString(data, ['mode', 'activityMode', 'movementMode']),
    activityLabel: firstString(data, ['activityLabel', 'activity']),
    accuracy: firstString(data, ['accuracy']),
    bearing: firstString(data, ['bearing']),
    altitude: firstString(data, ['altitude', 'elevation']),
  }
}

function toHistoryItem(event: StoredSosEvent): SosHistoryItem {
  const coordinates = event.latitude && event.longitude ? `${event.latitude}, ${event.longitude}` : ''
  return {
    id: event.id,
    organisation: event.organisations[0] ?? '',
    organisations: event.organisations,
    teamId: '',
    teamName: '',
    command: '',
    unit: '',
    personnelName: event.personnelName || event.callSign,
    triggeredBy: event.userEmail || event.userId,
    location: '',
    coordinates,
    latitude: event.latitude,
    longitude: event.longitude,
    incident: '',
    message: '',
    status: event.status,
    dateTime: event.activatedAt,
    createdAt: event.activatedAt,
    updatedAt: event.resolvedAt || event.cancelledAt || event.activatedAt,
    resolvedAt: event.resolvedAt || event.cancelledAt,
    callSign: event.callSign,
    userEmail: event.userEmail,
    heartRate: event.heartRate,
    speedKmh: event.speedKmh,
    mode: event.mode,
    activityLabel: event.activityLabel,
    accuracy: event.accuracy,
    bearing: event.bearing,
    altitude: event.altitude,
  }
}

/**
 * Sync beacon docs into the persisted SOS event log and return history items.
 * `docs` must already be filtered to the target organisation.
 */
export function syncSosEvents(orgId: string, docs: { id: string; data: Record<string, unknown> }[]): SosHistoryItem[] {
  const events = loadJson<StoredSosEvent[]>(eventsKey(orgId), [])
  const nowIso = new Date().toISOString()

  const openEvents = new Map<string, StoredSosEvent>()
  for (const event of events) {
    if (event.status === 'active') openEvents.set(event.beaconId, event)
  }

  for (const doc of docs) {
    const data = doc.data
    const level = beaconLevel(data)

    const open = openEvents.get(doc.id)
    const vitals = snapshotVitals(data)

    if ((level === 'active' || level === 'cancelled') && !open) {
      // New activation — or beacon already in distress when first observed.
      const activatedAt = beaconTimestamp(data) || nowIso
      const event: StoredSosEvent = {
        id: `${doc.id}:${activatedAt}`,
        beaconId: doc.id,
        personnelName: firstString(data, ['callSign', 'callsign', 'personnelName', 'userName', 'fullName', 'name']),
        callSign: firstString(data, ['callSign', 'callsign', 'call_sign']),
        userEmail: firstString(data, ['userEmail', 'email', 'operatorEmail']),
        userId: firstString(data, ['userId', 'id']),
        organisations: orgRefsOf(data),
        latitude: firstString(data, ['latitude', 'lat']),
        longitude: firstString(data, ['longitude', 'lng', 'lon', 'long']),
        activatedAt,
        resolvedAt: '',
        cancelledAt: '',
        status: level === 'cancelled' ? 'cancelled' : 'active',
        ...vitals,
        ...(level === 'cancelled' ? { cancelledAt: nowIso } : {}),
      }
      events.push(event)
      if (event.status === 'active') openEvents.set(doc.id, event)
    } else if (level === 'clear' && open) {
      open.status = 'resolved'
      open.resolvedAt = nowIso
      openEvents.delete(doc.id)
      // Refresh last-known telemetry on the closed event
      Object.assign(open, vitals)
    }
  }

  // Beacons no longer reporting keep their last state — do not auto-resolve.
  const trimmed = events
    .sort((a, b) => new Date(b.activatedAt).getTime() - new Date(a.activatedAt).getTime())
    .slice(0, MAX_EVENTS)

  saveJson(eventsKey(orgId), trimmed)

  return trimmed.map(toHistoryItem)
}
