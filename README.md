# BeanPath

**Supply chain traceability for DRC coffee and cocoa cooperatives.**

BeanPath digitises the entire farm-to-roaster journey — farmer registration, cherry delivery capture, lot processing, quality grading, EUDR compliance, and buyer-facing trace portals — in a single offline-first mobile and web application built for the Democratic Republic of Congo.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Roles & Permissions](#roles--permissions)
- [Data Models](#data-models)
- [Screens & Navigation](#screens--navigation)
- [Getting Started](#getting-started)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Production Build & Deployment](#production-build--deployment)
- [Offline-First Design](#offline-first-design)
- [Localisation](#localisation)
- [Demo Data](#demo-data)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## Overview

Coffee cooperatives in eastern DRC manage thousands of smallholder farmers across remote territories with no reliable internet. Paper registers are slow, error-prone, and opaque to international buyers who need EUDR due-diligence evidence.

BeanPath solves this by:

- Capturing every delivery transaction **offline** on an Android or iOS device
- Syncing automatically when connectivity is restored
- Generating **immutable lot dossiers** traceable back to individual farmers and GPS polygons
- Exposing a **public trace portal** (no login required) for buyers and certifiers to scan QR codes and verify origin

The application currently models real data from two DRC cooperatives: **TCC — Tounga wa Café Congo** (Station KAHISA, Kabare territory) and **NAKEZA SARL** (Station NAKEZA, Luhihi groupement).

---

## Features

| Feature | Description |
|---|---|
| Farmer registry | Bio-ID lookup, GPS village, tree count (pieds), group role |
| Cherry delivery capture | Bidons, price in FC, receipt no., register no., report no. |
| Cherry registers | Group deliveries from the same collection area on the same day |
| Delivery reports | Weekly periodic groupings of registers for one transport event |
| Lot management | Full lifecycle from cherry reception → shipped with weight and farmer count |
| Processing stages | Cherry received → Pulping → Fermenting → Washing → Drying → Hulling → Graded → Bagged → In transit → Shipped |
| Cup scoring | Numerical cup score attached to a lot by QC grader |
| Certifications | Fair Trade, Organic, Rainforest Alliance tags on lots |
| EUDR compliance | Due-diligence statement export for exporters |
| Trace portal | Public `GET /trace/:shortCode` page — no login, QR-scannable |
| Offline sync | AsyncStorage queue with conflict detection and manual resolution |
| Role-gated UI | 10 roles across 3 surfaces; 25 discrete permissions |
| Toast system | Non-blocking feedback for every action |
| Multilingual UI | French (primary), English, Swahili — switcher in nav |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Replit Reverse Proxy                        │
│              (path-based routing, mTLS, HTTPS)                   │
└────────────┬───────────────────────────────┬─────────────────────┘
             │ /beanpath                      │ /api
             ▼                               ▼
┌────────────────────────┐   ┌───────────────────────────────┐
│   BeanPath Expo App    │   │        API Server              │
│  (React Native + Web)  │   │   (Node.js / Express / TS)    │
│                        │   │                                │
│  • Expo Router v6      │   │  • OpenAPI 3.1 contract-first  │
│  • Offline-first       │   │  • Drizzle ORM + PostgreSQL    │
│  • AsyncStorage queue  │   │  • Zod request validation      │
│  • TanStack Query      │   │  • Pino structured logging     │
└────────────────────────┘   └───────────────────────────────┘
             │                               │
             └──────── shared libs ──────────┘
                    lib/api-spec        (OpenAPI YAML)
                    lib/api-zod         (generated Zod schemas)
                    lib/api-client-react (generated React Query hooks)
                    lib/db              (Drizzle schema + migrations)
```

The monorepo is managed with **pnpm workspaces**. Leaf packages (`artifacts/*`) consume shared libraries from `lib/*`. Shared libraries are composite TypeScript packages that emit declarations.

---

## Project Structure

```
beanpath/                        ← monorepo root
├── artifacts/
│   ├── beanpath/                ← Expo mobile + web app
│   │   ├── app/
│   │   │   ├── (auth)/          ← Unauthenticated screens
│   │   │   │   ├── welcome.tsx  ← Landing page (responsive, animated)
│   │   │   │   ├── personas.tsx ← Role persona selection
│   │   │   │   ├── login.tsx    ← Phone / email login
│   │   │   │   └── register.tsx ← New account registration
│   │   │   ├── (tabs)/          ← Field surface (agents & lead farmers)
│   │   │   │   ├── index.tsx    ← Field dashboard
│   │   │   │   ├── farmers/     ← Farmer list + new farmer form
│   │   │   │   ├── collect/     ← Cherry delivery capture
│   │   │   │   └── me.tsx       ← Profile / sign-out
│   │   │   ├── (console)/       ← Station & management surface
│   │   │   │   ├── index.tsx    ← Console dashboard
│   │   │   │   ├── lots/        ← Lot list + detail + stage updates
│   │   │   │   ├── registers.tsx← Cherry register viewer
│   │   │   │   ├── reports.tsx  ← Financial & delivery reports
│   │   │   │   └── reconciliation.tsx ← Offline conflict resolution
│   │   │   ├── trace/
│   │   │   │   └── [shortCode].tsx ← Public traceability portal
│   │   │   ├── index.tsx        ← Root redirect (auth → welcome, else → surface)
│   │   │   └── +not-found.tsx
│   │   ├── components/          ← Shared UI primitives
│   │   │   ├── CertBadge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FarmerCard.tsx
│   │   │   ├── LotCard.tsx
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── RoleGate.tsx
│   │   │   ├── StageTag.tsx
│   │   │   └── SyncChip.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   ← User session, role, org
│   │   │   ├── DataContext.tsx   ← Farmers, deliveries, lots (AsyncStorage)
│   │   │   ├── SyncContext.tsx   ← Online/offline state, pending queue
│   │   │   └── ToastContext.tsx  ← Non-blocking notifications
│   │   ├── constants/
│   │   │   └── colors.ts        ← Stone & Amber design tokens
│   │   ├── lib/
│   │   │   └── rbac.ts          ← Role → Permission matrix
│   │   ├── server/
│   │   │   └── serve.js         ← Production static server (zero dependencies)
│   │   └── scripts/
│   │       └── build.js         ← expo export web + native build
│   ├── api-server/              ← Express REST API
│   │   └── src/
│   │       └── index.ts         ← Server entry, route registration
│   └── mockup-sandbox/          ← Vite component prototyping environment
├── lib/
│   ├── api-spec/                ← OpenAPI 3.1 YAML (source of truth)
│   ├── api-zod/                 ← Generated Zod schemas (from api-spec)
│   ├── api-client-react/        ← Generated React Query hooks (from api-spec)
│   └── db/                      ← Drizzle ORM schema + migrations
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

---

## Tech Stack

### Mobile & Web App

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54, React Native 0.81 |
| Navigation | Expo Router v6 (file-based, typed routes) |
| State | React Context + AsyncStorage |
| Server state | TanStack Query v5 |
| Animations | React Native Animated API |
| Gestures | React Native Gesture Handler |
| Icons | `@expo/vector-icons` (Ionicons) |
| Fonts | Inter (Google Fonts via Expo) |
| Gradients | `expo-linear-gradient` |
| Haptics | `expo-haptics` |
| Images | `expo-image` |
| Location | `expo-location` |
| Architecture | React Compiler enabled, New Architecture (Fabric) |

### API Server

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express v5 |
| Validation | Zod (generated from OpenAPI) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Logging | Pino + pino-http |
| Build | esbuild |

### Shared Infrastructure

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Language | TypeScript 5.9 (strict) |
| API contract | OpenAPI 3.1 (code-first generation via Orval) |
| Package catalog | pnpm `catalog:` pins for shared versions |

---

## Roles & Permissions

BeanPath uses a 10-role, 3-surface RBAC model mirroring the real DRC cooperative org chart.

### Surfaces

| Surface | Route group | Who |
|---|---|---|
| **Field** | `/(tabs)/` | Agents and lead farmers doing farm-gate capture |
| **Console** | `/(console)/` | Station operators, mill, QC, exporters, admin |
| **Buyer** | `/(trace)/` | Read-only dossier access for roasters and certifiers |

### Roles

| Role | French Label | Surface | Key Responsibilities |
|---|---|---|---|
| `field_agent` | Agent de terrain | Field | Register farmers, record cherry deliveries |
| `lead_farmer` | Agriculteur leader | Field | Manage a farmer group, collective submissions |
| `station_operator` | Opérateur de station | Console | Cherry reception, lot creation, register management |
| `coop_admin` | Administrateur | Console | Full management, financial reports, EUDR |
| `transporter` | Transporteur | Console | Update lot location, confirm transport legs |
| `mill_operator` | Opérateur moulin | Console | Record processing stages |
| `qc_grader` | Inspecteur qualité | Console | Cup scores, quality certifications, audits |
| `exporter` | Exportateur | Console | Export documents, DDV, EUDR due diligence |
| `certifier` | Certificateur | Console | Issue / revoke Fair Trade, Organic, RA certs |
| `buyer` | Acheteur | Buyer | Read-only: lot dossiers, trace records, origin stories |

### Permission Matrix

| Permission | field_agent | lead_farmer | station_operator | coop_admin | transporter | mill_operator | qc_grader | exporter | certifier | buyer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `farmer.create` | ✓ | ✓ | ✓ | ✓ | | | | | | |
| `farmer.edit` | | | ✓ | ✓ | | | | | | |
| `farmer.delete` | | | | ✓ | | | | | | |
| `farmer.view` | ✓ | ✓ | ✓ | ✓ | | | ✓ | | ✓ | |
| `delivery.create` | ✓ | ✓ | ✓ | ✓ | | | | | | |
| `delivery.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `register.view` | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `register.manage` | | | ✓ | ✓ | | | | | | |
| `lot.create` | | | ✓ | ✓ | | | | | | |
| `lot.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lot.update_stage` | | | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| `lot.grade` | | | | ✓ | | ✓ | ✓ | | | |
| `lot.certify` | | | | ✓ | | | ✓ | | ✓ | |
| `lot.delete` | | | | ✓ | | | | | | |
| `finance.view` | | | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | |
| `finance.export` | | | | ✓ | | | | ✓ | | |
| `export.eudr` | | | | ✓ | | | | ✓ | | |
| `admin.panel` | | | | ✓ | | | | | | |
| `conflict.resolve` | | | ✓ | ✓ | | | | | | |
| `audit.view` | | | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | |
| `trace.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Use the `RoleGate` component or `usePermission(perm)` hook to gate any UI element or screen.

```tsx
import { RoleGate } from "@/components/RoleGate";

<RoleGate permission="lot.certify">
  <CertifyButton />
</RoleGate>
```

---

## Data Models

All models are defined in `artifacts/beanpath/context/DataContext.tsx` and persisted locally via AsyncStorage under the `@beanpath_v3:` namespace.

### Farmer

```ts
type Farmer = {
  id: string;
  bioId: string;           // e.g. "TCC BMB 009" — cooperative bio/organic cert ID
  firstName: string;
  lastName: string;
  phone?: string;
  age?: number;
  gender: "M" | "F" | "Other";
  territoire: string;      // e.g. "Kabare"
  groupement: string;      // e.g. "Bushumba"
  village: string;         // e.g. "Cinjava"
  stationId: string;       // default delivery washing station
  coopId: string;
  nbPieds: number;         // number of coffee/cocoa trees
  groupRole?: "president" | "vp" | "secretary" | "member";
  crop: "coffee" | "cocoa" | "both";
  registeredAt: string;
};
```

### CherryDelivery

Mirrors one row of the physical *Formulaire de registre des cerises* document:

```ts
type CherryDelivery = {
  id: string;
  farmerId: string;
  stationId: string;
  purchaseDate: string;        // date d'achat — at farm gate
  receptionDate: string;       // date de réception à la station
  receiptNo: string;           // No de reçu de paiement
  cherryRegisterNo: string;    // No du registre des cerises
  deliveryReportNo: string;    // No du rapport de livraison
  quantityBidons: number;      // volume in 5-litre bidons
  pricePerBidonFC: number;     // FC per bidon
  totalFC: number;
  exchangeRateFC_USD: number;
  paymentMethod: "cash" | "mobile_money" | "bank";
  synced: boolean;
  recordedAt: string;
};
```

### CherryRegister

Groups deliveries from the same collection area on the same day:

```ts
type CherryRegister = {
  id: string;
  registerNo: string;
  stationId: string;
  deliveryReportNo: string;
  date: string;
  groupement: string;
  totalBidons: number;
  totalFC: number;
  deliveryIds: string[];
};
```

### Lot

Tracks bulked product through the full processing pipeline:

```ts
type LotStage =
  | "cherry_received" | "pulping" | "fermenting" | "washing"
  | "drying" | "dry_parchment" | "hulling" | "graded"
  | "bagged" | "in_transit" | "shipped" | "closed";

type Lot = {
  id: string;
  ref: string;                        // e.g. "KAHISA-2024-07A"
  crop: "coffee" | "cocoa";
  stage: LotStage;
  weightKg: number;
  bidonCount: number;
  farmerCount: number;
  harvestSeason: string;
  certifications: string[];           // ["Fair Trade", "Organic", "RA"]
  openedAt: string;
  stationId: string;
  sourceRegisterNos: string[];
  cupScore?: number;
  processingMethod?: "washed" | "natural" | "honey";
};
```

### Station

```ts
type Station = {
  id: string;
  name: string;
  territoire: string;
  groupement: string;
  coopId: string;
};
```

---

## Screens & Navigation

Navigation is handled by Expo Router v6 using a file-based layout with three route groups:

```
/                        → redirects based on auth state
/(auth)/welcome          → Landing page (responsive, animated hero + sections)
/(auth)/personas         → Role persona selector
/(auth)/login            → Phone / email sign-in
/(auth)/register         → New account registration

/(tabs)/                 → Field dashboard (field_agent, lead_farmer)
/(tabs)/farmers          → Farmer list with search
/(tabs)/farmers/new      → Register a new farmer
/(tabs)/farmers/[id]     → Farmer detail card
/(tabs)/collect          → Cherry delivery capture form

/(console)/              → Console dashboard (all management roles)
/(console)/lots          → Lot list
/(console)/lots/[id]     → Lot detail + stage progression
/(console)/registers     → Cherry register viewer
/(console)/reports       → Financial & delivery reports
/(console)/reconciliation → Offline conflict resolution

/trace/[shortCode]       → Public traceability portal (no auth required)
```

The root `index.tsx` reads the session from `AuthContext`. If no user is signed in, it redirects to `/(auth)/welcome`. If signed in, it consults `ROLE_SURFACE` and redirects to `/(tabs)/`, `/(console)/`, or `/trace/`.

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later
- Expo Go on your iOS or Android device (for native preview)

### Install Dependencies

```bash
pnpm install
```

### Start Development Server

```bash
# Start the Expo app (mobile + web)
pnpm --filter @workspace/beanpath run dev

# Start the API server (separate terminal)
pnpm --filter @workspace/api-server run dev
```

The Expo dev server starts on the port configured by the workflow. Open the printed URL in your browser, or scan the QR code with Expo Go on your phone.

---

## Development

### Workspace Commands

| Command | What it does |
|---|---|
| `pnpm --filter @workspace/beanpath run dev` | Start Expo dev server |
| `pnpm --filter @workspace/api-server run dev` | Start API server |
| `pnpm run typecheck` | Full TypeScript check (libs + leaf packages) |
| `pnpm run typecheck:libs` | Build composite libs only |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate Zod schemas and React Query hooks from OpenAPI |

### Adding a New Screen

1. Create a file inside the appropriate route group in `artifacts/beanpath/app/`.
2. Export a default React component.
3. Expo Router picks it up automatically — no route registration needed.
4. Gate it with `<RoleGate permission="...">` if it is role-restricted.

### Adding a New Permission

1. Add the permission name to the `Permission` union in `lib/rbac.ts`.
2. Add it to the relevant roles in `ROLE_PERMISSIONS`.
3. Use `usePermission("your.permission")` or `<RoleGate permission="your.permission">` in the UI.

### Adding a New API Route

The project follows a contract-first approach:

1. Add the endpoint to `lib/api-spec/openapi.yaml`.
2. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate Zod schemas and React Query hooks.
3. Implement the handler in `artifacts/api-server/src/`.
4. Use `req.log` (not `console.log`) for all server-side logging.

### Toast Notifications

```tsx
import { useToast } from "@/context/ToastContext";

const { showToast } = useToast();
showToast("Agriculteur enregistré", "success");
showToast("Connexion perdue", "error");
```

---

## Environment Variables

| Variable | Where used | Description |
|---|---|---|
| `PORT` | Both apps | Port the dev server binds to (set by Replit workflow) |
| `BASE_PATH` | Expo app | URL path prefix for the proxy (e.g. `/beanpath`) |
| `REPLIT_DEV_DOMAIN` | Expo app | Public dev domain for deep links |
| `REPLIT_EXPO_DEV_DOMAIN` | Expo app | Expo-specific dev domain for Metro QR |
| `REPL_ID` | Expo app | Replit project identifier |
| `SESSION_SECRET` | API server | Secret for signing session cookies |
| `DATABASE_URL` | API server | PostgreSQL connection string |

Secrets are managed via Replit's environment secret store and are never committed to the repository.

---

## Production Build & Deployment

### Build

```bash
# From the beanpath artifact directory
node scripts/build.js
```

This script runs:
1. `expo export --platform web` → outputs to `dist/`
2. A Metro native bundle build → outputs to `static-build/`

### Serve

```bash
node server/serve.js
```

The production server (`serve.js`) is a zero-dependency Node.js HTTP server that:

- **Browser requests** (no `expo-platform` header): serves `dist/index.html` and static assets — the full Expo web React app.
- **Expo Go / native requests** (`expo-platform: ios | android` header): serves the native Metro bundle from `static-build/`.

Both paths fall back gracefully: unknown browser paths receive `dist/index.html` (SPA routing), and unknown native paths receive a 404.

### Deploy on Replit

Click **Publish** in the Replit interface. The platform runs the build script, starts `serve.js`, applies TLS, and makes the app available at your `.replit.app` domain.

---

## Offline-First Design

BeanPath is designed to work with zero connectivity — a hard requirement for field agents in remote DRC territories.

### Storage

All data is written to `AsyncStorage` immediately on the device under the `@beanpath_v3:` namespace:

| Key | Contents |
|---|---|
| `@beanpath_v3:farmers` | Farmer registry |
| `@beanpath_v3:deliveries` | Cherry delivery records |
| `@beanpath_v3:registers` | Cherry registers |
| `@beanpath_v3:reports` | Delivery reports |
| `@beanpath_v3:lots` | Processing lots |
| `@beanpath_v3:stations` | Washing stations |
| `@beanpath:user` | Authenticated session |
| `@beanpath:sync` | Sync state (pending count, last synced, conflicts) |

### Sync State

`SyncContext` tracks:

- `online` — current network availability
- `pendingCount` — records written locally but not yet confirmed by the server
- `conflictCount` — records that have a merge conflict requiring manual resolution
- `lastSyncedAt` — ISO timestamp of the last successful sync
- `syncing` — whether a sync is in progress

The `SyncChip` component renders this state as a persistent status indicator visible on every screen. Conflicts are surfaced in the `/(console)/reconciliation` screen.

### Conflict Resolution

When the same record is edited on two devices during an offline period, `SyncContext.markConflict()` increments the conflict counter. Station operators and coop admins (who hold the `conflict.resolve` permission) see the reconciliation screen where they can choose which version to keep.

---

## Localisation

The UI is primarily in **French**, matching the working language of DRC cooperatives. A language switcher in the navigation bar supports:

| Code | Language |
|---|---|
| `fr` | Français (default) |
| `en` | English |
| `sw` | Kiswahili |

All user-visible strings on the landing page and auth screens are in French. In-app labels follow the same convention. The `ROLE_LABELS` map in `lib/rbac.ts` provides French display names for all roles.

---

## Demo Data

The app ships with a realistic seed dataset drawn from actual TCC cooperative records:

- **20 farmers** across 5 villages in the Kabare territory (Bushumba and Luhihi groupements): Cinjava, Muganzo, Itara, Kahisa, Camuhozi, Izimero.
- **2 washing stations**: Station KAHISA (TCC) and Station NAKEZA (NAKEZA SARL).
- **Delivery records** from the week of 14–20 July 2024 matching real cherry register and delivery report numbers from the KAHISA Excel log (Rapports 5251, 5252, 5253 / Registres 14002, 14003, 14652, 14801–14803, 14807).
- **10 demo accounts**, one per role, with real Congolese names and matching organisations:

| Role | Demo User | Organisation |
|---|---|---|
| `field_agent` | Bulonza MUDUMBI | TCC — Tounga wa Café Congo |
| `lead_farmer` | Shamavu MIRUHO | TCC — Tounga wa Café Congo |
| `station_operator` | Jean-Baptiste KABILA | Station de lavage KAHISA |
| `transporter` | Serge MUHINDO | Transport Kivu SARL |
| `mill_operator` | Alexis NGOIE | Moulin de Bukavu SARL |
| `qc_grader` | Dr. Marie LUKUSA | Coffee Quality Institute — DRC |
| `exporter` | Patrick MWAMBA | Great Lakes Export DRC |
| `buyer` | Lars ERIKSEN | Nordic Roasters AS |
| `coop_admin` | Bishops KAJEREGE | NAKEZA SARL |
| `certifier` | Sophie MÜLLER | FLO-CERT GmbH |

To sign in as any persona, tap **Commencer maintenant** on the landing page, select a role, and enter any phone number or email — authentication is simulated in the demo build.

---

## Design System

Colours are defined in `artifacts/beanpath/constants/colors.ts` using a **Stone & Amber** palette that reflects the earthy tones of coffee farming.

| Token | Value | Usage |
|---|---|---|
| `tint` | `#b45309` | Primary amber — CTAs, active states, highlights |
| `accent` | `#15803d` | Green — success, sync confirmed, certifications |
| `background` | `#fafaf9` | Stone-50 — main app background |
| `text` | `#1c1917` | Stone-900 — primary body text |
| `textSecondary` | `#78716c` | Stone-500 — labels, metadata |
| `border` | `#e7e5e4` | Stone-200 — card borders, dividers |
| `card` | `#ffffff` | White — elevated card surfaces |
| `danger` | `#b91c1c` | Red-700 — errors, destructive actions |
| `greenLight` | `#dcfce7` | Green-100 — success pill backgrounds |
| `amberLight` | `#fef3c7` | Amber-100 — warning pill backgrounds |

Landing page dark gradient: `#080f06 → #0d1a0a → #091520`

### Component Conventions

- All shared components live in `artifacts/beanpath/components/`.
- Components accept standard `style` prop overrides where applicable.
- `PrimaryButton` is the canonical CTA component — amber fill, Stone-900 text on light, white text on dark.
- `EmptyState` renders an icon + heading + sub-text for empty list states.
- `StageTag` renders a coloured pill for a `LotStage` value.
- `CertBadge` renders Fair Trade / Organic / Rainforest Alliance badges.
- `SyncChip` reads from `SyncContext` and is always visible in the nav header.

---

## Contributing

1. **Branch from main** — create a feature branch with a descriptive name.
2. **One concern per PR** — keep changes focused; avoid mixing feature work with refactors.
3. **No `console.log` in server code** — use `req.log` in route handlers and the `logger` singleton elsewhere.
4. **Contract first** — any new API endpoint starts with an update to `lib/api-spec/openapi.yaml`, followed by `codegen`.
5. **Type everything** — the project uses `strict` TypeScript across all packages. No `any` unless absolutely necessary and commented.
6. **Test offline** — before marking a data-writing feature complete, verify it works with the device in airplane mode and syncs correctly on reconnect.
7. **French first** — all user-visible strings should default to French to match the primary user base.

---

*BeanPath is built on Replit. The monorepo is managed with pnpm workspaces. Expo SDK 54 targets iOS 16+, Android 10+, and modern browsers via React Native Web.*
