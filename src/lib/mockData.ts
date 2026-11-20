import type { OverviewData } from '@/types'
import type { SosHistoryItem } from '@/features/overview/types/overview.types'

export const MOCK_OVERVIEW_DATA: OverviewData = {
  // ── 1. SITREP (Situation Reports) ──────────────────────────────────────────
  sitreps: [
    {
      id: 'sitrep-001',
      serialNumber: 1,
      organisation: 'ic4uIYCiSHsqUlJT7wkN',
      command: 'JTF HQ',
      unit: '11 MECH BN',
      location: 'BAWKU SECTOR',
      incident: `M E S S A G E
PRIORITY: 090600Z NOV 26
FROM: 11 MECH BN
TO: JTF HQ / ARMY HQ
INFO: NORTHCOMD

DAILY SITREP NO 01 (PERIOD: 080600Z - 090600Z NOV 26)
1. GEN SIT: CALM BUT TENSE IN NORTHERN BORDER CORRIDOR.
2. SECURITY IN SECTOR: ROUTINE PATROLS ONGOING ALONG PILLAR 14-18.
3. INTERNAL OPS: OP RESOLUTE SYNERGY MAINTAINING 24/7 SNAP VEHICLE CHECKPOINTS.
4. INCIDENTS: ZERO ARMED ENCOUNTERS. ONE CONTRABAND CONVOY INTERCEPTED.
5. ADMIN & LOGISTICS: RATIONS SATISFACTORY, AMMUNITION STATE 100%.
6. MORALE OF TROOPS: HIGH.`,
      action: 'Snap checkpoints mounted along border access corridors. Area under active surveillance.',
      remark: 'All positions reinforced. Regular radio checks maintained on Primary HF Net.',
      dateTime: '090600Z NOV 26',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      senderId: 'team-bawku',
      info: ['ARMY HQ', 'JTF HQ', 'NORTHCOMD'],
    },
    {
      id: 'sitrep-002',
      serialNumber: 2,
      organisation: 'ic4uIYCiSHsqUlJT7wkN',
      command: 'HQ SOUTHERN COMMAND',
      unit: '2 INF BN',
      location: 'TAKORADI / ABOADZE',
      incident: `M E S S A G E
PRIORITY: 090400Z NOV 26
FROM: 2 INF BN
TO: HQ SOUTHCOMD
INFO: ARMY HQ

DAILY SITREP NO 02
1. GEN SIT: MARITIME COASTLINE & POWER INSTALLATION ENCLAVE CALM.
2. KEY POINT PROTECTION: ENI ONSHORE RECEIVING FACILITY AND T3 POWER PLANT GUARDED.
3. PATROLS CONDUCTED: 4 FOOT PATROLS, 2 MOBILE PATROLS ALONG COASTAL ROAD.
4. MORALE: HIGH.`,
      action: 'Routine maritime perimeter security maintained. Zero incidents reported.',
      remark: 'Coordinating with Naval Base Sekondi for joint radar monitoring.',
      dateTime: '090400Z NOV 26',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      senderId: 'team-takoradi',
      info: ['ARMY HQ', 'SOUTHCOMD'],
    },
    {
      id: 'sitrep-003',
      serialNumber: 3,
      organisation: 'ic4uIYCiSHsqUlJT7wkN',
      command: 'HQ 15 ARMD BDE',
      unit: 'RECCE REGT',
      location: 'BUNDASE CAMP',
      incident: `M E S S A G E
ROUTINE: 081800Z NOV 26
FROM: RECCE REGT
TO: ARMY HQ

EX STORM SHIELD FIELD INTEGRATION REPORT:
1. ARMORED VEHICLE ROAD MARCH COMPLETED WITHOUT BREAKDOWNS.
2. COMMUNICATIONS MESH VERIFIED ACROSS VHF/UHF BANDS.
3. LIVE FIRE EXERCISE SLATED FOR 100800Z.`,
      action: 'Battalion combat team assembled at designated staging area in Bundase.',
      remark: 'Fuel resupply received from Base Ordnance Depot.',
      dateTime: '081800Z NOV 26',
      createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
      senderId: 'team-recce',
      info: ['ARMY HQ'],
    },
  ],

  // ── 2. Operations (Operations Registry) ────────────────────────────────────
  operations: {
    active: 3,
    internal: 3,
    external: 1,
    all: [
      {
        id: 'op-001',
        ser: 1,
        organisation: 'ic4uIYCiSHsqUlJT7wkN',
        organisations: ['ic4uIYCiSHsqUlJT7wkN'],
        typeOfOps: 'OP CALMLIFE',
        status: 'Active',
        operationType: 'Internal',
        comdUnit: ['ARMY HQ', 'HQ SOUTHERN COMD', '48 ENGR REGT'],
        deplLoc: ['GREATER ACCRA', 'TEMA', 'KASOA'],
        description: 'Joint internal security operation with Police Service to curb armed crime and protect critical infrastructure.',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-11-08T10:00:00Z',
      },
      {
        id: 'op-002',
        ser: 2,
        organisation: 'ic4uIYCiSHsqUlJT7wkN',
        organisations: ['ic4uIYCiSHsqUlJT7wkN'],
        typeOfOps: 'OP CONQUERED TRAIL',
        status: 'Active',
        operationType: 'Internal',
        comdUnit: ['HQ NORTHERN COMD', '11 MECH BN', '6 INF BN'],
        deplLoc: ['BAWKU', 'PUSIGA', 'ZEBILLA', 'PULMAKOM'],
        description: 'Special border counter-terrorism and intelligence-led cordon-and-search operations along northern frontiers.',
        createdAt: '2026-03-20T06:00:00Z',
        updatedAt: '2026-11-07T14:30:00Z',
      },
      {
        id: 'op-003',
        ser: 3,
        organisation: 'ic4uIYCiSHsqUlJT7wkN',
        organisations: ['ic4uIYCiSHsqUlJT7wkN'],
        typeOfOps: 'OP JUBILEE',
        status: 'Active',
        operationType: 'Internal',
        comdUnit: ['WESTERN NAVAL COMMAND', '2 INF BN'],
        deplLoc: ['PRESTEA', 'ABOADZE', 'ATUABO GAS PLANT'],
        description: 'Protection of key offshore and onshore energy infrastructure and mining corridors.',
        createdAt: '2026-04-18T15:39:00Z',
        updatedAt: '2026-11-05T09:15:00Z',
      },
      {
        id: 'op-004',
        ser: 4,
        organisation: 'ic4uIYCiSHsqUlJT7wkN',
        organisations: ['ic4uIYCiSHsqUlJT7wkN'],
        typeOfOps: 'UNIFIL GHANBATT 91',
        status: 'Dormant',
        operationType: 'External',
        comdUnit: ['ARMY HQ', '5 INF BN'],
        deplLoc: ['LEBANON SECTOR EAST', 'AL-QAWZAH'],
        description: 'United Nations Interim Force in Lebanon peacekeeping mission rotation standby.',
        createdAt: '2026-06-01T12:00:00Z',
        updatedAt: '2026-10-15T16:00:00Z',
      },
    ],
  },

  // ── 3. Logging (Signal Messaging / Battle Logs) ────────────────────────────
  battleLogs: [
    {
      id: 'log-001',
      organisation: 'ic4uIYCiSHsqUlJT7wkN',
      organisations: ['ic4uIYCiSHsqUlJT7wkN'],
      command: 'HQ NORTHERN COMMAND',
      unit: '11 MECH BN',
      location: '11.0524, -0.2412 (WIDNABA CHKPT)',
      incident: 'SNAP CHECKPOINT INTERCEPTED CARGO VEHICLE TRANSPORTING 14 BAGS OF HIGH-GRADE AMMONIUM-BASED FERTILIZER AND 100M DETONATING CORD WITHOUT DOCUMENTATION.',
      action: 'Driver detained at 6 BN guardroom. EOD team dispatched from Tamale to neutralize initiation components.',
      remark: 'Drafter: COL T MOGYA (COO) · TEL: 0256405093',
      status: 'high',
      precedence: 'flash',
      securityClassification: 'SECRET',
      drafterName: 'COL T MOGYA',
      drafterAppointment: 'COO NORTHCOMD',
      drafterTel: '0256405093',
      dateTime: '090515Z NOV 26',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      operation: 'OP CONQUERED TRAIL',
      participants: ['feHBrHLQq4RMvFno4SN5'],
    },
    {
      id: 'log-002',
      organisation: 'ic4uIYCiSHsqUlJT7wkN',
      organisations: ['ic4uIYCiSHsqUlJT7wkN'],
      command: 'JTF HQ',
      unit: 'ARMY HQ',
      location: '9.4075, -0.8532 (TAMALE CENTRAL)',
      incident: 'STUDENT UNREST AND INTER-COMMUNAL CLASHES BROKE OUT NEAR DABOKPA TECHNICAL INSTITUTE. POLICE REQUESTED IMMEDIATE MILITARY BACKUP.',
      action: 'Troops deployed to scene within 15 minutes. Law and order successfully restored; 4 injured civilians escorted to TTH.',
      remark: 'Situation currently calm. Night curfews being reinforced by joint patrol teams.',
      status: 'medium',
      precedence: 'immediate',
      securityClassification: 'CONFIDENTIAL',
      drafterName: 'MAJ R APPIAH',
      drafterAppointment: 'A/IO',
      drafterTel: '0556833991',
      dateTime: '082330Z NOV 26',
      createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
      operation: 'OP CALMLIFE',
      participants: ['feHBrHLQq4RMvFno4SN5'],
    },
    {
      id: 'log-003',
      organisation: 'ic4uIYCiSHsqUlJT7wkN',
      organisations: ['ic4uIYCiSHsqUlJT7wkN'],
      command: 'HQ 14 ENGR BDE',
      unit: '48 ENGR REGT',
      location: '5.5622, -0.1385 (LABADI BEACH)',
      incident: 'DISASTER RELIEF SIMULATION EXERCISE CONDUCTED WITH 80 ALL-RANKS. AIR-DROPPED FLOOD DEFENSE BARRIERS TESTED SUCCESSFULLY.',
      action: 'Exercise concluded at 1000 hrs. All personnel and heavy engineering equipment accounted for.',
      remark: 'Full technical report submitted to Chief of the Army Staff.',
      status: 'low',
      precedence: 'priority',
      securityClassification: 'RESTRICTED',
      drafterName: 'CAPT E MENSAH',
      drafterAppointment: 'ADJT',
      drafterTel: '0244192084',
      dateTime: '081400Z NOV 26',
      createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
      operation: 'MISCELLANEOUS',
      participants: [],
    },
    {
      id: 'log-004',
      organisation: 'ic4uIYCiSHsqUlJT7wkN',
      organisations: ['ic4uIYCiSHsqUlJT7wkN'],
      command: 'ARMY HQ',
      unit: 'SIGNAL BDE',
      location: '5.5876, -0.1561 (BURMA CAMP)',
      incident: 'ROUTINE SATELLITE COMMUNICATIONS LINK VERIFICATION EXERCISE WITH TACTICAL OPERATIONS CENTERS IN TAMALE AND SUNYANI.',
      action: 'Data link latency under 45ms. Backup HF nets fully operational.',
      remark: 'Pending final sign-off by Director of Communications.',
      status: 'pending',
      precedence: 'routine',
      securityClassification: 'RESTRICTED',
      drafterName: 'LT CDR ASIAMAH',
      drafterAppointment: 'ESO',
      drafterTel: '777747',
      dateTime: '081100Z NOV 26',
      createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      operation: 'ROUTINE',
      participants: [],
    },
  ],

  // ── 4. Reports (Correspondence & Messages) ─────────────────────────────────
  reports: {
    unreadCount: 1,
    inbox: [
      {
        id: 'rep-001',
        organisation: 'ic4uIYCiSHsqUlJT7wkN',
        subject: 'OP RESOLUTE SYNERGY - SUBMISSION OF EQUIPMENT SERVICEABILITY STATE',
        from: 'GHQ (PR&D)',
        originator: 'DG PR&D (BRIG GEN OSEI)',
        to: ['staging-teams/feHBrHLQq4RMvFno4SN5'],
        info: ['GHQ (COS)', 'NORTHCOMD'],
        content: `M E S S A G E
PRIORITY: 090700Z NOV 26
FROM: GHQ (PR&D)
TO: ARMY HQ
INFO: GHQ (COS), HQ NORTHCOMD

OP RESOLUTE SYNERGY - SUBMISSION OF EQUIPMENT STATE:
1. REQUEST ALL FORWARD DETACHMENTS SUBMIT IMMEDIATE RETURNS ON WEAPONRY, B-VEHICLES, AND NIGHT-VISION STORES UNDER COMMAND.
2. DISCREPANCIES TO BE FLAGGED TO DEFENCE LOGISTICS HQ BY 101200Z NOV 26.
3. TREAT AS URGENT. PSE ACCEPT FOR ACTION///`,
        read: false,
        senderId: 'team-ghq-prd',
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        replies: [
          {
            id: 'reply-1',
            from: 'ARMY HQ',
            to: 'GHQ (PR&D)',
            subject: 'Re: OP RESOLUTE SYNERGY - SUBMISSION OF EQUIPMENT STATE',
            content: 'RECEIPT ACKNOWLEDGED. ALL BATTALION S4 LOGISTICS TEAMS TASKED. RETURNS COMPILING NOW.',
            timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
          },
        ],
      },
      {
        id: 'rep-002',
        organisation: 'ic4uIYCiSHsqUlJT7wkN',
        subject: 'INTELLIGENCE BRIEF: CROSS-BORDER ILLICIT VEHICLE CONVOYS IN SECTOR 3',
        from: 'DEFENCE INTELLIGENCE (DI)',
        originator: 'COL K ADOMAKO (DDI OPS)',
        to: ['staging-teams/feHBrHLQq4RMvFno4SN5'],
        info: ['JTF HQ'],
        content: `M E S S A G E
RESTRICTED: 081900Z NOV 26
FROM: GHQ (DI)
TO: ARMY HQ

INTELLIGENCE ASSESSMENT:
HUMINT REPORTS INDICATE UNREGISTERED 4X4 VEHICLES CONVERGING NEAR BORDER MARKER 22 DURING HOURS OF DARKNESS (0100 - 0400 HRS).
RECOMMEND DRONE RECONNAISSANCE PATROLS AND SNAP AMBUSHES AT GRID COORDINATES 30PYT 884 192.`,
        read: true,
        senderId: 'team-di',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        replies: [],
      },
    ],
    sent: [
      {
        id: 'rep-003',
        organisation: 'ic4uIYCiSHsqUlJT7wkN',
        subject: 'OPERATIONAL DIRECTIVE 11/26: REINFORCEMENT OF NORTHERN CORRIDOR',
        from: 'ARMY HQ',
        originator: 'CHIEF OF THE ARMY STAFF (COAS)',
        to: ['staging-teams/northcomd', 'staging-teams/11mech'],
        info: ['GHQ (COS)'],
        content: `M E S S A G E
FLASH: 081500Z NOV 26
FROM: ARMY HQ
TO: HQ NORTHCOMD, 11 MECH BN

DIRECTIVE FOR IMMEDIATE EXECUTION:
1. DISPATCH 1 COMBAT ARMORED TEAM AND 2 RIFLE PLATOONS TO REINFORCE ZEBILLA DETACHMENT.
2. COMMENCE 24-HOUR DOMINATION OF ALL TERTIARY TRAILS LEADING ACROSS FRONTIER.
3. SUBMIT 12-HOURLY SITREPS VIA SIGTRACK PORTAL.`,
        read: true,
        senderId: 'feHBrHLQq4RMvFno4SN5',
        createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
        replies: [],
      },
    ],
    all: [],
  },
}

export const MOCK_SOS_HISTORY: SosHistoryItem[] = [
  {
    id: 'sos-001',
    organisation: 'staging-config/ic4uIYCiSHsqUlJT7wkN',
    organisations: ['staging-config/ic4uIYCiSHsqUlJT7wkN'],
    teamId: 'feHBrHLQq4RMvFno4SN5',
    teamName: 'ARMY HQ',
    command: 'HQ NORTHERN COMMAND',
    unit: '11 MECH BN',
    personnelName: 'SGT ISSAH AKUFO',
    triggeredBy: 'team-bawku',
    location: 'WIDNABA CHECKPOINT',
    coordinates: '11.0524, -0.2412',
    latitude: '11.0524',
    longitude: '-0.2412',
    incident: 'Personnel under possible contact after suspicious vehicle approached checkpoint.',
    message: 'SOS activated from checkpoint guard post. Request immediate QRF and CASEVAC standby.',
    status: 'active',
    dateTime: '161015Z NOV 26',
    createdAt: new Date(Date.now() - 3600000 * 0.75).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    resolvedAt: '',
  },
  {
    id: 'sos-002',
    organisation: 'staging-config/ic4uIYCiSHsqUlJT7wkN',
    organisations: ['staging-config/ic4uIYCiSHsqUlJT7wkN'],
    teamId: 'feHBrHLQq4RMvFno4SN5',
    teamName: 'ARMY HQ',
    command: 'HQ SOUTHERN COMMAND',
    unit: '2 INF BN',
    personnelName: 'PTE ABENA OWUSU',
    triggeredBy: 'team-takoradi',
    location: 'PRESTEA TRAINING AREA',
    coordinates: '4.5521, -1.7397',
    latitude: '4.5521',
    longitude: '-1.7397',
    incident: 'Medic requested for heat casualty during field exercise.',
    message: 'SOS triggered for medical assistance. Casualty conscious and stable.',
    status: 'resolved',
    dateTime: '151820Z NOV 26',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
  {
    id: 'sos-003',
    organisation: 'staging-config/ic4uIYCiSHsqUlJT7wkN',
    organisations: ['staging-config/ic4uIYCiSHsqUlJT7wkN'],
    teamId: 'feHBrHLQq4RMvFno4SN5',
    teamName: 'ARMY HQ',
    command: 'HQ 15 ARMD BDE',
    unit: 'RECCE REGT',
    personnelName: 'CPL KWAME MENSAH',
    triggeredBy: 'team-recce',
    location: 'BUNDASE CAMP',
    coordinates: '7.9925, -1.0874',
    latitude: '7.9925',
    longitude: '-1.0874',
    incident: 'False activation during communications drill.',
    message: 'SOS activated accidentally during exercise. No emergency services required.',
    status: 'cancelled',
    dateTime: '141130Z NOV 26',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 29).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
]
