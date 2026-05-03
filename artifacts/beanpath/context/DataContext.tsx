import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Farmer = {
  id: string;
  householdCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  village: string;
  district: string;
  country: string;
  gender: "M" | "F" | "Other";
  coopId: string;
  registeredAt: string;
  plotCount: number;
};

export type LotStage =
  | "cherry"
  | "wet_parchment"
  | "drying"
  | "dry_parchment"
  | "green"
  | "in_transit"
  | "shipped"
  | "closed";

export type Lot = {
  id: string;
  ref: string;
  crop: "coffee" | "cocoa";
  stage: LotStage;
  weightGrams: number;
  farmerCount: number;
  harvestSeason: string;
  certifications: string[];
  openedAt: string;
  currentOrgId: string;
};

export type Collection = {
  id: string;
  farmerId: string;
  farmerName: string;
  lotId: string;
  weightGrams: number;
  pricePerKgMinor: number;
  currency: string;
  paymentMethod: "cash" | "mobile_money";
  recordedAt: string;
  synced: boolean;
};

const FARMERS_KEY = "@beanpath:farmers";
const LOTS_KEY = "@beanpath:lots";
const COLLECTIONS_KEY = "@beanpath:collections";

const SEED_FARMERS: Farmer[] = [
  { id: "f1", householdCode: "BKM-001", firstName: "Amara", lastName: "Kone", phone: "+256701234567", village: "Bukomero", district: "Kiboga", country: "UG", gender: "M", coopId: "coop_1", registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), plotCount: 3 },
  { id: "f2", householdCode: "BKM-002", firstName: "Fatima", lastName: "Nzeyimana", phone: "+256702345678", village: "Bukomero", district: "Kiboga", country: "UG", gender: "F", coopId: "coop_1", registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), plotCount: 2 },
  { id: "f3", householdCode: "BKM-003", firstName: "Jean-Claude", lastName: "Habimana", phone: "+256703456789", village: "Kyampisi", district: "Kiboga", country: "UG", gender: "M", coopId: "coop_1", registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), plotCount: 1 },
  { id: "f4", householdCode: "BKM-004", firstName: "Grace", lastName: "Atim", phone: "+256704567890", village: "Bukomero", district: "Kiboga", country: "UG", gender: "F", coopId: "coop_1", registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), plotCount: 2 },
  { id: "f5", householdCode: "BKM-005", firstName: "Samuel", lastName: "Okello", phone: "+256705678901", village: "Nalutuntu", district: "Kiboga", country: "UG", gender: "M", coopId: "coop_1", registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), plotCount: 4 },
];

const SEED_LOTS: Lot[] = [
  { id: "lot1", ref: "LOT-2024-0041", crop: "coffee", stage: "wet_parchment", weightGrams: 840000, farmerCount: 12, harvestSeason: "2024A", certifications: ["fair_trade", "organic_eu"], openedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), currentOrgId: "org_washing" },
  { id: "lot2", ref: "LOT-2024-0039", crop: "coffee", stage: "drying", weightGrams: 620000, farmerCount: 8, harvestSeason: "2024A", certifications: ["rainforest_alliance"], openedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), currentOrgId: "org_washing" },
  { id: "lot3", ref: "LOT-2024-0035", crop: "coffee", stage: "dry_parchment", weightGrams: 1100000, farmerCount: 18, harvestSeason: "2024A", certifications: ["fair_trade"], openedAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(), currentOrgId: "org_mill" },
  { id: "lot4", ref: "LOT-2024-0028", crop: "cocoa", stage: "in_transit", weightGrams: 2200000, farmerCount: 31, harvestSeason: "2024A", certifications: ["eudr", "rainforest_alliance"], openedAt: new Date(Date.now() - 1000 * 60 * 60 * 360).toISOString(), currentOrgId: "org_transport" },
  { id: "lot5", ref: "LOT-2024-0015", crop: "coffee", stage: "green", weightGrams: 980000, farmerCount: 14, harvestSeason: "2024A", certifications: ["fair_trade", "organic_eu", "eudr"], openedAt: new Date(Date.now() - 1000 * 60 * 60 * 500).toISOString(), currentOrgId: "org_exporter" },
];

const SEED_COLLECTIONS: Collection[] = [
  { id: "c1", farmerId: "f1", farmerName: "Amara Kone", lotId: "lot1", weightGrams: 52000, pricePerKgMinor: 1850, currency: "UGX", paymentMethod: "mobile_money", recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), synced: true },
  { id: "c2", farmerId: "f2", farmerName: "Fatima Nzeyimana", lotId: "lot1", weightGrams: 38000, pricePerKgMinor: 1850, currency: "UGX", paymentMethod: "cash", recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), synced: true },
  { id: "c3", farmerId: "f3", farmerName: "Jean-Claude Habimana", lotId: "lot1", weightGrams: 61000, pricePerKgMinor: 1850, currency: "UGX", paymentMethod: "mobile_money", recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), synced: false },
  { id: "c4", farmerId: "f4", farmerName: "Grace Atim", lotId: "lot1", weightGrams: 29000, pricePerKgMinor: 1850, currency: "UGX", paymentMethod: "cash", recordedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), synced: false },
];

type DataContextType = {
  farmers: Farmer[];
  lots: Lot[];
  collections: Collection[];
  addFarmer: (f: Omit<Farmer, "id" | "registeredAt">) => Promise<void>;
  addCollection: (c: Omit<Collection, "id">) => Promise<void>;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const load = useCallback(async () => {
    const [fRaw, lRaw, cRaw] = await Promise.all([
      AsyncStorage.getItem(FARMERS_KEY),
      AsyncStorage.getItem(LOTS_KEY),
      AsyncStorage.getItem(COLLECTIONS_KEY),
    ]);
    if (!fRaw) {
      setFarmers(SEED_FARMERS);
      await AsyncStorage.setItem(FARMERS_KEY, JSON.stringify(SEED_FARMERS));
    } else {
      setFarmers(JSON.parse(fRaw));
    }
    if (!lRaw) {
      setLots(SEED_LOTS);
      await AsyncStorage.setItem(LOTS_KEY, JSON.stringify(SEED_LOTS));
    } else {
      setLots(JSON.parse(lRaw));
    }
    if (!cRaw) {
      setCollections(SEED_COLLECTIONS);
      await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(SEED_COLLECTIONS));
    } else {
      setCollections(JSON.parse(cRaw));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addFarmer = useCallback(async (f: Omit<Farmer, "id" | "registeredAt">) => {
    const next: Farmer = { ...f, id: "f" + Date.now(), registeredAt: new Date().toISOString() };
    setFarmers((prev) => {
      const updated = [next, ...prev];
      AsyncStorage.setItem(FARMERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCollection = useCallback(async (c: Omit<Collection, "id">) => {
    const next: Collection = { ...c, id: "c" + Date.now() };
    setCollections((prev) => {
      const updated = [next, ...prev];
      AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <DataContext.Provider value={{ farmers, lots, collections, addFarmer, addCollection, refreshData: load }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
