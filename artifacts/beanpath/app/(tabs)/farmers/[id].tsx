import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatWeight(g: number) {
  return (g / 1000).toFixed(0) + " kg";
}

export default function FarmerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { farmers, collections } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const farmer = useMemo(() => farmers.find((f) => f.id === id), [farmers, id]);
  const farmerCollections = useMemo(() => collections.filter((c) => c.farmerId === id), [collections, id]);
  const totalKg = farmerCollections.reduce((s, c) => s + c.weightGrams / 1000, 0);

  if (!farmer) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Farmer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.initials}>{farmer.firstName[0]}{farmer.lastName[0]}</Text>
        </View>
        <Text style={[styles.fullName, { color: colors.foreground }]}>{farmer.firstName} {farmer.lastName}</Text>
        <Text style={[styles.code, { color: colors.mutedForeground }]}>{farmer.householdCode}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Collections", value: String(farmerCollections.length), icon: "receipt-outline" as const },
          { label: "Total weight", value: `${totalKg.toFixed(0)} kg`, icon: "scale-outline" as const },
          { label: "Plots", value: String(farmer.plotCount), icon: "map-outline" as const },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={s.icon} size={18} color={colors.primary} />
            <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Info */}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: "Village", value: farmer.village, icon: "location-outline" as const },
          { label: "District", value: farmer.district || "—", icon: "map-outline" as const },
          { label: "Phone", value: farmer.phone, icon: "phone-portrait-outline" as const },
          { label: "Gender", value: farmer.gender === "M" ? "Male" : farmer.gender === "F" ? "Female" : "Other", icon: "person-outline" as const },
          { label: "Registered", value: new Date(farmer.registeredAt).toLocaleDateString(), icon: "calendar-outline" as const },
        ].map(({ label, value, icon }) => (
          <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Ionicons name={icon} size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Recent collections */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Collections</Text>
      {farmerCollections.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No collections recorded yet</Text>
        </View>
      ) : (
        farmerCollections.map((c) => (
          <View key={c.id} style={[styles.collRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.collWeight, { color: colors.foreground }]}>{formatWeight(c.weightGrams)}</Text>
              <Text style={[styles.collSub, { color: colors.mutedForeground }]}>{new Date(c.recordedAt).toLocaleDateString()} · {c.paymentMethod === "mobile_money" ? "Mobile money" : "Cash"}</Text>
            </View>
            {!c.synced && (
              <View style={[styles.pendBadge, { backgroundColor: colors.amberLight }]}>
                <Text style={[styles.pendText, { color: colors.amber }]}>Pending</Text>
              </View>
            )}
          </View>
        ))
      )}

      <TouchableOpacity
        onPress={() => router.push({ pathname: "/(tabs)/collect", params: { farmerId: farmer.id, farmerName: `${farmer.firstName} ${farmer.lastName}` } } as any)}
        style={[styles.collectBtn, { borderColor: colors.primary, borderWidth: 1.5 }]}
      >
        <Ionicons name="scale-outline" size={18} color={colors.primary} />
        <Text style={[styles.collectBtnText, { color: colors.primary }]}>Record collection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  initials: { color: "#fff", fontSize: 26, fontFamily: "Inter_700Bold" },
  fullName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  code: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  infoCard: { borderRadius: 14, borderWidth: 1, marginBottom: 24, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1 },
  infoLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  collRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  collWeight: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  collSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  pendBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pendText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyCard: { padding: 20, borderRadius: 14, alignItems: "center", marginBottom: 12 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  collectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 14, marginTop: 8 },
  collectBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
