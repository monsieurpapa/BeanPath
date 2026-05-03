import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSync } from "@/context/SyncContext";
import { useColors } from "@/hooks/useColors";

type Props = { compact?: boolean };

export function SyncChip({ compact }: Props) {
  const { online, pendingCount, conflictCount, syncing, lastSyncedAt, triggerSync } = useSync();
  const colors = useColors();

  const getStatus = () => {
    if (syncing) return { label: "Syncing…", color: colors.primary, icon: null as null };
    if (!online) return { label: "Offline", color: colors.stone, icon: "cloud-offline-outline" as const };
    if (conflictCount > 0) return { label: `${conflictCount} conflict${conflictCount > 1 ? "s" : ""}`, color: colors.warning, icon: "warning-outline" as const };
    if (pendingCount > 0) return { label: `${pendingCount} pending`, color: colors.warning, icon: "cloud-upload-outline" as const };
    return { label: "Synced", color: colors.accent, icon: "checkmark-circle-outline" as const };
  };

  const { label, color, icon } = getStatus();

  const formatAgo = () => {
    if (!lastSyncedAt) return "";
    const ms = Date.now() - new Date(lastSyncedAt).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <TouchableOpacity
      onPress={triggerSync}
      style={[styles.chip, { backgroundColor: color + "18", borderColor: color + "40" }]}
      activeOpacity={0.7}
    >
      {syncing ? (
        <ActivityIndicator size={10} color={color} style={{ marginRight: 4 }} />
      ) : icon ? (
        <Ionicons name={icon} size={12} color={color} style={{ marginRight: 3 }} />
      ) : (
        <View style={[styles.dot, { backgroundColor: color }]} />
      )}
      <Text style={[styles.label, { color }]}>{label}</Text>
      {!compact && !syncing && lastSyncedAt && (
        <Text style={[styles.ago, { color: colors.mutedForeground }]}> · {formatAgo()}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  ago: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
});
