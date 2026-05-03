import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Farmer } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  farmer: Farmer;
  onPress: () => void;
};

const AVATAR_COLORS = ["#b45309", "#15803d", "#1d4ed8", "#7c3aed", "#db2777", "#0891b2"];
function avatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}
function getInitials(first: string, last: string) {
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}
const ROLE_ICONS: Record<string, string> = {
  president: "★", vp: "◆", secretary: "▲",
};

export function FarmerCard({ farmer, onPress }: Props) {
  const colors = useColors();
  const bg = avatarColor(farmer.id);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.initials}>{getInitials(farmer.firstName, farmer.lastName)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>{farmer.firstName} {farmer.lastName}</Text>
          {farmer.groupRole && farmer.groupRole !== "member" && (
            <Text style={{ fontSize: 10, color: colors.amber }}> {ROLE_ICONS[farmer.groupRole]}</Text>
          )}
        </View>
        <Text style={[styles.bioId, { color: colors.primary }]}>{farmer.bioId}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{farmer.groupement} · {farmer.village}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.piedsBadge, { backgroundColor: colors.greenLight }]}>
          <Ionicons name="leaf-outline" size={10} color={colors.accent} />
          <Text style={[styles.piedsText, { color: colors.accent }]}>{farmer.nbPieds}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  initials: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  bioId: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 1 },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  right: { alignItems: "flex-end", gap: 4 },
  piedsBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10 },
  piedsText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
