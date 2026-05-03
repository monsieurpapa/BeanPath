import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function PrimaryButton({ label, onPress, loading, disabled, variant = "primary", style, fullWidth = true }: Props) {
  const colors = useColors();

  const palettes: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.primaryForeground },
    secondary: { bg: colors.surface, fg: colors.foreground, border: colors.border },
    ghost: { bg: "transparent", fg: colors.primary },
    danger: { bg: colors.danger, fg: "#ffffff" },
  };

  const { bg, fg, border } = palettes[variant];
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (!isDisabled) {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: isDisabled ? colors.muted : bg, borderColor: border ?? "transparent", borderWidth: border ? 1 : 0 },
        fullWidth && styles.full,
        pressed && !isDisabled && { opacity: 0.82, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <Text style={[styles.label, { color: isDisabled ? colors.mutedForeground : fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  full: { width: "100%" },
  label: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
