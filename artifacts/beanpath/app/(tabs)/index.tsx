import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { useColors } from "@/hooks/useColors";

function formatWeight(g: number) {
  if (g >= 1000) return (g / 1000).toFixed(0) + " kg";
  return g + " g";
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

const QUICK_ACTIONS = [
  { label: "Register Farmer", icon: "person-add-outline" as const, route: "/farmers/new" as const },
  { label: "New Collection", icon: "scale-outline" as const, route: "/collect" as const },
  { label: "View Lots", icon: "layers-outline" as const, route: "/lots" as const },
];

export default function TodayScreen() {
  const { user } = useAuth();
  const { collections } = useData();
  const { pendingCount, triggerSync, syncing } = useSync();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const todayCollections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return collections.filter((c) => new Date(c.recordedAt) >= today);
  }, [collections]);

  const todayKg = todayCollections.reduce((s, c) => s + c.weightGrams / 1000, 0);
  const farmersVisited = new Set(todayCollections.map((c) => c.farmerId)).size;

  const recent = collections.slice(0, 8);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
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
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting()},</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name?.split(" ")[0] ?? "Agent"}</Text>
        </View>
        <View style={[styles.orgPill, { backgroundColor: colors.amberLight }]}>
          <Text style={[styles.orgText, { color: colors.amber }]} numberOfLines={1}>{user?.orgName?.split(" ")[0]}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: "Collections", value: String(todayCollections.length), icon: "receipt-outline" as const },
          { label: "Total weight", value: `${todayKg.toFixed(0)} kg`, icon: "scale-outline" as const },
          { label: "Farmers", value: String(farmersVisited), icon: "people-outline" as const },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={s.icon} size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Pending sync nudge */}
      {pendingCount > 0 && (
        <TouchableOpacity onPress={triggerSync} style={[styles.syncBanner, { backgroundColor: colors.amberLight, borderColor: colors.warning + "40" }]}>
          <Ionicons name="cloud-upload-outline" size={16} color={colors.warning} />
          <Text style={[styles.syncText, { color: colors.amber }]}>{pendingCount} records waiting to sync · Tap to sync now</Text>
        </TouchableOpacity>
      )}

      {/* Quick actions */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick actions</Text>
      <View style={styles.actions}>
        {QUICK_ACTIONS.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => router.push(a.route as any)}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.75 }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.amberLight }]}>
              <Ionicons name={a.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recent collections */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent collections</Text>
      {recent.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="scale-outline" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No collections yet today</Text>
        </View>
      ) : (
        recent.map((c) => (
          <View key={c.id} style={[styles.collectionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.collAvatar, { backgroundColor: colors.amberLight }]}>
              <Ionicons name="leaf-outline" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.collName, { color: colors.foreground }]}>{c.farmerName}</Text>
              <Text style={[styles.collSub, { color: colors.mutedForeground }]}>{formatWeight(c.weightGrams)} · {c.paymentMethod === "mobile_money" ? "Mobile money" : "Cash"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.collTime, { color: colors.mutedForeground }]}>{timeAgo(c.recordedAt)}</Text>
              {!c.synced && (
                <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />
              )}
            </View>
          </View>
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
  orgPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, maxWidth: 140 },
  orgText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  syncBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  syncText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionBtn: { flex: 1, alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  collectionRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  collAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  collName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  collSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  collTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  pendingDot: { width: 7, height: 7, borderRadius: 4, marginTop: 4 },
  emptyCard: { padding: 24, borderRadius: 14, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
