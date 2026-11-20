// ─── SITREP Message Parser ──────────────────────────────────────────────────
// Real SITREP `incident` fields contain formatted signal-message blocks like:
//   M E S S A G E
//   PRIORITY: 090600Z NOV 26
//   FROM: 11 MECH BN
//   DAILY SITREP NO 01
//   1. GEN SIT: CALM...
// This parses them into structured data for clean rendering.

export interface ParsedSitrepHeader {
  label: string
  value: string
}

export interface ParsedSitrepMessage {
  title: string
  headers: ParsedSitrepHeader[]
  points: string[]
  body: string[]
}

const HEADER_LABELS: Record<string, string> = {
  priority: 'Priority',
  from: 'From',
  to: 'To',
  info: 'Info',
  routine: 'Routine',
  serial: 'Serial',
  's/n': 'S/N',
  date: 'Date',
  time: 'Time',
}

const MESSAGE_NOISE = /^(m\s*e\s*s\s*s\s*a\s*g\s*e|message|task\s*org|attn|attention|flags?)$/i

export function parseSitrepMessage(raw: string | null | undefined): ParsedSitrepMessage {
  const result: ParsedSitrepMessage = { title: '', headers: [], points: [], body: [] }
  if (!raw) return result

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || MESSAGE_NOISE.test(trimmed)) continue

    // Numbered situation points: "1. GEN SIT: ..." / "2) ..."
    const pointMatch = trimmed.match(/^\d+[.)]\s*(.+)$/)
    if (pointMatch) {
      result.points.push(pointMatch[1].trim())
      continue
    }

    // "LABEL: value" headers
    const headerMatch = trimmed.match(/^([A-Za-z][A-Za-z/ ]{0,20}?)\s*:\s*(.+)$/)
    if (headerMatch) {
      const labelKey = headerMatch[1].trim().toLowerCase()
      if (HEADER_LABELS[labelKey]) {
        result.headers.push({ label: HEADER_LABELS[labelKey], value: headerMatch[2].trim() })
        continue
      }
    }

    // First unclassified line becomes the title; the rest are body copy
    if (!result.title) {
      result.title = trimmed
    } else {
      result.body.push(trimmed)
    }
  }

  return result
}
