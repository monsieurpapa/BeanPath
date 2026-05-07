import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { ROLE_LABELS } from "@/lib/rbac";
import { usePermission } from "@/hooks/usePermission";
import { useColors } from "@/hooks/useColors";

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  return `il y a ${Math.floor(m / 60)}h`;
}

const ALL_QUICK_ACTIONS = [
  { label: "Enregistrer agriculteur", icon: "person-add-outline" as const, route: "/(tabs)/farmers/new" as const, permission: "farmer.create" as const },
  { label: "Enregistrer livraison",   icon: "cube-outline"        as const, route: "/(tabs)/collect/"     as const, permission: "delivery.create" as const },
  { label: "Mes lots",                icon: "layers-outline"       as const, route: "/(tabs)/lots/"        as const, permission: "lot.view" as const },
];

export default function TodayScreen() {
  const { user } = useAuth();
  const { deliveries } = useData();
  const { pendingCount, triggerSync, syncing } = useSync();
  const canCreateFarmer   = usePermission("farmer.create");
  const canCreateDelivery = usePermission("delivery.create");
  const canViewLots       = usePermission("lot.view");
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const todayDeliveries = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return deliveries.filter((d) => d.purchaseDate === todayStr || d.recordedAt.startsWith(todayStr));
  }, [deliveries]);

  const todayBidons = todayDeliveries.reduce((s, d) => s + d.quantityBidons, 0);
  const todayFC = todayDeliveries.reduce((s, d) => s + d.totalFC, 0);
  const farmersToday = new Set(todayDeliveries.map((d) => d.farmerId)).size;

  const recent = [...deliveries].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(0, 8);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 17) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }, Platform.OS === "web" && { paddingTop: 16 }]}
      refreshControl={<RefreshControl refreshing={syncing} onRefresh={triggerSync} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting()},</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name?.split(" ")[0] ?? "Agent"}</Text>
          {user?.role && (
            <Text style={[styles.rolePill, { color: colors.primary }]}>
              {ROLE_LABELS[user.role]} · {user.orgName?.split(" ")[0]}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(console)/" as any)}
          style={[styles.consoleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="desktop-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.consoleBtnText, { color: colors.mutedForeground }]}>Console</Text>
        </TouchableOpacity>
      </View>

      {/* Today stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Livraisons", value: String(todayDeliveries.length), icon: "receipt-outline" as const },
          { label: "Bidons reçus", value: String(todayBidons), icon: "cube-outline" as const },
          { label: "Agriculteurs", value: String(farmersToday), icon: "people-outline" as const },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={s.icon} size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Today FC paid */}
      {todayFC > 0 && (
        <View style={[styles.fcCard, { backgroundColor: colors.greenLight, borderColor: colors.accent + "30" }]}>
          <Ionicons name="cash-outline" size={18} color={colors.accent} />
          <Text style={[styles.fcLabel, { color: colors.accent }]}>Payé aujourd'hui</Text>
          <Text style={[styles.fcAmount, { color: colors.accent }]}>{todayFC.toLocaleString()} FC</Text>
        </View>
      )}

      {/* Sync nudge */}
      {pendingCount > 0 && (
        <TouchableOpacity onPress={triggerSync} style={[styles.syncBanner, { backgroundColor: colors.amberLight, borderColor: colors.warning + "40" }]}>
          <Ionicons name="cloud-upload-outline" size={16} color={colors.warning} />
          <Text style={[styles.syncText, { color: colors.amber }]}>{pendingCount} livraison{pendingCount > 1 ? "s" : ""} à synchroniser · Appuyez pour synchroniser</Text>
        </TouchableOpacity>
      )}

      {/* Quick actions — RBAC filtered */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Actions rapides</Text>
      <View style={styles.actions}>
        {ALL_QUICK_ACTIONS.filter((a) => {
          if (a.permission === "farmer.create")   return canCreateFarmer;
          if (a.permission === "delivery.create") return canCreateDelivery;
          if (a.permission === "lot.view")        return canViewLots;
          return true;
        }).map((a) => (
          <Pressable
            key={a.label}
            onPress={() => router.push(a.route as any)}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.amberLight }]}>
              <Ionicons name={a.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recent deliveries */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Livraisons récentes</Text>
      {recent.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="cube-outline" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucune livraison enregistrée aujourd'hui</Text>
        </View>
      ) : (
        recent.map((d) => (
          <TouchableOpacity
            key={d.id}
            onPress={() => router.push({ pathname: "/(tabs)/farmers/[id]", params: { id: d.farmerId } } as any)}
            activeOpacity={0.75}
            style={[styles.delivRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.delivIcon, { backgroundColor: colors.amberLight }]}>
              <Ionicons name="cube-outline" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.delivName, { color: colors.foreground }]}>{d.farmerName}</Text>
              <Text style={[styles.delivSub, { color: colors.mutedForeground }]}>{d.quantityBidons} bidons · {d.pricePerBidonFC} FC/bidon · Reçu #{d.receiptNo}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.delivFC, { color: colors.primary }]}>{d.totalFC.toLocaleString()} FC</Text>
              <Text style={[styles.delivTime, { color: colors.mutedForeground }]}>{timeAgo(d.recordedAt)}</Text>
              {!d.synced && <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  greetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginTop: 2 },
  rolePill: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 4 },
  consoleBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  consoleBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  fcCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  fcLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  fcAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  syncBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  syncText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionBtn: { flex: 1, alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  delivRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  delivIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  delivName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  delivSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  delivFC: { fontSize: 13, fontFamily: "Inter_700Bold" },
  delivTime: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  pendingDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  emptyCard: { padding: 24, borderRadius: 14, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
