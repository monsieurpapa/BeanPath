# Changelog

All notable changes to BeanPath are documented here.

## [0.1.0.0] - 2026-05-07

### Added
- **Demo access from welcome page** — visitors can now try BeanPath without signing up. A new "Essayer la démo" button on the landing page leads to a role picker (Field Agent, Coop Admin, Buyer) that logs in instantly with realistic mock data.
- **`loginAsDemo(role)` in AuthContext** — credential-free session creation for demo use; sessions auto-expire after 2 hours and are tagged with `isDemo: true` so they are distinguishable from real accounts.
- **Demo safety guards** — double-tap race prevented via `useRef` flag; async errors reset loading state instead of freezing the UI; corrupted AsyncStorage sessions are cleared on startup rather than crashing the app.

### Changed
- **Lots tab now navigable** — tapping any lot card in the field agent's Lots tab opens the full lot dossier (previously the cards were non-interactive).
- **Recent deliveries are tappable** — tapping a delivery row on the Today screen navigates to that farmer's profile.
- **EUDR "DDS PDF" button is no longer dead** — tapping it shows an info toast explaining availability timeline.
- **Lot reference is now copyable** — tapping the lot ref in the dossier copies it to clipboard (web) or displays it in a toast (native).
- **Reconciliation resolution buttons translated to French** — "Garder le mien", "Garder le leur", "Fusionner" with a success toast on resolution.
- **Profile screen (Me) fully in French** — all section titles, labels, status values, and the sign-out alert are now in French. Sign-out on web uses an inline confirmation card instead of `window.confirm` (which is blocked in some environments).
- **Language change and sync now show feedback toasts** — selecting a language or tapping "Synchroniser maintenant" triggers a success or error toast.

### Fixed
- `handleSync` in the profile screen unconditionally showed a success toast even when sync failed — now shows an error toast on failure.
- `window.confirm` for sign-out was silently blocked in Replit iframes and certain mobile browsers, making the sign-out button appear broken.
- `clipboard.writeText` was not awaited, causing a false-positive "copied" toast when the clipboard API was unavailable or denied.
- Corrupted AsyncStorage sessions (bad JSON from a crash) previously left the app in a permanent loading state; they are now cleared and the app continues.
