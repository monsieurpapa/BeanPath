import { Ionicons } from "@expo/vector-icons";
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
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + " M FC";
  if (n >= 1000)      return (n / 1000).toFixed(0) + " K FC";
  return n.toLocaleString() + " FC";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

const PRICE_COLOR: Record<number, string> = {
  700: "#854d0e",
  900: "#b45309",
  1000: "#15803d",
};

export default function RegistersScreen() {
  const { t } = useTranslation();
  const { registers, deliveries, reports, stations } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterReport, setFilterReport] = useState<string | null>(null);

  const totalBidons = useMemo(() => registers.reduce((s, r) => s + r.totalBidons, 0), [registers]);
  const totalFC     = useMemo(() => registers.reduce((s, r) => s + r.totalFC, 0), [registers]);

  const filtered = useMemo(() => {
    if (!filterReport) return registers;
    return registers.filter(r => r.deliveryReportNo === filterReport);
  }, [registers, filterReport]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.date.localeCompare(a.date)), [filtered]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary strip */}
      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: t("registers.summary.registers"), value: String(registers.length), icon: "list-outline" as const },
          { label: t("registers.summary.bidons"),    value: totalBidons.toLocaleString(), icon: "cube-outline" as const },
          { label: t("registers.summary.paid"),      value: formatFC(totalFC), icon: "cash-outline" as const },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <View style={styles.summStat}>
              <Ionicons name={s.icon} size={15} color={colors.primary} />
              <Text style={[styles.summVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.summLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={[styles.div, { backgroundColor: colors.border }]} />}
          </React.Fragment>
        ))}
      </View>

      {/* Explain card */}
      <View style={[styles.explainCard, { backgroundColor: colors.amberLight, borderColor: colors.primary + "20" }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.amber} />
        <Text style={[styles.explainText, { color: colors.amber }]}>{t("registers.explain")}</Text>
      </View>

      {/* Filter by report */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilterReport(null)}
            style={[styles.chip, { backgroundColor: !filterReport ? colors.primary : colors.surface, borderColor: !filterReport ? colors.primary : colors.border }]}
          >
            <Text style={[styles.chipText, { color: !filterReport ? "#fff" : colors.mutedForeground }]}>{t("registers.filterAll")}</Text>
          </TouchableOpacity>
          {reports.map(r => (
            <TouchableOpacity
              key={r.id}
              onPress={() => setFilterReport(filterReport === r.reportNo ? null : r.reportNo)}
              style={[styles.chip, { backgroundColor: filterReport === r.reportNo ? colors.primary : colors.surface, borderColor: filterReport === r.reportNo ? colors.primary : colors.border }]}
            >
              <Text style={[styles.chipText, { color: filterReport === r.reportNo ? "#fff" : colors.mutedForeground }]}>
                {t("registers.reportFilter", { n: r.reportNo })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Register list */}
      {sorted.map(reg => {
        const expanded  = expandedId === reg.id;
        const regDelivs = deliveries.filter(d => reg.deliveryIds.includes(d.id));
        const report    = reports.find(r => r.reportNo === reg.deliveryReportNo);
        const station   = stations.find(s => s.id === reg.stationId);

        return (
          <View key={reg.id} style={[styles.regCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.regHeader}
              onPress={() => setExpandedId(expanded ? null : reg.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.regNum, { backgroundColor: colors.amberLight }]}>
                <Text style={[styles.regNumText, { color: colors.primary }]}>{reg.registerNo}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.regTitleRow}>
                  <Text style={[styles.regVillage, { color: colors.foreground }]}>{reg.village ?? reg.groupement}</Text>
                  <View style={[styles.reportPill, { backgroundColor: colors.greenLight }]}>
                    <Text style={[styles.reportPillText, { color: colors.accent }]}>
                      {t("registers.reportFilter", { n: reg.deliveryReportNo })}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.regMeta, { color: colors.mutedForeground }]}>
                  {fmtDate(reg.date)} · {station?.name} · {t(regDelivs.length === 1 ? "registers.deliveries" : "registers.deliveries_plural", { count: regDelivs.length })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 2 }}>
                <Text style={[styles.regBidons, { color: colors.primary }]}>{reg.totalBidons} bidons</Text>
                <Text style={[styles.regFC, { color: colors.foreground }]}>{formatFC(reg.totalFC)}</Text>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} style={{ marginTop: 2 }} />
              </View>
            </TouchableOpacity>

            {expanded && (
              <View style={[styles.delivList, { borderTopColor: colors.border }]}>
                <View style={[styles.delivHead, { backgroundColor: colors.surface }]}>
                  {[
                    t("registers.col.bioFarmer"),
                    t("registers.col.bidons"),
                    t("registers.col.fcPerBidon"),
                    t("registers.col.totalFC"),
                    t("registers.col.receipt"),
                  ].map(h => (
                    <Text key={h} style={[styles.delivHeadCell, { color: colors.mutedForeground }]}>{h}</Text>
                  ))}
                </View>
                {regDelivs.map((d, i) => (
                  <View key={d.id} style={[styles.delivRow, i < regDelivs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={{ flex: 2 }}>
                      <Text style={[styles.delivBioId, { color: colors.primary }]}>{d.farmerBioId}</Text>
                      <Text style={[styles.delivName, { color: colors.foreground }]}>{d.farmerName}</Text>
                      <Text style={[styles.delivVillage, { color: colors.mutedForeground }]}>{d.village}</Text>
                    </View>
                    <Text style={[styles.delivCell, { color: colors.foreground, flex: 0.7, fontFamily: "Inter_600SemiBold" }]}>{d.quantityBidons}</Text>
                    <View style={{ flex: 0.8, alignItems: "center" }}>
                      <View style={[styles.pricePill, { backgroundColor: (PRICE_COLOR[d.pricePerBidonFC] ?? colors.mutedForeground) + "18" }]}>
                        <Text style={[styles.pricePillText, { color: PRICE_COLOR[d.pricePerBidonFC] ?? colors.mutedForeground }]}>{d.pricePerBidonFC}</Text>
                      </View>
                    </View>
                    <Text style={[styles.delivCell, { color: colors.primary, flex: 1, fontFamily: "Inter_600SemiBold" }]}>{d.totalFC.toLocaleString()}</Text>
                    <Text style={[styles.delivCell, { color: colors.mutedForeground, flex: 0.7, fontFamily: "Inter_400Regular" }]}>#{d.receiptNo}</Text>
                  </View>
                ))}
                <View style={[styles.totalsRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                  <Text style={[styles.totalsLabel, { color: colors.mutedForeground }]}>{t("registers.total", { n: reg.registerNo })}</Text>
                  <Text style={[styles.totalsBidons, { color: colors.foreground }]}>{reg.totalBidons} bidons</Text>
                  <Text style={[styles.totalsFC, { color: colors.primary }]}>{reg.totalFC.toLocaleString()} FC</Text>
                </View>
                {regDelivs.length > 0 && (
                  <View style={[styles.rateRow, { borderTopColor: colors.border }]}>
                    <Ionicons name="swap-horizontal-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.rateText, { color: colors.mutedForeground }]}>
                      {t("registers.exchangeRate", {
                        rates: [...new Set(regDelivs.map(d => d.exchangeRateFC_USD))].join(", "),
                        usd: (reg.totalFC / regDelivs[0].exchangeRateFC_USD).toFixed(0),
                      })}
                    </Text>
                  </View>
                )}
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
  summVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  summLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  div: { width: 1, marginVertical: 6 },
  explainCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  explainText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  regCard: { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  regHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  regNum: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: 70, alignItems: "center" },
  regNumText: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  regTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  regVillage: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reportPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  reportPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  regMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  regBidons: { fontSize: 14, fontFamily: "Inter_700Bold" },
  regFC: { fontSize: 12, fontFamily: "Inter_500Medium" },
  delivList: { borderTopWidth: 1 },
  delivHead: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  delivHeadCell: { flex: 1, fontSize: 9, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.3 },
  delivRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  delivBioId: { fontSize: 10, fontFamily: "Inter_600SemiBold", marginBottom: 1 },
  delivName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  delivVillage: { fontSize: 10, fontFamily: "Inter_400Regular" },
  delivCell: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  pricePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pricePillText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  totalsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, gap: 8 },
  totalsLabel: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular" },
  totalsBidons: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  totalsFC: { fontSize: 14, fontFamily: "Inter_700Bold", minWidth: 80, textAlign: "right" },
  rateRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1 },
  rateText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
});
