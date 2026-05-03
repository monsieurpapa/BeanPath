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
  territoire: string;      // territory, e.g. "Kabare"
  groupement: string;      // administrative groupement, e.g. "Bushumba"
  village: string;         // e.g. "Cinjava"
  stationId: string;       // default delivery washing station
  coopId: string;
  nbPieds: number;         // number of coffee/cocoa trees (pieds)
  groupRole?: GroupRole;
  crop: "coffee" | "cocoa" | "both";
  registeredAt: string;
};

// ─── Cherry Delivery (one transaction — one farmer, one day, one receipt) ────
// Mirrors "Formulaire de registre des cerises" row by row

export type CherryDelivery = {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerBioId: string;
  stationId: string;
  stationName: string;
  groupement: string;
  village: string;
  purchaseDate: string;        // date d'achat — at farm gate / collection point
  receptionDate: string;       // date de réception à la station
  receiptNo: string;           // No de reçu de paiement
  cherryRegisterNo: string;    // No du registre des cerises
  deliveryReportNo: string;    // No du rapport de livraison
  quantityBidons: number;      // quantité cerise livrée (bidons de 5L)
  pricePerBidonFC: number;     // prix de base FC/bidon
  totalFC: number;             // prix total FC
  exchangeRateFC_USD: number;  // taux de change FC/USD
  paymentMethod: "cash" | "mobile_money" | "bank";
  notes?: string;
  synced: boolean;
  recordedAt: string;
};

// ─── Cherry Register ─────────────────────────────────────────────────────────
// Groups deliveries from the same collection area on the same day

export type CherryRegister = {
  id: string;
  registerNo: string;
  stationId: string;
  deliveryReportNo: string;
  date: string;
  groupement: string;
  village?: string;          // primary village for this register
  totalBidons: number;
  totalFC: number;
  deliveryIds: string[];
};

// ─── Delivery Report ─────────────────────────────────────────────────────────
// Weekly or periodic grouping of registers for one transport event

export type DeliveryReport = {
  id: string;
  reportNo: string;
  stationId: string;
  dateFrom: string;
  dateTo: string;
  totalBidons: number;
  totalFC: number;
  registerNos: string[];
};

// ─── Lot ─────────────────────────────────────────────────────────────────────

export type LotStage =
  | "cherry_received"
  | "pulping"
  | "fermenting"
  | "washing"
  | "drying"
  | "dry_parchment"
  | "hulling"
  | "graded"
  | "bagged"
  | "in_transit"
  | "shipped"
  | "closed";

export type Lot = {
  id: string;
  ref: string;
  crop: "coffee" | "cocoa";
  stage: LotStage;
  weightKg: number;
  bidonCount: number;
  farmerCount: number;
  harvestSeason: string;
  certifications: string[];
  openedAt: string;
  currentOrgId: string;
  stationId: string;
  sourceRegisterNos: string[];
  cupScore?: number;
  processingMethod?: "washed" | "natural" | "honey";
};

// ─── AsyncStorage keys (v2 namespace to avoid stale data) ────────────────────

const FARMERS_KEY    = "@beanpath_v3:farmers";
const DELIVERIES_KEY = "@beanpath_v3:deliveries";
const REGISTERS_KEY  = "@beanpath_v3:registers";
const REPORTS_KEY    = "@beanpath_v3:reports";
const LOTS_KEY       = "@beanpath_v3:lots";
const STATIONS_KEY   = "@beanpath_v3:stations";

// ─── Seed stations ────────────────────────────────────────────────────────────

export const SEED_STATIONS: Station[] = [
  { id: "st_kahisa",  name: "Station KAHISA",  territoire: "Kabare", groupement: "Bushumba", coopId: "coop_tcc" },
  { id: "st_nakeza",  name: "Station NAKEZA",  territoire: "Kabare", groupement: "Luhihi",   coopId: "coop_nakeza" },
];

// ─── Seed farmers (20 real names from TCC KAHISA register + NAKEZA roster) ──

export const SEED_FARMERS: Farmer[] = [
  // ── TCC KAHISA — Cinjava village ──
  { id: "f1",  bioId: "TCC BMB 009", firstName: "Bulonza",    lastName: "MUDUMBI",              gender: "M", age: 48, territoire: "Kabare", groupement: "Bushumba", village: "Cinjava",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 380, groupRole: "member",    crop: "coffee", phone: "+243 970 123 456", registeredAt: "2023-01-15T08:00:00.000Z" },
  { id: "f2",  bioId: "TCC BMB 010", firstName: "Migambo",    lastName: "LEONARD",              gender: "M", age: 52, territoire: "Kabare", groupement: "Bushumba", village: "Cinjava",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 290, groupRole: "member",    crop: "coffee", phone: "+243 970 234 567", registeredAt: "2023-01-15T08:00:00.000Z" },
  { id: "f14", bioId: "TCC BMB 016", firstName: "Mateso",     lastName: "MAJEGE",               gender: "M", age: 44, territoire: "Kabare", groupement: "Bushumba", village: "Cinjava",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 430, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-02-10T08:00:00.000Z" },
  // ── TCC KAHISA — Muganzo village ──
  { id: "f8",  bioId: "TCC BKK 005", firstName: "Murhimanya", lastName: "CISENGE",              gender: "M", age: 38, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 185, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-02-01T08:00:00.000Z" },
  { id: "f9",  bioId: "TCC BNC 003", firstName: "Murhula",    lastName: "MAPENDANO",            gender: "M", age: 61, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 840, groupRole: "president", crop: "coffee", phone: "+243 970 444 001", registeredAt: "2023-02-01T08:00:00.000Z" },
  { id: "f10", bioId: "TCC BCR 026", firstName: "Butama",     lastName: "MUKUBIZA",             gender: "M", age: 55, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 310, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-02-05T08:00:00.000Z" },
  { id: "f11", bioId: "TCC BMB 005", firstName: "Buhendwa",   lastName: "BISANGWA",             gender: "M", age: 33, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 120, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-02-10T08:00:00.000Z" },
  { id: "f12", bioId: "TCC BMB 012", firstName: "Matembera",  lastName: "LEOPAUL",              gender: "M", age: 47, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 195, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-02-10T08:00:00.000Z" },
  { id: "f13", bioId: "TCC BMB 001", firstName: "Nsimire",    lastName: "M'RUBANGUKA",          gender: "F", age: 41, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 510, groupRole: "secretary", crop: "coffee", phone: "+243 970 555 012", registeredAt: "2023-01-15T08:00:00.000Z" },
  { id: "f18", bioId: "TCC BMR 003", firstName: "Masirika",   lastName: "MUNOGERA",             gender: "M", age: 58, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 160, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-03-01T08:00:00.000Z" },
  { id: "f19", bioId: "TCC MNT 015", firstName: "Mpakanira",  lastName: "NGENGE DESIRE",        gender: "M", age: 45, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 645, groupRole: "vp",        crop: "coffee", phone: "+243 970 666 123", registeredAt: "2023-03-01T08:00:00.000Z" },
  { id: "f3",  bioId: "TCC BNC 006", firstName: "Buroko",     lastName: "BASHWIRA",             gender: "M", age: 39, territoire: "Kabare", groupement: "Bushumba", village: "Muganzo",   stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 450, groupRole: "member",    crop: "coffee", phone: "+243 970 345 678", registeredAt: "2023-02-01T08:00:00.000Z" },
  // ── TCC KAHISA — Itara village ──
  { id: "f15", bioId: "TCC BIR 011", firstName: "Mudumbi",    lastName: "CIRAGIRA",             gender: "M", age: 50, territoire: "Kabare", groupement: "Bushumba", village: "Itara",     stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 280, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-03-10T08:00:00.000Z" },
  { id: "f5",  bioId: "TCC BIR 009", firstName: "Bahiga",     lastName: "CHIZA",                gender: "F", age: 35, territoire: "Kabare", groupement: "Bushumba", village: "Itara",     stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 220, groupRole: "member",    crop: "coffee", phone: "+243 970 567 890", registeredAt: "2023-03-01T08:00:00.000Z" },
  { id: "f16", bioId: "TCC BIR 010", firstName: "Ntadumba",   lastName: "MUFANZARA GERVAIS",    gender: "M", age: 43, territoire: "Kabare", groupement: "Bushumba", village: "Itara",     stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 320, groupRole: "president", crop: "coffee", phone: "",                registeredAt: "2023-03-10T08:00:00.000Z" },
  // ── TCC KAHISA — Kahisa / Camuhozi ──
  { id: "f4",  bioId: "TCC BKR 006", firstName: "Shamavu",    lastName: "MIRUHO",               gender: "M", age: 44, territoire: "Kabare", groupement: "Bushumba", village: "Kahisa",    stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 780, groupRole: "president", crop: "coffee", phone: "+243 970 456 789", registeredAt: "2023-02-10T08:00:00.000Z" },
  { id: "f20", bioId: "TCC BKR 005", firstName: "Lyadunga",   lastName: "NDASHINGA",            gender: "M", age: 37, territoire: "Kabare", groupement: "Bushumba", village: "Kahisa",    stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 390, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-03-15T08:00:00.000Z" },
  { id: "f17", bioId: "TCC BMB 002", firstName: "Manegabe",   lastName: "DENIS",                gender: "M", age: 49, territoire: "Kabare", groupement: "Bushumba", village: "Camuhozi",  stationId: "st_kahisa", coopId: "coop_tcc", nbPieds: 480, groupRole: "member",    crop: "coffee", phone: "",                registeredAt: "2023-03-20T08:00:00.000Z" },
  // ── NAKEZA SARL — Luhihi Groupement ──
  { id: "f6",  bioId: "NKZ LHI 023", firstName: "Bishweka",   lastName: "MUHIMBO",              gender: "M", age: 59, territoire: "Kabare", groupement: "Luhihi",   village: "Izimero",   stationId: "st_nakeza", coopId: "coop_nakeza", nbPieds: 1345, groupRole: "president", crop: "coffee", phone: "+243 974 855 943", registeredAt: "2023-04-01T08:00:00.000Z" },
  { id: "f7",  bioId: "NKZ LHI 024", firstName: "Dembasi",    lastName: "KAJEREGE",             gender: "M", age: 66, territoire: "Kabare", groupement: "Luhihi",   village: "Izimero",   stationId: "st_nakeza", coopId: "coop_nakeza", nbPieds: 1200, groupRole: "secretary", crop: "coffee", phone: "",                registeredAt: "2023-04-01T08:00:00.000Z" },
];

// ─── Seed deliveries — every row from the KAHISA Excel for July 14-20, 2024 ──

export const SEED_DELIVERIES: CherryDelivery[] = [
  // ── Rapport 5251 · Registre 14002 · Cinjava · 14 juillet 2024 ──
  { id: "d1",  farmerId: "f1",  farmerName: "Bulonza MUDUMBI",         farmerBioId: "TCC BMB 009", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava",   purchaseDate: "2024-07-14", receptionDate: "2024-07-14", receiptNo: "8957", cherryRegisterNo: "14002", deliveryReportNo: "5251", quantityBidons: 56,  pricePerBidonFC: 1000, totalFC: 56000,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-14T08:14:00.000Z" },
  { id: "d2",  farmerId: "f2",  farmerName: "Migambo LEONARD",         farmerBioId: "TCC BMB 010", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava",   purchaseDate: "2024-07-14", receptionDate: "2024-07-14", receiptNo: "8958", cherryRegisterNo: "14002", deliveryReportNo: "5251", quantityBidons: 39,  pricePerBidonFC: 1000, totalFC: 39000,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-14T08:22:00.000Z" },
  // ── Rapport 5252 · Registre 14801 · Muganzo · 16 juillet 2024 ──
  { id: "d3",  farmerId: "f8",  farmerName: "Murhimanya CISENGE",      farmerBioId: "TCC BKK 005", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-16", receptionDate: "2024-07-16", receiptNo: "8650", cherryRegisterNo: "14801", deliveryReportNo: "5252", quantityBidons: 16,  pricePerBidonFC: 700,  totalFC: 11200,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-16T08:00:00.000Z" },
  { id: "d4",  farmerId: "f9",  farmerName: "Murhula MAPENDANO",       farmerBioId: "TCC BNC 003", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-16", receptionDate: "2024-07-16", receiptNo: "8651", cherryRegisterNo: "14801", deliveryReportNo: "5252", quantityBidons: 111, pricePerBidonFC: 700,  totalFC: 77700,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-16T08:30:00.000Z" },
  // ── Rapport 5252 · Registre 14802 · Muganzo · 17 juillet 2024 ──
  { id: "d5",  farmerId: "f10", farmerName: "Butama MUKUBIZA",         farmerBioId: "TCC BCR 026", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-17", receptionDate: "2024-07-17", receiptNo: "8652", cherryRegisterNo: "14802", deliveryReportNo: "5252", quantityBidons: 38,  pricePerBidonFC: 700,  totalFC: 26600,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-17T07:50:00.000Z" },
  { id: "d6",  farmerId: "f11", farmerName: "Buhendwa BISANGWA",       farmerBioId: "TCC BMB 005", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-17", receptionDate: "2024-07-17", receiptNo: "8653", cherryRegisterNo: "14802", deliveryReportNo: "5252", quantityBidons: 13,  pricePerBidonFC: 700,  totalFC: 9100,   exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-17T08:10:00.000Z" },
  // ── Rapport 5252 · Registre 14652 · Itara · 17 juillet 2024 ──
  { id: "d11", farmerId: "f15", farmerName: "Mudumbi CIRAGIRA",        farmerBioId: "TCC BIR 011", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Itara",     purchaseDate: "2024-07-17", receptionDate: "2024-07-17", receiptNo: "7901", cherryRegisterNo: "14652", deliveryReportNo: "5252", quantityBidons: 82,  pricePerBidonFC: 900,  totalFC: 73800,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-17T09:00:00.000Z" },
  { id: "d12", farmerId: "f5",  farmerName: "Bahiga CHIZA",            farmerBioId: "TCC BIR 009", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Itara",     purchaseDate: "2024-07-17", receptionDate: "2024-07-17", receiptNo: "7902", cherryRegisterNo: "14652", deliveryReportNo: "5252", quantityBidons: 86,  pricePerBidonFC: 900,  totalFC: 77400,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-17T09:20:00.000Z" },
  { id: "d13", farmerId: "f16", farmerName: "Ntadumba MUFANZARA G.",   farmerBioId: "TCC BIR 010", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Itara",     purchaseDate: "2024-07-17", receptionDate: "2024-07-17", receiptNo: "7903", cherryRegisterNo: "14652", deliveryReportNo: "5252", quantityBidons: 58,  pricePerBidonFC: 900,  totalFC: 52200,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-17T09:40:00.000Z" },
  // ── Rapport 5252 · Registre 14803 · Muganzo · 18 juillet 2024 ──
  { id: "d7",  farmerId: "f12", farmerName: "Matembera LEOPAUL",       farmerBioId: "TCC BMB 012", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-18", receptionDate: "2024-07-18", receiptNo: "8654", cherryRegisterNo: "14803", deliveryReportNo: "5252", quantityBidons: 21,  pricePerBidonFC: 700,  totalFC: 14700,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-18T07:45:00.000Z" },
  { id: "d8",  farmerId: "f13", farmerName: "Nsimire M'RUBANGUKA",     farmerBioId: "TCC BMB 001", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-18", receptionDate: "2024-07-18", receiptNo: "8656", cherryRegisterNo: "14803", deliveryReportNo: "5252", quantityBidons: 66,  pricePerBidonFC: 700,  totalFC: 46200,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-18T08:05:00.000Z" },
  // ── Rapport 5252 · Registre 14003 · Cinjava · 18 juillet 2024 ──
  { id: "d9",  farmerId: "f14", farmerName: "Mateso MAJEGE",           farmerBioId: "TCC BMB 016", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava",   purchaseDate: "2024-07-18", receptionDate: "2024-07-18", receiptNo: "8959", cherryRegisterNo: "14003", deliveryReportNo: "5252", quantityBidons: 55,  pricePerBidonFC: 1000, totalFC: 55000,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-18T08:30:00.000Z" },
  { id: "d10", farmerId: "f2",  farmerName: "Migambo LEONARD",         farmerBioId: "TCC BMB 010", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava",   purchaseDate: "2024-07-18", receptionDate: "2024-07-18", receiptNo: "8964", cherryRegisterNo: "14003", deliveryReportNo: "5252", quantityBidons: 57,  pricePerBidonFC: 1000, totalFC: 57000,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-18T09:00:00.000Z" },
  // ── Rapport 5253 · Registre 14807 · Muganzo · 19 juillet 2024 ──
  { id: "d14", farmerId: "f19", farmerName: "Mpakanira NGENGE DESIRE", farmerBioId: "TCC MNT 015", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8675", cherryRegisterNo: "14807", deliveryReportNo: "5253", quantityBidons: 81,  pricePerBidonFC: 900,  totalFC: 72900,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-19T08:00:00.000Z" },
  { id: "d15", farmerId: "f4",  farmerName: "Shamavu MIRUHO",          farmerBioId: "TCC BKR 006", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8676", cherryRegisterNo: "14807", deliveryReportNo: "5253", quantityBidons: 91,  pricePerBidonFC: 900,  totalFC: 81900,  exchangeRateFC_USD: 2720, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-19T08:20:00.000Z" },
  { id: "d16", farmerId: "f3",  farmerName: "Buroko BASHWIRA",         farmerBioId: "TCC BNC 006", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Muganzo",   purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8678", cherryRegisterNo: "14807", deliveryReportNo: "5253", quantityBidons: 61,  pricePerBidonFC: 900,  totalFC: 54900,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-19T08:40:00.000Z" },
  // ── Rapport 5253 · Registre 14458 · Kahisa · 19 juillet 2024 ──
  { id: "d17", farmerId: "f4",  farmerName: "Shamavu MIRUHO",          farmerBioId: "TCC BKR 006", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Kahisa",    purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8464", cherryRegisterNo: "14458", deliveryReportNo: "5253", quantityBidons: 173, pricePerBidonFC: 1000, totalFC: 173000, exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-19T09:00:00.000Z" },
  { id: "d18", farmerId: "f20", farmerName: "Lyadunga NDASHINGA",      farmerBioId: "TCC BKR 005", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Kahisa",    purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8463", cherryRegisterNo: "14458", deliveryReportNo: "5253", quantityBidons: 64,  pricePerBidonFC: 1000, totalFC: 64000,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-19T09:15:00.000Z" },
  // ── Rapport 5253 · Registre 14808 · Camuhozi · 19 juillet 2024 ──
  { id: "d19", farmerId: "f17", farmerName: "Manegabe DENIS",          farmerBioId: "TCC BMB 002", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Camuhozi",  purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8169", cherryRegisterNo: "14808", deliveryReportNo: "5253", quantityBidons: 31,  pricePerBidonFC: 1000, totalFC: 31000,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: true,  recordedAt: "2024-07-19T10:00:00.000Z" },
  { id: "d20", farmerId: "f18", farmerName: "Masirika MUNOGERA",       farmerBioId: "TCC BMR 003", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Camuhozi",  purchaseDate: "2024-07-19", receptionDate: "2024-07-19", receiptNo: "8173", cherryRegisterNo: "14808", deliveryReportNo: "5253", quantityBidons: 91,  pricePerBidonFC: 1000, totalFC: 91000,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: true,  recordedAt: "2024-07-19T10:20:00.000Z" },
  // ── Rapport 5253 · Registre 14006 · Cinjava · 20 juillet 2024 ──
  { id: "d21", farmerId: "f3",  farmerName: "Buroko BASHWIRA",         farmerBioId: "TCC BNC 006", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava",   purchaseDate: "2024-07-20", receptionDate: "2024-07-20", receiptNo: "8969", cherryRegisterNo: "14006", deliveryReportNo: "5253", quantityBidons: 43,  pricePerBidonFC: 1000, totalFC: 43000,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: false, recordedAt: "2024-07-20T08:00:00.000Z" },
  { id: "d22", farmerId: "f1",  farmerName: "Bulonza MUDUMBI",         farmerBioId: "TCC BMB 009", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava",   purchaseDate: "2024-07-20", receptionDate: "2024-07-20", receiptNo: "8970", cherryRegisterNo: "14006", deliveryReportNo: "5253", quantityBidons: 57,  pricePerBidonFC: 1000, totalFC: 57000,  exchangeRateFC_USD: 2700, paymentMethod: "cash",         synced: false, recordedAt: "2024-07-20T08:30:00.000Z" },
  { id: "d23", farmerId: "f14", farmerName: "Mateso MAJEGE",           farmerBioId: "TCC BMB 016", stationId: "st_kahisa", stationName: "Station KAHISA", groupement: "Bushumba", village: "Cinjava",   purchaseDate: "2024-07-20", receptionDate: "2024-07-20", receiptNo: "8966", cherryRegisterNo: "14006", deliveryReportNo: "5253", quantityBidons: 65,  pricePerBidonFC: 1000, totalFC: 65000,  exchangeRateFC_USD: 2700, paymentMethod: "mobile_money", synced: false, recordedAt: "2024-07-20T09:00:00.000Z" },
];

// ─── Seed cherry registers ────────────────────────────────────────────────────

export const SEED_REGISTERS: CherryRegister[] = [
  { id: "r1",  registerNo: "14002", stationId: "st_kahisa", deliveryReportNo: "5251", date: "2024-07-14", groupement: "Bushumba", village: "Cinjava",  totalBidons: 95,  totalFC: 95000,  deliveryIds: ["d1","d2"] },
  { id: "r2",  registerNo: "14801", stationId: "st_kahisa", deliveryReportNo: "5252", date: "2024-07-16", groupement: "Bushumba", village: "Muganzo",  totalBidons: 127, totalFC: 88900,  deliveryIds: ["d3","d4"] },
  { id: "r3",  registerNo: "14802", stationId: "st_kahisa", deliveryReportNo: "5252", date: "2024-07-17", groupement: "Bushumba", village: "Muganzo",  totalBidons: 51,  totalFC: 35700,  deliveryIds: ["d5","d6"] },
  { id: "r4",  registerNo: "14652", stationId: "st_kahisa", deliveryReportNo: "5252", date: "2024-07-17", groupement: "Bushumba", village: "Itara",    totalBidons: 226, totalFC: 203400, deliveryIds: ["d11","d12","d13"] },
  { id: "r5",  registerNo: "14803", stationId: "st_kahisa", deliveryReportNo: "5252", date: "2024-07-18", groupement: "Bushumba", village: "Muganzo",  totalBidons: 87,  totalFC: 60900,  deliveryIds: ["d7","d8"] },
  { id: "r6",  registerNo: "14003", stationId: "st_kahisa", deliveryReportNo: "5252", date: "2024-07-18", groupement: "Bushumba", village: "Cinjava",  totalBidons: 112, totalFC: 112000, deliveryIds: ["d9","d10"] },
  { id: "r7",  registerNo: "14807", stationId: "st_kahisa", deliveryReportNo: "5253", date: "2024-07-19", groupement: "Bushumba", village: "Muganzo",  totalBidons: 233, totalFC: 209700, deliveryIds: ["d14","d15","d16"] },
  { id: "r8",  registerNo: "14458", stationId: "st_kahisa", deliveryReportNo: "5253", date: "2024-07-19", groupement: "Bushumba", village: "Kahisa",   totalBidons: 237, totalFC: 237000, deliveryIds: ["d17","d18"] },
  { id: "r9",  registerNo: "14808", stationId: "st_kahisa", deliveryReportNo: "5253", date: "2024-07-19", groupement: "Bushumba", village: "Camuhozi", totalBidons: 122, totalFC: 122000, deliveryIds: ["d19","d20"] },
  { id: "r10", registerNo: "14006", stationId: "st_kahisa", deliveryReportNo: "5253", date: "2024-07-20", groupement: "Bushumba", village: "Cinjava",  totalBidons: 165, totalFC: 165000, deliveryIds: ["d21","d22","d23"] },
];

// ─── Seed delivery reports ────────────────────────────────────────────────────

export const SEED_REPORTS: DeliveryReport[] = [
  { id: "rp1", reportNo: "5251", stationId: "st_kahisa", dateFrom: "2024-07-14", dateTo: "2024-07-14", totalBidons: 95,   totalFC: 95000,  registerNos: ["14002"] },
  { id: "rp2", reportNo: "5252", stationId: "st_kahisa", dateFrom: "2024-07-16", dateTo: "2024-07-18", totalBidons: 603,  totalFC: 500900, registerNos: ["14801","14802","14652","14803","14003"] },
  { id: "rp3", reportNo: "5253", stationId: "st_kahisa", dateFrom: "2024-07-19", dateTo: "2024-07-20", totalBidons: 757,  totalFC: 733700, registerNos: ["14807","14458","14808","14006"] },
];

// ─── Seed lots ────────────────────────────────────────────────────────────────

export const SEED_LOTS: Lot[] = [
  { id: "lot1", ref: "LOT-2024-0041", crop: "coffee", stage: "fermenting",   weightKg: 420,  bidonCount: 222,  farmerCount: 6,  harvestSeason: "2024A", certifications: ["fair_trade","organic_eu"],       openedAt: "2024-07-14T16:00:00.000Z", currentOrgId: "st_kahisa", stationId: "st_kahisa", sourceRegisterNos: ["14002","14801"], processingMethod: "washed" },
  { id: "lot2", ref: "LOT-2024-0039", crop: "coffee", stage: "washing",      weightKg: 310,  bidonCount: 277,  farmerCount: 5,  harvestSeason: "2024A", certifications: ["rainforest_alliance"],            openedAt: "2024-07-17T12:00:00.000Z", currentOrgId: "st_kahisa", stationId: "st_kahisa", sourceRegisterNos: ["14802","14652"],  processingMethod: "washed" },
  { id: "lot3", ref: "LOT-2024-0035", crop: "coffee", stage: "drying",       weightKg: 510,  bidonCount: 199,  farmerCount: 4,  harvestSeason: "2024A", certifications: ["fair_trade"],                     openedAt: "2024-07-18T08:00:00.000Z", currentOrgId: "st_kahisa", stationId: "st_kahisa", sourceRegisterNos: ["14803","14003"],  processingMethod: "washed" },
  { id: "lot4", ref: "LOT-2024-0028", crop: "coffee", stage: "in_transit",   weightKg: 1240, bidonCount: 592,  farmerCount: 10, harvestSeason: "2024A", certifications: ["eudr","rainforest_alliance"],     openedAt: "2024-07-21T06:00:00.000Z", currentOrgId: "coop_export", stationId: "st_kahisa", sourceRegisterNos: ["14807","14458","14808"], processingMethod: "washed" },
  { id: "lot5", ref: "LOT-2024-0015", crop: "coffee", stage: "graded",       weightKg: 680,  bidonCount: 165,  farmerCount: 3,  harvestSeason: "2024A", certifications: ["fair_trade","organic_eu","eudr"], openedAt: "2024-07-22T08:00:00.000Z", currentOrgId: "coop_export", stationId: "st_kahisa", sourceRegisterNos: ["14006"],          processingMethod: "washed", cupScore: 86.5 },
];

// ─── Context ──────────────────────────────────────────────────────────────────

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
  const [stations,   setStations]   = useState<Station[]>([]);
  const [farmers,    setFarmers]    = useState<Farmer[]>([]);
  const [deliveries, setDeliveries] = useState<CherryDelivery[]>([]);
  const [registers,  setRegisters]  = useState<CherryRegister[]>([]);
  const [reports,    setReports]    = useState<DeliveryReport[]>([]);
  const [lots,       setLots]       = useState<Lot[]>([]);

  const load = useCallback(async () => {
    const [stRaw, fRaw, dRaw, rRaw, rpRaw, lRaw] = await Promise.all([
      AsyncStorage.getItem(STATIONS_KEY),
      AsyncStorage.getItem(FARMERS_KEY),
      AsyncStorage.getItem(DELIVERIES_KEY),
      AsyncStorage.getItem(REGISTERS_KEY),
      AsyncStorage.getItem(REPORTS_KEY),
      AsyncStorage.getItem(LOTS_KEY),
    ]);
    setStations(  stRaw  ? JSON.parse(stRaw)  : SEED_STATIONS);
    setFarmers(   fRaw   ? JSON.parse(fRaw)   : SEED_FARMERS);
    setDeliveries(dRaw   ? JSON.parse(dRaw)   : SEED_DELIVERIES);
    setRegisters( rRaw   ? JSON.parse(rRaw)   : SEED_REGISTERS);
    setReports(   rpRaw  ? JSON.parse(rpRaw)  : SEED_REPORTS);
    setLots(      lRaw   ? JSON.parse(lRaw)   : SEED_LOTS);
    // Seed on first launch
    if (!stRaw)  AsyncStorage.setItem(STATIONS_KEY,   JSON.stringify(SEED_STATIONS));
    if (!fRaw)   AsyncStorage.setItem(FARMERS_KEY,    JSON.stringify(SEED_FARMERS));
    if (!dRaw)   AsyncStorage.setItem(DELIVERIES_KEY, JSON.stringify(SEED_DELIVERIES));
    if (!rRaw)   AsyncStorage.setItem(REGISTERS_KEY,  JSON.stringify(SEED_REGISTERS));
    if (!rpRaw)  AsyncStorage.setItem(REPORTS_KEY,    JSON.stringify(SEED_REPORTS));
    if (!lRaw)   AsyncStorage.setItem(LOTS_KEY,       JSON.stringify(SEED_LOTS));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addFarmer = useCallback(async (f: Omit<Farmer, "id" | "registeredAt">) => {
    const next: Farmer = { ...f, id: "f" + Date.now(), registeredAt: new Date().toISOString() };
    setFarmers(prev => { const u = [next, ...prev]; AsyncStorage.setItem(FARMERS_KEY, JSON.stringify(u)); return u; });
    return next;
  }, []);

  const addDelivery = useCallback(async (d: Omit<CherryDelivery, "id">) => {
    const next: CherryDelivery = { ...d, id: "d" + Date.now() };
    setDeliveries(prev => { const u = [next, ...prev]; AsyncStorage.setItem(DELIVERIES_KEY, JSON.stringify(u)); return u; });
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
