import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CherryDelivery } from "./DataContext";

const DELIVERIES_KEY = "@beanpath_v3:deliveries";

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
    pendingCount: 0,
    conflictCount: 0,
    lastSyncedAt: null,
    syncing: false,
    offlineSinceMs: null,
  });
  const offlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SYNC_KEY).then((raw) => {
      if (raw) {
        const saved = JSON.parse(raw);
        setState((s) => ({ ...s, ...saved }));
      } else {
        // Count unsynced deliveries for the initial pending badge
        AsyncStorage.getItem(DELIVERIES_KEY).then((dRaw) => {
          if (dRaw) {
            const deliveries: CherryDelivery[] = JSON.parse(dRaw);
            const pending = deliveries.filter((d) => !d.synced).length;
            setState((s) => ({ ...s, pendingCount: pending }));
          }
        });
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

    try {
      const raw = await AsyncStorage.getItem(DELIVERIES_KEY);
      const deliveries: CherryDelivery[] = raw ? JSON.parse(raw) : [];
      const pending = deliveries.filter((d) => !d.synced);

      if (pending.length > 0) {
        const rows = pending.map((d) => ({
          id: d.id,
          farmer_id: d.farmerId,
          farmer_name: d.farmerName,
          farmer_bio_id: d.farmerBioId,
          station_id: d.stationId,
          station_name: d.stationName,
          groupement: d.groupement,
          village: d.village,
          purchase_date: d.purchaseDate,
          reception_date: d.receptionDate,
          receipt_no: d.receiptNo,
          cherry_register_no: d.cherryRegisterNo,
          delivery_report_no: d.deliveryReportNo,
          quantity_bidons: d.quantityBidons,
          price_per_bidon_fc: d.pricePerBidonFC,
          total_fc: d.totalFC,
          exchange_rate_fc_usd: d.exchangeRateFC_USD,
          payment_method: d.paymentMethod,
          notes: d.notes,
          synced: true,
          recorded_at: d.recordedAt,
        }));

        const { error } = await supabase
          .from("cherry_deliveries")
          .upsert(rows, { onConflict: "id" });

        if (!error) {
          const synced = deliveries.map((d) => ({ ...d, synced: true }));
          await AsyncStorage.setItem(DELIVERIES_KEY, JSON.stringify(synced));
        }
      }

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
    } catch {
      setState((s) => ({ ...s, syncing: false }));
    }
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
