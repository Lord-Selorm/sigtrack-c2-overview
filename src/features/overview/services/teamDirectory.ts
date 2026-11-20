import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { serializeValue } from '../utils/formatters'

// ─── Team Directory ─────────────────────────────────────────────────────────
// Resolves `staging-teams/<docId>` references to human-readable team names.
// Cached for 60s — team names change rarely and snapshots fire often.

const TTL_MS = 60_000
let cache: Promise<Map<string, string>> | null = null
let fetchedAt = 0

export function getTeamDirectory(): Promise<Map<string, string>> {
  if (cache && Date.now() - fetchedAt < TTL_MS) return cache
  fetchedAt = Date.now()
  cache = getDocs(collection(db, 'staging-teams'))
    .then((snap) => {
      const map = new Map<string, string>()
      for (const doc of snap.docs) {
        const data = doc.data() as Record<string, unknown>
        const name =
          serializeValue(data.name) ||
          serializeValue(data.teamName) ||
          serializeValue(data.callSign) ||
          serializeValue(data.title)
        if (name) map.set(doc.id, name)
      }
      return map
    })
    .catch(() => new Map<string, string>())
  return cache
}

/**
 * Resolve a field that may be a team reference path/id or plain text.
 * Falls back to the doc id for unresolved refs, or the raw text otherwise.
 */
export function resolveTeamName(value: string, directory?: Map<string, string>): string {
  if (!value) return ''
  const id = value.split('/').pop() ?? value
  const resolved = directory?.get(id)
  if (resolved) return resolved
  return value.includes('/') ? id : value
}
