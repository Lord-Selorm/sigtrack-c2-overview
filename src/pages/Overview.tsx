import { OverviewPage } from '@/features/overview'
import type { OverviewPageProps } from '@/features/overview'

/**
 * Tactical C2 Overview Dashboard Route
 *
 * Dedicated executive summary of the core platform sections:
 * 1. Operations (Operations Registry)
 * 2. Logging (Signal Messaging / Battle Logs)
 * 3. Reports (Correspondence & Messages)
 * 4. SITREP (Situation Reports)
 * 5. SOS History
 *
 * Fixed viewport height (unscrollable dashboard) with internal table scrolling.
 */
export default function Overview(props: OverviewPageProps) {
  return <OverviewPage {...props} />
}
