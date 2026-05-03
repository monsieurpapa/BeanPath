import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Farmer } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  farmer: Farmer;
  onPress: () => void;
};

function getInitials(first: string, last: string) {
  return (first[0] ?? "") + (last[0] ?? "");
}

const AVATAR_COLORS = ["#b45309", "#15803d", "#1d4ed8", "#7c3aed", "#db2777"];

function avatarColor(id: string) {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function FarmerCard({ farmer, onPress }: Props) {
  const colors = useColors();
  const bg = avatarColor(farmer.id);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.initials}>{getInitials(farmer.firstName, farmer.lastName)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{farmer.firstName} {farmer.lastName}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{farmer.householdCode} · {farmer.village}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.plotBadge, { backgroundColor: colors.amberLight }]}>
          <Ionicons name="map-outline" size={11} color={colors.amber} />
          <Text style={[styles.plotCount, { color: colors.amber }]}>{farmer.plotCount}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  right: { alignItems: "flex-end", gap: 4 },
  plotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  plotCount: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
