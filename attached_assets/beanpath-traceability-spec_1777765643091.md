# BeanPath — Coffee & Cocoa Traceability, Offline-First

You are building **BeanPath\*** — a mobile-first, **offline-first** traceability and logistics platform that follows coffee and cocoa from the farmer's plot to the importing buyer's warehouse. The app must work in places where there is **no signal for days at a time** — washing stations in valleys, dry mills with intermittent generators, trucks crossing borders, cocoa farms three hours from the nearest cell tower — and reconcile cleanly the moment a device sees WiFi or 3G again.

It is **region-agnostic by design**: country, currency, language, timezone, tax rules, mobile-money rails, certification bodies, and regulatory regimes (EUDR, US LACEY, UK FSA, JAS, Fair Trade, Rainforest Alliance, organic, etc.) are all configuration on the cooperative or exporter record. Nothing about a country, city, currency, or payment provider is hard-coded in the client.

It is **production-ready**, meaning: cryptographically signed event log, tamper-evident chain-of-custody, deterministic conflict resolution, full audit trail for every gram of coffee or kilo of cocoa, exportable RDUE/EUDR due-diligence dossiers, and a public consumer-facing "scan the bag" experience.

The Express + PostgreSQL + Supabase Auth backend is already live, with PostGIS for spatial data and S3-compatible object storage for media. You are only building the native client and its sync engine.

---

## 1. Vision

> A drop of coffee or a kilo of cocoa is a story: a farmer's plot, a wet mill batch, a truck, a sea container, a cupping score, a roastery. BeanPath captures that story even when no one has signal.

Three product surfaces, one codebase:

| Surface | Audience | Mode |
|---|---|---|
| **Field app** | Farmers, lead farmers, cooperative agents, washing-station and dry-mill operators, transporters, weighbridge clerks | Offline-first, voice-friendly, low-literacy fallbacks |
| **Operator console** | Coop managers, exporters, QC labs, certifiers, finance | Mostly online, dense data, bulk operations |
| **Buyer & public** | Importers, roasters, manufacturers, end consumers via QR scan | Online, read-mostly, marketing-grade |

---

## 2. Personas & Roles

| Role | Primary actions | Connectivity profile |
|---|---|---|
| `farmer` | Register household, view their lots, see payments, scan their own farmer card | Mostly offline, often shared phone |
| `lead_farmer` | Register/update farmers in their village cluster, capture plot polygons, log harvest collection | Offline for days |
| `field_agent` | Buy cherry/parchment/wet-cocoa at farm gate, weigh, pay (cash or mobile money), issue receipt | Offline 60–90% of the time |
| `station_operator` | Receive lots at washing station, log fermentation, drying, parchment, sorting | Mostly offline, syncs nightly on WiFi |
| `mill_operator` | Hulling, grading, bagging, lot consolidation | Mostly online (urban mills), occasional outage |
| `qc_grader` | Cup samples, record scores (SCA form, fragrance/aroma/acidity/body…), defect counts | Online |
| `transporter` | Pickup, delivery, GPS breadcrumbs, seal photos, weighbridge tickets | Offline most of trip, GPS always on |
| `weighbridge_clerk` | Independent gross/tare/net weights | Online |
| `exporter` | Container loading, BL number, certificate uploads, customs declarations | Online |
| `buyer` | View incoming lots, contracts, sample shipments, dossier downloads | Online |
| `certifier` | Audit visit recording, non-conformity logs, certificate issuance | Mixed |
| `coop_admin` | Member onboarding, premium distribution, governance, payouts | Online |
| `consumer` *(no account)* | Scan QR on retail bag → public origin story | Online, read-only |

Each user belongs to one or more **organizations** (cooperative, washing station, mill, exporter, lab, buyer) with one or more roles per org. Permissions are role × org × resource.

---

## 3. Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native via Expo SDK 51 (managed workflow, dev clients allowed for native modules) |
| Router | Expo Router v3 (file-based, typed routes) |
| **Local DB** | **WatermelonDB** on `op-sqlite` (faster than `expo-sqlite`) for the operational data model + reactive observers |
| **Outbox / event log** | Custom append-only `events` table in the same SQLite, separate from materialized state |
| **Sync engine** | Custom — WatermelonDB sync protocol for state, signed-event push for chain-of-custody mutations |
| Server cache / fetching | TanStack React Query v5 (online reads only — operational data goes through the local DB) |
| Auth | `@supabase/supabase-js` — email/password, phone OTP (critical for low-literacy users), Google OAuth, Apple Sign In |
| Token storage | `expo-secure-store` |
| **Device key** | Ed25519 keypair generated on first launch via `expo-crypto`, private key stored in Secure Enclave / StrongBox via `expo-secure-store` with biometric gate |
| Styling | NativeWind v4 |
| Component kit | Custom components — earthy palette (terracotta accent on slate), shadcn/ui *New York* density on console screens |
| Icons | `@expo/vector-icons` (Ionicons + custom SVG set for coffee/cocoa process steps) |
| Maps | `react-native-maps` with **MBTiles offline tiles** packaged per region; satellite layer via Mapbox when online |
| **GPS** | `expo-location` background updates, polygon capture mode, accuracy threshold guard |
| **Camera** | `expo-camera` with on-device EXIF stamping (lat/lng, device key signature, hash) |
| **Barcode / QR** | `expo-barcode-scanner` — supports Code128, QR, DataMatrix |
| **NFC** | `react-native-nfc-manager` for tag-based farmer cards and bag tags |
| **Bluetooth** | `react-native-ble-plx` for Bluetooth scales (Adam, AND, Ohaus) and thermal label printers (Zebra, Brother) |
| **Voice** | `expo-speech` (TTS) + on-device speech-to-text via Whisper.cpp (`whisper.rn`) for Swahili, Lingala, French, English, Spanish, Bambara |
| **On-device ML** | `react-native-fast-tflite` for defect detection and bean classification |
| Notifications | Expo Notifications (APNs + FCM) + SMS fallback via server when push fails for >24h |
| Forms | `react-hook-form` + `zod` (zod schemas shared with backend) |
| **i18n** | `i18next` + `react-i18next` with namespace-per-screen-group; locale resolved from org → user → device |
| **Locale formatting** | `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` |
| Phone input | `react-native-phone-number-input` (E.164) |
| Deep linking | scheme `BeanPath` + Universal Links / App Links for QR codes |
| Background tasks | `expo-task-manager` + `expo-background-fetch` for sync, breadcrumb upload, photo queue |
| Charts | `victory-native` v40 (Skia-backed, fast on low-end Android) |
| Crash & telemetry | Sentry, with **offline event queue** flushed on reconnect |
| Build target | iOS and Android, **Android prioritized** (mid-range devices, Android 8+) |

---

## 4. Offline-First Architecture *(this is the heart of the system)*

### 4.1 Two layers of local data

**Layer A — Materialized state** (WatermelonDB tables): farmers, plots, lots, batches, transfers, weights, payments, photos, GPS tracks, certifications, cupping scores. This is what the UI renders.

**Layer B — Event outbox** (append-only SQLite table): every mutation that affects chain-of-custody or money is also written here as an immutable, signed event. The materialized state can be rebuilt by replaying the outbox.

```
events (
  id           TEXT PRIMARY KEY     -- ULID, sortable, time-prefixed
  aggregate    TEXT NOT NULL        -- "farmer", "lot", "batch", "transfer", "payment", "weight", "cup", ...
  aggregate_id TEXT NOT NULL
  type         TEXT NOT NULL        -- "lot.created", "transfer.handed_over", "payment.disbursed", ...
  payload      JSON NOT NULL
  actor_id     TEXT NOT NULL
  org_id       TEXT NOT NULL
  device_id    TEXT NOT NULL
  occurred_at  TEXT NOT NULL        -- device clock, ISO 8601 UTC
  prev_hash    TEXT                 -- hash of previous event for this aggregate
  sig          TEXT NOT NULL        -- ed25519(device_priv_key, canonical_json(event_minus_sig))
  status       TEXT NOT NULL        -- 'pending' | 'syncing' | 'synced' | 'rejected'
  recorded_at  TEXT                 -- server clock when accepted
  attempts     INTEGER DEFAULT 0
  last_error   TEXT
)
```

Each event references the previous event's hash for the same aggregate, producing a per-aggregate hash chain — tamper-evident even if the device is later compromised.

### 4.2 Sync protocol

Two channels run in parallel:

**Channel 1 — State sync (WatermelonDB-style)**
Pull-then-push, cursor-based:
```
POST /api/sync/pull    { last_pulled_at, schema_version, scope }
→ { changes: { farmers: { created, updated, deleted }, plots: { ... }, ... }, timestamp }

POST /api/sync/push    { changes, last_pulled_at }
→ { accepted: [...], conflicts: [...] }
```
Used for **idempotent, last-write-wins** data: farmer profile edits, plot notes, photos, contract drafts.

**Channel 2 — Event push (chain-of-custody, money, signatures)**
Append-only, signed, ordered:
```
POST /api/events/push      [ event, event, event, ... ]
→ { accepted: [ids], rejected: [{ id, reason }] }

GET  /api/events/pull?since=<ulid>&aggregates=lot,transfer,payment
→ [ event, event, event, ... ]
```
Used for **non-commutative, audit-critical** mutations. Rejected events surface as conflicts in a UI inbox — never silently dropped.

### 4.3 Conflict resolution rules (per aggregate)

| Aggregate | Conflict policy |
|---|---|
| `farmer` profile fields | Last-write-wins by `occurred_at`, with field-level merge (you edited phone, I edited address — both kept) |
| `plot` polygon | First-write-wins per `(plot_id)` — re-mapping requires explicit `plot.remapped` event |
| `lot.weight_recorded` | All writes kept as separate readings, latest one displayed; QC must reconcile if delta > 2% |
| `transfer.handed_over` | First-write-wins per `(lot_id, from_org, to_org)` — two actors can't both claim the same handoff |
| `payment.disbursed` | First-write-wins per `(lot_id, farmer_id, idempotency_key)` — duplicate payments must surface, never auto-merge |
| `cup.scored` | All scores kept (multiple graders), aggregated server-side |
| `gps.breadcrumb` | Append-only, never conflicts |

Conflicts that can't auto-resolve land in a **Reconciliation Inbox** for the org admin, with both versions side-by-side and a *Keep mine / Keep theirs / Merge* picker.

### 4.4 Media handling

- Photos and videos are saved to local FS, hashed (SHA-256), and the **hash + file metadata** is what goes into the event.
- The actual bytes upload lazily through a **MediaQueue** with: WiFi-only by default, resumable chunked upload (`tus` protocol), bandwidth budget per day (configurable), exponential backoff.
- Until upload completes, the UI shows the local thumbnail; once uploaded, it falls back to the CDN URL transparently.
- Photos taken via the in-app camera are EXIF-stamped with: device key fingerprint, GPS, timestamp, and a hash chain referencing the previous photo from the same actor — cheap forgery deterrent.

### 4.5 Time

- Events use **device wall-clock at occurrence**, but every device tracks **clock skew vs server** on each successful sync (`server_now - device_now`) and shows a banner if skew > 5 min.
- Audit reports use server `recorded_at`. UI uses `occurred_at`. Both are stored.
- All comparisons happen in UTC; render in viewer's org timezone.

### 4.6 Storage budget & hygiene

- Local DB target: **< 200 MB per device** for active orgs. Older synced events older than 90 days are pruned locally (server retains forever).
- Media on device: LRU-evicted once total > 1 GB or > 80% of free space, whichever first. Synced + thumbnailed media is the first to go.
- Encrypted at rest via SQLCipher (keyed off the device key + biometric gate).
- "Wipe device" remote command: server flags a device, on next sync the client zeros local data and signs out.

### 4.7 Offline UX rules

- Every screen renders from local DB — no spinners blocking interaction because of network.
- A persistent **Sync chip** in the header shows: ● Synced / ● *N* pending / ● *N* conflicts / ● Offline *Xh*.
- Long offline streaks (> 7 days) trigger a soft nudge: *"You haven't synced in 9 days. Find WiFi when possible."*
- Forms never block on server validation. Server validation runs on push and surfaces in the Reconciliation Inbox.
- "Last seen synced: 3h ago" timestamps on every list to set expectations.

---

## 5. Internationalization & Regionalization

### 5.1 Per-organization config

Every organization (coop, washing station, mill, exporter, lab, buyer) carries:

- `country` — ISO 3166-1 alpha-2
- `currency` — ISO 4217 (`CDF`, `XAF`, `XOF`, `KES`, `RWF`, `UGX`, `ETB`, `USD`, `EUR`, …)
- `locale` — BCP 47 (`fr`, `en`, `es`, `sw`, `pt`, `am`, `ln`, `bm`, `rw`, …)
- `timezone` — IANA TZ
- `taxProfile` — opaque server-resolved key
- `crop_focus` — `coffee` | `cocoa` | `both` (drives terminology and process steps)
- `compliance_regimes` — array (`eudr`, `lacey`, `uk_fsa`, `jas`, `fair_trade`, `rainforest_alliance`, `organic_eu`, `organic_usda`, …)

### 5.2 Languages (initial)

**French, English, Spanish, Swahili, Portuguese, Lingala, Bambara, Amharic, Kinyarwanda.** Every user-facing string lives in `locales/<bcp47>.json`. **Adding a language = drop in a JSON file, no code changes.**

### 5.3 Voice & low-literacy fallbacks

For users with low literacy (a real majority in many farming communities), every primary input field has:

1. A **🎤 voice button** that records, transcribes on-device (Whisper), and fills the field.
2. A **🔊 read-aloud button** on confirmation screens that reads the receipt back via TTS.
3. **Pictogram-based step indicators** (cherry → wet parchment → dry parchment → green) instead of text-only progress bars.
4. **Photo-as-receipt**: every transaction generates a printable receipt with QR + key facts in icons + numbers, designed to be readable without reading.

### 5.4 Currency rules

- Amounts stored as integer **minor units** + ISO currency code.
- Farm-gate transactions in local currency. Export contracts often in USD or EUR. Both stored on the lot's commercial chain.
- **Never convert FX on the client.** Server returns `displayAmount` if the viewer's currency differs.

### 5.5 Weights & measures

- Internal storage always in **grams** for coffee weights and **grams** for cocoa weights, with a `unit_displayed` hint per market.
- Display: kg in most African markets, lbs in US-buyer screens, MT for container-level views.
- The same `<Weight grams={..} />` primitive renders correctly per locale.

---

## 6. Data Model

```
organizations            id, name, type (cooperative|washing_station|dry_mill|exporter|
                         lab|buyer|transporter|certifier|coop_union),
                         country, currency, locale, timezone, taxProfile,
                         crop_focus, compliance_regimes[], parent_org_id,
                         logoUrl, isVerified, createdAt

org_members              id, org_id, user_id, role, status, createdAt

farmers                  id, household_code, first_name, last_name, gender, dob,
                         phone, national_id_number_hash, photo_url, coop_id,
                         village, district, country, registered_by_user_id,
                         registered_at, consent_signed_at, consent_doc_url

plots                    id, farmer_id, name, polygon (PostGIS), area_hectares,
                         altitude_m, slope_pct, crop, varieties[], shade_pct,
                         tree_count_estimate, planted_year, last_visited_at,
                         deforestation_risk_score (server-computed),
                         eudr_polygon_status (compliant|review|non_compliant)

lots                     id, ref (LOT-YYYY-XXXX), crop, stage (cherry|wet_parchment|
                         dry_parchment|green|wet_cocoa|fermented|dried|graded),
                         current_org_id, current_location, weight_grams,
                         certifications[], parent_lot_ids[], child_lot_ids[],
                         harvest_season, opened_at, closed_at

lot_sources              id, lot_id, farmer_id, plot_id, weight_grams,
                         price_per_kg_minor, currency, recorded_by, recorded_at
                         -- attribution mapping: which farmer/plot contributed
                         -- to a consolidated lot, with weight share

processing_events        id, lot_id, type (pulping|fermentation|washing|drying|
                         hulling|sorting|grading|cocoa_fermentation|cocoa_drying),
                         started_at, ended_at, parameters (JSON),
                         recorded_by, photos[]

transfers                id, lot_id, from_org_id, to_org_id, from_user_id,
                         to_user_id, weight_grams, location, gps_track_id,
                         seal_number, photos[], handed_over_at, received_at,
                         signature_image_url

weighings                id, lot_id, transfer_id?, gross_g, tare_g, net_g,
                         scale_id, recorded_by, recorded_at, photo_url

payments                 id, farmer_id, lot_id, gross_minor, deductions_minor,
                         net_minor, currency, method (cash|mobile_money|
                         bank_transfer|voucher|in_kind), reference,
                         disbursed_by, disbursed_at, idempotency_key

cup_scores               id, lot_id, grader_user_id, form (sca|cqc|cocoa_iso),
                         scores (JSON: fragrance, aroma, flavor, aftertaste,
                         acidity, body, balance, uniformity, clean_cup,
                         sweetness, defects, total), notes, scored_at

certifications           id, lot_id?, plot_id?, org_id?, regime, certificate_number,
                         issued_by_org_id, issued_at, valid_until, document_url

contracts                id, seller_org_id, buyer_org_id, crop, grade, quantity_mt,
                         price_per_lb_minor, currency, incoterms, shipment_window,
                         certifications_required[], status

shipments                id, contract_id, container_no, seal_no, vessel, voyage,
                         bl_number, etd, eta, current_status, current_location,
                         lot_ids[]

gps_tracks               id, subject_type (transfer|shipment|farm_visit),
                         subject_id, points (array of {lat, lng, accuracy,
                         speed, ts}), started_at, ended_at

audits                   id, org_id, certifier_org_id, regime, started_at,
                         ended_at, findings (JSON), report_url

reconciliation_items     id, org_id, kind, mine (JSON), theirs (JSON),
                         created_at, resolved_at, resolution
```

---

## 7. Backend Contract

All endpoints under `/api/`. Bearer token. Base URL: `EXPO_PUBLIC_API_URL`.

### Sync

```
POST  /api/sync/pull           { last_pulled_at, schema_version, scope }
POST  /api/sync/push           { changes, last_pulled_at }
POST  /api/events/push         signed event batch
GET   /api/events/pull         since cursor, optional aggregates filter
GET   /api/sync/status         per-org sync health
```

### Meta

```
GET   /api/meta/locales
GET   /api/meta/services
GET   /api/meta/countries
GET   /api/meta/certifications
GET   /api/meta/process-steps?crop=coffee|cocoa
GET   /api/payment-methods
```

### Farmers, plots, lots

Standard CRUD; reads should ideally hit local DB, writes go through events:

```
GET   /api/farmers / :id
GET   /api/plots / :id
GET   /api/plots/:id/deforestation-check          server runs JRC/Whisp/GFW
GET   /api/lots / :id / :id/lineage               full ancestry tree
POST  /api/lots/:id/split                          one lot → many
POST  /api/lots/:id/merge                          many lots → one
GET   /api/lots/:id/dossier?regime=eudr            generates due-diligence PDF
```

### Logistics

```
POST  /api/transfers                               create transfer (handed_over event)
POST  /api/transfers/:id/receive                   receiver confirmation
POST  /api/gps-tracks                              push breadcrumb batch
GET   /api/shipments / :id / :id/timeline
GET   /api/shipments/:id/track                     polls carrier API server-side
```

### Quality

```
POST  /api/cup-scores
GET   /api/lots/:id/cup-scores
```

### Finance

```
POST  /api/payments                                disburse to farmer
GET   /api/payments?farmer_id=
POST  /api/contracts / GET /api/contracts / :id
POST  /api/invoices/:id/pay
```

### AI

```
POST  /api/ai/defect-detect            multipart image → defect report
POST  /api/ai/yield-forecast           plot_id → projection
POST  /api/ai/cup-summary              cup score id → tasting note draft
POST  /api/ai/translate                text + target_locale
POST  /api/ai/voice-extract            transcript → structured fields
GET   /api/ai/insights                 org-level digest (weekly)
```

### Public consumer endpoint (no auth)

```
GET   /api/public/trace/:lot_short_code   sanitized lot story for QR scans
```

---

## 8. Screens

### Auth

- `/auth/welcome` — Logo, tagline (`t('welcome.tagline')`), three CTAs:
  - *I work in the field* (phone OTP first)
  - *I work at a station / office* (email/password first)
  - *I'm a buyer / consumer*
  - Locale switcher top-right, auto-detect on first launch.
- `/auth/login` — Email/password, phone OTP, Google, Apple, **biometric unlock** for returning users.
- `/auth/register` — Name, phone (E.164), org join code OR create-new-org, country picker.
- `/auth/org-setup` — Org details, crop focus, compliance regimes, currency, timezone (pre-filled from country).

### Field app (role-aware tabs)

#### `lead_farmer` / `field_agent` — focus tabs

| Tab | Route | Content |
|---|---|---|
| Today | `/today` | "What's open" — pending pickups, today's collection plan, sync chip, weather + harvest-window nudge. |
| Farmers | `/farmers` | Searchable list, big tap targets, NFC card scanner FAB. New farmer wizard with photo, polygon walk, household roster. |
| Collect | `/collect` | New collection: pick farmer → scan/connect Bluetooth scale → confirm grams → choose price band → pay (cash / mobile money) → print/show receipt. Entire flow works offline. |
| Lots | `/lots` | Lots in your hand right now, with stage badge and weight. Transfer to next custodian. |
| Me | `/me` | Profile, language, voice settings, sync inbox, conflicts, sign out. |

#### `station_operator` — focus tabs

| Tab | Route | Content |
|---|---|---|
| Yard | `/yard` | All lots currently on premises by stage, drag-to-move between stages. |
| Receive | `/receive` | Scan incoming transfer QR / NFC, weigh, photo of seal. |
| Process | `/process` | Start/stop fermentation, drying, log parameters (Brix, pH, moisture). |
| Dispatch | `/dispatch` | Outgoing transfers, assign transporter, GPS track starts on handover. |
| Me | `/me` |  |

#### `transporter` — focus tabs

| Tab | Route | Content |
|---|---|---|
| Trips | `/trips` | Active trip card with live GPS breadcrumb status, fuel, distance, ETA. |
| Pickup | `/pickup` | QR scan, weighbridge ticket photo, seal photo. |
| Deliver | `/deliver` | Receiver signature capture, seal-intact photo, offload weight. |
| Me | `/me` |  |

### Operator console (online, denser)

- `/console` — Multi-org dashboard, KPIs, alerts, reconciliation inbox count.
- `/console/farmers` — Searchable directory, bulk import (CSV), polygon QA queue.
- `/console/lots` — Lot explorer with **lineage graph** view (parents and children), filterable by stage, season, certification.
- `/console/lots/:id` — Full lot dossier: sources (which farmers, what %), processing timeline, weighings, transfers, GPS tracks, cup scores, certifications, photos, **EUDR risk panel**, **download dossier PDF**.
- `/console/transfers` — Map view of in-flight transfers with GPS breadcrumbs.
- `/console/quality` — Cupping table mode (large-screen friendly), SCA form, blind cup mode, panel calibration.
- `/console/finance` — Payments to farmers, premium distribution, contracts, invoices.
- `/console/contracts/:id` — Contract detail + linked shipments.
- `/console/shipments` — Container tracking, BL numbers, vessel ETAs (server polls Maersk/MSC/etc.).
- `/console/compliance` — Per-regime status board (EUDR, FT, RA, organic), audit log, document vault.
- `/console/reconciliation` — Conflict inbox with side-by-side resolver.
- `/console/insights` — AI digest (see §9).
- `/console/admin` — Members, roles, devices, remote-wipe, sync health.

### Buyer screens

- `/buyer/incoming` — Open contracts, expected shipments, sample requests.
- `/buyer/lots/:id` — Read-only dossier mirror, with cup score history and origin photos.
- `/buyer/sustainability` — Carbon, water, deforestation reports per shipment (data fed by upstream events).

### Public consumer

- `/trace/:short_code` (Universal Link from QR on retail bag)
  - **Hero**: photo of the originating coop / farmer (with consent flag), country flag, harvest year.
  - **Map**: animated dot trail farm → wet mill → dry mill → port → roastery.
  - **Story panel**: cup score, varieties, processing method, certifications.
  - **Farmer share**: % of FOB price that reached the farmer for this lot.
  - **Verify**: tamper-evidence badge ("This lot's chain of custody is cryptographically verified across N events from N actors").
  - No tracking, no login, fast on 3G.

---

## 9. AI Insights *(grounded, not magic)*

Every AI feature must (a) be honest about confidence, (b) work either on-device or via an explicit server call, (c) never block a critical workflow if the model is unavailable.

| Feature | Where it runs | What it does | Failure mode |
|---|---|---|---|
| **Bean defect detection** | On-device TFLite (small model) → server (full model) when online | Photo of green coffee or dried cocoa → defect counts (broken, insect, mold, immature, foreign matter) | Falls back to manual count form |
| **Polygon-deforestation pre-check** | Server (Whisp, GFW, JRC TMF) | Plot polygon → forest cover change since 2020 → EUDR risk score | Always available offline as last cached score |
| **Yield forecast** | Server | Plot history + weather + altitude → next-harvest projection in kg | Hidden if confidence < threshold |
| **Cupping note synthesis** | Server | SCA scores + descriptors → tasting note draft for marketing | Editable, never auto-published |
| **Voice → form** | On-device Whisper.cpp + on-device fields-extractor (small LLM via `mlx`/`ONNX`) | Field agent dictates *"Marie Kabila, three buckets cherry, twelve thousand francs total"* → fills farmer + weight + price fields for review | Falls back to manual entry |
| **Translation** | On-device (NLLB-distilled) for common pairs, server for the rest | French ↔ Swahili ↔ English ↔ Spanish | Shows source + target side-by-side |
| **Anomaly detection** | Server (nightly batch) | Flags: weight loss > drying-curve expectation, payment outliers, GPS deviations from planned route, time-of-day pattern breaks | Surfaces in console alerts, never auto-blocks |
| **Demand & price intelligence** | Server | NY-C and London cocoa forwards, regional differentials, FX, internal sell-through → suggested floor price for farmers | Advisory only |
| **Document OCR** | On-device (Vision/MLKit) → server fallback | Paper receipts, weighbridge tickets, certificates → structured fields | Manual edit always available |
| **Carbon & insurance** | Server | Plot polygon + processing energy + transport → estimated tCO₂e per kg green; parametric insurance trigger eligibility | Read-only |

A weekly **Insights Digest** (`/console/insights`) summarizes: top-performing plots, at-risk plots, farmer cohorts trending up/down, quality drift across stations, payment cycle health, deforestation alerts. Every insight is clickable to its source data — **no black-box numbers**.

---

## 10. Logistics & Real-Time Tracking

### 10.1 GPS breadcrumbs

- On accepted handover, the transporter device starts a **foreground service** (Android) / **background location** (iOS) that records a point every 60s while moving and every 15min while stationary, with adaptive accuracy.
- Points buffer locally; uploaded in compressed batches when connectivity returns.
- Per-trip GPS budget: ≤ 2 MB/day target.
- A "Trip card" shows: distance, duration, idle time, deviations from planned route, fuel logged.

### 10.2 Cell-tower fallback

When GPS fix isn't available (dense forest), record cell-tower IDs (`expo-cellular` extension or Android-only `TelephonyManager` via dev module) — not for high precision, but for "still moving" liveness.

### 10.3 Container & vessel tracking

- Server integrates with carrier APIs (Maersk, MSC, CMA, Hapag, ONE, ZIM) and INTTRA / GateHouse / Vesseltracker.
- Client just polls `/api/shipments/:id/track` and renders the timeline.
- Buyer screens get push notifications on key milestones: gate-in, loaded, departed, arrived, gate-out, customs cleared.

### 10.4 Hardware integrations

- **Bluetooth scales**: paired once per device, weight reading auto-fills the form. The reading is signed by the device key + scale serial — useful for disputes.
- **Thermal label printers**: print farmer cards, lot tags (Code128 + QR), and transfer receipts in the field.
- **NFC tags**: optional bag tags for re-identification at receiving stations even without scanning a printed QR.
- **Dymo / Brother label printers** over Bluetooth for office-side bag tagging.

---

## 11. Compliance & Certifications

### 11.1 EUDR / RDUE module (highest-value feature for buyers)

- Plot polygon required for every farmer contributing to an export lot (DDS prep).
- Server runs daily checks against the EU JRC Tropical Moist Forest dataset and the cutoff date (31 Dec 2020) to compute a per-plot status: `compliant`, `review`, `non_compliant`.
- **Dossier exporter**: `/api/lots/:id/dossier?regime=eudr` produces a single PDF with: lot ref, contributing farmers + polygons + GeoJSON, deforestation analysis screenshots, chain-of-custody timeline, signed event hashes, certifications. This PDF is what the buyer files as their DDS.
- A separate machine-readable JSON dossier is produced alongside for buyers' own systems.

### 11.2 Other regimes

- Each regime is a config object: required fields, audit cadence, evidence types, certificate template.
- Audits run through the same event log: `audit.started`, `nonconformity.raised`, `corrective_action.taken`, `audit.closed`, `certificate.issued`.
- Certificate documents stored in encrypted object storage, hashes in event log.

### 11.3 Privacy & consent

- Farmer registration captures explicit consent (signed pad image + checkbox) for: data storage, sharing with buyers, public dossier inclusion.
- Public-consumer page only shows what the farmer consented to, with face-blur option by default.

---

## 12. Domain Rules

1. **Mass balance is enforced.** Sum of `lot_sources.weight_grams` must equal lot weight at the consolidation event. Splits and merges must reconcile within a 0.5% tolerance, otherwise the event is rejected and lands in the reconciliation inbox.
2. **No silent merges.** Any conflict that touches money, weight, or chain-of-custody is surfaced — never auto-resolved.
3. **Server is the source of truth for prices, surcharges, FX, taxes, premiums, and certifications.** The client never computes any of these.
4. **Every transfer creates two events**: `transfer.handed_over` (sender) and `transfer.received` (receiver). A transfer with only one side after 7 days is flagged as suspicious.
5. **Idempotency for payments** is enforced via `idempotency_key = hash(farmer_id, lot_id, recorded_by, day)` — the same agent paying the same farmer for the same lot the same day cannot create two payment events.
6. **Plot polygons are immutable** once accepted — re-mapping requires an explicit `plot.remapped` event with a reason.
7. **Voice transcription is never auto-submitted.** It always fills a draft form for human confirmation — protects against mishearing in noisy environments.
8. **Photos require GPS or Bluetooth witness.** Photos taken with location services off get a "low-evidence" badge in dossiers.
9. **Offline-only operations are allowed for**: collections, weighings, transfers (handed_over side), processing events, payments, photo capture, voice notes. **Online-only**: contract creation, certificate issuance, member invitations, role changes, payouts to bank accounts, AI calls that need server.
10. **Devices are identities.** Every event is signed by the device key. Losing a device → admin remote-wipes it and revokes its key; events from a revoked device after revocation are quarantined for review.
11. **Permission rules** combine role × org × resource. A `field_agent` of Coop A cannot see farmers of Coop B, even if both belong to the same union, unless an explicit data-sharing agreement event exists.
12. **Public consumer pages** show **only** what the lot's contributing farmers and the coop have explicitly published. Default is conservative.

---

## 13. Visual Design

**Palette** (theme tokens, swappable):

| Token | Default | Use |
|---|---|---|
| `--primary` | `#b45309` (amber-700, "wet parchment") | Buttons, active states |
| `--accent` | `#15803d` (green-700, "leaf") | Success, certified |
| `--background` | `#fafaf9` (stone-50) | Screen background |
| `--surface` | `#f5f5f4` (stone-100) | Cards |
| `--text` | `#1c1917` (stone-900) | Primary text |
| `--text-muted` | `#78716c` (stone-500) | Secondary text |
| `--warning` | `#d97706` (amber-600) | SLA risk |
| `--danger` | `#b91c1c` (red-700) | Deforestation alert, conflict |

Tone: **earthy, calm, tactile** on field-app screens — large tap targets (min 56pt), high contrast, voice & icon support. **Dense, console-like** on operator screens — tables, filters, keyboard shortcuts, multi-select.

**Stage badges** (icon + label via i18n):
🍒 Cherry · 🟫 Wet parchment · ☀️ Drying · 📦 Dry parchment · 🟢 Green · 🚚 In transit · 🚢 Shipped · 🔒 Closed

**Status & evidence badges**:
- ✅ Synced · ⏳ Pending · ⚠️ Conflict · 🔴 Offline
- 🛰️ GPS-verified · 📷 Photo-stamped · 🔐 Signed · 🌳 Forest-OK · 🚨 Forest-risk

---

## 14. Environment Variables

```
EXPO_PUBLIC_API_URL                = https://api.your-backend.com
EXPO_PUBLIC_SUPABASE_URL           = https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY      = eyJ...
EXPO_PUBLIC_PUBLIC_TRACE_URL       = https://trace.your-domain.com

EXPO_PUBLIC_PLACES_PROVIDER        = mapbox | google | here
EXPO_PUBLIC_PLACES_API_KEY         = pk.xxx
EXPO_PUBLIC_MAPBOX_TILES_PACKAGE   = url to per-region MBTiles bundles

EXPO_PUBLIC_DEFAULT_LOCALE         = en
EXPO_PUBLIC_FALLBACK_LOCALE        = en
EXPO_PUBLIC_SUPPORTED_LOCALES      = fr,en,es,sw,pt,ln,bm,am,rw

EXPO_PUBLIC_SYNC_BATCH_SIZE        = 200
EXPO_PUBLIC_SYNC_INTERVAL_MIN      = 15
EXPO_PUBLIC_MEDIA_WIFI_ONLY        = true
EXPO_PUBLIC_MEDIA_DAILY_BUDGET_MB  = 50

EXPO_PUBLIC_TUS_ENDPOINT           = https://upload.your-backend.com/files
EXPO_PUBLIC_SENTRY_DSN             = (optional)
EXPO_PUBLIC_ADMIN_EMAIL            = admin@BeanPath.app
```

---

## 15. Directory Structure

```
app/
  _layout.tsx
  (auth)/
    welcome.tsx / login.tsx / register.tsx / org-setup.tsx
  (field)/                          ← role-aware field app
    _layout.tsx
    today.tsx
    farmers/index.tsx / new.tsx / [id].tsx
    collect/index.tsx / [id].tsx
    lots/index.tsx / [id].tsx
    yard.tsx / receive.tsx / process.tsx / dispatch.tsx
    trips/index.tsx / [id].tsx
    pickup.tsx / deliver.tsx
    me.tsx
  (console)/                        ← operator console
    _layout.tsx
    index.tsx
    farmers.tsx / lots/index.tsx / lots/[id].tsx
    transfers.tsx / quality.tsx
    finance/index.tsx / contracts/[id].tsx / shipments/index.tsx
    shipments/[id].tsx
    compliance/index.tsx / compliance/eudr.tsx
    reconciliation.tsx / insights.tsx / admin.tsx
  (buyer)/
    _layout.tsx
    incoming.tsx / lots/[id].tsx / sustainability.tsx
  trace/[shortCode].tsx             ← public, unauth, Universal Link

db/
  schema.ts                          WatermelonDB models
  migrations/
  outbox.ts                          event log table + signer
  sync/
    pull.ts / push.ts / events.ts / mediaQueue.ts
    conflicts.ts                     per-aggregate resolvers
    cursors.ts

lib/
  api.ts / supabase.ts / queryClient.ts
  i18n.ts / locales/<bcp47>.json
  format.ts                          formatMoney, formatWeight, formatDate
  region.ts
  crypto.ts                          ed25519 sign/verify, SHA-256
  device.ts                          deviceId, key bootstrap
  geo.ts                             polygon utils, area, simplification
  tiles.ts                           MBTiles loader
  ai/
    defects.tflite / classifier.ts
    whisper/                         on-device STT
    extractFields.ts                 voice → fields

hooks/
  use-auth.ts / use-org.ts / use-role.ts / use-sync.ts
  use-farmers.ts / use-plots.ts / use-lots.ts / use-transfers.ts
  use-payments.ts / use-cup.ts / use-shipments.ts
  use-payment-methods.ts / use-locale.ts / use-conflicts.ts
  use-bluetooth-scale.ts / use-printer.ts / use-nfc.ts

components/
  SyncChip.tsx                       persistent header status
  EvidenceBadges.tsx                 GPS / photo / signed / forest
  StageBadge.tsx
  Money.tsx / Weight.tsx
  VoiceField.tsx                     voice-enabled input wrapper
  PolygonWalker.tsx                  GPS polygon capture map
  ScaleReader.tsx                    Bluetooth scale reading widget
  PaymentSheet.tsx
  ReceiptPrinter.tsx
  LineageGraph.tsx                   parent/child lot tree
  DossierPreview.tsx                 EUDR PDF preview
  ConflictResolver.tsx
  Charts/...

services/
  background/
    sync-task.ts / breadcrumb-task.ts / media-task.ts
  notifications.ts
  errors.ts                          offline-aware error queue
```

---

## 16. Deliverables

1. All screens listed above, fully functional against the live API and the local DB.
2. **Offline-first sync engine** with: state pull/push, signed event push/pull, media queue, conflict resolution per aggregate, reconciliation inbox UI.
3. **Device key bootstrap & event signing** with biometric gate.
4. **Voice + low-literacy fallbacks** on every primary input.
5. **Bluetooth scale, NFC, thermal printer integrations** with pluggable adapters.
6. **EUDR dossier export** (PDF + JSON) end-to-end.
7. **Public consumer trace page** with Universal Link routing.
8. Typed API client in `lib/api.ts`, one function per endpoint.
9. One React Query hook per resource (online), one observable per WatermelonDB model (offline).
10. TypeScript strict mode; no `any` except at API response boundaries.
11. **Full i18n: every user-facing string in `locales/<bcp47>.json`.** Minimum ship locales: French, English, Spanish, Swahili.
12. Money, weight, date, phone, address — all locale/region aware via dedicated primitives.
13. `app.config.ts` with all env vars, deep-link scheme, Universal Links, Associated Domains, APNs + FCM, background-fetch + background-location entitlements.
14. `eas.json` with `development`, `preview`, `production` profiles for both platforms (`provisioning: automatic`).
15. `README.md`: setup, env table, EAS build steps, **how to add a locale**, **how to add a payment rail**, **how to add a country**, **how to add a certification regime**, **how the sync protocol works** (sequence diagrams).
16. **Test fixtures**: seed script that creates a coop, three field agents, fifty farmers with polygons, two seasons of lots, and a fully signed event log — runnable against a dev backend.

### Do NOT

- Modify the backend.
- Compute prices, surcharges, FX, taxes, premiums, or certifications on the client.
- Use AsyncStorage for tokens — `expo-secure-store` only.
- Hard-code any country, city, currency, payment provider, certification body, tax label, or user-facing string.
- Branch logic on `country === "..."` or `currency === "..."` anywhere in the client.
- Auto-merge conflicts that involve weight, money, or chain-of-custody.
- Show spinners that block interaction because of network — every screen must render from local DB first.
- Upload photos over cellular by default.
- Drop events silently on push failure — they must remain in the outbox until accepted or surfaced as a conflict.
- Trust the device clock for audits — use server `recorded_at` for compliance, `occurred_at` for UX only.
- Add features not listed above.

---

## 17. Why This Architecture

A traceability app that doesn't work offline, doesn't sign its events, and computes prices on the client is theatre — a buyer's compliance officer will see through it in five minutes. BeanPath's design is opinionated about three things:

1. **Offline is the default state, not an edge case.** The agents who add the most value to the chain are the ones with the worst signal. Every screen renders from local DB. Every mutation is an event in a local outbox. Sync is a background concern.
2. **Chain of custody is cryptographically anchored.** Device-signed, hash-chained events are the cheapest way to make a dossier defensible without inventing a blockchain. A buyer's auditor can verify any lot's history independently from the server's word.
3. **Mass balance and idempotency are first-class.** A traceability system that can't tell you whether the kilos in equal the kilos out, or that lets the same payment fire twice on a bad network, is how trust evaporates. Both are enforced by the data model and the sync layer, not by goodwill.

Everything else — AI insights, logistics tracking, EUDR dossiers, the public consumer page — is leverage on top of that foundation.
