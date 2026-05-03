# BeanPath

Offline-first traceability and logistics platform for coffee and cocoa supply chains (farmer plot → importing buyer). Built as an Expo SDK 54 mobile app. Data model is derived from real DRC cooperative field forms (TCC KAHISA station, NAKEZA SARL).

## Architecture

- **Framework**: Expo SDK 54, Expo Router (file-based routing)
- **State**: React Context + AsyncStorage (offline-first, v2 key namespace)
- **Backend**: Not yet connected — uses seeded AsyncStorage data from real DRC field records
- **Fonts**: Inter (400/500/600/700) via @expo-google-fonts/inter
- **Icons**: Ionicons (@expo/vector-icons)

## Color Palette

```
primary:    #b45309  (amber-700 — "wet parchment")
accent:     #15803d  (green-700 — "leaf")
background: #fafaf9  (stone-50)
surface:    #f5f5f4  (stone-100)
foreground: #1c1917  (stone-900)
muted:      #e7e5e4  (stone-200)
mutedForeground: #78716c  (stone-500)
warning:    #d97706  (amber-600)
danger:     #b91c1c  (red-700)
amberLight: #fef3c7  greenLight: #dcfce7  dangerLight: #fee2e2
```

## Real-World Data Model (v2)

Derived from two real DRC cooperative forms:
- `TCC_Formualire_de_registre_des_cerises` — KAHISA washing station cherry purchase register
- `LEADERSHIP_STRATEGIQUE_DE_NAKEZA` — NAKEZA SARL farmer roster

### Key design decisions vs generic traceability apps

| Field / concept | Generic traceability | BeanPath (DRC-accurate) |
|---|---|---|
| Collection unit | kg | **Bidon** (5L can) — traditional DRC measure |
| Price currency | USD or local | **FC (Congolese Francs)** with explicit exchange rate |
| Farmer ID | Household code | **AAA Bio ID** e.g. `TCC BMB 009` |
| Location hierarchy | Country → Region → Village | Province → **Territoire → Groupement → Village** |
| Farmer attribute | Plot count | **Nombre de pieds** (tree count, 80–1345) |
| Payment document | Receipt | **No de reçu + No registre cerises + No rapport livraison** |
| Processing stages | generic 5 | **12 DRC-specific stages** from cherry received to shipped |

### Data Entities (AsyncStorage, key prefix `@beanpath_v2:`)

```ts
Station       { id, name, territoire, groupement, coopId }

Farmer        { id, bioId, firstName, lastName, phone?, age?, gender,
                territoire, groupement, village, stationId, coopId,
                nbPieds, groupRole?, crop, registeredAt }

CherryDelivery { id, farmerId, farmerName, farmerBioId,
                 stationId, stationName, groupement, village,
                 purchaseDate, receptionDate,
                 receiptNo, cherryRegisterNo, deliveryReportNo,
                 quantityBidons, pricePerBidonFC, totalFC,
                 exchangeRateFC_USD, paymentMethod,
                 synced, recordedAt }

CherryRegister { id, registerNo, stationId, deliveryReportNo, date,
                 groupement, totalBidons, totalFC, deliveryIds[] }

DeliveryReport { id, reportNo, stationId, dateFrom, dateTo,
                 totalBidons, totalFC, registerNos[] }

Lot           { id, ref, crop, stage (LotStage), weightKg, bidonCount,
                farmerCount, harvestSeason, certifications[],
                openedAt, currentOrgId, stationId,
                sourceRegisterNos[], cupScore?, processingMethod? }
```

### Lot Stages (LotStage)

`cherry_received → pulping → fermenting → washing → drying → dry_parchment → hulling → graded → bagged → in_transit → shipped → closed`

### Seed Data (real TCC / NAKEZA names & IDs)

- 2 stations: KAHISA (Bushumba/Kabare), NAKEZA (Luhihi/Kabare)
- 7 farmers with real Bio IDs (TCC BMB 009, TCC BNC 006, TCC BKR 006, TCC BIR 009, NKZ LHI 023…)
- 6 cherry deliveries with actual receipt/register/report numbers from the Excel forms
- 5 cherry registers & 3 delivery reports
- 5 lots across multiple processing stages

## App Surfaces & Routes

### Auth (`app/(auth)/`)
- `welcome.tsx` — Role selection: Field / Station-Office / Buyer
- `login.tsx` — Phone OTP or email/password login
- `register.tsx` — New user registration with org join code

### Field App (`app/(tabs)/`) — field_agent, lead_farmer, station_operator, transporter
Tabs: Aujourd'hui · Agriculteurs · Collecte · Lots · Moi

- `index.tsx` — Today dashboard: stats (livraisons/bidons/agriculteurs), FC paid, sync nudge, quick actions, recent deliveries feed
- `farmers/index.tsx` — Searchable by nom, Code Bio, groupement, village
- `farmers/new.tsx` — Farmer registration: territoire, groupement, village, nbPieds, crop, role, auto-generated Bio ID
- `farmers/[id].tsx` — Dossier: profile, stats (livraisons/bidons/pieds/USD), info card, record delivery button, full delivery history with receipt/register numbers
- `collect/index.tsx` — 5-step cherry delivery wizard (mirrors the actual TCC form):
  1. Agriculteur — search by name or Bio ID
  2. Quantité — bidons + purchase date (kg estimate shown)
  3. Prix & Taux — price band (700/900/1000 FC) + custom + FC/USD exchange rate + live FC/USD calc
  4. Documents — receipt No, cherry register No, delivery report No, payment method
  5. Confirmer — full receipt card before saving
- `lots/index.tsx` — Filter: Tous / Réception / Traitement / Séchage / Export
- `me.tsx` — Profile, sync status, sign out

### Operator Console (`app/(console)/`) — buyer, exporter, qc_grader, coop_admin, certifier, mill_operator
- `index.tsx` — KPI grid (bidons, weight, lots, farmers, FC paid, EUDR ready, unsynced, conflicts), groupement breakdown table, stage breakdown bar, recent lots table
- `lots/index.tsx` — Lot explorer: search + stage filter (DRC stages)
- `lots/[id].tsx` — Full dossier: hero (weight/bidons/farmers/certs), EUDR panel, cup score, financial summary, CoC processing timeline (12 stages with completed/current/pending states), source registers table, contributing farmers list, tamper evidence
- `reconciliation.tsx` — Conflict inbox with side-by-side resolver

### Public Trace (`app/trace/[shortCode].tsx`)
- Consumer-facing origin story (mock data): cup score, journey timeline, farmer share %, certifications, cryptographic verification

## Context Providers

| Provider | Purpose |
|---|---|
| `AuthContext` | User auth state, role, org info — AsyncStorage-persisted |
| `DataContext` | All entities (Station, Farmer, CherryDelivery, CherryRegister, DeliveryReport, Lot) — seeded on first launch |
| `SyncContext` | Online/offline, pending count, conflict count, sync trigger |

## Shared Components

- `SyncChip` — persistent sync status in every header
- `StageTag` — DRC lot processing stage badge (12 stages, color-coded with Ionicons)
- `FarmerCard` — shows Bio ID, groupement, village, nbPieds badge, leadership indicator
- `LotCard` — ref, stage tag, weight, bidons, farmer count, cert count, cup score
- `CertBadge` — Fair Trade, Organic EU, EUDR, Rainforest Alliance
- `PrimaryButton` — CTA with loading/disabled/haptic
- `EmptyState` — icon + title + subtitle

## Packages Used

- `@react-native-async-storage/async-storage@2.2.0`
- `expo-linear-gradient@~15.0.8`
- `expo-haptics@~15.0.8`
- `expo-blur@~15.0.8`
- `expo-glass-effect@~0.1.4`
- `react-native-safe-area-context@~5.6.0`
- `react-native-keyboard-controller@1.18.5`

## TODO (next build)

- Connect Express + PostgreSQL + Supabase Auth backend
- Real OTP/biometric auth
- Bluetooth scale integration in collect wizard
- GPS polygon capture for EUDR compliance on farmer registration
- Push notifications for sync conflicts
- QR/barcode scanning for Bio ID lookup
- EUDR Due Diligence Statement PDF generation
- CherryRegister and DeliveryReport management screens in console
- Multi-station / multi-cooperative support
