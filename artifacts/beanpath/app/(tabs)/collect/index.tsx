import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useData, type Farmer } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { useColors } from "@/hooks/useColors";

const STEPS = ["Farmer", "Weight", "Price & Pay", "Confirm"];
const PRICE_BANDS = [
  { label: "Standard", pricePerKg: 1850 },
  { label: "Premium A", pricePerKg: 2100 },
  { label: "Premium B (FT)", pricePerKg: 2400 },
];
const PAY_METHODS = [
  { id: "cash" as const, label: "Cash", icon: "cash-outline" as const },
  { id: "mobile_money" as const, label: "Mobile money", icon: "phone-portrait-outline" as const },
];

export default function CollectScreen() {
  const { user } = useAuth();
  const { farmers, addCollection } = useData();
  const { addPending } = useSync();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ farmerId?: string; farmerName?: string }>();

  const [step, setStep] = useState(0);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(
    params.farmerId ? farmers.find((f) => f.id === params.farmerId) ?? null : null
  );
  const [farmerSearch, setFarmerSearch] = useState(params.farmerName ?? "");
  const [weightKg, setWeightKg] = useState("");
  const [priceBandIdx, setPriceBandIdx] = useState(0);
  const [payMethod, setPayMethod] = useState<"cash" | "mobile_money">("mobile_money");
  const [saving, setSaving] = useState(false);

  const filteredFarmers = farmers.filter((f) => {
    const q = farmerSearch.toLowerCase();
    return !q || f.firstName.toLowerCase().includes(q) || f.lastName.toLowerCase().includes(q) || f.householdCode.toLowerCase().includes(q);
  });

  const pricePerKg = PRICE_BANDS[priceBandIdx].pricePerKg;
  const totalAmount = parseFloat(weightKg || "0") * pricePerKg;
  const currency = user?.orgCurrency ?? "UGX";

  const canProceed = () => {
    if (step === 0) return !!selectedFarmer;
    if (step === 1) return !!weightKg && parseFloat(weightKg) > 0;
    return true;
  };

  const handleSave = async () => {
    if (!selectedFarmer) return;
    setSaving(true);
    if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addCollection({
      farmerId: selectedFarmer.id,
      farmerName: `${selectedFarmer.firstName} ${selectedFarmer.lastName}`,
      lotId: "lot1",
      weightGrams: parseFloat(weightKg) * 1000,
      pricePerKgMinor: pricePerKg,
      currency,
      paymentMethod: payMethod,
      recordedAt: new Date().toISOString(),
      synced: false,
    });
    addPending();
    setSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Step indicator */}
        <View style={[styles.stepBar, { borderBottomColor: colors.border, paddingTop: Platform.OS === "web" ? 16 : 0 }]}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, { backgroundColor: i <= step ? colors.primary : colors.muted }]}>
                {i < step ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, { color: i === step ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: i === step ? colors.primary : colors.mutedForeground }]}>{s}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 0: Farmer */}
          {step === 0 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Select farmer</Text>
              <View style={[styles.searchWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.searchInput, { color: colors.foreground }]}
                  value={farmerSearch}
                  onChangeText={setFarmerSearch}
                  placeholder="Search by name or code…"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              {filteredFarmers.slice(0, 6).map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => { setSelectedFarmer(f); setFarmerSearch(`${f.firstName} ${f.lastName}`); }}
                  style={[styles.farmerRow, { backgroundColor: selectedFarmer?.id === f.id ? colors.amberLight : colors.card, borderColor: selectedFarmer?.id === f.id ? colors.primary : colors.border }]}
                >
                  <View style={[styles.rowAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.rowAvatarText}>{f.firstName[0]}{f.lastName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, { color: colors.foreground }]}>{f.firstName} {f.lastName}</Text>
                    <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{f.householdCode} · {f.village}</Text>
                  </View>
                  {selectedFarmer?.id === f.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 1: Weight */}
          {step === 1 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Enter weight</Text>
              <View style={[styles.weightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="scale-outline" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
                <TextInput
                  style={[styles.weightInput, { color: colors.foreground, borderBottomColor: colors.primary }]}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                />
                <Text style={[styles.weightUnit, { color: colors.mutedForeground }]}>kg net weight</Text>
              </View>
              <TouchableOpacity style={[styles.btScaleBtn, { borderColor: colors.border }]}>
                <Ionicons name="bluetooth-outline" size={18} color={colors.mutedForeground} />
                <Text style={[styles.btScaleText, { color: colors.mutedForeground }]}>Connect Bluetooth scale</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Price & Payment */}
          {step === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Price band</Text>
              {PRICE_BANDS.map((b, i) => (
                <TouchableOpacity
                  key={b.label}
                  onPress={() => setPriceBandIdx(i)}
                  style={[styles.bandRow, { backgroundColor: priceBandIdx === i ? colors.amberLight : colors.card, borderColor: priceBandIdx === i ? colors.primary : colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bandLabel, { color: colors.foreground }]}>{b.label}</Text>
                    <Text style={[styles.bandPrice, { color: colors.mutedForeground }]}>{currency} {b.pricePerKg.toLocaleString()} / kg</Text>
                  </View>
                  {priceBandIdx === i && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}

              <Text style={[styles.stepTitle, { color: colors.foreground, marginTop: 20 }]}>Payment method</Text>
              <View style={styles.payRow}>
                {PAY_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setPayMethod(m.id)}
                    style={[styles.payBtn, { flex: 1, backgroundColor: payMethod === m.id ? colors.amberLight : colors.card, borderColor: payMethod === m.id ? colors.primary : colors.border }]}
                  >
                    <Ionicons name={m.icon} size={20} color={payMethod === m.id ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.payLabel, { color: payMethod === m.id ? colors.primary : colors.mutedForeground }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Confirm collection</Text>
              <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {[
                  { label: "Farmer", value: selectedFarmer ? `${selectedFarmer.firstName} ${selectedFarmer.lastName}` : "—" },
                  { label: "Weight", value: `${weightKg} kg` },
                  { label: "Price band", value: PRICE_BANDS[priceBandIdx].label },
                  { label: "Rate", value: `${currency} ${pricePerKg.toLocaleString()} / kg` },
                  { label: "Total payment", value: `${currency} ${totalAmount.toLocaleString()}` },
                  { label: "Method", value: payMethod === "mobile_money" ? "Mobile money" : "Cash" },
                ].map(({ label, value }, i, arr) => (
                  <View key={label} style={[styles.receiptRow, i < arr.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}]}>
                    <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{label}</Text>
                    <Text style={[styles.receiptValue, { color: label === "Total payment" ? colors.primary : colors.foreground }, label === "Total payment" && { fontFamily: "Inter_700Bold", fontSize: 16 }]}>{value}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.offlineNote, { backgroundColor: colors.amberLight, borderColor: colors.warning + "30" }]}>
                <Ionicons name="cloud-upload-outline" size={14} color={colors.amber} />
                <Text style={[styles.offlineText, { color: colors.amber }]}>Saved offline. Syncs automatically when connected.</Text>
              </View>
              <PrimaryButton label="Confirm & record payment" onPress={handleSave} loading={saving} />
            </View>
          )}
        </ScrollView>

        {/* Nav buttons */}
        {step < 3 && (
          <View style={[styles.navBar, { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
            {step > 0 ? (
              <TouchableOpacity onPress={() => setStep(step - 1)} style={[styles.backBtn, { borderColor: colors.border }]}>
                <Ionicons name="arrow-back" size={18} color={colors.foreground} />
                <Text style={[styles.backText, { color: colors.foreground }]}>Back</Text>
              </TouchableOpacity>
            ) : <View />}
            <Pressable
              onPress={() => setStep(step + 1)}
              disabled={!canProceed()}
              style={[styles.nextBtn, { backgroundColor: canProceed() ? colors.primary : colors.muted }]}
            >
              <Text style={[styles.nextText, { color: canProceed() ? "#fff" : colors.mutedForeground }]}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color={canProceed() ? "#fff" : colors.mutedForeground} />
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stepBar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 14, gap: 0, borderBottomWidth: 1 },
  stepItem: { flex: 1, alignItems: "center", gap: 4 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  stepLabel: { fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center" },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  stepTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 16 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  farmerRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  rowAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  rowAvatarText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  rowName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  weightCard: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: "center", marginBottom: 16 },
  weightInput: { fontSize: 48, fontFamily: "Inter_700Bold", textAlign: "center", borderBottomWidth: 2, minWidth: 160, paddingBottom: 4 },
  weightUnit: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 8 },
  btScaleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  btScaleText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  bandRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  bandLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  bandPrice: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  payRow: { flexDirection: "row", gap: 10 },
  payBtn: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 8 },
  payLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  receiptCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 },
  receiptLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  receiptValue: { fontSize: 14, fontFamily: "Inter_500Medium" },
  offlineNote: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  offlineText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  navBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  backText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  nextBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  nextText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
