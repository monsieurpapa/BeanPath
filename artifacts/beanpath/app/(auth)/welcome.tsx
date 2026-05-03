import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform, Pressable, SafeAreaView,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import type { UserRole } from "@/context/AuthContext";

/**
 * Welcome / persona selection screen.
 *
 * Shows all supply-chain roles involved in DRC coffee & cocoa traceability.
 * Selecting a persona routes to the login screen with that role pre-set.
 * The login screen then routes to the correct app surface (field / console / buyer).
 */

type PersonaCard = {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  accent: string;
  group: "terrain" | "station" | "gestion" | "marche";
};

const PERSONAS: PersonaCard[] = [
  // ── TERRAIN ──────────────────────────────────────────────────────────────
  {
    role: "field_agent",
    title: "Agent de terrain",
    subtitle: "Collecte des cerises · Paiement agriculteurs",
    description: "Enregistre les livraisons bidons, génère les reçus, inscrit de nouveaux agriculteurs.",
    icon: "leaf-outline",
    accent: "#b45309",
    group: "terrain",
  },
  {
    role: "lead_farmer",
    title: "Agriculteur leader",
    subtitle: "Gestion de groupe · Livraisons collectives",
    description: "Représente un groupement villageois, soumet les livraisons au nom de son groupe.",
    icon: "people-outline",
    accent: "#92400e",
    group: "terrain",
  },
  // ── STATION ──────────────────────────────────────────────────────────────
  {
    role: "station_operator",
    title: "Opérateur de station",
    subtitle: "Réception cerises · Registres · Création lots",
    description: "Gère la station de lavage : réception, registres, rapports de livraison et lots.",
    icon: "water-outline",
    accent: "#15803d",
    group: "station",
  },
  {
    role: "transporter",
    title: "Transporteur",
    subtitle: "Transit des lots · Confirmation de livraison",
    description: "Confirme les étapes de transport et met à jour la localisation des lots.",
    icon: "car-outline",
    accent: "#7c3aed",
    group: "station",
  },
  {
    role: "mill_operator",
    title: "Opérateur moulin",
    subtitle: "Traitement · Séchage · Décorticage",
    description: "Enregistre les étapes de transformation : dépulpage, fermentation, séchage, décorticage.",
    icon: "cog-outline",
    accent: "#065f46",
    group: "station",
  },
  // ── GESTION ──────────────────────────────────────────────────────────────
  {
    role: "coop_admin",
    title: "Administrateur coopérative",
    subtitle: "Gestion complète · Finances · EUDR · Membres",
    description: "Accès complet à tous les modules : agriculteurs, lots, finances, exportations, EUDR.",
    icon: "shield-checkmark-outline",
    accent: "#1d4ed8",
    group: "gestion",
  },
  {
    role: "qc_grader",
    title: "Inspecteur qualité",
    subtitle: "Scores de tasse · Audits · Contrôle terrain",
    description: "Effectue les contrôles de qualité, enregistre les scores de tasse, valide les certifications.",
    icon: "checkmark-circle-outline",
    accent: "#dc2626",
    group: "gestion",
  },
  {
    role: "certifier",
    title: "Organisme de certification",
    subtitle: "Bio · Fair Trade · Rainforest Alliance · EUDR",
    description: "Émet et révoque les certifications Biologique, Fair Trade, Rainforest Alliance et EUDR.",
    icon: "ribbon-outline",
    accent: "#0369a1",
    group: "gestion",
  },
  // ── MARCHÉ ───────────────────────────────────────────────────────────────
  {
    role: "exporter",
    title: "Exportateur",
    subtitle: "DDV · Documents EUDR · Expéditions",
    description: "Crée les documents d'exportation, les Déclarations de Diligence Raisonnable EUDR.",
    icon: "boat-outline",
    accent: "#0891b2",
    group: "marche",
  },
  {
    role: "buyer",
    title: "Acheteur / Torréfacteur",
    subtitle: "Dossiers lots · Traçabilité · Histoires d'origine",
    description: "Accès en lecture aux dossiers des lots, traçabilité complète, histoires des agriculteurs.",
    icon: "bag-handle-outline",
    accent: "#6d28d9",
    group: "marche",
  },
];

const GROUP_LABELS: Record<PersonaCard["group"], string> = {
  terrain: "Sur le terrain",
  station: "Station & transport",
  gestion: "Gestion & qualité",
  marche:  "Commerce & export",
};

const GROUPS: PersonaCard["group"][] = ["terrain", "station", "gestion", "marche"];

const LANGS = ["FR", "EN", "SW"];

export default function WelcomeScreen() {
  const [lang, setLang] = useState("FR");

  const handleSelect = (role: UserRole) => {
    router.push({ pathname: "/(auth)/login", params: { role } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0d1a0a" }}>
      <LinearGradient
        colors={["#0d1a0a", "#1a2e10", "#0d1825"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            Platform.OS === "web" && { paddingTop: 60, paddingBottom: 60 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Locale bar */}
          <View style={styles.topBar}>
            <View />
            <View style={styles.langRow}>
              {LANGS.map((l) => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLang(l)}
                  style={[styles.langBtn, lang === l && styles.langBtnActive]}
                >
                  <Text style={[styles.langText, lang === l && styles.langTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoRing}>
              <Ionicons name="leaf" size={30} color="#b45309" />
            </View>
            <Text style={styles.wordmark}>BeanPath</Text>
            <Text style={styles.tagline}>
              De la parcelle au torréfacteur — chaque étape, vérifiée.
            </Text>
          </View>

          {/* Persona groups */}
          {GROUPS.map((grp) => {
            const cards = PERSONAS.filter((p) => p.group === grp);
            return (
              <View key={grp} style={styles.group}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupLine} />
                  <Text style={styles.groupLabel}>{GROUP_LABELS[grp]}</Text>
                  <View style={styles.groupLine} />
                </View>
                {cards.map((p) => (
                  <Pressable
                    key={p.role}
                    onPress={() => handleSelect(p.role)}
                    style={({ pressed }) => [
                      styles.card,
                      pressed && { borderColor: p.accent, transform: [{ scale: 0.975 }] },
                    ]}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: p.accent + "20", borderColor: p.accent + "30" }]}>
                      <Ionicons name={p.icon} size={22} color={p.accent} />
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle}>{p.title}</Text>
                      <Text style={styles.cardSub}>{p.subtitle}</Text>
                      <Text style={styles.cardDesc}>{p.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.25)" />
                  </Pressable>
                ))}
              </View>
            );
          })}

          <Text style={styles.footer}>
            Multi-coopérative · Hors-ligne · Cryptographiquement vérifié
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginBottom: 4 },
  langRow: { flexDirection: "row", gap: 4, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 3 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  langBtnActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  langText: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  langTextActive: { color: "#fff" },
  brand: { alignItems: "center", paddingVertical: 32 },
  logoRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(180,83,9,0.15)", borderWidth: 1, borderColor: "rgba(180,83,9,0.35)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  wordmark: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.8 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: 8, lineHeight: 19, paddingHorizontal: 24, fontFamily: "Inter_400Regular" },
  group: { marginBottom: 6 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 16 },
  groupLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  groupLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", marginBottom: 8 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#ffffff" },
  cardSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_500Medium" },
  cardDesc: { fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
  footer: { textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 32, lineHeight: 15 },
});
