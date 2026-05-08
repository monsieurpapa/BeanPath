import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatFC(n: number) {
  return n.toLocaleString() + " FC";
}

export default function FarmerDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { farmers, deliveries, stations } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const farmer = useMemo(() => farmers.find((f) => f.id === id), [farmers, id]);
  const farmerDeliveries = useMemo(() => deliveries.filter((d) => d.farmerId === id).sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)), [deliveries, id]);
  const station = useMemo(() => stations.find((s) => s.id === farmer?.stationId), [stations, farmer]);

  const totalBidons = farmerDeliveries.reduce((s, d) => s + d.quantityBidons, 0);
  const totalFC = farmerDeliveries.reduce((s, d) => s + d.totalFC, 0);
  const totalUSD = farmerDeliveries.length > 0
    ? farmerDeliveries.reduce((s, d) => s + d.totalFC / d.exchangeRateFC_USD, 0)
    : 0;

  const groupRoleLabel = (r: string | undefined) => {
    if (!r || r === "member") return "";
    const key = `farmers.detail.groupRoles.${r}`;
    return t(key, r);
  };

  const genderLabel = (g: string | undefined) => {
    if (g === "M") return t("farmers.detail.gender.M");
    if (g === "F") return t("farmers.detail.gender.F");
    return t("farmers.detail.gender.Other");
  };

  const cropLabel = (c: string | undefined) => {
    if (c === "coffee") return t("farmers.detail.crop.coffee");
    if (c === "cocoa") return t("farmers.detail.crop.cocoa");
    return t("farmers.detail.crop.both");
  };

  const methodLabel = (m: string) => {
    if (m === "mobile_money") return t("farmers.detail.mobileMoney");
    if (m === "bank") return t("farmers.detail.bank");
    return t("farmers.detail.cash");
  };

  if (!farmer) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{t("farmers.detail.notFound")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.initials}>{farmer.firstName[0]}{farmer.lastName[0]}</Text>
        </View>
        <Text style={[styles.fullName, { color: colors.foreground }]}>{farmer.firstName} {farmer.lastName}</Text>
        <View style={[styles.bioIdPill, { backgroundColor: colors.amberLight }]}>
          <Ionicons name="qr-code-outline" size={12} color={colors.amber} />
          <Text style={[styles.bioIdText, { color: colors.primary }]}>{farmer.bioId}</Text>
        </View>
        {farmer.groupRole && farmer.groupRole !== "member" && (
          <View style={[styles.rolePill, { backgroundColor: colors.greenLight }]}>
            <Text style={[styles.roleText, { color: colors.accent }]}>{groupRoleLabel(farmer.groupRole)}</Text>
          </View>
        )}
      </View>

      {/* Production stats */}
      <View style={styles.statsRow}>
        {[
          { label: t("farmers.detail.stats.deliveries"), value: String(farmerDeliveries.length), icon: "receipt-outline" as const },
          { label: t("farmers.detail.stats.totalBidons"), value: String(totalBidons), icon: "cube-outline" as const },
          { label: t("farmers.detail.stats.plants"), value: String(farmer.nbPieds), icon: "leaf-outline" as const },
          { label: t("farmers.detail.stats.paidUSD"), value: `$${totalUSD.toFixed(0)}`, icon: "cash-outline" as const },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={s.icon} size={16} color={colors.primary} />
            <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Info card */}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: t("farmers.detail.info.territoire"), value: farmer.territoire, icon: "map-outline" as const },
          { label: t("farmers.detail.info.groupement"), value: farmer.groupement, icon: "people-outline" as const },
          { label: t("farmers.detail.info.village"), value: farmer.village, icon: "location-outline" as const },
          { label: t("farmers.detail.info.station"), value: station?.name ?? "—", icon: "business-outline" as const },
          { label: t("farmers.detail.info.phone"), value: farmer.phone || "—", icon: "phone-portrait-outline" as const },
          {
            label: t("farmers.detail.info.genderAge"),
            value: `${genderLabel(farmer.gender)}${farmer.age ? ` · ${t("farmers.detail.age", { age: farmer.age })}` : ""}`,
            icon: "person-outline" as const,
          },
          { label: t("farmers.detail.info.crop"), value: cropLabel(farmer.crop), icon: "leaf-outline" as const },
          { label: t("farmers.detail.info.registeredAt"), value: new Date(farmer.registeredAt).toLocaleDateString(), icon: "calendar-outline" as const },
        ].map(({ label, value, icon }, i, arr) => (
          <View key={label} style={[styles.infoRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Ionicons name={icon} size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Record delivery */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/(tabs)/collect/", params: { farmerId: farmer.id, farmerName: `${farmer.firstName} ${farmer.lastName}`, farmerBioId: farmer.bioId } } as any)}
        style={[styles.collectBtn, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="scale-outline" size={18} color="#fff" />
        <Text style={styles.collectBtnText}>{t("farmers.detail.recordDelivery")}</Text>
      </TouchableOpacity>

      {/* Delivery history */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("farmers.detail.deliveryHistory")}</Text>
      {farmerDeliveries.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t("farmers.detail.noDeliveries")}</Text>
        </View>
      ) : (
        farmerDeliveries.map((d) => (
          <View key={d.id} style={[styles.deliveryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.deliveryTop}>
                <Text style={[styles.deliveryBidons, { color: colors.foreground }]}>{d.quantityBidons} bidons</Text>
                <Text style={[styles.deliveryFC, { color: colors.primary }]}>{formatFC(d.totalFC)}</Text>
              </View>
              <Text style={[styles.deliverySub, { color: colors.mutedForeground }]}>
                {t("farmers.detail.receiptLine", { receipt: d.receiptNo, register: d.cherryRegisterNo, date: new Date(d.purchaseDate).toLocaleDateString() })}
              </Text>
              <Text style={[styles.deliverySub, { color: colors.mutedForeground }]}>
                {t("farmers.detail.priceLine", { price: d.pricePerBidonFC, rate: d.exchangeRateFC_USD, method: methodLabel(d.paymentMethod) })}
              </Text>
            </View>
            {!d.synced && (
              <View style={[styles.pendBadge, { backgroundColor: colors.amberLight }]}>
                <Text style={[styles.pendText, { color: colors.amber }]}>{t("farmers.detail.pending")}</Text>
              </View>
            )}
          </View>
        ))
      )}

      {farmerDeliveries.length > 0 && (
        <View style={[styles.totalRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>{t("farmers.detail.totalPaid")}</Text>
          <Text style={[styles.totalVal, { color: colors.primary }]}>{formatFC(totalFC)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  profileSection: { alignItems: "center", paddingVertical: 20, gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  initials: { color: "#fff", fontSize: 26, fontFamily: "Inter_700Bold" },
  fullName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  bioIdPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bioIdText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: 70, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  infoLabel: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right", flex: 1 },
  collectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 14, marginBottom: 24 },
  collectBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  deliveryRow: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  deliveryTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  deliveryBidons: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  deliveryFC: { fontSize: 15, fontFamily: "Inter_700Bold" },
  deliverySub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  pendBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start", marginTop: 6 },
  pendText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyCard: { padding: 20, borderRadius: 14, alignItems: "center", marginBottom: 12 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  totalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  totalVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
