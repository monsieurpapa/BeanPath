import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StageTag } from "@/components/StageTag";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { useColors } from "@/hooks/useColors";

function formatWeight(g: number) {
  if (g >= 1_000_000) return (g / 1_000_000).toFixed(2) + " MT";
  return (g / 1000).toFixed(0) + " kg";
}

export default function ConsoleDashboard() {
  const { user } = useAuth();
  const { lots, farmers, collections } = useData();
  const { conflictCount, pendingCount, triggerSync, syncing } = useSync();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const totalWeight = useMemo(() => lots.reduce((s, l) => s + l.weightGrams, 0), [lots]);
  const totalFarmers = farmers.length;
  const pendingPayments = collections.filter((c) => !c.synced).length;
  const eudrReady = lots.filter((l) => l.certifications.includes("eudr")).length;

  const stageGroups = useMemo(() => {
    const groups: Record<string, number> = {};
    lots.forEach((l) => { groups[l.stage] = (groups[l.stage] ?? 0) + 1; });
    return Object.entries(groups);
  }, [lots]);

  const recentLots = lots.slice(0, 5);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 16 }]}
      refreshControl={<RefreshControl refreshing={syncing} onRefresh={triggerSync} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Org header */}
      <View style={styles.orgHeader}>
        <View>
          <Text style={[styles.orgName, { color: colors.foreground }]}>{user?.orgName}</Text>
          <Text style={[styles.orgSub, { color: colors.mutedForeground }]}>{user?.cropFocus} · {user?.orgCurrency} · {user?.country}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/")}
          style={[styles.switchBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="phone-portrait-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>Field app</Text>
        </TouchableOpacity>
      </View>

      {/* Conflict alert */}
      {conflictCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/(console)/reconciliation")}
          style={[styles.conflictBanner, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "30" }]}
        >
          <Ionicons name="warning-outline" size={18} color={colors.danger} />
          <Text style={[styles.conflictText, { color: colors.danger }]}>{conflictCount} unresolved conflict{conflictCount > 1 ? "s" : ""} require attention</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.danger} />
        </TouchableOpacity>
      )}

      {/* KPI grid */}
      <View style={styles.kpiGrid}>
        {[
          { label: "Total weight", value: formatWeight(totalWeight), icon: "scale-outline" as const, color: colors.primary },
          { label: "Active lots", value: String(lots.length), icon: "layers-outline" as const, color: colors.accent },
          { label: "Farmers", value: String(totalFarmers), icon: "people-outline" as const, color: colors.primary },
          { label: "EUDR ready", value: String(eudrReady), icon: "shield-checkmark-outline" as const, color: colors.accent },
          { label: "Pending payments", value: String(pendingPayments), icon: "card-outline" as const, color: pendingPayments > 0 ? colors.warning : colors.mutedForeground },
          { label: "Conflicts", value: String(conflictCount), icon: "warning-outline" as const, color: conflictCount > 0 ? colors.danger : colors.mutedForeground },
        ].map((k) => (
          <View key={k.label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={k.icon} size={20} color={k.color} />
            <Text style={[styles.kpiValue, { color: colors.foreground }]}>{k.value}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Stage breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Lot status</Text>
      <View style={[styles.stageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {stageGroups.map(([stage, count], i) => (
          <View key={stage} style={[styles.stageRow, i < stageGroups.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <StageTag stage={stage as any} size="sm" />
            <View style={styles.stageBar}>
              <View style={[styles.stageBarFill, { width: `${(count / lots.length) * 100}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.stageCount, { color: colors.foreground }]}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Recent lots */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent lots</Text>
        <TouchableOpacity onPress={() => router.push("/(console)/lots/")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.lotsTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.tableHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          {["Ref", "Stage", "Weight", "Farmers"].map((h) => (
            <Text key={h} style={[styles.tableHead, { color: colors.mutedForeground, flex: h === "Ref" ? 2 : 1 }]}>{h}</Text>
          ))}
        </View>
        {recentLots.map((lot, i) => (
          <TouchableOpacity
            key={lot.id}
            onPress={() => router.push({ pathname: "/(console)/lots/[id]", params: { id: lot.id } })}
            style={[styles.tableRow, i < recentLots.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <Text style={[styles.tableCell, { color: colors.foreground, flex: 2, fontFamily: "Inter_500Medium" }]}>{lot.ref}</Text>
            <View style={{ flex: 1 }}><StageTag stage={lot.stage} size="sm" /></View>
            <Text style={[styles.tableCell, { color: colors.foreground, flex: 1 }]}>{formatWeight(lot.weightGrams)}</Text>
            <Text style={[styles.tableCell, { color: colors.foreground, flex: 1 }]}>{lot.farmerCount}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick nav */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Console</Text>
      <View style={styles.navGrid}>
        {[
          { label: "Lot Explorer", icon: "layers-outline" as const, route: "/(console)/lots/" as const },
          { label: "Reconciliation", icon: "git-compare-outline" as const, route: "/(console)/reconciliation" as const },
        ].map((n) => (
          <Pressable
            key={n.label}
            onPress={() => router.push(n.route as any)}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.amberLight }]}>
              <Ionicons name={n.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.navLabel, { color: colors.foreground }]}>{n.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  orgHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  orgName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  orgSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  switchBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  switchText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  conflictBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  conflictText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  kpiCard: { width: "30%", minWidth: 90, flexGrow: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  kpiValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  stageCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  stageBar: { flex: 1, height: 4, backgroundColor: "#e7e5e4", borderRadius: 2 },
  stageBarFill: { height: 4, borderRadius: 2 },
  stageCount: { fontSize: 13, fontFamily: "Inter_600SemiBold", width: 20, textAlign: "right" },
  lotsTable: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  tableHeader: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  tableHead: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13 },
  tableCell: { fontSize: 13, fontFamily: "Inter_400Regular" },
  navGrid: { gap: 10, marginBottom: 8 },
  navCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  navIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  navLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
});
