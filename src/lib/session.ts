import type { OrgSession, FeaturePrivilege } from '@/types'

// ─── Keys used by the SigTrak app ────────────────────────────────────────────
export const STORAGE_KEYS = {
  organizationDocId: 'organizationDocId',
  organizationConfig: 'organizationConfig',
  userAuth: 'userAuth',
  userCredentials: 'userCredentials',
  userType: 'userType',
} as const

export const DEFAULT_ORG_CONFIG = {
  name: 'EX STORM SHIELD',
  loginAccess: { twoStepOrganizationalTeam: true, threeStepPersonnelFeature: false },
  Levels: [
    {
      id: 0,
      name: 'HQ',
      password: 'hq',
      LevelPrivilege: {
        canAdd: [1, 0, 2],
        canEdit: [0, 1, 2],
        canDelete: [0, 2, 1],
        canView: [0, 1, 2],
        canSendLogMessageTo: [0, 1, 2],
        canSendReportMessageTo: [0, 1, 2],
      },
      SymbolPrivilege: {
        canDrop: [0, 1, 2],
        canEdit: [0, 1, 2],
        canDelete: [0, 1, 2],
        canView: [0, 1, 2],
        dropOptions: { fobIncidentReport: true, operationIncident: true },
      },
      MapPrivilege: { canViewHeatmap: [], canDrawShapes: [] },
      FeaturePrivilege: {
        enableReporting: true,
        enableEventLogging: true,
        enableImageGallery: true,
        enableVideoStream: true,
        enableNatoSymbols: true,
        enableRadioCommunications: true,
        enableGISDashboard: true,
        enableLiveMap: true,
        enableSOSEmergency: true,
        enableSigtrackTube: true,
        enableSigtrackMeet: true,
        enableDroneLogs: true,
        enableIntellisight: true,
        enableSigtrackOssint: true,
        enableSitrep: true,
        enableMapArmy: true,
        enableChannels: true,
        enableIOBrief: true,
        enableInsAndOut: true,
        enableOperations: true,
        enableCloudStorage: true,
      },
      Parents: [],
    },
    {
      id: 1,
      name: 'Commands',
      password: '',
      FeaturePrivilege: {
        enableReporting: true,
        enableEventLogging: true,
        enableDroneLogs: true,
        enableSitrep: true,
        enableChannels: true,
        enableOperations: false,
        enableSOSEmergency: false,
        enableInsAndOut: false,
      },
    },
    {
      id: 2,
      name: 'Company',
      password: '',
      FeaturePrivilege: {
        enableReporting: true,
        enableEventLogging: true,
        enableDroneLogs: true,
        enableSitrep: true,
        enableChannels: true,
        enableOperations: false,
        enableSOSEmergency: false,
        enableInsAndOut: false,
      },
    },
  ],
}

/** Initialize EX STORM SHIELD session for local development or testing */
export function initDefaultSession(): void {
  localStorage.setItem(STORAGE_KEYS.organizationDocId, 'ic4uIYCiSHsqUlJT7wkN')
  localStorage.setItem(STORAGE_KEYS.organizationConfig, JSON.stringify(DEFAULT_ORG_CONFIG))
  sessionStorage.setItem(
    STORAGE_KEYS.userCredentials,
    JSON.stringify({
      organization: 'EX STORM SHIELD',
      adminLevel: '0',
      loginType: 'team',
      userType: 'team',
      team: 'feHBrHLQq4RMvFno4SN5',
      teamName: 'ARMY HQ',
      loginTime: new Date().toISOString(),
    })
  )
  sessionStorage.setItem(STORAGE_KEYS.userAuth, 'true')
  sessionStorage.setItem(STORAGE_KEYS.userType, 'team')
}

/** Read the authenticated session from localStorage / sessionStorage */
export function readOrgSession(): OrgSession | null {
  try {
    const orgDocId = localStorage.getItem(STORAGE_KEYS.organizationDocId)
    const configRaw = localStorage.getItem(STORAGE_KEYS.organizationConfig)
    const userCredRaw = sessionStorage.getItem(STORAGE_KEYS.userCredentials)

    if (!orgDocId || !configRaw) return null

    const config = JSON.parse(configRaw)
    const userCred = userCredRaw ? JSON.parse(userCredRaw) : null

    // Determine current level from stored credentials (handles adminLevel "0" or levelId 0)
    const levelId: number = Number(userCred?.adminLevel ?? userCred?.levelId ?? 0)
    const level = config.Levels?.find((l: { id: number }) => l.id === levelId)

    return {
      organizationDocId: orgDocId,
      organizationName: userCred?.organization ?? config.name ?? 'EX STORM SHIELD',
      teamId: userCred?.team ?? userCred?.id ?? userCred?.teamId ?? 'feHBrHLQq4RMvFno4SN5',
      teamName: userCred?.teamName ?? userCred?.name ?? 'ARMY HQ',
      levelId,
      levelName: level?.name ?? 'HQ',
    }
  } catch {
    return null
  }
}

/** Extract FeaturePrivilege for the given level from stored organizationConfig */
export function readFeaturePrivilege(levelId: number): FeaturePrivilege {
  const defaults: FeaturePrivilege = {
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

  try {
    const configRaw = localStorage.getItem(STORAGE_KEYS.organizationConfig)
    if (!configRaw) return defaults
    const config = JSON.parse(configRaw)
    const level = config.Levels?.find((l: { id: number }) => l.id === levelId)
    return { ...defaults, ...(level?.FeaturePrivilege ?? {}) }
  } catch {
    return defaults
  }
}
