import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LotStage } from "@/context/DataContext";

const STAGE_CONFIG: Record<LotStage, { label: string; icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap; bg: string; fg: string }> = {
  cherry: { label: "Cherry", icon: "leaf", bg: "#fee2e2", fg: "#b91c1c" },
  wet_parchment: { label: "Wet Parchment", icon: "water", bg: "#fef3c7", fg: "#92400e" },
  drying: { label: "Drying", icon: "sunny", bg: "#fef9c3", fg: "#854d0e" },
  dry_parchment: { label: "Dry Parchment", icon: "cube-outline", bg: "#f5f5f4", fg: "#57534e" },
  green: { label: "Green", icon: "bag-handle-outline", bg: "#dcfce7", fg: "#15803d" },
  in_transit: { label: "In Transit", icon: "car", bg: "#dbeafe", fg: "#1d4ed8" },
  shipped: { label: "Shipped", icon: "boat", bg: "#e0e7ff", fg: "#3730a3" },
  closed: { label: "Closed", icon: "lock-closed", bg: "#f3f4f6", fg: "#6b7280" },
};

type Props = {
  stage: LotStage;
  size?: "sm" | "md";
};

export function StageTag({ stage, size = "sm" }: Props) {
  const cfg = STAGE_CONFIG[stage];
  const isSmall = size === "sm";
  return (
    <View style={[styles.tag, { backgroundColor: cfg.bg }, isSmall ? styles.small : styles.medium]}>
      <Ionicons name={cfg.icon} size={isSmall ? 10 : 13} color={cfg.fg} />
      <Text style={[styles.label, { color: cfg.fg }, isSmall ? styles.labelSm : styles.labelMd]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    gap: 4,
  },
  small: { paddingHorizontal: 7, paddingVertical: 3 },
  medium: { paddingHorizontal: 10, paddingVertical: 5 },
  label: { fontFamily: "Inter_600SemiBold" },
  labelSm: { fontSize: 10 },
  labelMd: { fontSize: 12 },
});
