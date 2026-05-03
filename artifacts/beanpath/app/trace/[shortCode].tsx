import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CertBadge } from "@/components/CertBadge";
import { useColors } from "@/hooks/useColors";

const MOCK_TRACE = {
  lotRef: "LOT-2024-0015",
  crop: "coffee",
  variety: "Washed SL28 / SL34",
  harvestSeason: "2024A",
  country: "Uganda",
  region: "Kiboga District",
  coop: "Bukomero Coffee Cooperative",
  farmerCount: 14,
  totalWeightMT: 0.98,
  certifications: ["fair_trade", "organic_eu", "eudr"],
  cupScore: 86.5,
  cupNotes: "Bright citrus acidity, full body, dark chocolate finish, floral aroma.",
  farmerShare: 42,
  processingMethod: "Fully washed",
  stages: [
    { label: "Farm gate", location: "Kiboga, Uganda", icon: "leaf-outline" as const, done: true },
    { label: "Washing station", location: "Kigezi Station", icon: "water-outline" as const, done: true },
    { label: "Dry mill", location: "Kampala Mill", icon: "cube-outline" as const, done: true },
    { label: "Export port", location: "Mombasa, Kenya", icon: "boat-outline" as const, done: true },
    { label: "Destination", location: "Rotterdam, Netherlands", icon: "flag-outline" as const, done: false },
  ],
  events: 23,
  actors: 9,
};

export default function TraceScreen() {
  const { shortCode } = useLocalSearchParams<{ shortCode: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = MOCK_TRACE;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }, Platform.OS === "web" && { paddingTop: 0 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient colors={["#1c1006", "#2d1a06"]} style={StyleSheet.absoluteFill} />
        <View style={[styles.heroPad, { paddingTop: insets.top + 20 }]}>
          <View style={styles.brandRow}>
            <Ionicons name="leaf" size={18} color="#b45309" />
            <Text style={styles.brandText}>BeanPath</Text>
            <View style={[styles.qrBadge]}>
              <Text style={styles.qrCode}>{shortCode ?? "BKM-0015"}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{t.variety}</Text>
          <Text style={styles.heroSub}>{t.coop}</Text>
          <Text style={styles.heroMeta}>{t.region} · {t.country} · {t.harvestSeason}</Text>

          <View style={styles.certsRow}>
            {t.certifications.map((c) => (
              <View key={c} style={[styles.heroCert, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
                <Ionicons name="shield-checkmark-outline" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroCertText}>{c.replace(/_/g, " ").toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {/* Cup score */}
          <View style={[styles.cupCard, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
            <View>
              <Text style={styles.cupScore}>{t.cupScore}</Text>
              <Text style={styles.cupLabel}>SCA Cup Score</Text>
            </View>
            <Text style={styles.cupNotes}>{t.cupNotes}</Text>
          </View>
        </View>
      </View>

      {/* Journey */}
      <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Journey</Text>
        <View style={[styles.journeyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {t.stages.map((s, i) => (
            <View key={s.label} style={styles.journeyRow}>
              <View style={styles.journeyLeft}>
                <View style={[styles.journeyDot, { backgroundColor: s.done ? colors.accent : colors.muted }]}>
                  <Ionicons name={s.icon} size={11} color={s.done ? "#fff" : colors.mutedForeground} />
                </View>
                {i < t.stages.length - 1 && <View style={[styles.journeyLine, { backgroundColor: s.done ? colors.accent : colors.muted }]} />}
              </View>
              <View style={styles.journeyBody}>
                <Text style={[styles.journeyLabel, { color: s.done ? colors.foreground : colors.mutedForeground }]}>{s.label}</Text>
                <Text style={[styles.journeyLocation, { color: colors.mutedForeground }]}>{s.location}</Text>
              </View>
              {s.done && <Ionicons name="checkmark-circle" size={16} color={colors.accent} />}
            </View>
          ))}
        </View>

        {/* Farmer share */}
        <View style={[styles.shareCard, { backgroundColor: colors.amberLight, borderColor: colors.primary + "30" }]}>
          <Ionicons name="cash-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.shareTitle, { color: colors.primary }]}>{t.farmerShare}% reached farmers</Text>
            <Text style={[styles.shareSub, { color: colors.amber }]}>Of the FOB price for this lot was paid directly to the {t.farmerCount} contributing farmers.</Text>
          </View>
        </View>

        {/* Processing */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Processing</Text>
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Method", value: t.processingMethod },
            { label: "Crop", value: t.crop.charAt(0).toUpperCase() + t.crop.slice(1) },
            { label: "Weight", value: `${t.totalWeightMT} MT` },
            { label: "Farmers", value: String(t.farmerCount) },
          ].map(({ label, value }, i, arr) => (
            <View key={label} style={[styles.detailRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Verify badge */}
        <View style={[styles.verifyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="lock-closed" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.verifyTitle, { color: colors.foreground }]}>Chain of custody verified</Text>
            <Text style={[styles.verifySub, { color: colors.mutedForeground }]}>
              This lot's provenance is cryptographically verified across {t.events} signed events from {t.actors} independent actors.
            </Text>
          </View>
        </View>

        <Text style={[styles.poweredBy, { color: colors.mutedForeground }]}>Powered by BeanPath · Offline-first traceability</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
  hero: { overflow: "hidden" },
  heroPad: { paddingHorizontal: 20, paddingBottom: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  brandText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  qrBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.12)" },
  qrCode: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_500Medium" },
  heroTitle: { color: "#fff", fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 6 },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontFamily: "Inter_500Medium", marginBottom: 4 },
  heroMeta: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  certsRow: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  heroCert: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  heroCertText: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  cupCard: { borderRadius: 14, padding: 14, flexDirection: "row", gap: 14, alignItems: "center" },
  cupScore: { color: "#fff", fontSize: 40, fontFamily: "Inter_700Bold", lineHeight: 44 },
  cupLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_400Regular" },
  cupNotes: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 19, fontStyle: "italic" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  journeyCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20 },
  journeyRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 4 },
  journeyLeft: { alignItems: "center", width: 22 },
  journeyDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  journeyLine: { width: 2, flex: 1, marginTop: 4, minHeight: 20, marginBottom: -4 },
  journeyBody: { flex: 1, paddingBottom: 14 },
  journeyLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  journeyLocation: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  shareCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  shareTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  shareSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  detailCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13 },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  verifyCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  verifyTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  verifySub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  poweredBy: { textAlign: "center", fontSize: 11, fontFamily: "Inter_400Regular" },
});
