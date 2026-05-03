import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccessDeniedBanner } from "@/components/RoleGate";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { useToast } from "@/context/ToastContext";
import { usePermission } from "@/hooks/usePermission";
import { useColors } from "@/hooks/useColors";

// Auto-generate a BioID from cooperative prefix + groupement code + sequence
function generateBioId(coopPrefix: string, groupement: string, village: string, count: number): string {
  const grpCode = groupement.slice(0, 1).toUpperCase();
  const vilCode = village.slice(0, 2).toUpperCase();
  const seq = String(count + 1).padStart(3, "0");
  return `${coopPrefix} ${grpCode}${vilCode} ${seq}`;
}

const GROUPEMENTS = ["Bushumba", "Mudaka", "Miti", "Luhihi", "Kabare", "Walungu"];
const TERRITOIRES = ["Kabare", "Walungu", "Shabunda", "Kalehe", "Mwenga", "Uvira"];
const CROPS: { label: string; value: "coffee" | "cocoa" | "both" }[] = [
  { label: "Café", value: "coffee" },
  { label: "Cacao", value: "cocoa" },
  { label: "Les deux", value: "both" },
];
const GROUP_ROLES: { label: string; value: "member" | "president" | "vp" | "secretary" }[] = [
  { label: "Membre", value: "member" },
  { label: "Président", value: "president" },
  { label: "Vice-Président", value: "vp" },
  { label: "Secrétaire", value: "secretary" },
];

export default function NewFarmerScreen() {
  const { addFarmer, farmers, stations } = useData();
  const { addPending } = useSync();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const canCreate = usePermission("farmer.create");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    gender: "M" as "M" | "F" | "Other",
    territoire: "Kabare",
    groupement: "Bushumba",
    village: "",
    nbPieds: "",
    crop: "coffee" as "coffee" | "cocoa" | "both",
    groupRole: "member" as "member" | "president" | "vp" | "secretary",
    bioId: "",
  });

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      // Auto-generate bioId when key fields change
      if (k === "groupement" || k === "village") {
        const coopPrefix = user?.orgId?.includes("nakeza") ? "NKZ" : "TCC";
        next.bioId = generateBioId(coopPrefix, next.groupement, next.village || "XX", farmers.length);
      }
      return next;
    });
  };

  const isValid = form.firstName.trim() && form.lastName.trim() && form.village.trim() && form.nbPieds.trim();

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const station = stations.find((s) => s.groupement.toLowerCase() === form.groupement.toLowerCase()) ?? stations[0];
      const bioId = form.bioId || generateBioId("TCC", form.groupement, form.village, farmers.length);
      await addFarmer({
        bioId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim().toUpperCase(),
        phone: form.phone,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender,
        territoire: form.territoire,
        groupement: form.groupement,
        village: form.village.trim(),
        stationId: station?.id ?? "st_kahisa",
        coopId: user?.orgId ?? "coop_tcc",
        nbPieds: parseInt(form.nbPieds) || 0,
        groupRole: form.groupRole,
        crop: form.crop,
      });
      addPending();
      showSuccess(
        "Agriculteur inscrit",
        `${form.firstName} ${form.lastName.toUpperCase()} · Code Bio: ${bioId}`
      );
      router.back();
    } catch (err: any) {
      showError("Erreur d'inscription", err?.message ?? "Vérifiez les informations et réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, padding: 20, paddingTop: 60 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <Ionicons name="arrow-back" size={20} color={colors.background === "#fafaf9" ? "#1c1917" : "#fafaf9"} />
          <Text style={{ color: "#78716c", fontFamily: "Inter_400Regular", fontSize: 13 }}>Retour</Text>
        </TouchableOpacity>
        <AccessDeniedBanner message="Vous n'avez pas l'autorisation d'inscrire de nouveaux agriculteurs." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gender row */}
        <Text style={[styles.label, { color: colors.foreground }]}>Sexe</Text>
        <View style={styles.pillRow}>
          {(["M", "F", "Other"] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setForm((f) => ({ ...f, gender: g }))}
              style={[styles.pill, { borderColor: form.gender === g ? colors.primary : colors.border, backgroundColor: form.gender === g ? colors.amberLight : colors.surface }]}
            >
              <Text style={[styles.pillText, { color: form.gender === g ? colors.primary : colors.mutedForeground }]}>
                {g === "M" ? "Homme" : g === "F" ? "Femme" : "Autre"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name fields */}
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>Prénom *</Text>
            <Field value={form.firstName} onChange={set("firstName")} placeholder="Bulonza" icon="person-outline" colors={colors} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>Nom *</Text>
            <Field value={form.lastName} onChange={set("lastName")} placeholder="MUDUMBI" icon="person-outline" colors={colors} />
          </View>
        </View>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>Téléphone</Text>
            <Field value={form.phone} onChange={set("phone")} placeholder="+243 970 000 000" icon="phone-portrait-outline" colors={colors} keyboardType="phone-pad" />
          </View>
          <View style={{ width: 90 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>Âge</Text>
            <Field value={form.age} onChange={set("age")} placeholder="42" icon="calendar-outline" colors={colors} keyboardType="numeric" />
          </View>
        </View>

        {/* Location */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Localisation</Text>

        <Text style={[styles.label, { color: colors.foreground }]}>Territoire</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={styles.chipRow}>
            {TERRITOIRES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setForm((f) => ({ ...f, territoire: t }))}
                style={[styles.chip, { borderColor: form.territoire === t ? colors.primary : colors.border, backgroundColor: form.territoire === t ? colors.amberLight : colors.surface }]}
              >
                <Text style={[styles.chipText, { color: form.territoire === t ? colors.primary : colors.mutedForeground }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.label, { color: colors.foreground }]}>Groupement</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={styles.chipRow}>
            {GROUPEMENTS.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => set("groupement")(g)}
                style={[styles.chip, { borderColor: form.groupement === g ? colors.primary : colors.border, backgroundColor: form.groupement === g ? colors.amberLight : colors.surface }]}
              >
                <Text style={[styles.chipText, { color: form.groupement === g ? colors.primary : colors.mutedForeground }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.label, { color: colors.foreground }]}>Village *</Text>
        <Field value={form.village} onChange={set("village")} placeholder="Cinjava" icon="location-outline" colors={colors} />

        {/* Production */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Production</Text>

        <Text style={[styles.label, { color: colors.foreground }]}>Nombre de pieds *</Text>
        <Field value={form.nbPieds} onChange={set("nbPieds")} placeholder="420" icon="leaf-outline" colors={colors} keyboardType="numeric" hint="Nombre de caféiers/cacaoyers" />

        <Text style={[styles.label, { color: colors.foreground }]}>Culture principale</Text>
        <View style={styles.pillRow}>
          {CROPS.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setForm((f) => ({ ...f, crop: c.value }))}
              style={[styles.pill, { flex: 1, borderColor: form.crop === c.value ? colors.accent : colors.border, backgroundColor: form.crop === c.value ? colors.greenLight : colors.surface }]}
            >
              <Text style={[styles.pillText, { color: form.crop === c.value ? colors.accent : colors.mutedForeground }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Role */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Rôle dans le groupement</Text>
        <View style={styles.pillRow}>
          {GROUP_ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              onPress={() => setForm((f) => ({ ...f, groupRole: r.value }))}
              style={[styles.pill, { flex: 1, borderColor: form.groupRole === r.value ? colors.primary : colors.border, backgroundColor: form.groupRole === r.value ? colors.amberLight : colors.surface }]}
            >
              <Text style={[styles.pillText, { fontSize: 11, color: form.groupRole === r.value ? colors.primary : colors.mutedForeground }]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BioId preview */}
        <View style={[styles.bioIdCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bioIdLabel, { color: colors.mutedForeground }]}>Code Bio généré</Text>
            <Text style={[styles.bioIdValue, { color: colors.primary }]}>{form.bioId || generateBioId("TCC", form.groupement, form.village || "XX", farmers.length)}</Text>
          </View>
        </View>

        <View style={[styles.offlineNote, { backgroundColor: colors.amberLight, borderColor: colors.warning + "30" }]}>
          <Ionicons name="cloud-upload-outline" size={14} color={colors.amber} />
          <Text style={[styles.offlineText, { color: colors.amber }]}>Sauvegardé localement. Synchronisation automatique en ligne.</Text>
        </View>

        <PrimaryButton label="Enregistrer l'agriculteur" onPress={handleSave} loading={saving} disabled={!isValid} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ value, onChange, placeholder, icon, colors, keyboardType = "default", hint }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
        />
      </View>
      {hint && <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  row2: { flexDirection: "row", gap: 10, marginBottom: 0 },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  pill: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  pillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  chipRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4, marginLeft: 4 },
  bioIdCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  bioIdLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  bioIdValue: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  offlineNote: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  offlineText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
});
