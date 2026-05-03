import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CertBadge } from "@/components/CertBadge";
import { StageTag } from "@/components/StageTag";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatWeight(kg: number) {
  if (kg >= 1000) return (kg / 1000).toFixed(3) + " MT";
  return kg.toFixed(1) + " kg";
}

// Processing stages in order for CoC timeline
const STAGE_FLOW = [
  { stage: "cherry_received", label: "Cerises reçues à la station",       icon: "leaf-outline" as const,            color: "#b91c1c" },
  { stage: "pulping",         label: "Dépulpage",                          icon: "cog-outline" as const,             color: "#b45309" },
  { stage: "fermenting",      label: "Fermentation (12–48h)",              icon: "flask-outline" as const,           color: "#854d0e" },
  { stage: "washing",         label: "Lavage",                             icon: "water-outline" as const,           color: "#1d4ed8" },
  { stage: "drying",          label: "Séchage (tables surélevées)",        icon: "sunny-outline" as const,           color: "#b45309" },
  { stage: "dry_parchment",   label: "Parche sèche — en stock",            icon: "cube-outline" as const,            color: "#57534e" },
  { stage: "hulling",         label: "Déparcheminé (décortiqueur)",        icon: "construct-outline" as const,       color: "#3730a3" },
  { stage: "graded",          label: "Trié et classé",                     icon: "filter-outline" as const,          color: "#15803d" },
  { stage: "bagged",          label: "Ensaché pour export",                icon: "bag-handle-outline" as const,      color: "#166534" },
  { stage: "in_transit",      label: "En transit vers le port",            icon: "car-outline" as const,             color: "#1d4ed8" },
  { stage: "shipped",         label: "Exporté",                            icon: "boat-outline" as const,            color: "#3730a3" },
];

export default function LotDossierScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lots, deliveries, registers, farmers } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const lot = useMemo(() => lots.find((l) => l.id === id), [lots, id]);

  // Find deliveries linked via cherry registers
  const linkedDeliveries = useMemo(() => {
    if (!lot) return [];
    return deliveries.filter((d) => lot.sourceRegisterNos.includes(d.cherryRegisterNo));
  }, [deliveries, lot]);

  // Unique farmers who contributed
  const sourceFarmerIds = useMemo(() => [...new Set(linkedDeliveries.map((d) => d.farmerId))], [linkedDeliveries]);
  const sourceFarmers = useMemo(() => farmers.filter((f) => sourceFarmerIds.includes(f.id)), [farmers, sourceFarmerIds]);

  // Determine which CoC stages are complete
  const stageIdx = STAGE_FLOW.findIndex((s) => s.stage === lot?.stage);

  if (!lot) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Lot introuvable</Text>
      </View>
    );
  }

  const totalFC = linkedDeliveries.reduce((s, d) => s + d.totalFC, 0);
  const totalBidons = linkedDeliveries.reduce((s, d) => s + d.quantityBidons, 0);

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
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              {lot.crop === "coffee" ? "Café" : "Cacao"} · {lot.harvestSeason} · {lot.processingMethod ? lot.processingMethod.charAt(0).toUpperCase() + lot.processingMethod.slice(1) : ""}
            </Text>
          </View>
          <StageTag stage={lot.stage} size="md" />
        </View>
        <View style={styles.heroStats}>
          {[
            { label: "Poids", value: formatWeight(lot.weightKg), icon: "scale-outline" as const },
            { label: "Bidons", value: String(lot.bidonCount), icon: "cube-outline" as const },
            { label: "Agriculteurs", value: String(lot.farmerCount), icon: "people-outline" as const },
            { label: "Certif.", value: String(lot.certifications.length), icon: "shield-checkmark-outline" as const },
          ].map((s) => (
            <View key={s.label} style={styles.heroStat}>
              <Ionicons name={s.icon} size={16} color={colors.primary} />
              <Text style={[styles.heroStatVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
        {lot.certifications.length > 0 && (
          <View style={styles.certs}>
            {lot.certifications.map((c) => <CertBadge key={c} regime={c} />)}
          </View>
        )}
        {lot.cupScore && (
          <View style={[styles.cupRow, { backgroundColor: colors.amberLight, borderColor: colors.primary + "30" }]}>
            <Ionicons name="cafe-outline" size={14} color={colors.primary} />
            <Text style={[styles.cupLabel, { color: colors.primary }]}>Note SCA</Text>
            <Text style={[styles.cupScore, { color: colors.primary }]}>{lot.cupScore}</Text>
          </View>
        )}
      </View>

      {/* EUDR panel */}
      {lot.certifications.includes("eudr") && (
        <View style={[styles.eudrPanel, { backgroundColor: colors.greenLight, borderColor: colors.accent + "30" }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.eudrTitle, { color: colors.accent }]}>EUDR Conforme</Text>
            <Text style={[styles.eudrSub, { color: colors.accent }]}>
              {lot.farmerCount} agriculteurs avec parcelles vérifiées. Aucun risque de déforestation détecté.
            </Text>
          </View>
          <TouchableOpacity style={[styles.eudrBtn, { backgroundColor: colors.accent }]}>
            <Ionicons name="download-outline" size={14} color="#fff" />
            <Text style={styles.eudrBtnText}>DDS PDF</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Financial summary */}
      {totalFC > 0 && (
        <View style={[styles.finCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.finRow}>
            <Text style={[styles.finLabel, { color: colors.mutedForeground }]}>Registres sources</Text>
            <Text style={[styles.finVal, { color: colors.foreground }]}>{lot.sourceRegisterNos.join(", ")}</Text>
          </View>
          <View style={[styles.finRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.finLabel, { color: colors.mutedForeground }]}>Total bidons reçus</Text>
            <Text style={[styles.finVal, { color: colors.foreground }]}>{totalBidons} bidons</Text>
          </View>
          <View style={[styles.finRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.finLabel, { color: colors.mutedForeground }]}>Payé aux agriculteurs (FC)</Text>
            <Text style={[styles.finVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{totalFC.toLocaleString()} FC</Text>
          </View>
        </View>
      )}

      {/* CoC timeline */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Chaîne de traitement</Text>
      <View style={[styles.timeline, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {STAGE_FLOW.map((s, i) => {
          const done = i <= stageIdx;
          const current = i === stageIdx;
          return (
            <View key={s.stage} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: done ? s.color : colors.muted, opacity: done ? 1 : 0.4 }]}>
                  {done
                    ? <Ionicons name={s.icon} size={11} color="#fff" />
                    : <View style={[styles.timelineDotInner, { backgroundColor: "#fff" }]} />
                  }
                </View>
                {i < STAGE_FLOW.length - 1 && <View style={[styles.timelineLine, { backgroundColor: done ? s.color : colors.border, opacity: done ? 0.4 : 1 }]} />}
              </View>
              <View style={[styles.timelineBody, current && { opacity: 1 }, !done && { opacity: 0.4 }]}>
                <Text style={[styles.timelineEvent, { color: colors.foreground }]}>
                  {s.label}
                  {current && <Text style={{ color: colors.primary, fontFamily: "Inter_400Regular" }}> — en cours</Text>}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Cherry register sources */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Registres de cerises sources</Text>
      {lot.sourceRegisterNos.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun registre lié à ce lot</Text>
        </View>
      ) : (
        <View style={[styles.sourcesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {lot.sourceRegisterNos.map((regNo, i) => {
            const regDeliveries = deliveries.filter((d) => d.cherryRegisterNo === regNo);
            const regBidons = regDeliveries.reduce((s, d) => s + d.quantityBidons, 0);
            const regFC = regDeliveries.reduce((s, d) => s + d.totalFC, 0);
            return (
              <View key={regNo} style={[styles.sourceRow, i < lot.sourceRegisterNos.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.regIcon, { backgroundColor: colors.amberLight }]}>
                  <Ionicons name="list-outline" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sourceName, { color: colors.foreground }]}>Registre {regNo}</Text>
                  <Text style={[styles.sourceMeta, { color: colors.mutedForeground }]}>
                    {regDeliveries.length} livraisons · {regBidons} bidons
                  </Text>
                </View>
                <Text style={[styles.sourceWeight, { color: colors.primary }]}>{regFC.toLocaleString()} FC</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Source farmers */}
      {sourceFarmers.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Agriculteurs contributeurs</Text>
          <View style={[styles.sourcesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {sourceFarmers.map((f, i) => {
              const fd = linkedDeliveries.filter((d) => d.farmerId === f.id);
              const fb = fd.reduce((s, d) => s + d.quantityBidons, 0);
              const ffc = fd.reduce((s, d) => s + d.totalFC, 0);
              return (
                <View key={f.id} style={[styles.sourceRow, i < sourceFarmers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sourceName, { color: colors.foreground }]}>{f.firstName} {f.lastName}</Text>
                    <Text style={[styles.sourceMeta, { color: colors.mutedForeground }]}>{f.bioId} · {f.village} · {fb} bidons</Text>
                  </View>
                  <Text style={[styles.sourceWeight, { color: colors.primary }]}>{ffc.toLocaleString()} FC</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Tamper evidence */}
      <View style={[styles.tamperCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.tamperTitle, { color: colors.foreground }]}>Traçabilité vérifiée</Text>
          <Text style={[styles.tamperSub, { color: colors.mutedForeground }]}>
            Ce lot est tracé depuis {lot.sourceRegisterNos.length} registre{lot.sourceRegisterNos.length > 1 ? "s" : ""} de cerises et {lot.farmerCount} agriculteurs identifiés.
          </Text>
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
  heroStatVal: { fontSize: 17, fontFamily: "Inter_700Bold" },
  heroStatLabel: { fontSize: 9, fontFamily: "Inter_400Regular" },
  certs: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  cupRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  cupLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  cupScore: { fontSize: 18, fontFamily: "Inter_700Bold" },
  eudrPanel: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  eudrTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  eudrSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  eudrBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start" },
  eudrBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  finCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  finRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  finLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  finVal: { fontSize: 13, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  timeline: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20 },
  timelineItem: { flexDirection: "row", gap: 12, marginBottom: 4 },
  timelineLeft: { alignItems: "center", width: 22 },
  timelineDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  timelineDotInner: { width: 6, height: 6, borderRadius: 3 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: -4 },
  timelineBody: { flex: 1, paddingBottom: 14 },
  timelineEvent: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sourcesCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  regIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sourceName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  sourceMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sourceWeight: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emptyCard: { padding: 20, borderRadius: 14, alignItems: "center", marginBottom: 20 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  tamperCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  tamperTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tamperSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginTop: 2 },
});
