import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { LotStage } from "@/context/DataContext";

type StageCfg = {
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  bg: string;
  fg: string;
};

const STAGE_CONFIG: Record<LotStage, StageCfg> = {
  cherry_received: { icon: "leaf",                   bg: "#fee2e2", fg: "#b91c1c" },
  pulping:         { icon: "cog-outline",            bg: "#fef3c7", fg: "#92400e" },
  fermenting:      { icon: "flask-outline",          bg: "#fef9c3", fg: "#854d0e" },
  washing:         { icon: "water-outline",          bg: "#dbeafe", fg: "#1d4ed8" },
  drying:          { icon: "sunny-outline",          bg: "#fef3c7", fg: "#b45309" },
  dry_parchment:   { icon: "cube-outline",           bg: "#f5f5f4", fg: "#57534e" },
  hulling:         { icon: "construct-outline",      bg: "#e0e7ff", fg: "#3730a3" },
  graded:          { icon: "filter-outline",         bg: "#dcfce7", fg: "#15803d" },
  bagged:          { icon: "bag-handle-outline",     bg: "#dcfce7", fg: "#166534" },
  in_transit:      { icon: "car-outline",            bg: "#dbeafe", fg: "#1d4ed8" },
  shipped:         { icon: "boat-outline",           bg: "#e0e7ff", fg: "#3730a3" },
  closed:          { icon: "lock-closed-outline",    bg: "#f3f4f6", fg: "#6b7280" },
};

type Props = {
  stage: LotStage;
  size?: "sm" | "md";
};

export function StageTag({ stage, size = "sm" }: Props) {
  const { t } = useTranslation();
  const cfg = STAGE_CONFIG[stage] ?? { icon: "ellipse-outline" as const, bg: "#f3f4f6", fg: "#6b7280" };
  const label = t(`stages.${stage}`, stage);
  const isSmall = size === "sm";
  return (
    <View style={[styles.tag, { backgroundColor: cfg.bg }, isSmall ? styles.small : styles.medium]}>
      <Ionicons name={cfg.icon} size={isSmall ? 10 : 13} color={cfg.fg} />
      <Text style={[styles.label, { color: cfg.fg }, isSmall ? styles.labelSm : styles.labelMd]}>
        {label}
      </Text>
    </View>
  );
}

export function stageLabel(stage: LotStage): string {
  const cfg = STAGE_CONFIG[stage];
  return cfg ? stage : stage;
}

const styles = StyleSheet.create({
  tag: { flexDirection: "row", alignItems: "center", borderRadius: 20, gap: 4 },
  small: { paddingHorizontal: 7, paddingVertical: 3 },
  medium: { paddingHorizontal: 10, paddingVertical: 5 },
  label: { fontFamily: "Inter_600SemiBold" },
  labelSm: { fontSize: 10 },
  labelMd: { fontSize: 12 },
});
