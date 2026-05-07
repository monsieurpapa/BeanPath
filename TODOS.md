# TODOS

## Auth & Session

### P2 — Native clipboard for lot reference copy
Implement proper clipboard copy on iOS/Android using `expo-clipboard` (`Clipboard.setStringAsync`).
Currently the "Référence copiée" toast shows on native without actually copying anything.

### P3 — Real authentication backend
Replace `loginAsDemo` / `signIn` mock with actual API calls.
User IDs should come from the server, not `Math.random()`.

## Features

### P1 — EUDR DDS PDF export
Implement actual PDF generation for the Due Diligence Statement.
Currently shows an info toast ("disponible prochainement").

### P2 — Test framework
Set up Jest + `@testing-library/react-native`. Priority files:
- `AuthContext.tsx` (loginAsDemo, signIn, session expiry)
- `demo.tsx` (role routing, double-tap guard)
- `me.tsx` (formatAgo branches, handleSync error path)

### P3 — Lot creation from station operator surface
Station operators can currently view lots but not create new ones from the console.

## UX

### P3 — Demo session banner
Show a visible "Mode démo" banner inside the app so users know they're in a demo session.
Could be a dismissible chip in the top nav.

### P4 — Deep link support for iOS/Android Expo Go QR
The iOS and Android Expo Go step cards in the AccessSection have `onPress` that only works on web (`Platform.OS === "web"`). Add `Linking.openURL(IOS_URL)` for native.

## Completed
