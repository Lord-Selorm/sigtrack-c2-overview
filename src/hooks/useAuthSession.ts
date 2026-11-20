import { useState, useEffect } from 'react'
import { readOrgSession, readFeaturePrivilege } from '@/lib/session'
import type { OrgSession, FeaturePrivilege } from '@/types'

interface UseAuthSessionReturn {
  session: OrgSession | null
  features: FeaturePrivilege
  isLoading: boolean
}

/**
 * Reads the current authenticated session from localStorage / sessionStorage.
 * If no session is found, session will be null.
 */
export function useAuthSession(): UseAuthSessionReturn {
  const [session, setSession] = useState<OrgSession | null>(null)
  const [features, setFeatures] = useState<FeaturePrivilege>({
    enableReporting: true,
    enableEventLogging: true,
    enableSitrep: true,
    enableOperations: true,
    enableSOSEmergency: true,
    enableInsAndOut: true,
    enableDroneLogs: true,
    enableChannels: true,
    enableLiveMap: true,
    enableGISDashboard: true,
    enableIOBrief: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      const sess = readOrgSession()
      setSession(sess)
      setFeatures(
        sess
          ? readFeaturePrivilege(sess.levelId)
          : {
              enableReporting: true,
              enableEventLogging: true,
              enableSitrep: true,
              enableOperations: true,
              enableSOSEmergency: true,
              enableInsAndOut: true,
              enableDroneLogs: true,
              enableChannels: true,
              enableLiveMap: true,
              enableGISDashboard: true,
              enableIOBrief: true,
            }
      )
      setIsLoading(false)
    }

    load()

    // Re-read session when SigTrak storage keys change in another tab
    const onStorage = (e: StorageEvent) => {
      if (!e.key || ['organizationDocId', 'organizationConfig', 'userAuth', 'userCredentials', 'userType'].includes(e.key)) {
        load()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { session, features, isLoading }
}
