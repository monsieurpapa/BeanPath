# BeanPath

Offline-first traceability and logistics platform for coffee and cocoa supply chains (farmer plot → importing buyer). Built as an Expo SDK 54 mobile app.

## Architecture

- **Framework**: Expo SDK 54, Expo Router (file-based routing)
- **State**: React Context + AsyncStorage (offline-first data model)
- **Backend**: Not yet connected — first build uses seeded AsyncStorage mock data
- **Fonts**: Inter (400/500/600/700) via @expo-google-fonts/inter
- **Icons**: Ionicons (@expo/vector-icons)

## Color Palette

```
primary:    #b45309  (amber-700 — "wet parchment")
accent:     #15803d  (green-700 — "leaf")
background: #fafaf9  (stone-50)
surface:    #f5f5f4  (stone-100)
text:       #1c1917  (stone-900)
muted:      #78716c  (stone-500)
warning:    #d97706  (amber-600)
danger:     #b91c1c  (red-700)
```

## App Surfaces & Routes

### Auth (`app/(auth)/`)
- `welcome.tsx` — Role selection: Field / Station-Office / Buyer
- `login.tsx` — Phone OTP or email/password login
- `register.tsx` — New user registration with org join code

### Field App (`app/(tabs)/`) — for field_agent, lead_farmer, transporter, station_operator
Tabs: Today · Farmers · Collect · Lots · Me
- `index.tsx` — Today dashboard (stats, recent collections, quick actions, sync nudge)
- `farmers/_layout.tsx` — Stack for farmers
- `farmers/index.tsx` — Searchable farmer list with FAB
- `farmers/new.tsx` — Register new farmer (offline-first, queues sync)
- `farmers/[id].tsx` — Farmer dossier (stats, info, collections, record action)
- `collect/_layout.tsx` — Stack for collect
- `collect/index.tsx` — 4-step collection wizard: pick farmer → weight → price & pay → confirm
- `lots/_layout.tsx` — Stack for lots
- `lots/index.tsx` — Lot list with stage filter chips
- `me.tsx` — Profile, sync status, language, sign out

### Operator Console (`app/(console)/`) — for buyer, exporter, qc_grader, coop_admin, certifier, mill_operator
- `index.tsx` — Dense dashboard: KPIs, conflict alert, stage breakdown, recent lots table
- `lots/index.tsx` — Lot explorer with search + stage filter
- `lots/[id].tsx` — Full lot dossier: hero stats, EUDR panel, CoC timeline, sources
- `reconciliation.tsx` — Conflict inbox with side-by-side resolver (keep mine/theirs/merge)

### Public Trace (`app/trace/[shortCode].tsx`)
- Consumer-facing lot origin story: journey, farmer share %, certifications, cup score, tamper-evidence badge

## Context Providers

| Provider | File | Purpose |
|---|---|---|
| AuthContext | `context/AuthContext.tsx` | User auth state, role, org info. AsyncStorage-persisted. |
| DataContext | `context/DataContext.tsx` | Farmers, lots, collections. Seeded on first launch. |
| SyncContext | `context/SyncContext.tsx` | Online/offline, pending count, conflict count, sync trigger. |

## Shared Components

- `SyncChip` — persistent sync status pill in every screen header
- `StageTag` — lot stage badge with icon + color coding
- `FarmerCard` — farmer list row with avatar, household code, plot count
- `LotCard` — lot row with stage tag, weight, farmer count, cert badges
- `CertBadge` — certification label pill (Fair Trade, Organic EU, EUDR, etc.)
- `PrimaryButton` — primary CTA with loading/disabled states + haptic feedback
- `EmptyState` — icon + title + subtitle empty state

## Data Models (AsyncStorage)

```ts
Farmer: { id, householdCode, firstName, lastName, phone, village, district, country, gender, coopId, registeredAt, plotCount }
Lot: { id, ref, crop, stage, weightGrams, farmerCount, harvestSeason, certifications, openedAt, currentOrgId }
Collection: { id, farmerId, farmerName, lotId, weightGrams, pricePerKgMinor, currency, paymentMethod, recordedAt, synced }
User: { id, name, phone, email, role, orgId, orgName, orgCurrency, cropFocus, locale, country }
```

## Lot Stages

`cherry → wet_parchment → drying → dry_parchment → green → in_transit → shipped → closed`

## Roles

Field roles (→ field app tabs): `field_agent`, `lead_farmer`, `station_operator`, `transporter`
Console roles (→ operator console): `buyer`, `exporter`, `qc_grader`, `coop_admin`, `certifier`, `mill_operator`

## Seeded Mock Data

- 5 farmers (Bukomero Cooperative, Uganda)
- 5 lots (various stages, coffee + cocoa)
- 4 collections linked to lot1

## Packages Used

All from package.json — no additional installs needed:
- `@react-native-async-storage/async-storage@2.2.0`
- `expo-linear-gradient@~15.0.8`
- `expo-haptics@~15.0.8`
- `expo-blur@~15.0.8`
- `expo-glass-effect@~0.1.4`
- `react-native-safe-area-context@~5.6.0`
- `react-native-keyboard-controller@1.18.5`

## TODO (next build)

- Connect to live Express + PostgreSQL + Supabase Auth backend
- Real OTP/biometric auth via Supabase
- Bluetooth scale integration (collect/index.tsx has placeholder)
- GPS plot capture on farmer registration
- Push notifications for sync conflicts
- Buyer app surface (`/(buyer)/` group)
- QR code scanning for lot lookups
- EUDR Due Diligence Statement PDF download
