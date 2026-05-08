import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatFC(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(3) + " M FC";
  if (n >= 1000)      return (n / 1000).toFixed(0) + " K FC";
  return n.toLocaleString() + " FC";
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { reports, registers, deliveries, stations } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalBidons = useMemo(() => reports.reduce((s, r) => s + r.totalBidons, 0), [reports]);
  const totalFC     = useMemo(() => reports.reduce((s, r) => s + r.totalFC, 0), [reports]);

  const sorted = useMemo(() => [...reports].sort((a, b) => b.reportNo.localeCompare(a.reportNo)), [reports]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary strip */}
      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: t("reports.summary.reports"),   value: String(reports.length),   icon: "folder-outline" as const },
          { label: t("reports.summary.registers"), value: String(registers.length), icon: "list-outline" as const },
          { label: t("reports.summary.bidons"),    value: totalBidons.toLocaleString(), icon: "cube-outline" as const },
          { label: t("reports.summary.totalFC"),   value: formatFC(totalFC),        icon: "cash-outline" as const },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <View style={styles.summStat}>
              <Ionicons name={s.icon} size={14} color={colors.primary} />
              <Text style={[styles.summVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.summLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={[styles.div, { backgroundColor: colors.border }]} />}
          </React.Fragment>
        ))}
      </View>

      {/* Explain card */}
      <View style={[styles.explainCard, { backgroundColor: colors.greenLight, borderColor: colors.accent + "20" }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
        <Text style={[styles.explainText, { color: colors.accent }]}>{t("reports.explain")}</Text>
      </View>

      {/* Report list */}
      {sorted.map(rp => {
        const expanded  = expandedId === rp.id;
        const rpRegs    = registers.filter(r => rp.registerNos.includes(r.registerNo));
        const station   = stations.find(s => s.id === rp.stationId);
        const rpDelivs  = deliveries.filter(d => rp.registerNos.includes(d.cherryRegisterNo));
        const farmerIds = [...new Set(rpDelivs.map(d => d.farmerId))];
        const villages  = [...new Set(rpDelivs.map(d => d.village))];
        const avgRate   = rpDelivs.length > 0
          ? (rpDelivs.reduce((s, d) => s + d.exchangeRateFC_USD, 0) / rpDelivs.length).toFixed(0)
          : "2700";

        const registersLabel = rp.registerNos.length === 1
          ? t("reports.registers", { count: rp.registerNos.length })
          : t("reports.registers_plural", { count: rp.registerNos.length });
        const farmersLabel = farmerIds.length === 1
          ? t("reports.farmers", { count: farmerIds.length })
          : t("reports.farmers_plural", { count: farmerIds.length });

        return (
          <View key={rp.id} style={[styles.rpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.rpHeader}
              onPress={() => setExpandedId(expanded ? null : rp.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.rpNum, { backgroundColor: colors.primary }]}>
                <Text style={styles.rpNumLabel}>{t("reports.reportNum")}</Text>
                <Text style={styles.rpNumValue}>{rp.reportNo}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rpDate, { color: colors.foreground }]}>
                  {fmtDate(rp.dateFrom)}{rp.dateFrom !== rp.dateTo ? ` → ${fmtDate(rp.dateTo)}` : ""}
                </Text>
                <Text style={[styles.rpMeta, { color: colors.mutedForeground }]}>
                  {station?.name} · {registersLabel} · {farmersLabel}
                </Text>
                <Text style={[styles.rpMeta, { color: colors.mutedForeground }]}>
                  {villages.join(", ")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 2 }}>
                <Text style={[styles.rpBidons, { color: colors.primary }]}>{rp.totalBidons} bidons</Text>
                <Text style={[styles.rpFC, { color: colors.foreground }]}>{formatFC(rp.totalFC)}</Text>
                <Text style={[styles.rpUSD, { color: colors.mutedForeground }]}>≈ ${(rp.totalFC / parseFloat(avgRate)).toFixed(0)} USD</Text>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} style={{ marginTop: 2 }} />
              </View>
            </TouchableOpacity>

            {expanded && (
              <View style={[styles.regsContainer, { borderTopColor: colors.border }]}>
                <Text style={[styles.regsTitle, { color: colors.mutedForeground }]}>{t("reports.registersIncluded")}</Text>
                {rpRegs.map((reg, i) => {
                  const regDelivs = deliveries.filter(d => reg.deliveryIds.includes(d.id));
                  const delivLabel = regDelivs.length === 1
                    ? t("reports.deliveries", { count: regDelivs.length })
                    : t("reports.deliveries_plural", { count: regDelivs.length });
                  return (
                    <TouchableOpacity
                      key={reg.id}
                      onPress={() => router.push("/(console)/registers" as any)}
                      style={[styles.regRow, i < rpRegs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.regNumBadge, { backgroundColor: colors.amberLight }]}>
                        <Text style={[styles.regNumBadgeText, { color: colors.primary }]}>{reg.registerNo}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.regVillage, { color: colors.foreground }]}>{reg.village ?? reg.groupement}</Text>
                        <Text style={[styles.regDate, { color: colors.mutedForeground }]}>
                          {fmtDate(reg.date)} · {delivLabel}
                        </Text>
                        <Text style={[styles.regFarmers, { color: colors.mutedForeground }]} numberOfLines={2}>
                          {regDelivs.map(d => d.farmerBioId).join(", ")}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 2 }}>
                        <Text style={[styles.regBidons, { color: colors.primary }]}>{reg.totalBidons}</Text>
                        <Text style={[styles.regBidonsLabel, { color: colors.mutedForeground }]}>bidons</Text>
                        <Text style={[styles.regFC, { color: colors.foreground }]}>{(reg.totalFC / 1000).toFixed(0)}K FC</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Price breakdown */}
                <View style={[styles.breakdownSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.breakdownTitle, { color: colors.mutedForeground }]}>{t("reports.priceBreakdown")}</Text>
                  <View style={styles.breakdownRow}>
                    {[700, 900, 1000].map(price => {
                      const count = rpDelivs.filter(d => d.pricePerBidonFC === price).reduce((s, d) => s + d.quantityBidons, 0);
                      if (!count) return null;
                      return (
                        <View key={price} style={[styles.bandCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={[styles.bandPrice, { color: colors.primary }]}>{price} FC</Text>
                          <Text style={[styles.bandBidons, { color: colors.foreground }]}>{count} bidons</Text>
                          <Text style={[styles.bandFC, { color: colors.mutedForeground }]}>{(count * price / 1000).toFixed(0)}K FC</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Financial summary */}
                <View style={[styles.finSummary, { backgroundColor: colors.amberLight, borderTopColor: colors.border }]}>
                  <View style={styles.finRow}>
                    <Text style={[styles.finLabel, { color: colors.amber }]}>{t("reports.financial.totalPaid")}</Text>
                    <Text style={[styles.finVal, { color: colors.primary }]}>{rp.totalFC.toLocaleString()} FC</Text>
                  </View>
                  <View style={styles.finRow}>
                    <Text style={[styles.finLabel, { color: colors.amber }]}>{t("reports.financial.avgRate")}</Text>
                    <Text style={[styles.finVal, { color: colors.primary }]}>{avgRate} FC/USD</Text>
                  </View>
                  <View style={styles.finRow}>
                    <Text style={[styles.finLabel, { color: colors.amber }]}>{t("reports.financial.usdEquiv")}</Text>
                    <Text style={[styles.finVal, { color: colors.primary }]}>${(rp.totalFC / parseFloat(avgRate)).toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  summary: { flexDirection: "row", borderRadius: 14, borderWidth: 1, paddingVertical: 14, marginBottom: 14 },
  summStat: { flex: 1, alignItems: "center", gap: 3 },
  summVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  summLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  div: { width: 1, marginVertical: 6 },
  explainCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  explainText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  rpCard: { borderRadius: 14, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  rpHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rpNum: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", minWidth: 80 },
  rpNumLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  rpNumValue: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  rpDate: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  rpMeta: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  rpBidons: { fontSize: 15, fontFamily: "Inter_700Bold" },
  rpFC: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rpUSD: { fontSize: 11, fontFamily: "Inter_400Regular" },
  regsContainer: { borderTopWidth: 1, paddingTop: 12 },
  regsTitle: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4, paddingHorizontal: 14, marginBottom: 8 },
  regRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  regNumBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  regNumBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  regVillage: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  regDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  regFarmers: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  regBidons: { fontSize: 15, fontFamily: "Inter_700Bold" },
  regBidonsLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  regFC: { fontSize: 12, fontFamily: "Inter_500Medium" },
  breakdownSection: { borderTopWidth: 1, padding: 14 },
  breakdownTitle: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 },
  breakdownRow: { flexDirection: "row", gap: 8 },
  bandCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 10, alignItems: "center", gap: 3 },
  bandPrice: { fontSize: 13, fontFamily: "Inter_700Bold" },
  bandBidons: { fontSize: 12, fontFamily: "Inter_500Medium" },
  bandFC: { fontSize: 10, fontFamily: "Inter_400Regular" },
  finSummary: { borderTopWidth: 1, padding: 14, gap: 8 },
  finRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  finLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  finVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
