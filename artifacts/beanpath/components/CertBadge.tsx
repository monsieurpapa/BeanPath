import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const CERT_LABELS: Record<string, string> = {
  fair_trade: "Fair Trade",
  rainforest_alliance: "RA",
  organic_eu: "Org EU",
  organic_usda: "Org USDA",
  eudr: "EUDR",
  jas: "JAS",
  lacey: "LACEY",
  uk_fsa: "UK FSA",
};

type Props = { regime: string };

export function CertBadge({ regime }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.badge, { backgroundColor: colors.greenLight }]}>
      <Text style={[styles.text, { color: colors.accent }]}>{CERT_LABELS[regime] ?? regime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  text: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
