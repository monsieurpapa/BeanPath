import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const ROLE_LABELS: Record<string, string> = {
  president: "Président", vp: "Vice-Président", secretary: "Secrétaire", member: "Membre",
};

function formatFC(n: number) {
  return n.toLocaleString() + " FC";
}
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `il y a ${m} min`;
  if (m < 1440) return `il y a ${Math.floor(m / 60)}h`;
  return `il y a ${Math.floor(m / 1440)}j`;
}

export default function FarmerDetailScreen() {
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

  if (!farmer) {
    return <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}><Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Agriculteur introuvable</Text></View>;
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
            <Text style={[styles.roleText, { color: colors.accent }]}>{ROLE_LABELS[farmer.groupRole]}</Text>
          </View>
        )}
      </View>

      {/* Production stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Livraisons", value: String(farmerDeliveries.length), icon: "receipt-outline" as const },
          { label: "Total bidons", value: String(totalBidons), icon: "cube-outline" as const },
          { label: "Pieds", value: String(farmer.nbPieds), icon: "leaf-outline" as const },
          { label: "Payé (USD)", value: `$${totalUSD.toFixed(0)}`, icon: "cash-outline" as const },
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
          { label: "Territoire", value: farmer.territoire, icon: "map-outline" as const },
          { label: "Groupement", value: farmer.groupement, icon: "people-outline" as const },
          { label: "Village", value: farmer.village, icon: "location-outline" as const },
          { label: "Station", value: station?.name ?? "—", icon: "business-outline" as const },
          { label: "Téléphone", value: farmer.phone || "—", icon: "phone-portrait-outline" as const },
          { label: "Sexe / Âge", value: `${farmer.gender === "M" ? "Homme" : farmer.gender === "F" ? "Femme" : "Autre"}${farmer.age ? ` · ${farmer.age} ans` : ""}`, icon: "person-outline" as const },
          { label: "Culture", value: farmer.crop === "coffee" ? "Café" : farmer.crop === "cocoa" ? "Cacao" : "Café & Cacao", icon: "leaf-outline" as const },
          { label: "Inscrit le", value: new Date(farmer.registeredAt).toLocaleDateString("fr-FR"), icon: "calendar-outline" as const },
        ].map(({ label, value, icon }, i, arr) => (
          <View key={label} style={[styles.infoRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Ionicons name={icon} size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Record a delivery */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/(tabs)/collect/", params: { farmerId: farmer.id, farmerName: `${farmer.firstName} ${farmer.lastName}`, farmerBioId: farmer.bioId } } as any)}
        style={[styles.collectBtn, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="scale-outline" size={18} color="#fff" />
        <Text style={styles.collectBtnText}>Enregistrer une livraison</Text>
      </TouchableOpacity>

      {/* Delivery history */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Historique des livraisons</Text>
      {farmerDeliveries.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucune livraison enregistrée</Text>
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
                Reçu #{d.receiptNo} · Registre {d.cherryRegisterNo} · {new Date(d.purchaseDate).toLocaleDateString("fr-FR")}
              </Text>
              <Text style={[styles.deliverySub, { color: colors.mutedForeground }]}>
                {d.pricePerBidonFC} FC/bidon · Taux {d.exchangeRateFC_USD} FC/USD · {d.paymentMethod === "mobile_money" ? "Mobile money" : "Espèces"}
              </Text>
            </View>
            {!d.synced && (
              <View style={[styles.pendBadge, { backgroundColor: colors.amberLight }]}>
                <Text style={[styles.pendText, { color: colors.amber }]}>En attente</Text>
              </View>
            )}
          </View>
        ))
      )}

      {farmerDeliveries.length > 0 && (
        <View style={[styles.totalRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total payé (FC)</Text>
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
