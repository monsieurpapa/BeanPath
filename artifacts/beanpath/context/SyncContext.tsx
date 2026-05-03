import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

type SyncState = {
  online: boolean;
  pendingCount: number;
  conflictCount: number;
  lastSyncedAt: string | null;
  syncing: boolean;
  offlineSinceMs: number | null;
};

type SyncContextType = SyncState & {
  addPending: (n?: number) => void;
  markConflict: () => void;
  resolveConflict: () => void;
  triggerSync: () => Promise<void>;
};

const SyncContext = createContext<SyncContextType | null>(null);

const SYNC_KEY = "@beanpath:sync";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SyncState>({
    online: true,
    pendingCount: 3,
    conflictCount: 1,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    syncing: false,
    offlineSinceMs: null,
  });
  const offlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SYNC_KEY).then((raw) => {
      if (raw) {
        const saved = JSON.parse(raw);
        setState((s) => ({ ...s, ...saved }));
      }
    });
  }, []);

  const persist = (s: SyncState) => {
    AsyncStorage.setItem(
      SYNC_KEY,
      JSON.stringify({ pendingCount: s.pendingCount, conflictCount: s.conflictCount, lastSyncedAt: s.lastSyncedAt })
    );
  };

  const addPending = useCallback((n = 1) => {
    setState((s) => {
      const next = { ...s, pendingCount: s.pendingCount + n };
      persist(next);
      return next;
    });
  }, []);

  const markConflict = useCallback(() => {
    setState((s) => {
      const next = { ...s, conflictCount: s.conflictCount + 1 };
      persist(next);
      return next;
    });
  }, []);

  const resolveConflict = useCallback(() => {
    setState((s) => {
      const next = { ...s, conflictCount: Math.max(0, s.conflictCount - 1) };
      persist(next);
      return next;
    });
  }, []);

  const triggerSync = useCallback(async () => {
    if (state.syncing || !state.online) return;
    setState((s) => ({ ...s, syncing: true }));
    await new Promise((r) => setTimeout(r, 1500));
    setState((s) => {
      const next = {
        ...s,
        syncing: false,
        pendingCount: 0,
        lastSyncedAt: new Date().toISOString(),
      };
      persist(next);
      return next;
    });
  }, [state.syncing, state.online]);

  const ctx: SyncContextType = {
    ...state,
    addPending,
    markConflict,
    resolveConflict,
    triggerSync,
  };

  return <SyncContext.Provider value={ctx}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used inside SyncProvider");
  return ctx;
}
