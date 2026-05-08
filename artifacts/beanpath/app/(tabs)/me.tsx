import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { useToast } from "@/context/ToastContext";
import { ROLE_LABELS } from "@/lib/rbac";
import { useColors } from "@/hooks/useColors";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
  { code: "rw", label: "Kinyarwanda" },
];

export default function MeScreen() {
  const { t } = useTranslation();
  const { user, signOut, updateUser } = useAuth();
  const { pendingCount, conflictCount, lastSyncedAt, online, syncing, triggerSync } = useSync();
  const { showSuccess, showError } = useToast();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [wifiOnly, setWifiOnly] = useState(true);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const handleSignOutRequest = () => {
    if (Platform.OS !== "web") {
      Alert.alert(t("profile.signOut.title"), t("profile.signOut.confirm"), [
        { text: t("profile.signOut.cancel"), style: "cancel" },
        { text: t("profile.signOut.confirmBtn"), style: "destructive", onPress: () => signOut().then(() => router.replace("/(auth)/welcome")) },
      ]);
      return;
    }
    setConfirmingSignOut(true);
  };

  const handleSignOutConfirm = () => {
    setConfirmingSignOut(false);
    signOut().then(() => router.replace("/(auth)/welcome"));
  };

  const handleSync = async () => {
    try {
      await triggerSync();
      showSuccess(t("profile.sync.done"), t("profile.sync.doneMsg"));
    } catch {
      showError(t("profile.sync.failed"), t("profile.sync.failedMsg"));
    }
  };

  const handleLanguageChange = (code: string) => {
    updateUser({ locale: code });
    const lang = LANGUAGES.find((l) => l.code === code);
    showSuccess(t("profile.languageUpdated"), lang?.label);
  };

  const formatAgo = (iso: string | null) => {
    if (!iso) return t("profile.never");
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (isNaN(m)) return t("profile.never");
    if (m < 1) return t("profile.justNow");
    if (m < 60) return t("profile.minutesAgo", { m });
    if (m < 1440) return t("profile.hoursAgo", { h: Math.floor(m / 60) });
    return t("profile.daysAgo", { d: Math.floor(m / 1440) });
  };

  const roleLabel = user?.role ? (t(`roles.${user.role}`, ROLE_LABELS[user.role])) : "—";

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
          <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name ?? t("profile.unknown")}</Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>{roleLabel}</Text>
          <Text style={[styles.userOrg, { color: colors.mutedForeground }]}>{user?.orgName}</Text>
        </View>
        {user?.cropFocus && (
          <View style={[styles.cropPill, { backgroundColor: colors.greenLight }]}>
            <Ionicons name="leaf-outline" size={12} color={colors.accent} />
            <Text style={[styles.cropText, { color: colors.accent }]}>{user.cropFocus}</Text>
          </View>
        )}
      </View>

      {/* Sync status */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("profile.sections.sync")}</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name={online ? "cloud-outline" : "cloud-offline-outline"} size={18} color={online ? colors.accent : colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("profile.sync.connection")}</Text>
          <Text style={[styles.rowValue, { color: online ? colors.accent : colors.mutedForeground }]}>
            {online ? t("common.online") : t("common.offline")}
          </Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("profile.sync.lastSync")}</Text>
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{formatAgo(lastSyncedAt)}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name="cloud-upload-outline" size={18} color={pendingCount > 0 ? colors.warning : colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("profile.sync.pending")}</Text>
          <Text style={[styles.rowValue, { color: pendingCount > 0 ? colors.warning : colors.mutedForeground }]}>
            {t("profile.sync.pendingCount", { count: pendingCount })}
          </Text>
        </View>
        {conflictCount > 0 && (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Ionicons name="warning-outline" size={18} color={colors.warning} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("profile.sync.conflicts")}</Text>
            <Text style={[styles.rowValue, { color: colors.warning }]}>
              {t("profile.sync.conflictCount", { count: conflictCount })}
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <Ionicons name="wifi-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("profile.sync.wifiOnly")}</Text>
          <Switch
            value={wifiOnly}
            onValueChange={setWifiOnly}
            thumbColor={colors.card}
            trackColor={{ false: colors.muted, true: colors.primary }}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSync}
        disabled={syncing || !online}
        style={[styles.syncBtn, { borderColor: colors.primary, opacity: syncing || !online ? 0.5 : 1 }]}
      >
        <Ionicons name="sync-outline" size={18} color={colors.primary} />
        <Text style={[styles.syncBtnText, { color: colors.primary }]}>
          {syncing ? t("profile.sync.syncing") : t("profile.sync.syncNow")}
        </Text>
      </TouchableOpacity>

      {/* Language */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("profile.sections.language")}</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {LANGUAGES.map((lang, i) => (
          <Pressable
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            style={[styles.row, i < LANGUAGES.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}]}
          >
            <Text style={[styles.langFlag, { color: colors.mutedForeground }]}>
              {lang.code === "fr" ? "🇫🇷" : lang.code === "en" ? "🇬🇧" : lang.code === "sw" ? "🇹🇿" : "🇷🇼"}
            </Text>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>{lang.label}</Text>
            {user?.locale === lang.code && (
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Device info */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("profile.sections.device")}</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Ionicons name="phone-portrait-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("profile.device.id")}</Text>
          <Text style={[styles.rowValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>d8f3a1…c9e2</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>{t("profile.device.key")}</Text>
          <Text style={[styles.rowValue, { color: colors.accent }]}>{t("profile.device.active")}</Text>
        </View>
      </View>

      {/* Sign out */}
      {confirmingSignOut ? (
        <View style={[styles.confirmCard, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "40" }]}>
          <Text style={[styles.confirmText, { color: colors.danger }]}>
            {t("profile.signOut.confirm")}
          </Text>
          <View style={styles.confirmRow}>
            <TouchableOpacity
              onPress={() => setConfirmingSignOut(false)}
              style={[styles.confirmBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.confirmBtnText, { color: colors.foreground }]}>{t("profile.signOut.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSignOutConfirm}
              style={[styles.confirmBtn, { backgroundColor: colors.danger }]}
            >
              <Text style={[styles.confirmBtnText, { color: "#fff" }]}>{t("profile.signOut.confirmBtn")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleSignOutRequest}
          style={[styles.signOutBtn, { borderColor: colors.danger + "40", backgroundColor: colors.dangerLight }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.signOutText, { color: colors.danger }]}>{t("profile.signOut.button")}</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        {t("profile.version")}
      </Text>
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
  langFlag: { fontSize: 18, width: 28, textAlign: "center" },
  syncBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 24 },
  syncBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  confirmCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 8, gap: 12 },
  confirmText: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  confirmRow: { flexDirection: "row", gap: 10 },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  confirmBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  version: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 24, lineHeight: 16 },
});
