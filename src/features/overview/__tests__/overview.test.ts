import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getMilitaryDTG, formatDate, matchesOrg, serializeValue, serializeDateValue, serializeArray } from '../utils/formatters.ts'
import { isWithinTimeRange, matchesQuery } from '../utils/filterUtils.ts'
import { syncSosEvents } from '../services/sosEventLog.ts'
import { parseSitrepMessage } from '../utils/sitrepParser.ts'

describe('Overview Utilities & Formatters', () => {
  it('generates a valid military ZULU DTG string', () => {
    const fixedDate = new Date('2026-11-14T15:30:00Z')
    const dtg = getMilitaryDTG(fixedDate)
    assert.equal(dtg, '141530Z NOV 26')
  })

  it('formats dates consistently', () => {
    const formatted = formatDate('2026-11-14T15:30:00Z')
    assert.ok(formatted.includes('14') && formatted.includes('Nov'))
  })

  it('matches organization reference paths and IDs', () => {
    const orgId = 'ic4uIYCiSHsqUlJT7wkN'
    assert.equal(matchesOrg(`staging-config/${orgId}`, orgId), true)
    assert.equal(matchesOrg(orgId, orgId), true)
    assert.equal(matchesOrg('other-org', orgId), false)
  })

  it('filters by keyword search across fields', () => {
    assert.equal(matchesQuery('artillery', '105mm Artillery Battery', 'HQ'), true)
    assert.equal(matchesQuery('radar', 'Troop Alpha', 'Grid 4429'), false)
    assert.equal(matchesQuery('', 'Any string'), true)
  })

  it('filters by time range', () => {
    const now = Date.now()
    const twoHoursAgo = now - 2 * 60 * 60 * 1000
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000

    assert.equal(isWithinTimeRange(twoHoursAgo, '24h'), true)
    assert.equal(isWithinTimeRange(twoDaysAgo, '24h'), false)
    assert.equal(isWithinTimeRange(twoDaysAgo, '7d'), true)
    assert.equal(isWithinTimeRange(twoDaysAgo, 'all'), true)
  })

  it('filters by custom start and end dates inclusively', () => {
    const range = { startDate: '2026-05-01', endDate: '2026-05-30' }
    assert.equal(isWithinTimeRange(new Date(2026, 4, 1, 0, 30).getTime(), 'custom', range), true)
    assert.equal(isWithinTimeRange(new Date(2026, 4, 15, 12, 0).getTime(), 'custom', range), true)
    assert.equal(isWithinTimeRange(new Date(2026, 4, 30, 23, 30).getTime(), 'custom', range), true)
    assert.equal(isWithinTimeRange(new Date(2026, 4, 31, 0, 30).getTime(), 'custom', range), false)
    assert.equal(isWithinTimeRange(new Date(2026, 3, 30, 23, 30).getTime(), 'custom', range), false)
    assert.equal(
      isWithinTimeRange({ toMillis: () => new Date(2026, 4, 15, 12, 0).getTime() }, 'custom', range),
      true
    )
  })
})

describe('Firestore value serialization', () => {
  it('serializes document reference paths and plain values', () => {
    assert.equal(serializeValue({ path: 'staging-config/org123' }), 'staging-config/org123')
    assert.equal(serializeValue('plain text'), 'plain text')
    assert.equal(serializeValue(42), '42')
    assert.equal(serializeValue(null), '')
    assert.equal(serializeValue(undefined), '')
  })

  it('serializes Firestore timestamps and epoch values to ISO', () => {
    const iso = serializeDateValue({ seconds: 1787737260, nanoseconds: 0 })
    assert.equal(iso, new Date(1787737260 * 1000).toISOString())
    assert.equal(serializeDateValue(1769086322287), new Date(1769086322287).toISOString())
    assert.equal(serializeDateValue('2026-08-26T09:41'), '2026-08-26T09:41:00.000Z')
  })

  it('serializes arrays and drops empty entries', () => {
    assert.deepEqual(serializeArray([{ path: 'a/b' }, 'x', null, '']), ['a/b', 'x'])
    assert.deepEqual(serializeArray('not-array'), [])
  })
})

describe('SOS event log', () => {
  const beacon = (overrides: Record<string, unknown> = {}) => ({
    id: 'beacon-1',
    data: {
      callSign: 'OP-1',
      userName: 'Operator One',
      userEmail: 'op@example.com',
      latitude: 5.587,
      longitude: -0.156,
      timestamp: { seconds: 1793980962, nanoseconds: 0 },
      organisations: ['staging-config/test-org'],
      distressStatus: 'normal',
      heartRate: 72,
      ...overrides,
    },
  })

  it('ignores idle beacons at distressStatus normal', () => {
    const items = syncSosEvents('org-test-idle', [beacon()])
    assert.equal(items.length, 0)
  })

  it('records activation then resolution as one event', () => {
    const org = 'org-test-cycle'
    syncSosEvents(org, [beacon({ distressStatus: 'distress' })])

    let items = syncSosEvents(org, [beacon({ distressStatus: 'distress' })])
    assert.equal(items.length, 1)
    assert.equal(items[0].status, 'active')
    assert.equal(items[0].personnelName, 'OP-1')
    assert.equal(items[0].userEmail, 'op@example.com')
    assert.ok(items[0].coordinates.includes('5.587'))

    items = syncSosEvents(org, [beacon({ distressStatus: 'normal' })])
    assert.equal(items.length, 1)
    assert.equal(items[0].status, 'resolved')
    assert.ok(items[0].resolvedAt)
  })

  it('records cancelled activations', () => {
    const items = syncSosEvents('org-test-cancel', [beacon({ distressStatus: 'cancelled' })])
    assert.equal(items.length, 1)
    assert.equal(items[0].status, 'cancelled')
    assert.ok(items[0].resolvedAt)
  })
})

describe('SITREP message parser', () => {
  const sample = `M E S S A G E
PRIORITY: 090600Z NOV 26
FROM: 11 MECH BN
TO: JTF HQ / ARMY HQ
INFO: NORTHCOMD

DAILY SITREP NO 01 (PERIOD: 080600Z - 090600Z NOV 26)
1. GEN SIT: CALM BUT TENSE IN NORTHERN BORDER CORRIDOR.
2. SECURITY IN SECTOR: ROUTINE PATROLS ONGOING.
3. INCIDENTS: ZERO ARMED ENCOUNTERS.`

  it('extracts headers, title and numbered points', () => {
    const parsed = parseSitrepMessage(sample)
    assert.equal(parsed.headers.length, 4)
    assert.equal(parsed.headers[0].label, 'Priority')
    assert.equal(parsed.headers[0].value, '090600Z NOV 26')
    assert.equal(parsed.points.length, 3)
    assert.ok(parsed.points[0].includes('CALM BUT TENSE'))
    assert.ok(parsed.title.includes('DAILY SITREP'))
  })

  it('handles plain text without structure', () => {
    const parsed = parseSitrepMessage('Routine sitrep, all quiet on the western sector.')
    assert.equal(parsed.points.length, 0)
    assert.equal(parsed.headers.length, 0)
    assert.ok(parsed.title.length > 0 || parsed.body.length > 0)
  })

  it('returns empty result for empty input', () => {
    const parsed = parseSitrepMessage('')
    assert.deepEqual(parsed.points, [])
    assert.deepEqual(parsed.headers, [])
  })
})
