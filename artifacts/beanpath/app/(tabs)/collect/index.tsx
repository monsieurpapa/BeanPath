import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccessDeniedBanner, RoleGate } from "@/components/RoleGate";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useData, type Farmer } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { useToast } from "@/context/ToastContext";
import { usePermission } from "@/hooks/usePermission";
import { useColors } from "@/hooks/useColors";

/**
 * Cherry delivery wizard — mirrors the real TCC "Formulaire de registre des cerises"
 *
 * Steps:
 *  1. Agriculteur — pick farmer by name or Bio ID
 *  2. Quantité & Date — bidons, purchase date
 *  3. Prix & Taux — FC/bidon, total FC auto-calc, FC/USD exchange rate
 *  4. Documents — receipt No, cherry register No, delivery report No, payment method
 *  5. Confirmation — full receipt view
 */

const STEPS = ["Agriculteur", "Quantité", "Prix & Taux", "Documents", "Confirmer"];

const PRICE_BANDS = [
  { label: "Cerise standard",   priceFC: 700,  note: "Zone Muganzo / Itara" },
  { label: "Cerise qualité A",  priceFC: 900,  note: "Sélectionné à la collecte" },
  { label: "Cerise qualité B",  priceFC: 1000, note: "Cinjava / Kahisa / Bio certifié" },
];
const PAY_METHODS = [
  { id: "cash" as const,         label: "Espèces",       icon: "cash-outline" as const },
  { id: "mobile_money" as const, label: "Mobile money",  icon: "phone-portrait-outline" as const },
  { id: "bank" as const,         label: "Banque",        icon: "card-outline" as const },
];

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function CollectScreen() {
  const { user } = useAuth();
  const { farmers, stations, addDelivery, registers } = useData();
  const { addPending } = useSync();
  const { showSuccess, showError } = useToast();
  const canCreate = usePermission("delivery.create");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ farmerId?: string; farmerName?: string; farmerBioId?: string }>();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(
    params.farmerId ? farmers.find((f) => f.id === params.farmerId) ?? null : null
  );
  const [query, setQuery] = useState(params.farmerName ?? "");

  // Step 2
  const [quantityBidons, setQuantityBidons] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());

  // Step 3
  const [priceBandIdx, setPriceBandIdx] = useState(1);
  const [customPrice, setCustomPrice] = useState("");
  const [exchangeRate, setExchangeRate] = useState("2700");

  // Step 4
  const [receiptNo, setReceiptNo] = useState("");
  const [cherryRegisterNo, setCherryRegisterNo] = useState("");
  const [deliveryReportNo, setDeliveryReportNo] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "mobile_money" | "bank">("mobile_money");

  const effectivePrice = customPrice ? parseInt(customPrice) : PRICE_BANDS[priceBandIdx].priceFC;
  const qty = parseInt(quantityBidons || "0");
  const totalFC = qty * effectivePrice;
  const totalUSD = totalFC / (parseFloat(exchangeRate) || 2700);

  const filteredFarmers = farmers.filter((f) => {
    const q = query.toLowerCase();
    return !q || f.firstName.toLowerCase().includes(q) || f.lastName.toLowerCase().includes(q) || f.bioId.toLowerCase().includes(q) || f.village.toLowerCase().includes(q);
  });

  // Next register suggestion
  const nextRegisterNo = String(Math.max(0, ...registers.map((r) => parseInt(r.registerNo) || 0)) + 1).padStart(5, "0");
  const nextReceiptNo = String(Math.floor(Math.random() * 900 + 8100));
  const currentReportNo = registers.length > 0 ? registers[registers.length - 1].deliveryReportNo : "5254";

  const canNext = [
    !!selectedFarmer,
    !!quantityBidons && qty > 0,
    !!exchangeRate && parseFloat(exchangeRate) > 0,
    !!receiptNo.trim(),
    true,
  ][step];

  const handleSave = async () => {
    if (!selectedFarmer) return;
    setSaving(true);
    try {
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const station = stations.find((s) => s.id === selectedFarmer.stationId) ?? stations[0];
      const usedReceiptNo = receiptNo || nextReceiptNo;
      await addDelivery({
        farmerId: selectedFarmer.id,
        farmerName: `${selectedFarmer.firstName} ${selectedFarmer.lastName}`,
        farmerBioId: selectedFarmer.bioId,
        stationId: station?.id ?? "st_kahisa",
        stationName: station?.name ?? "Station",
        groupement: selectedFarmer.groupement,
        village: selectedFarmer.village,
        purchaseDate,
        receptionDate: today(),
        receiptNo: usedReceiptNo,
        cherryRegisterNo: cherryRegisterNo || nextRegisterNo,
        deliveryReportNo: deliveryReportNo || currentReportNo,
        quantityBidons: qty,
        pricePerBidonFC: effectivePrice,
        totalFC,
        exchangeRateFC_USD: parseFloat(exchangeRate),
        paymentMethod: payMethod,
        synced: false,
        recordedAt: new Date().toISOString(),
      });
      addPending();
      showSuccess(
        "Livraison enregistrée",
        `Reçu #${usedReceiptNo} · ${qty} bidons · ${totalFC.toLocaleString()} FC`
      );
      router.back();
    } catch (err: any) {
      showError("Erreur d'enregistrement", err?.message ?? "Vérifiez les données et réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, padding: 20, paddingTop: 60 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>Retour</Text>
        </TouchableOpacity>
        <AccessDeniedBanner message="Vous n'avez pas l'autorisation d'enregistrer des livraisons de cerises." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* Step bar */}
        <View style={[styles.stepBar, { borderBottomColor: colors.border, paddingTop: Platform.OS === "web" ? 16 : 0 }]}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, { backgroundColor: i < step ? colors.accent : i === step ? colors.primary : colors.muted }]}>
                {i < step
                  ? <Ionicons name="checkmark" size={11} color="#fff" />
                  : <Text style={[styles.stepNum, { color: i <= step ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, { color: i === step ? colors.primary : colors.mutedForeground }]}>{s}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Step 1: Farmer ── */}
          {step === 0 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Sélectionner l'agriculteur</Text>
              <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
                <TextInput style={[styles.searchInput, { color: colors.foreground }]} value={query} onChangeText={setQuery} placeholder="Nom, prénom ou Code Bio…" placeholderTextColor={colors.mutedForeground} />
              </View>
              {filteredFarmers.slice(0, 7).map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => { setSelectedFarmer(f); setQuery(`${f.firstName} ${f.lastName}`); }}
                  style={[styles.farmerRow, { backgroundColor: selectedFarmer?.id === f.id ? colors.amberLight : colors.card, borderColor: selectedFarmer?.id === f.id ? colors.primary : colors.border }]}
                >
                  <View style={[styles.fAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.fAvatarText}>{f.firstName[0]}{f.lastName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fName, { color: colors.foreground }]}>{f.firstName} {f.lastName}</Text>
                    <Text style={[styles.fSub, { color: colors.mutedForeground }]}>{f.bioId} · {f.village}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={[styles.fPieds, { color: colors.accent }]}>{f.nbPieds} pieds</Text>
                    {selectedFarmer?.id === f.id && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Step 2: Quantity & Date ── */}
          {step === 1 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Quantité livrée</Text>
              <View style={[styles.centreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="cube-outline" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
                <TextInput
                  style={[styles.bigInput, { color: colors.foreground, borderBottomColor: colors.primary }]}
                  value={quantityBidons}
                  onChangeText={setQuantityBidons}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                />
                <Text style={[styles.bigUnit, { color: colors.mutedForeground }]}>bidons de 5 litres</Text>
                {qty > 0 && (
                  <Text style={[styles.kgEstimate, { color: colors.primary }]}>
                    ≈ {(qty * 3.5).toFixed(0)} kg cerises estimés
                  </Text>
                )}
              </View>
              <Text style={[styles.label, { color: colors.foreground }]}>Date d'achat</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
                <TextInput style={[styles.input, { color: colors.foreground }]} value={purchaseDate} onChangeText={setPurchaseDate} placeholder="AAAA-MM-JJ" placeholderTextColor={colors.mutedForeground} />
              </View>
            </View>
          )}

          {/* ── Step 3: Price & Exchange ── */}
          {step === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Prix et taux de change</Text>
              <Text style={[styles.label, { color: colors.foreground }]}>Bande de prix (FC/bidon)</Text>
              {PRICE_BANDS.map((b, i) => (
                <TouchableOpacity
                  key={b.label}
                  onPress={() => { setPriceBandIdx(i); setCustomPrice(""); }}
                  style={[styles.bandRow, { backgroundColor: priceBandIdx === i && !customPrice ? colors.amberLight : colors.card, borderColor: priceBandIdx === i && !customPrice ? colors.primary : colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bandLabel, { color: colors.foreground }]}>{b.label}</Text>
                    <Text style={[styles.bandNote, { color: colors.mutedForeground }]}>{b.note}</Text>
                  </View>
                  <Text style={[styles.bandPrice, { color: priceBandIdx === i && !customPrice ? colors.primary : colors.foreground }]}>{b.priceFC} FC</Text>
                  {priceBandIdx === i && !customPrice && <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
              ))}

              <Text style={[styles.label, { color: colors.foreground, marginTop: 12 }]}>Prix personnalisé (facultatif)</Text>
              <View style={[styles.inputRow, { borderColor: customPrice ? colors.primary : colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="create-outline" size={16} color={colors.mutedForeground} />
                <TextInput style={[styles.input, { color: colors.foreground }]} value={customPrice} onChangeText={setCustomPrice} keyboardType="numeric" placeholder="ex. 850" placeholderTextColor={colors.mutedForeground} />
                <Text style={[styles.unit, { color: colors.mutedForeground }]}>FC/bidon</Text>
              </View>

              <Text style={[styles.label, { color: colors.foreground, marginTop: 12 }]}>Taux de change (FC/USD)</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="swap-horizontal-outline" size={16} color={colors.mutedForeground} />
                <TextInput style={[styles.input, { color: colors.foreground }]} value={exchangeRate} onChangeText={setExchangeRate} keyboardType="decimal-pad" placeholder="2700" placeholderTextColor={colors.mutedForeground} />
                <Text style={[styles.unit, { color: colors.mutedForeground }]}>FC/USD</Text>
              </View>

              {/* Live calculation */}
              {qty > 0 && (
                <View style={[styles.calcCard, { backgroundColor: colors.amberLight, borderColor: colors.primary + "30" }]}>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: colors.amber }]}>{qty} bidons × {effectivePrice} FC</Text>
                    <Text style={[styles.calcTotal, { color: colors.primary }]}>{totalFC.toLocaleString()} FC</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { color: colors.amber }]}>Équivalent USD</Text>
                    <Text style={[styles.calcTotal, { color: colors.primary }]}>${totalUSD.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ── Step 4: Documents ── */}
          {step === 3 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Numéros de documents</Text>

              <Text style={[styles.label, { color: colors.foreground }]}>No de reçu de paiement *</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="document-text-outline" size={16} color={colors.mutedForeground} />
                <TextInput style={[styles.input, { color: colors.foreground }]} value={receiptNo} onChangeText={setReceiptNo} keyboardType="numeric" placeholder={nextReceiptNo} placeholderTextColor={colors.mutedForeground} />
              </View>

              <Text style={[styles.label, { color: colors.foreground }]}>No du registre des cerises</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="list-outline" size={16} color={colors.mutedForeground} />
                <TextInput style={[styles.input, { color: colors.foreground }]} value={cherryRegisterNo} onChangeText={setCherryRegisterNo} keyboardType="numeric" placeholder={nextRegisterNo} placeholderTextColor={colors.mutedForeground} />
              </View>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Laissez vide pour créer un nouveau registre (No {nextRegisterNo})</Text>

              <Text style={[styles.label, { color: colors.foreground, marginTop: 12 }]}>No du rapport de livraison</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="folder-outline" size={16} color={colors.mutedForeground} />
                <TextInput style={[styles.input, { color: colors.foreground }]} value={deliveryReportNo} onChangeText={setDeliveryReportNo} keyboardType="numeric" placeholder={currentReportNo} placeholderTextColor={colors.mutedForeground} />
              </View>

              <Text style={[styles.label, { color: colors.foreground, marginTop: 12 }]}>Mode de paiement</Text>
              <View style={styles.payRow}>
                {PAY_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setPayMethod(m.id)}
                    style={[styles.payBtn, { flex: 1, backgroundColor: payMethod === m.id ? colors.amberLight : colors.card, borderColor: payMethod === m.id ? colors.primary : colors.border }]}
                  >
                    <Ionicons name={m.icon} size={18} color={payMethod === m.id ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.payLabel, { color: payMethod === m.id ? colors.primary : colors.mutedForeground }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Step 5: Confirm ── */}
          {step === 4 && selectedFarmer && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Confirmation de livraison</Text>
              <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Header */}
                <View style={[styles.receiptHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                  <Text style={[styles.receiptTitle, { color: colors.foreground }]}>REÇU DE LIVRAISON DE CERISES</Text>
                  <Text style={[styles.receiptSub, { color: colors.mutedForeground }]}>{stations.find((s) => s.id === selectedFarmer.stationId)?.name ?? "Station"}</Text>
                </View>
                {[
                  { label: "Agriculteur", value: `${selectedFarmer.firstName} ${selectedFarmer.lastName}` },
                  { label: "Code Bio", value: selectedFarmer.bioId },
                  { label: "Groupement", value: selectedFarmer.groupement },
                  { label: "Village", value: selectedFarmer.village },
                  { label: "Date d'achat", value: new Date(purchaseDate).toLocaleDateString("fr-FR") },
                  { label: "Quantité (bidons)", value: `${qty} bidons` },
                  { label: "Prix / bidon", value: `${effectivePrice.toLocaleString()} FC` },
                  { label: "Total (FC)", value: `${totalFC.toLocaleString()} FC`, bold: true },
                  { label: "Équivalent USD", value: `$${totalUSD.toFixed(2)}` },
                  { label: "Taux FC/USD", value: exchangeRate },
                  { label: "No reçu paiement", value: receiptNo || nextReceiptNo },
                  { label: "No registre cerises", value: cherryRegisterNo || nextRegisterNo },
                  { label: "No rapport livraison", value: deliveryReportNo || currentReportNo },
                  { label: "Mode de paiement", value: payMethod === "cash" ? "Espèces" : payMethod === "mobile_money" ? "Mobile money" : "Banque" },
                ].map(({ label, value, bold }, i, arr) => (
                  <View key={label} style={[styles.receiptRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{label}</Text>
                    <Text style={[styles.receiptValue, { color: bold ? colors.primary : colors.foreground }, bold && { fontFamily: "Inter_700Bold", fontSize: 16 }]}>{value}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.offlineNote, { backgroundColor: colors.amberLight, borderColor: colors.warning + "30" }]}>
                <Ionicons name="cloud-upload-outline" size={14} color={colors.amber} />
                <Text style={[styles.offlineText, { color: colors.amber }]}>Sauvegardé hors ligne. Sync automatique dès que le réseau est disponible.</Text>
              </View>
              <PrimaryButton label="Confirmer & enregistrer le paiement" onPress={handleSave} loading={saving} />
            </View>
          )}
        </ScrollView>

        {/* Navigation buttons */}
        {step < 4 && (
          <View style={[styles.navBar, { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
            {step > 0
              ? <TouchableOpacity onPress={() => setStep(step - 1)} style={[styles.backBtn, { borderColor: colors.border }]}>
                  <Ionicons name="arrow-back" size={18} color={colors.foreground} />
                  <Text style={[styles.backText, { color: colors.foreground }]}>Retour</Text>
                </TouchableOpacity>
              : <View />
            }
            <Pressable
              onPress={() => setStep(step + 1)}
              disabled={!canNext}
              style={[styles.nextBtn, { backgroundColor: canNext ? colors.primary : colors.muted }]}
            >
              <Text style={[styles.nextText, { color: canNext ? "#fff" : colors.mutedForeground }]}>Suivant</Text>
              <Ionicons name="arrow-forward" size={18} color={canNext ? "#fff" : colors.mutedForeground} />
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stepBar: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  stepItem: { flex: 1, alignItems: "center", gap: 4 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  stepLabel: { fontSize: 8, fontFamily: "Inter_500Medium", textAlign: "center" },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  stepTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 18 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  farmerRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  fAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  fAvatarText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  fName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  fSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  fPieds: { fontSize: 11, fontFamily: "Inter_500Medium" },
  centreCard: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: "center", marginBottom: 20 },
  bigInput: { fontSize: 52, fontFamily: "Inter_700Bold", textAlign: "center", borderBottomWidth: 2, minWidth: 120, paddingBottom: 4 },
  bigUnit: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 10 },
  kgEstimate: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 4 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  unit: { fontSize: 12, fontFamily: "Inter_500Medium" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 12, marginLeft: 4 },
  bandRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  bandLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bandNote: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  bandPrice: { fontSize: 16, fontFamily: "Inter_700Bold" },
  calcCard: { borderRadius: 12, padding: 14, borderWidth: 1, marginTop: 16, gap: 8 },
  calcRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  calcLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  calcTotal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  payRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  payBtn: { padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 6 },
  payLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  receiptCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  receiptHeader: { padding: 16, borderBottomWidth: 1, alignItems: "center" },
  receiptTitle: { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 },
  receiptSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  receiptLabel: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  receiptValue: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right", flex: 1 },
  offlineNote: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  offlineText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  navBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  backText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  nextBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  nextText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
