import type { DocumentReference } from 'firebase/firestore'

/** Convert Firestore Timestamps, epoch values, Dates and refs to a Date (or null). */
function toDateValue(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'object') {
    const c = value as {
      toDate?: () => Date
      toMillis?: () => number
      seconds?: number
      _seconds?: number
    }
    if (typeof c.toMillis === 'function') {
      const d = new Date(c.toMillis())
      return isNaN(d.getTime()) ? null : d
    }
    if (typeof c.toDate === 'function') {
      const d = c.toDate()
      return isNaN(d.getTime()) ? null : d
    }
    const seconds = c.seconds ?? c._seconds
    if (typeof seconds === 'number') {
      const d = new Date(seconds * 1000)
      return isNaN(d.getTime()) ? null : d
    }
  }
  return null
}

/** Serialize a Firestore-ish value (Timestamp, DocumentReference, epoch, primitive) to a string. */
export function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return isNaN(value.getTime()) ? '' : value.toISOString()
  if (typeof value === 'object') {
    const c = value as { path?: string; id?: string }
    if (typeof c.path === 'string') return c.path
    if (typeof c.id === 'string') return c.id
  }
  return ''
}

/** Serialize a date-ish field to ISO, handling epoch seconds/ms strings too. */
export function serializeDateValue(value: unknown): string {
  const date = toDateValue(value)
  if (date) return date.toISOString()
  const text = serializeValue(value)
  if (/^\d{10,13}$/.test(text)) {
    const n = Number(text)
    const d = new Date(text.length === 10 ? n * 1000 : n)
    return isNaN(d.getTime()) ? text : d.toISOString()
  }
  return text
}

/** Serialize an array of Firestore-ish values to strings. */
export function serializeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map(serializeValue).filter(Boolean)
}

/** Generate military Date Time Group (DTG) string: e.g. 090320Z NOV 26 */
export function getMilitaryDTG(date: Date = new Date()): string {
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const month = date
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    .toUpperCase()
  const year = String(date.getUTCFullYear()).slice(2)
  return `${day}${hour}${min}Z ${month} ${year}`
}

/** Format ISO or timestamp into readable date (DD MMM YY) */
export function formatDate(value: unknown): string {
  const d = toDateValue(value)
  if (!d) return value ? String(value) : '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

/** Format a date if parseable, otherwise return the raw string (e.g. DTG groups). */
export function formatDateTimeOrRaw(value: unknown): string {
  const d = toDateValue(value)
  if (d) return formatDateTime(d)
  return value === null || value === undefined || value === '' ? '—' : String(value)
}

/** Format timestamp with hour & minute */
export function formatDateTime(value: unknown): string {
  const d = toDateValue(value)
  if (!d) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Check if a field value matches an organisation string or reference */
export function matchesOrg(value: unknown, orgId: string): boolean {
  if (!orgId) return false
  const short = `staging-config/${orgId}`
  const full = `projects/fieldcom-8159b/databases/(default)/documents/staging-config/${orgId}`

  if (typeof value === 'string') {
    return value === short || value === full || value === orgId
  }

  if (value && typeof value === 'object' && 'path' in value) {
    const ref = value as DocumentReference
    return ref.path === short
  }

  return false
}

/** Check if an array contains the given organisation */
export function arrayContainsOrg(arr: unknown, orgId: string): boolean {
  if (!Array.isArray(arr)) return false
  return arr.some((item) => matchesOrg(item, orgId))
}

/** Safely extract string path or ID from reference/string */
export function extractId(item: unknown): string {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    if ('path' in item) return String((item as { path: string }).path)
    if ('id' in item) return String((item as { id: string }).id)
  }
  return ''
}
