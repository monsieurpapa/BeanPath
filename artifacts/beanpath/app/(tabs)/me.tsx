import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { useColors } from "@/hooks/useColors";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "rw", label: "Kinyarwanda" },
];

export default function MeScreen() {
  const { user, signOut, updateUser } = useAuth();
  const { pendingCount, conflictCount, lastSyncedAt, online, syncing, triggerSync } = useSync();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [wifiOnly, setWifiOnly] = useState(true);

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      signOut().then(() => router.replace("/(auth)/welcome"));
      return;
    }
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut().then(() => router.replace("/(auth)/welcome")) },
    ]);
  };

  const formatAgo = (iso: string | null) => {
    if (!iso) return "Never";
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m} min ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };

  const ROLE_LABELS: Record<string, string> = {
    field_agent: "Field Agent",
    lead_farmer: "Lead Farmer",
    station_operator: "Station Operator",
    transporter: "Transporter",
    mill_operator: "Mill Operator",
    qc_grader: "QC Grader",
    exporter: "Exporter",
    buyer: "Buyer",
    coop_admin: "Cooperative Admin",
    certifier: "Certifier",
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }, Platform.OS === "web" && { paddingTop: 80 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.initials}>
            {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name ?? "Unknown"}</Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>{ROLE_LABELS[user?.role ?? ""] ?? user?.role}</Text>
          <Text style={[styles.userOrg, { color: colors.mutedForeground }]}>{user?.orgName}</Text>
        </View>
        <View style={[styles.cropPill, { backgroundColor: colors.greenLight }]}>
          <Ionicons name="leaf-outline" size={12} color={colors.accent} />
          <Text style={[styles.cropText, { color: colors.accent }]}>{user?.cropFocus}</Text>
        </View>
      </View>

      {/* Sync status */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sync status</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name={online ? "cloud-outline" : "cloud-offline-outline"} size={18} color={online ? colors.accent : colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Connection</Text>
          <Text style={[styles.rowValue, { color: online ? colors.accent : colors.mutedForeground }]}>{online ? "Online" : "Offline"}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Last synced</Text>
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{formatAgo(lastSyncedAt)}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name="cloud-upload-outline" size={18} color={pendingCount > 0 ? colors.warning : colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Pending</Text>
          <Text style={[styles.rowValue, { color: pendingCount > 0 ? colors.warning : colors.mutedForeground }]}>{pendingCount} records</Text>
        </View>
        {conflictCount > 0 && (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Ionicons name="warning-outline" size={18} color={colors.warning} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Conflicts</Text>
            <Text style={[styles.rowValue, { color: colors.warning }]}>{conflictCount} unresolved</Text>
          </View>
        )}
        <View style={styles.row}>
          <Ionicons name="wifi-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>WiFi-only sync</Text>
          <Switch value={wifiOnly} onValueChange={setWifiOnly} thumbColor={colors.card} trackColor={{ false: colors.muted, true: colors.primary }} />
        </View>
      </View>

      <TouchableOpacity
        onPress={triggerSync}
        disabled={syncing || !online}
        style={[styles.syncBtn, { borderColor: colors.primary, opacity: syncing || !online ? 0.5 : 1 }]}
      >
        <Ionicons name="sync-outline" size={18} color={colors.primary} />
        <Text style={[styles.syncBtnText, { color: colors.primary }]}>{syncing ? "Syncing…" : "Sync now"}</Text>
      </TouchableOpacity>

      {/* Language */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Language</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {LANGUAGES.map((lang, i) => (
          <Pressable
            key={lang.code}
            onPress={() => updateUser({ locale: lang.code })}
            style={[styles.row, i < LANGUAGES.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}]}
          >
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>{lang.label}</Text>
            {user?.locale === lang.code && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
          </Pressable>
        ))}
      </View>

      {/* Device info */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Device</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name="phone-portrait-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Device ID</Text>
          <Text style={[styles.rowValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>d8f3a1…c9e2</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Device key</Text>
          <Text style={[styles.rowValue, { color: colors.accent }]}>Active</Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity onPress={handleSignOut} style={[styles.signOutBtn, { borderColor: colors.danger + "40", backgroundColor: colors.dangerLight }]}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={[styles.signOutText, { color: colors.danger }]}>Sign out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>BeanPath v1.0.0 · Offline-first · Cryptographically verified</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  initials: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  userName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  userRole: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  userOrg: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  cropPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  cropText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  section: { borderRadius: 14, borderWidth: 1, marginBottom: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1 },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  syncBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 24 },
  syncBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  version: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 24, lineHeight: 16 },
});
