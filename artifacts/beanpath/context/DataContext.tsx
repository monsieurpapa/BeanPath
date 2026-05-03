import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// ─── Administrative ──────────────────────────────────────────────────────────

export type Station = {
  id: string;
  name: string;
  territoire: string;
  groupement: string;
  coopId: string;
};

// ─── Farmer ──────────────────────────────────────────────────────────────────

export type GroupRole = "president" | "vp" | "secretary" | "member";

export type Farmer = {
  id: string;
  bioId: string;           // e.g. "TCC BMB 009" — cooperative bio/organic cert ID
  firstName: string;
  lastName: string;
  phone?: string;
  age?: number;
  gender: "M" | "F" | "Other";
  territoire: string;      // territory, e.g. "Kabare" or "Kiboga"
  groupement: string;      // administrative groupement, e.g. "Bushumba"
  village: string;         // e.g. "Cinjava"
  stationId: string;       // default delivery washing station
  coopId: string;
  nbPieds: number;         // number of coffee/cocoa trees (pieds)
  groupRole?: GroupRole;   // leadership role within groupement
  crop: "coffee" | "cocoa" | "both";
  registeredAt: string;
};

// ─── Cherry Delivery (replaces Collection) ───────────────────────────────────
// Mirrors the "Formulaire de registre des cerises" exactly

export type CherryDelivery = {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerBioId: string;         // TCC Bio code
  stationId: string;
  stationName: string;
  groupement: string;
  village: string;
  purchaseDate: string;        // date achat (at farm gate)
  receptionDate: string;       // date de reception a la station
  receiptNo: string;           // No de recu de paiement
  cherryRegisterNo: string;    // No du registres de cerises (groups same-day deliveries)
  deliveryReportNo: string;    // No du rapport de livraison (weekly grouping)
  quantityBidons: number;      // quantité cerise delivrée (in 5L bidons)
  pricePerBidonFC: number;     // prix de base FC/bidon
  totalFC: number;             // prix total en FC
  exchangeRateFC_USD: number;  // taux de change FC/USD
  paymentMethod: "cash" | "mobile_money" | "bank";
  notes?: string;
  synced: boolean;
  recordedAt: string;
};

// ─── Cherry Register (registre de cerises) ───────────────────────────────────
// Groups deliveries from one area on one day

export type CherryRegister = {
  id: string;
  registerNo: string;       // No du registres de cerises
  stationId: string;
  deliveryReportNo: string;
  date: string;
  groupement: string;
  totalBidons: number;
  totalFC: number;
  deliveryIds: string[];
};

// ─── Delivery Report (rapport de livraison) ──────────────────────────────────
// Groups registers for a period/transport event

export type DeliveryReport = {
  id: string;
  reportNo: string;         // No du rapport de livraison
  stationId: string;
  dateFrom: string;
  dateTo: string;
  totalBidons: number;
  totalFC: number;
  registerNos: string[];
};

// ─── Lot ─────────────────────────────────────────────────────────────────────
// Exists after cherries arrive at station and processing begins

export type LotStage =
  | "cherry_received"  // cherries received, awaiting pulping
  | "pulping"          // dépulpage en cours
  | "fermenting"       // fermentation (12–48h)
  | "washing"          // lavage
  | "drying"           // séchage sur tables (raised beds)
  | "dry_parchment"    // parche sèche prête
  | "hulling"          // déparcheminé au décortiqueur
  | "graded"           // trié et classé
  | "bagged"           // ensaché pour export
  | "in_transit"       // en transit
  | "shipped"          // exporté
  | "closed";          // fermé / archivé

export type Lot = {
  id: string;
  ref: string;             // e.g. LOT-2024-0041
  crop: "coffee" | "cocoa";
  stage: LotStage;
  weightKg: number;        // weight in kg (converted from bidons after station weighing)
  bidonCount: number;      // total bidons received into this lot
  farmerCount: number;
  harvestSeason: string;
  certifications: string[];
  openedAt: string;
  currentOrgId: string;
  stationId: string;
  sourceRegisterNos: string[]; // which cherry registers went into this lot
  cupScore?: number;
  processingMethod?: "washed" | "natural" | "honey";
};

// ─── AsyncStorage keys ───────────────────────────────────────────────────────

const FARMERS_KEY       = "@beanpath_v2:farmers";
const DELIVERIES_KEY    = "@beanpath_v2:deliveries";
const REGISTERS_KEY     = "@beanpath_v2:registers";
const REPORTS_KEY       = "@beanpath_v2:reports";
const LOTS_KEY          = "@beanpath_v2:lots";
const STATIONS_KEY      = "@beanpath_v2:stations";

// ─── Seed data (based on real TCC / NAKEZA data from DRC) ────────────────────

export const SEED_STATIONS: Station[] = [
  { id: "st_kahisa", name: "Station KAHISA", territoire: "Kabare", groupement: "Bushumba", coopId: "coop_tcc" },
  { id: "st_nakeza", name: "Station NAKEZA", territoire: "Kabare", groupement: "Luhihi", coopId: "coop_nakeza" },
];

export const SEED_FARMERS: Farmer[] = [
  { id: "f1", bioId: "TCC BMB 009", firstName: "Bulonza", lastName: "MUDUMBI", gender: "M", age: 48, territoire: "Kabare", groupement: "Bushumba", village: "Cinjava", stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 420, groupRole: "member", crop: "coffee", phone: "+243 970 123 456", registeredAt: "2023-01-15T08:00:00.000Z" },
  { id: "f2", bioId: "TCC BMB 010", firstName: "Migambo", lastName: "LEONARD", gender: "M", age: 52, territoire: "Kabare", groupement: "Bushumba", village: "Cinjava", stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 310, groupRole: "member", crop: "coffee", phone: "+243 970 234 567", registeredAt: "2023-01-15T08:00:00.000Z" },
  { id: "f3", bioId: "TCC BNC 006", firstName: "Buroko", lastName: "BASHWIRA", gender: "M", age: 39, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo", stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 580, groupRole: "secretary", crop: "coffee", phone: "+243 970 345 678", registeredAt: "2023-02-01T08:00:00.000Z" },
  { id: "f4", bioId: "TCC BKR 006", firstName: "Shamavu", lastName: "MIRUHO", gender: "M", age: 44, territoire: "Kabare", groupement: "Bushumba", village: "Kahisa", stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 890, groupRole: "president", crop: "coffee", phone: "+243 970 456 789", registeredAt: "2023-02-10T08:00:00.000Z" },
  { id: "f5", bioId: "TCC BIR 009", firstName: "Bahiga", lastName: "CHIZA", gender: "F", age: 35, territoire: "Kabare", groupement: "Bushumba", village: "Itara", stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 260, groupRole: "member", crop: "coffee", phone: "+243 970 567 890", registeredAt: "2023-03-01T08:00:00.000Z" },
  { id: "f6", bioId: "NKZ LHI 023", firstName: "Bishweka", lastName: "MUHIMBO", gender: "M", age: 59, territoire: "Kabare", groupement: "Luhihi", village: "Izimero", stationId: "st_nakeza", coopId: "coop_nakeza", nbPieds: 1345, groupRole: "president", crop: "coffee", phone: "+243 974 855 943", registeredAt: "2023-04-01T08:00:00.000Z" },
  { id: "f7", bioId: "NKZ LHI 024", firstName: "Dembasi", lastName: "KAJEREGE", gender: "M", age: 66, territoire: "Kabare", groupement: "Luhihi", village: "Izimero", stationId: "st_nakeza", coopId: "coop_nakeza", nbPieds: 1200, groupRole: "secretary", crop: "coffee", phone: "", registeredAt: "2023-04-01T08:00:00.000Z" },
];

export const SEED_DELIVERIES: CherryDelivery[] = [
  { id: "d1", farmerId: "f1", farmerName: "Bulonza MUDUMBI", farmerBioId: "TCC BMB 009", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava", purchaseDate: "2024-07-14", receptionDate: "2024-07-14", receiptNo: "8957", cherryRegisterNo: "14002", deliveryReportNo: "5251", quantityBidons: 56, pricePerBidonFC: 1000, totalFC: 56000, exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true, recordedAt: "2024-07-14T08:14:00.000Z" },
  { id: "d2", farmerId: "f2", farmerName: "Migambo LEONARD", farmerBioId: "TCC BMB 010", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava", purchaseDate: "2024-07-14", receptionDate: "2024-07-14", receiptNo: "8958", cherryRegisterNo: "14002", deliveryReportNo: "5251", quantityBidons: 39, pricePerBidonFC: 1000, totalFC: 39000, exchangeRateFC_USD: 2700, paymentMethod: "cash", synced: true, recordedAt: "2024-07-14T08:22:00.000Z" },
  { id: "d3", farmerId: "f3", farmerName: "Buroko BASHWIRA", farmerBioId: "TCC BNC 006", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo", purchaseDate: "2024-07-17", receptionDate: "2024-07-17", receiptNo: "8661", cherryRegisterNo: "14805", deliveryReportNo: "5252", quantityBidons: 13, pricePerBidonFC: 700, totalFC: 9100, exchangeRateFC_USD: 2700, paymentMethod: "cash", synced: true, recordedAt: "2024-07-17T09:00:00.000Z" },
  { id: "d4", farmerId: "f4", farmerName: "Shamavu MIRUHO", farmerBioId: "TCC BKR 006", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Kahisa", purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8476", cherryRegisterNo: "14459", deliveryReportNo: "5253", quantityBidons: 20, pricePerBidonFC: 1000, totalFC: 20000, exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true, recordedAt: "2024-07-19T10:30:00.000Z" },
  { id: "d5", farmerId: "f5", farmerName: "Bahiga CHIZA", farmerBioId: "TCC BIR 009", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Itara", purchaseDate: "2024-07-17", receptionDate: "2024-07-17", receiptNo: "7902", cherryRegisterNo: "14652", deliveryReportNo: "5252", quantityBidons: 86, pricePerBidonFC: 900, totalFC: 77400, exchangeRateFC_USD: 2700, paymentMethod: "cash", synced: false, recordedAt: "2024-07-17T11:00:00.000Z" },
  { id: "d6", farmerId: "f3", farmerName: "Buroko BASHWIRA", farmerBioId: "TCC BNC 006", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava", purchaseDate: "2024-07-20", receptionDate: "2024-07-20", receiptNo: "8969", cherryRegisterNo: "14006", deliveryReportNo: "5253", quantityBidons: 43, pricePerBidonFC: 1000, totalFC: 43000, exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: false, recordedAt: "2024-07-20T08:45:00.000Z" },
];

export const SEED_REGISTERS: CherryRegister[] = [
  { id: "r1", registerNo: "14002", stationId: "st_kahisa", deliveryReportNo: "5251", date: "2024-07-14", groupement: "Bushumba", totalBidons: 95, totalFC: 95000, deliveryIds: ["d1", "d2"] },
  { id: "r2", registerNo: "14805", stationId: "st_kahisa", deliveryReportNo: "5252", date: "2024-07-17", groupement: "Bushumba", totalBidons: 13, totalFC: 9100, deliveryIds: ["d3"] },
  { id: "r3", registerNo: "14652", stationId: "st_kahisa", deliveryReportNo: "5252", date: "2024-07-17", groupement: "Bushumba", totalBidons: 86, totalFC: 77400, deliveryIds: ["d5"] },
  { id: "r4", registerNo: "14459", stationId: "st_kahisa", deliveryReportNo: "5253", date: "2024-07-19", groupement: "Bushumba", totalBidons: 20, totalFC: 20000, deliveryIds: ["d4"] },
  { id: "r5", registerNo: "14006", stationId: "st_kahisa", deliveryReportNo: "5253", date: "2024-07-20", groupement: "Bushumba", totalBidons: 43, totalFC: 43000, deliveryIds: ["d6"] },
];

export const SEED_REPORTS: DeliveryReport[] = [
  { id: "rp1", reportNo: "5251", stationId: "st_kahisa", dateFrom: "2024-07-14", dateTo: "2024-07-14", totalBidons: 95, totalFC: 95000, registerNos: ["14002"] },
  { id: "rp2", reportNo: "5252", stationId: "st_kahisa", dateFrom: "2024-07-16", dateTo: "2024-07-17", totalBidons: 99, totalFC: 86500, registerNos: ["14805", "14652"] },
  { id: "rp3", reportNo: "5253", stationId: "st_kahisa", dateFrom: "2024-07-19", dateTo: "2024-07-20", totalBidons: 63, totalFC: 63000, registerNos: ["14459", "14006"] },
];

export const SEED_LOTS: Lot[] = [
  { id: "lot1", ref: "LOT-2024-0041", crop: "coffee", stage: "fermenting", weightKg: 420, bidonCount: 95, farmerCount: 12, harvestSeason: "2024A", certifications: ["fair_trade", "organic_eu"], openedAt: "2024-07-14T14:00:00.000Z", currentOrgId: "st_kahisa", stationId: "st_kahisa", sourceRegisterNos: ["14002"], processingMethod: "washed" },
  { id: "lot2", ref: "LOT-2024-0039", crop: "coffee", stage: "drying", weightKg: 310, bidonCount: 99, farmerCount: 8, harvestSeason: "2024A", certifications: ["rainforest_alliance"], openedAt: "2024-07-10T14:00:00.000Z", currentOrgId: "st_kahisa", stationId: "st_kahisa", sourceRegisterNos: ["14801", "14802"], processingMethod: "washed" },
  { id: "lot3", ref: "LOT-2024-0035", crop: "coffee", stage: "dry_parchment", weightKg: 580, bidonCount: 210, farmerCount: 18, harvestSeason: "2024A", certifications: ["fair_trade"], openedAt: "2024-07-01T00:00:00.000Z", currentOrgId: "st_kahisa", stationId: "st_kahisa", sourceRegisterNos: ["14651", "14652", "14653"], processingMethod: "washed" },
  { id: "lot4", ref: "LOT-2024-0028", crop: "coffee", stage: "in_transit", weightKg: 840, bidonCount: 380, farmerCount: 31, harvestSeason: "2024A", certifications: ["eudr", "rainforest_alliance"], openedAt: "2024-06-20T00:00:00.000Z", currentOrgId: "coop_transport", stationId: "st_kahisa", sourceRegisterNos: ["13870", "13871", "13872"], processingMethod: "washed" },
  { id: "lot5", ref: "LOT-2024-0015", crop: "coffee", stage: "graded", weightKg: 980, bidonCount: 420, farmerCount: 14, harvestSeason: "2024A", certifications: ["fair_trade", "organic_eu", "eudr"], openedAt: "2024-05-15T00:00:00.000Z", currentOrgId: "coop_exporter", stationId: "st_nakeza", sourceRegisterNos: ["12100", "12101"], processingMethod: "washed", cupScore: 86.5 },
];

// ─── Context ─────────────────────────────────────────────────────────────────

type DataContextType = {
  stations: Station[];
  farmers: Farmer[];
  deliveries: CherryDelivery[];
  registers: CherryRegister[];
  reports: DeliveryReport[];
  lots: Lot[];
  addFarmer: (f: Omit<Farmer, "id" | "registeredAt">) => Promise<Farmer>;
  addDelivery: (d: Omit<CherryDelivery, "id">) => Promise<CherryDelivery>;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [deliveries, setDeliveries] = useState<CherryDelivery[]>([]);
  const [registers, setRegisters] = useState<CherryRegister[]>([]);
  const [reports, setReports] = useState<DeliveryReport[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);

  const load = useCallback(async () => {
    const [stRaw, fRaw, dRaw, rRaw, rpRaw, lRaw] = await Promise.all([
      AsyncStorage.getItem(STATIONS_KEY),
      AsyncStorage.getItem(FARMERS_KEY),
      AsyncStorage.getItem(DELIVERIES_KEY),
      AsyncStorage.getItem(REGISTERS_KEY),
      AsyncStorage.getItem(REPORTS_KEY),
      AsyncStorage.getItem(LOTS_KEY),
    ]);
    setStations(stRaw ? JSON.parse(stRaw) : SEED_STATIONS);
    setFarmers(fRaw ? JSON.parse(fRaw) : SEED_FARMERS);
    setDeliveries(dRaw ? JSON.parse(dRaw) : SEED_DELIVERIES);
    setRegisters(rRaw ? JSON.parse(rRaw) : SEED_REGISTERS);
    setReports(rpRaw ? JSON.parse(rpRaw) : SEED_REPORTS);
    setLots(lRaw ? JSON.parse(lRaw) : SEED_LOTS);
    if (!stRaw) AsyncStorage.setItem(STATIONS_KEY, JSON.stringify(SEED_STATIONS));
    if (!fRaw)  AsyncStorage.setItem(FARMERS_KEY, JSON.stringify(SEED_FARMERS));
    if (!dRaw)  AsyncStorage.setItem(DELIVERIES_KEY, JSON.stringify(SEED_DELIVERIES));
    if (!rRaw)  AsyncStorage.setItem(REGISTERS_KEY, JSON.stringify(SEED_REGISTERS));
    if (!rpRaw) AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(SEED_REPORTS));
    if (!lRaw)  AsyncStorage.setItem(LOTS_KEY, JSON.stringify(SEED_LOTS));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addFarmer = useCallback(async (f: Omit<Farmer, "id" | "registeredAt">) => {
    const next: Farmer = { ...f, id: "f" + Date.now(), registeredAt: new Date().toISOString() };
    setFarmers((prev) => {
      const updated = [next, ...prev];
      AsyncStorage.setItem(FARMERS_KEY, JSON.stringify(updated));
      return updated;
    });
    return next;
  }, []);

  const addDelivery = useCallback(async (d: Omit<CherryDelivery, "id">) => {
    const next: CherryDelivery = { ...d, id: "d" + Date.now() };
    setDeliveries((prev) => {
      const updated = [next, ...prev];
      AsyncStorage.setItem(DELIVERIES_KEY, JSON.stringify(updated));
      return updated;
    });
    return next;
  }, []);

  return (
    <DataContext.Provider value={{ stations, farmers, deliveries, registers, reports, lots, addFarmer, addDelivery, refreshData: load }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
