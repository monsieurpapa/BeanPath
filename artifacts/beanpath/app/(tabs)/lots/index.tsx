import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { LotCard } from "@/components/LotCard";
import { type LotStage, useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const FILTERS: { label: string; stages: LotStage[] | null }[] = [
  { label: "All", stages: null },
  { label: "Cherry", stages: ["cherry"] },
  { label: "Processing", stages: ["wet_parchment", "drying", "dry_parchment"] },
  { label: "Green", stages: ["green"] },
  { label: "Moving", stages: ["in_transit", "shipped"] },
];

export default function LotsScreen() {
  const { lots } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filterIdx, setFilterIdx] = useState(0);

  const filtered = useMemo(() => {
    const stages = FILTERS[filterIdx].stages;
    if (!stages) return lots;
    return lots.filter((l) => stages.includes(l.stage));
  }, [lots, filterIdx]);

  const totalKg = useMemo(() => lots.reduce((s, l) => s + l.weightGrams / 1000, 0), [lots]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header stats */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Platform.OS === "web" ? 80 : 0 }]}>
        <View style={styles.stat}>
          <Text style={[styles.statVal, { color: colors.foreground }]}>{lots.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Active lots</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statVal, { color: colors.foreground }]}>{(totalKg / 1000).toFixed(2)} MT</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total weight</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statVal, { color: colors.foreground }]}>{lots.filter((l) => l.certifications.includes("eudr")).length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>EUDR ready</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        {FILTERS.map((f, i) => (
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
        renderItem={({ item }) => <LotCard lot={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
        ListEmptyComponent={<EmptyState icon="layers-outline" title="No lots found" subtitle="Lots will appear here after collection and processing." />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  statsBar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  stat: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { padding: 16 },
});
