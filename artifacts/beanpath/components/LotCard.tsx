import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StageTag } from "@/components/StageTag";
import type { Lot } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

type Props = { lot: Lot; onPress?: () => void };

function formatWeight(kg: number) {
  if (kg >= 1000) return (kg / 1000).toFixed(2) + " MT";
  return kg.toFixed(0) + " kg";
}

export function LotCard({ lot, onPress }: Props) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.top}>
        <Text style={[styles.ref, { color: colors.foreground }]}>{lot.ref}</Text>
        <StageTag stage={lot.stage} />
      </View>
      <View style={styles.bottom}>
        <View style={styles.stat}>
          <Ionicons name="scale-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{formatWeight(lot.weightKg)}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="cube-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{lot.bidonCount} bidons</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{lot.farmerCount} agriculteurs</Text>
        </View>
        {lot.certifications.length > 0 && (
          <View style={[styles.cert, { backgroundColor: colors.greenLight }]}>
            <Ionicons name="shield-checkmark-outline" size={10} color={colors.accent} />
            <Text style={[styles.certText, { color: colors.accent }]}>{lot.certifications.length}</Text>
          </View>
        )}
        {lot.cupScore && (
          <View style={[styles.cert, { backgroundColor: colors.amberLight }]}>
            <Text style={[styles.certText, { color: colors.amber }]}>{lot.cupScore} SCA</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 10, marginBottom: 10 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ref: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  bottom: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cert: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  certText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
