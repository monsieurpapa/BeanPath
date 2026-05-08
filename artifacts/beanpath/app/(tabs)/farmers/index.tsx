import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FarmerCard } from "@/components/FarmerCard";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function FarmersScreen() {
  const { t } = useTranslation();
  const { farmers } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return farmers;
    const q = query.toLowerCase();
    return farmers.filter(
      (f) =>
        f.firstName.toLowerCase().includes(q) ||
        f.lastName.toLowerCase().includes(q) ||
        f.bioId.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.groupement.toLowerCase().includes(q)
    );
  }, [farmers, query]);

  const countLabel = filtered.length === 1
    ? t("farmers.count", { count: filtered.length })
    : t("farmers.count_plural", { count: filtered.length });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Platform.OS === "web" ? 80 : 0 }]}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={query}
            onChangeText={setQuery}
            placeholder={t("farmers.searchPlaceholder")}
            placeholderTextColor={colors.mutedForeground}
          />
          {!!query && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{countLabel}</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <FarmerCard farmer={item} onPress={() => router.push({ pathname: "/(tabs)/farmers/[id]", params: { id: item.id } })} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
        ListEmptyComponent={<EmptyState icon="person-outline" title={t("farmers.noTitle")} subtitle={t("farmers.noSub")} />}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/(tabs)/farmers/new")}
        style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 90, opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons name="person-add" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  count: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 4 },
  list: { padding: 16 },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
});
