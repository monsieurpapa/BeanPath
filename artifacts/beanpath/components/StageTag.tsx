import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LotStage } from "@/context/DataContext";

type StageCfg = {
  label: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  bg: string;
  fg: string;
};

const STAGE_CONFIG: Record<LotStage, StageCfg> = {
  cherry_received: { label: "Cerises reçues",   icon: "leaf",                   bg: "#fee2e2", fg: "#b91c1c" },
  pulping:         { label: "Dépulpage",         icon: "cog-outline",            bg: "#fef3c7", fg: "#92400e" },
  fermenting:      { label: "Fermentation",      icon: "flask-outline",          bg: "#fef9c3", fg: "#854d0e" },
  washing:         { label: "Lavage",            icon: "water-outline",          bg: "#dbeafe", fg: "#1d4ed8" },
  drying:          { label: "Séchage",           icon: "sunny-outline",          bg: "#fef3c7", fg: "#b45309" },
  dry_parchment:   { label: "Parche sèche",      icon: "cube-outline",           bg: "#f5f5f4", fg: "#57534e" },
  hulling:         { label: "Déparcheminé",      icon: "construct-outline",      bg: "#e0e7ff", fg: "#3730a3" },
  graded:          { label: "Trié/Classé",       icon: "filter-outline",         bg: "#dcfce7", fg: "#15803d" },
  bagged:          { label: "Ensaché",           icon: "bag-handle-outline",     bg: "#dcfce7", fg: "#166534" },
  in_transit:      { label: "En transit",        icon: "car-outline",            bg: "#dbeafe", fg: "#1d4ed8" },
  shipped:         { label: "Exporté",           icon: "boat-outline",           bg: "#e0e7ff", fg: "#3730a3" },
  closed:          { label: "Fermé",             icon: "lock-closed-outline",    bg: "#f3f4f6", fg: "#6b7280" },
};

type Props = {
  stage: LotStage;
  size?: "sm" | "md";
};

export function StageTag({ stage, size = "sm" }: Props) {
  const cfg = STAGE_CONFIG[stage] ?? { label: stage, icon: "ellipse-outline" as const, bg: "#f3f4f6", fg: "#6b7280" };
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

export function stageLabel(stage: LotStage): string {
  return STAGE_CONFIG[stage]?.label ?? stage;
}

const styles = StyleSheet.create({
  tag: { flexDirection: "row", alignItems: "center", borderRadius: 20, gap: 4 },
  small: { paddingHorizontal: 7, paddingVertical: 3 },
  medium: { paddingHorizontal: 10, paddingVertical: 5 },
  label: { fontFamily: "Inter_600SemiBold" },
  labelSm: { fontSize: 10 },
  labelMd: { fontSize: 12 },
});
