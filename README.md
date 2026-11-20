# SigTrak Overview Module

A tactical, unscrollable command-and-control (C2) executive Overview dashboard for **SigTrak**, written in **React**, **TypeScript**, and **Tailwind CSS**, connected directly to Firebase/Firestore.

---

## 🎯 Scope: The Core Dashboard Sections

This Overview summarizes the core operational modules of SigTrak:

1. **Operations (Operations Registry)**
   - Maps to `staging-operations`
   - Key Metrics: `TOTAL OPS`, `ACTIVE`, `INTERNAL`, `EXTERNAL`
   - Table columns: `SER`, `TYPE OF OPS`, `STATUS` (*Active / Dormant / Completed*), `TYPE` (*Internal / External*), `COMD / UNIT`, `DEPL LOC`

2. **Logging / Incident Logs (Signal Messaging / Battle Logs)**
   - Maps to `staging-battle-log`
   - Incident records with precedence (`flash`, `immediate`, `priority`, `routine`), severity status (`high`, `medium`, `low`, `pending`), drafter appointment/contact, and security classification

3. **Reports (Correspondence & Signals)**
   - Maps to `staging-reports`
   - Tabs: **Inbox**, **Sent**, and **Org-wide**
   - Unread badges, read status indicators, message previews, and replies threads

4. **SITREP (Situation Reports)**
   - Maps to `staging-sitreps`
   - Fields: `S/N`, `Date/Time`, `Command`, `Unit`, `Location`, `Incident`, `Action Taken`, `Remark`, `INFO`
   - Real-time stream with expandable detailed event breakdown

5. **SOS History**
   - Reads SOS/emergency history from supported staging collections (`staging-sos-history`, `staging-sos`, `staging-sos-logs`, `staging-sos-alerts`)
   - Shows status, unit/personnel, incident details, location/coordinates, trigger time, and resolution state

---

## 🖥️ Unscrollable Tactical Dashboard Layout

The dashboard implements a strict unscrollable viewport model (`100vh` / `h-screen overflow-hidden`):
- **Window level**: No page-level scrollbars; the entire tactical overview fits cleanly inside the display.
- **Fixed Elements**:
  - `OverviewHeader`: SigTrak logo, organization title, level & team pills, live beacon, and ZULU DTG clock.
  - `MetricsBanner`: Top KPI cards for the core modules.
  - Search bar: Real-time multi-module keyword filtering.
  - `SectionNavigator`: Ordered section tabs for Operations, Incident Logs, Reports, SITREP, and SOS History.
- **Single-Section View**: One modular card (`flex-1 min-h-0 overflow-hidden`) at a time, with its own internal scroll container (`overflow-y-auto`) for table rows.

---

## 🔍 Interactive Filtering System

- **Multi-field Search**: Matches query case-insensitively across Unit, Command, Location, Incident, Action, Type, Subject, and Drafter.
- **Time Range Selector**: Instant time filtering (`Last 24 Hours`, `Last 7 Days`, `Last 30 Days`, `All Time`) plus a `Custom Range` start/end date picker.
- **Section Focus**: Switch between Operations, Incident Logs, Reports, SITREP, and SOS History tabs.
- **Active Filter State**: Live match counter with a one-click reset action and tactical empty state.

---

## 📁 Architecture & Feature Structure

Follows a strict feature-driven architecture where **no file exceeds 200 lines**:

```
src/
├── features/
│   └── overview/
│       ├── components/
│       │   ├── OverviewPage.tsx         # Main unscrollable C2 dashboard container
│       │   ├── SectionNavigator.tsx     # Ordered section tab navigator
│       │   ├── SummaryCard.tsx          # Reusable tactical card with fixed header
│       │   ├── MetricsBanner.tsx        # 4-card horizontal metric strip
│       │   ├── SitrepSummary.tsx        # SITREP table with expandable drawer
│       │   ├── OperationsSummary.tsx    # Operations Registry table & KPI summary
│       │   ├── LoggingSummary.tsx       # Signal/Battle Logs with severity filter
│       │   ├── ReportsSummary.tsx       # Correspondence Inbox/Sent tabs
│       │   ├── SosHistorySummary.tsx    # SOS/emergency history with status filters
│       │   └── states/
│       │       ├── LoadingState.tsx     # Skeleton loaders matching tactical theme
│       │       ├── ErrorState.tsx       # Error recovery state with retry action
│       │       └── EmptyState.tsx       # Empty search/data placeholder
│       ├── hooks/
│       │   ├── useSitrepSummary.ts      # Real-time listener & filtering for SITREP
│       │   ├── useOperationsSummary.ts  # Real-time listener & filtering for Operations
│       │   ├── useLoggingSummary.ts     # Real-time listener & filtering for Battle Logs
│       │   ├── useReportsSummary.ts     # Real-time listener & filtering for Reports
│       │   └── useSosHistorySummary.ts  # Real-time listener & filtering for SOS history
│       ├── services/
│       │   ├── overviewService.ts       # Core Firestore listeners (index-safe, client-side sort)
│       │   └── sosHistoryService.ts     # SOS history listener and flexible field mapping
│       ├── types/
│       │   └── overview.types.ts        # TypeScript interfaces for all modules & filters
│       ├── utils/
│       │   ├── formatters.ts            # Zulu DTG generator, date formatters, orgRef matcher
│       │   └── filterUtils.ts           # Keyword search & time-range filters
│       ├── __tests__/
│       │   └── overview.test.ts         # Automated unit tests for utilities & filters
│       └── index.ts                     # Public feature barrel export
├── pages/
│   └── Overview.tsx                     # Route-level wrapper mounting OverviewPage
├── lib/
│   ├── firebase.ts                      # Firebase app & Firestore client
│   ├── mockData.ts                      # Military test feed for all modules
│   ├── orgRef.ts                        # Organisation reference helpers
│   └── session.ts                       # Local SigTrak session helpers
└── ...
```

---

## 💻 Commands

```bash
# Start Vite development server
npm run dev

# Run automated unit tests
npm test

# Run TypeScript checks and production build
npm run build
```
