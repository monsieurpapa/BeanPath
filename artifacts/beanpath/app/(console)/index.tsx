import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StageTag } from "@/components/StageTag";
import { RoleGate } from "@/components/RoleGate";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { useToast } from "@/context/ToastContext";
import { ROLE_LABELS, ROLE_SURFACE } from "@/lib/rbac";
import { usePermission } from "@/hooks/usePermission";
import { useColors } from "@/hooks/useColors";

function formatFC(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + " M FC";
  if (n >= 1000) return (n / 1000).toFixed(0) + " K FC";
  return n.toLocaleString() + " FC";
}
function formatWeight(kg: number) {
  if (kg >= 1000) return (kg / 1000).toFixed(2) + " MT";
  return kg.toFixed(0) + " kg";
}

export default function ConsoleDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { lots, farmers, deliveries, registers, reports, stations } = useData();
  const { conflictCount, pendingCount, triggerSync, syncing } = useSync();
  const { showInfo } = useToast();
  const canViewFinance  = usePermission("finance.view");
  const canResolve      = usePermission("conflict.resolve");
  const canAdmin        = usePermission("admin.panel");
  const canExport       = usePermission("export.create");
  const canCertify      = usePermission("lot.certify");
  const canGrade        = usePermission("lot.grade");
  const canManageRegs   = usePermission("register.manage");
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const totalBidons = useMemo(() => deliveries.reduce((s, d) => s + d.quantityBidons, 0), [deliveries]);
  const totalFC = useMemo(() => deliveries.reduce((s, d) => s + d.totalFC, 0), [deliveries]);
  const totalKg = useMemo(() => lots.reduce((s, l) => s + l.weightKg, 0), [lots]);
  const unsyncedCount = deliveries.filter((d) => !d.synced).length;
  const eudrReady = lots.filter((l) => l.certifications.includes("eudr")).length;

  const stageGroups = useMemo(() => {
    const g: Record<string, number> = {};
    lots.forEach((l) => { g[l.stage] = (g[l.stage] ?? 0) + 1; });
    return Object.entries(g);
  }, [lots]);

  const groupementTotals = useMemo(() => {
    const g: Record<string, { bidons: number; fc: number }> = {};
    deliveries.forEach((d) => {
      if (!g[d.groupement]) g[d.groupement] = { bidons: 0, fc: 0 };
      g[d.groupement].bidons += d.quantityBidons;
      g[d.groupement].fc += d.totalFC;
    });
    return Object.entries(g).sort((a, b) => b[1].bidons - a[1].bidons).slice(0, 4);
  }, [deliveries]);

  const recentLots = lots.slice(0, 5);
  const stationsLabel = stations.length === 1
    ? t("console.stations", { count: stations.length })
    : t("console.stations_plural", { count: stations.length });
  const roleLabel = user?.role ? t(`roles.${user.role}`, ROLE_LABELS[user.role]) : "";

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
          <Text style={[styles.orgSub, { color: colors.mutedForeground }]}>{stationsLabel} · {user?.cropFocus} · {user?.orgCurrency}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/")} style={[styles.switchBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="phone-portrait-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>{t("console.field")}</Text>
        </TouchableOpacity>
      </View>

      {/* Conflict alert */}
      {conflictCount > 0 && (
        <TouchableOpacity onPress={() => router.push("/(console)/reconciliation")} style={[styles.conflictBanner, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "30" }]}>
          <Ionicons name="warning-outline" size={18} color={colors.danger} />
          <Text style={[styles.conflictText, { color: colors.danger }]}>
            {t(conflictCount === 1 ? "console.conflictsAlert" : "console.conflictsAlert_plural", { count: conflictCount })}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.danger} />
        </TouchableOpacity>
      )}

      {/* KPI grid */}
      <View style={styles.kpiGrid}>
        {[
          { label: t("console.kpi.bidons"),       value: totalBidons.toLocaleString(), icon: "cube-outline"            as const, color: colors.primary,        show: true },
          { label: t("console.kpi.totalWeight"),  value: formatWeight(totalKg),        icon: "scale-outline"           as const, color: colors.primary,        show: true },
          { label: t("console.kpi.activeLots"),   value: String(lots.length),          icon: "layers-outline"          as const, color: colors.accent,         show: true },
          { label: t("console.kpi.farmers"),      value: String(farmers.length),       icon: "people-outline"          as const, color: colors.accent,         show: true },
          { label: t("console.kpi.paidFC"),       value: formatFC(totalFC),            icon: "cash-outline"            as const, color: colors.primary,        show: canViewFinance },
          { label: t("console.kpi.eudrReady"),    value: String(eudrReady),            icon: "shield-checkmark-outline"as const, color: colors.accent,         show: canExport || canCertify },
          { label: t("console.kpi.unsynced"),     value: String(unsyncedCount),        icon: "cloud-upload-outline"    as const, color: unsyncedCount > 0 ? colors.warning : colors.mutedForeground, show: true },
          { label: t("console.kpi.conflicts"),    value: String(conflictCount),        icon: "warning-outline"         as const, color: conflictCount > 0 ? colors.danger : colors.mutedForeground,  show: canResolve },
        ].filter((k) => k.show).map((k) => (
          <View key={k.label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={k.icon} size={18} color={k.color} />
            <Text style={[styles.kpiValue, { color: colors.foreground }]}>{k.value}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Par groupement */}
      {groupementTotals.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("console.byGroupement")}</Text>
          <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={[styles.tableHead, { color: colors.mutedForeground, flex: 1 }]}>{t("console.table.groupement")}</Text>
              <Text style={[styles.tableHead, { color: colors.mutedForeground, flex: 1 }]}>{t("console.table.bidons")}</Text>
              {canViewFinance && <Text style={[styles.tableHead, { color: colors.mutedForeground, flex: 1.4 }]}>{t("console.table.totalFC")}</Text>}
            </View>
            {groupementTotals.map(([grp, data], i) => (
              <View key={grp} style={[styles.tableRow, i < groupementTotals.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={[styles.tableCell, { color: colors.foreground, flex: 1, fontFamily: "Inter_500Medium" }]}>{grp}</Text>
                <Text style={[styles.tableCell, { color: colors.foreground, flex: 1 }]}>{data.bidons}</Text>
                {canViewFinance && (
                  <Text style={[styles.tableCell, { color: colors.primary, flex: 1.4, fontFamily: "Inter_600SemiBold" }]}>{data.fc.toLocaleString()}</Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {/* Stage breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("console.lotStatus")}</Text>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {stageGroups.map(([stage, count], i) => (
          <View key={stage} style={[styles.stageRow, i < stageGroups.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <StageTag stage={stage as any} size="sm" />
            <View style={styles.stageBar}>
              <View style={[styles.stageBarFill, { width: `${(count / lots.length) * 100}%` as any, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.stageCount, { color: colors.foreground }]}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Recent lots */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("console.recentLots")}</Text>
        <TouchableOpacity onPress={() => router.push("/(console)/lots/")}><Text style={[styles.seeAll, { color: colors.primary }]}>{t("common.seeAll")}</Text></TouchableOpacity>
      </View>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {[t("console.table.ref"), t("console.table.stage"), t("console.table.bidons"), t("console.table.farmers")].map((h) => (
            <Text key={h} style={[styles.tableHead, { color: colors.mutedForeground, flex: h === t("console.table.ref") ? 2 : 1 }]}>{h}</Text>
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
            <Text style={[styles.tableCell, { color: colors.foreground, flex: 1 }]}>{lot.bidonCount}</Text>
            <Text style={[styles.tableCell, { color: colors.foreground, flex: 1 }]}>{lot.farmerCount}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Documents */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("console.collectDocs")}</Text>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {[t("console.table.document"), t("console.table.qty"), t("console.table.bidons"), t("console.table.totalFC")].map((h) => (
            <Text key={h} style={[styles.tableHead, { color: colors.mutedForeground, flex: h === t("console.table.totalFC") ? 1.4 : 1 }]}>{h}</Text>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(console)/registers" as any)}
          style={[styles.tableRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
        >
          <Text style={[styles.tableCell, { color: colors.foreground, flex: 1, fontFamily: "Inter_500Medium" }]}>{t("common.registers")}</Text>
          <Text style={[styles.tableCell, { color: colors.primary, flex: 1, fontFamily: "Inter_700Bold" }]}>{registers.length}</Text>
          <Text style={[styles.tableCell, { color: colors.foreground, flex: 1 }]}>{totalBidons}</Text>
          <Text style={[styles.tableCell, { color: colors.primary, flex: 1.4, fontFamily: "Inter_600SemiBold" }]}>{formatFC(totalFC)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(console)/reports" as any)}
          style={styles.tableRow}
        >
          <Text style={[styles.tableCell, { color: colors.foreground, flex: 1, fontFamily: "Inter_500Medium" }]}>{t("common.reports")}</Text>
          <Text style={[styles.tableCell, { color: colors.primary, flex: 1, fontFamily: "Inter_700Bold" }]}>{reports.length}</Text>
          <Text style={[styles.tableCell, { color: colors.foreground, flex: 1 }]}>{totalBidons}</Text>
          <Text style={[styles.tableCell, { color: colors.primary, flex: 1.4, fontFamily: "Inter_600SemiBold" }]}>{formatFC(totalFC)}</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>
        {t("nav.console")} — {roleLabel}
      </Text>
      <View style={styles.navGrid}>

        <RoleGate permission="register.view">
          <Pressable
            onPress={() => router.push("/(console)/registers" as any)}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.amberLight }]}><Ionicons name="list-outline" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.cherryRegisters")}</Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground }]}>{t("console.nav.cherryRegistersSub", { count: registers.length, bidons: totalBidons })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

        <RoleGate permission="report.view">
          <Pressable
            onPress={() => router.push("/(console)/reports" as any)}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.amberLight }]}><Ionicons name="folder-outline" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.deliveryReports")}</Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground }]}>{t("console.nav.deliveryReportsSub", { count: reports.length })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

        <RoleGate permission="lot.view">
          <Pressable
            onPress={() => router.push("/(console)/lots/" as any)}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.amberLight }]}><Ionicons name="layers-outline" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.lotExplorer")}</Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground }]}>{t("console.nav.lotExplorerSub", { count: lots.length })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

        <RoleGate permission="conflict.resolve">
          <Pressable
            onPress={() => router.push("/(console)/reconciliation" as any)}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: conflictCount > 0 ? colors.danger + "30" : colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: conflictCount > 0 ? colors.dangerLight : colors.amberLight }]}>
              <Ionicons name="git-compare-outline" size={20} color={conflictCount > 0 ? colors.danger : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.reconciliation")}</Text>
              <Text style={[styles.navSub, { color: conflictCount > 0 ? colors.danger : colors.mutedForeground }]}>
                {t(conflictCount === 1 ? "console.nav.reconciliationSub" : "console.nav.reconciliationSub_plural", { count: conflictCount })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

        <RoleGate permission="export.eudr">
          <Pressable
            onPress={() => showInfo(t("console.nav.eudrExport"), t("console.eudrInfo"))}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: "#eff6ff" }]}><Ionicons name="document-text-outline" size={20} color="#2563eb" /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.eudrExport")}</Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground }]}>{t("console.nav.eudrExportSub")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

        <RoleGate permission="lot.certify">
          <Pressable
            onPress={() => showInfo(t("console.nav.certifications"), t("console.certInfo"))}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: "#f0fdf4" }]}><Ionicons name="ribbon-outline" size={20} color="#16a34a" /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.certifications")}</Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground }]}>{t("console.nav.certificationsSub")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

        <RoleGate permission="lot.grade">
          <Pressable
            onPress={() => showInfo(t("console.nav.qualityControl"), t("console.qcInfo"))}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: "#fef2f2" }]}><Ionicons name="checkmark-circle-outline" size={20} color="#dc2626" /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.qualityControl")}</Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground }]}>{t("console.nav.qualityControlSub")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

        <RoleGate permission="admin.members">
          <Pressable
            onPress={() => showInfo(t("console.nav.members"), t("console.membersInfo"))}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.navIcon, { backgroundColor: "#eff6ff" }]}><Ionicons name="people-outline" size={20} color="#1d4ed8" /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{t("console.nav.members")}</Text>
              <Text style={[styles.navSub, { color: colors.mutedForeground }]}>{t("console.nav.membersSub", { count: farmers.length })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </RoleGate>

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
  kpiCard: { width: "22%", minWidth: 80, flexGrow: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 5 },
  kpiValue: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  kpiLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  tableCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  tableHeader: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  tableHead: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  tableCell: { fontSize: 12, fontFamily: "Inter_400Regular" },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  stageBar: { flex: 1, height: 4, backgroundColor: "#e7e5e4", borderRadius: 2, overflow: "hidden" },
  stageBarFill: { height: 4, borderRadius: 2 },
  stageCount: { fontSize: 13, fontFamily: "Inter_600SemiBold", width: 20, textAlign: "right" },
  navGrid: { gap: 10, marginBottom: 8 },
  navCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  navIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  navSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
});
