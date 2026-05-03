import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CertBadge } from "@/components/CertBadge";
import { StageTag } from "@/components/StageTag";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatWeight(g: number) {
  if (g >= 1_000_000) return (g / 1_000_000).toFixed(3) + " MT";
  return (g / 1000).toFixed(1) + " kg";
}

const MOCK_TIMELINE = [
  { event: "lot.created", actor: "Amara Kone (field_agent)", time: "3 days ago", icon: "add-circle-outline" as const, color: "#15803d" },
  { event: "transfer.handed_over", actor: "Amara Kone → Kigezi Washing Station", time: "2 days ago", icon: "swap-horizontal-outline" as const, color: "#b45309" },
  { event: "processing.pulping_started", actor: "Station Operator", time: "2 days ago", icon: "water-outline" as const, color: "#1d4ed8" },
  { event: "weight.recorded", actor: "Weighbridge — 840 kg gross", time: "2 days ago", icon: "scale-outline" as const, color: "#7c3aed" },
  { event: "processing.fermentation_started", actor: "Station Operator", time: "1 day ago", icon: "flask-outline" as const, color: "#1d4ed8" },
];

export default function LotDossierScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lots, collections } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const lot = useMemo(() => lots.find((l) => l.id === id), [lots, id]);
  const sources = useMemo(() => collections.filter((c) => c.lotId === id), [collections, id]);

  if (!lot) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Lot not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.ref, { color: colors.foreground }]}>{lot.ref}</Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>{lot.crop} · {lot.harvestSeason}</Text>
          </View>
          <StageTag stage={lot.stage} size="md" />
        </View>
        <View style={styles.heroStats}>
          {[
            { label: "Weight", value: formatWeight(lot.weightGrams), icon: "scale-outline" as const },
            { label: "Farmers", value: String(lot.farmerCount), icon: "people-outline" as const },
            { label: "Certifications", value: String(lot.certifications.length), icon: "shield-checkmark-outline" as const },
          ].map((s) => (
            <View key={s.label} style={styles.heroStat}>
              <Ionicons name={s.icon} size={16} color={colors.primary} />
              <Text style={[styles.heroStatVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
        {/* Certifications */}
        {lot.certifications.length > 0 && (
          <View style={styles.certs}>
            {lot.certifications.map((c) => <CertBadge key={c} regime={c} />)}
          </View>
        )}
      </View>

      {/* EUDR panel */}
      {lot.certifications.includes("eudr") && (
        <View style={[styles.eudrPanel, { backgroundColor: colors.greenLight, borderColor: colors.accent + "30" }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.eudrTitle, { color: colors.accent }]}>EUDR Compliant</Text>
            <Text style={[styles.eudrSub, { color: colors.accent + "cc" }]}>All {lot.farmerCount} farmers have verified plot polygons. No deforestation risk detected.</Text>
          </View>
          <TouchableOpacity style={[styles.eudrBtn, { backgroundColor: colors.accent }]}>
            <Ionicons name="download-outline" size={14} color="#fff" />
            <Text style={styles.eudrBtnText}>DDS PDF</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chain of custody timeline */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Chain of custody</Text>
      <View style={[styles.timeline, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MOCK_TIMELINE.map((e, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: e.color }]}>
                <Ionicons name={e.icon} size={11} color="#fff" />
              </View>
              {i < MOCK_TIMELINE.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
            </View>
            <View style={styles.timelineBody}>
              <Text style={[styles.timelineEvent, { color: colors.foreground }]}>{e.event.replace(/\./g, " › ")}</Text>
              <Text style={[styles.timelineActor, { color: colors.mutedForeground }]}>{e.actor}</Text>
              <Text style={[styles.timelineTime, { color: colors.mutedForeground }]}>{e.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Sources */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sources</Text>
      {sources.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No direct collection records linked to this lot</Text>
        </View>
      ) : (
        <View style={[styles.sourcesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {sources.map((s, i) => (
            <View key={s.id} style={[styles.sourceRow, i < sources.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sourceName, { color: colors.foreground }]}>{s.farmerName}</Text>
                <Text style={[styles.sourceMeta, { color: colors.mutedForeground }]}>{(s.weightGrams / 1000).toFixed(1)} kg · {s.paymentMethod}</Text>
              </View>
              <Text style={[styles.sourceWeight, { color: colors.primary }]}>{(s.weightGrams / 1000).toFixed(1)} kg</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tamper evidence */}
      <View style={[styles.tamperCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.tamperTitle, { color: colors.foreground }]}>Cryptographically verified</Text>
          <Text style={[styles.tamperSub, { color: colors.mutedForeground }]}>This lot's chain of custody is verified across {MOCK_TIMELINE.length} signed events from {lot.farmerCount} actors.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  hero: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  ref: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  heroStats: { flexDirection: "row", marginBottom: 12 },
  heroStat: { flex: 1, alignItems: "center", gap: 4 },
  heroStatVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  heroStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  certs: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  eudrPanel: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  eudrTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  eudrSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  eudrBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start" },
  eudrBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  timeline: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 24 },
  timelineItem: { flexDirection: "row", gap: 12, marginBottom: 4 },
  timelineLeft: { alignItems: "center", width: 22 },
  timelineDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: -4 },
  timelineBody: { flex: 1, paddingBottom: 16 },
  timelineEvent: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  timelineActor: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  timelineTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  sourcesCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  sourceRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13 },
  sourceName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  sourceMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sourceWeight: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emptyCard: { padding: 20, borderRadius: 14, alignItems: "center", marginBottom: 20 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  tamperCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  tamperTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tamperSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginTop: 2 },
});
