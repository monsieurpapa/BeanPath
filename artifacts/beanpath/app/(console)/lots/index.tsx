import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { CertBadge } from "@/components/CertBadge";
import { EmptyState } from "@/components/EmptyState";
import { StageTag } from "@/components/StageTag";
import { type LotStage, useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatWeight(kg: number) {
  if (kg >= 1000) return (kg / 1000).toFixed(2) + " MT";
  return kg.toFixed(0) + " kg";
}

export default function LotExplorerScreen() {
  const { t } = useTranslation();
  const { lots } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filterIdx, setFilterIdx] = useState(0);

  const STAGE_FILTERS: { label: string; stages: LotStage[] | null }[] = useMemo(() => [
    { label: t("lots.filters.all"), stages: null },
    { label: t("lots.filters.reception"), stages: ["cherry_received"] },
    { label: t("lots.filters.processing"), stages: ["pulping", "fermenting", "washing"] },
    { label: t("lots.filters.drying"), stages: ["drying", "dry_parchment"] },
    { label: t("lots.filters.export"), stages: ["hulling", "graded", "bagged", "in_transit", "shipped"] },
    { label: t("lots.filters.closed"), stages: ["closed"] },
  ], [t]);

  const filtered = useMemo(() => {
    let result = lots;
    const stages = STAGE_FILTERS[filterIdx]?.stages;
    if (stages) result = result.filter((l) => stages.includes(l.stage));
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((l) => l.ref.toLowerCase().includes(q) || l.crop.toLowerCase().includes(q));
    }
    return result;
  }, [lots, filterIdx, query, STAGE_FILTERS]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchBar, { borderBottomColor: colors.border, paddingTop: Platform.OS === "web" ? 16 : 0 }]}>
        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={query}
            onChangeText={setQuery}
            placeholder={t("lots.searchPlaceholder")}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>

      {/* Stage filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {STAGE_FILTERS.map((f, i) => (
          <Pressable
            key={f.label}
            onPress={() => setFilterIdx(i)}
            style={[styles.filterChip, { backgroundColor: filterIdx === i ? colors.primary : colors.surface, borderColor: filterIdx === i ? colors.primary : colors.border }]}
          >
            <Text style={[styles.filterText, { color: filterIdx === i ? "#fff" : colors.mutedForeground }]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(l) => l.id}
        renderItem={({ item: lot }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/(console)/lots/[id]", params: { id: lot.id } })}
            style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={styles.rowTop}>
              <Text style={[styles.lotRef, { color: colors.foreground }]}>{lot.ref}</Text>
              <StageTag stage={lot.stage} size="sm" />
            </View>
            <View style={styles.rowMeta}>
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {t("lots.meta", {
                  crop: lot.crop === "coffee" ? t("lots.coffee") : t("lots.cocoa"),
                  weight: formatWeight(lot.weightKg),
                  farmers: lot.farmerCount,
                })}
              </Text>
            </View>
            <View style={styles.certs}>
              {lot.certifications.map((c) => <CertBadge key={c} regime={c} />)}
            </View>
          </Pressable>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ListEmptyComponent={<EmptyState icon="layers-outline" title={t("lots.noTitle")} subtitle={t("lots.noSub")} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchBar: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { padding: 14, gap: 8 },
  row: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 6 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lotRef: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowMeta: {},
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  certs: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
});
