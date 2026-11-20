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
import { matchesOrg, arrayContainsOrg, serializeValue } from '../utils/formatters'
import { syncSosEvents } from './sosEventLog'
import type { SosHistoryItem } from '../types/overview.types'

// Confirmed against the live SigTrak backend: SOS beacons live in `staging-SOS`.
const SOS_COLLECTION = 'staging-SOS'

function docBelongsToOrg(data: Record<string, unknown>, orgId: string): boolean {
  const single = data.organisation ?? data.organization ?? data.org ?? data.organisationRef ?? data.organizationRef
  const multi = data.organisations ?? data.organizations ?? data.orgs ?? data.organisationList
  return (
    matchesOrg(single, orgId) ||
    matchesOrg(serializeValue(single), orgId) ||
    arrayContainsOrg(multi, orgId) ||
    (Array.isArray(multi) && multi.some((ref) => matchesOrg(serializeValue(ref), orgId)))
  )
}

/**
 * Subscribe to SOS activations for an organisation.
 * `staging-SOS` holds live beacon state; `syncSosEvents` converts
 * distressStatus transitions into persisted activation/resolution history.
 */
export function subscribeSosHistory(
  orgId: string,
  onChange: (items: SosHistoryItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const orgRef = doc(db, 'staging-config', orgId)
  return onSnapshot(
    query(
      collection(db, SOS_COLLECTION),
      or(
        where('organisation', '==', orgRef),
        where('organisations', 'array-contains', orgRef)
      )
    ),
    (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> }))
        .filter((doc) => docBelongsToOrg(doc.data, orgId))

      const items = syncSosEvents(orgId, docs).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      onChange(items)
    },
    (err) => onError?.(err)
  )
}
