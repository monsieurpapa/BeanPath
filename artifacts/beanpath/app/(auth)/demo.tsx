import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";

const CONSOLE_ROLES = new Set<UserRole>([
  "buyer", "exporter", "qc_grader", "coop_admin", "certifier", "mill_operator",
]);

type DemoPersona = {
  role: UserRole;
  title: string;
  name: string;
  org: string;
  description: string;
  features: string[];
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  accent: string;
  surfaceLabel: string;
};

const DEMO_PERSONAS: DemoPersona[] = [
  {
    role:         "field_agent",
    title:        "Agent de terrain",
    name:         "Bulonza MUDUMBI",
    org:          "TCC — Tounga wa Café Congo",
    description:  "Interface terrain pour la collecte quotidienne des cerises, le paiement des agriculteurs et la gestion des lots.",
    features:     ["Tableau de bord & livraisons du jour", "Enregistrement cerises · reçus PDF", "Registre des agriculteurs"],
    icon:         "leaf-outline",
    accent:       "#b45309",
    surfaceLabel: "Interface mobile · 5 onglets",
  },
  {
    role:         "coop_admin",
    title:        "Administrateur coopérative",
    name:         "Bishops KAJEREGE",
    org:          "NAKEZA SARL",
    description:  "Console de gestion complète : finances, rapports EUDR, réconciliation, lots et membres.",
    features:     ["Console de gestion complète", "Rapports & conformité EUDR", "Explorateur de lots & dossiers"],
    icon:         "shield-checkmark-outline",
    accent:       "#1d4ed8",
    surfaceLabel: "Console de gestion",
  },
  {
    role:         "buyer",
    title:        "Acheteur / Torréfacteur",
    name:         "Lars ERIKSEN",
    org:          "Nordic Roasters AS",
    description:  "Accès en lecture aux dossiers de lots, traçabilité complète, certifications et histoires d'origine.",
    features:     ["Dossiers de lots complets", "Traçabilité champ-à-tasse", "Certificats Bio · Fair Trade · EUDR"],
    icon:         "bag-handle-outline",
    accent:       "#6d28d9",
    surfaceLabel: "Console acheteur",
  },
];

export default function DemoScreen() {
  const { loginAsDemo } = useAuth();
  const [loading, setLoading] = useState<UserRole | null>(null);
  const inFlight = useRef(false);

  const handleEnterDemo = async (role: UserRole) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(role);
    try {
      await loginAsDemo(role);
      const target = CONSOLE_ROLES.has(role) ? "/(console)/" : "/(tabs)/";
      router.replace(target as any);
    } catch {
      setLoading(null);
      inFlight.current = false;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#080f06" }}>
      <LinearGradient
        colors={["#080f06", "#0d1a0a", "#091520"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[s.scroll, Platform.OS === "web" && { paddingTop: 56, paddingBottom: 80, maxWidth: 720, alignSelf: "center" as const, width: "100%" }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={s.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.65)" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={s.demoTag}>
                <Ionicons name="flash" size={10} color="#b45309" />
                <Text style={s.demoTagText}>Accès immédiat · Aucune inscription</Text>
              </View>
              <Text style={s.title}>Essayez BeanPath</Text>
              <Text style={s.subtitle}>
                Choisissez un profil pour explorer la plateforme avec des données fictives réalistes.
              </Text>
            </View>
          </View>

          {/* Persona cards */}
          {DEMO_PERSONAS.map((p) => {
            const isLoading = loading === p.role;
            return (
              <Pressable
                key={p.role}
                onPress={() => handleEnterDemo(p.role)}
                disabled={loading !== null}
                style={({ pressed }) => [
                  s.card,
                  { borderColor: pressed || isLoading ? p.accent + "70" : "rgba(255,255,255,0.09)" },
                  pressed && { transform: [{ scale: 0.985 }] },
                ]}
              >
                {/* Card header */}
                <View style={s.cardHead}>
                  <View style={[s.cardIcon, { backgroundColor: p.accent + "20", borderColor: p.accent + "35" }]}>
                    <Ionicons name={p.icon} size={24} color={p.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{p.title}</Text>
                    <Text style={[s.cardOrg, { color: p.accent }]}>{p.name}</Text>
                    <Text style={s.cardOrgName}>{p.org}</Text>
                  </View>
                  <View style={[s.surfacePill, { backgroundColor: p.accent + "18", borderColor: p.accent + "30" }]}>
                    <Text style={[s.surfaceText, { color: p.accent }]}>{p.surfaceLabel}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={s.cardDesc}>{p.description}</Text>

                {/* Feature list */}
                <View style={s.featureList}>
                  {p.features.map((f) => (
                    <View key={f} style={s.featureRow}>
                      <Ionicons name="checkmark-circle" size={13} color={p.accent} />
                      <Text style={s.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA */}
                <View style={[s.cta, { backgroundColor: p.accent }]}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="rocket-outline" size={15} color="#fff" />
                      <Text style={s.ctaText}>Entrer en démo</Text>
                      <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </>
                  )}
                </View>
              </Pressable>
            );
          })}

          {/* Footer note */}
          <View style={s.note}>
            <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.25)" />
            <Text style={s.noteText}>
              Les données affichées sont fictives et servent uniquement à la démonstration. Aucune donnée réelle n'est utilisée.
            </Text>
          </View>

          {/* Sign-in link */}
          <TouchableOpacity
            style={s.signinLink}
            onPress={() => router.push({ pathname: "/(auth)/personas" })}
          >
            <Text style={s.signinLinkText}>Vous avez un compte ? Se connecter</Text>
            <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:         { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header:         { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 28 },
  backBtn:        { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", marginTop: 4, flexShrink: 0 },
  demoTag:        { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  demoTagText:    { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#b45309", textTransform: "uppercase", letterSpacing: 0.8 },
  title:          { fontSize: 26, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.7, marginBottom: 6 },
  subtitle:       { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", lineHeight: 19 },

  card:           { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", padding: 18, marginBottom: 14, gap: 14 },
  cardHead:       { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardIcon:       { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  cardTitle:      { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 2 },
  cardOrg:        { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 1 },
  cardOrgName:    { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },
  surfacePill:    { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" },
  surfaceText:    { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
  cardDesc:       { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.50)", lineHeight: 18 },

  featureList:    { gap: 6 },
  featureRow:     { flexDirection: "row", alignItems: "center", gap: 7 },
  featureText:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.60)", flex: 1 },

  cta:            { borderRadius: 13, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ctaText:        { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

  note:           { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: 14, marginTop: 6, marginBottom: 20 },
  noteText:       { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.30)", lineHeight: 16 },

  signinLink:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  signinLinkText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.35)" },
});
