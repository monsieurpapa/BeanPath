import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useSync } from "@/context/SyncContext";
import { useColors } from "@/hooks/useColors";

export default function NewFarmerScreen() {
  const { addFarmer } = useData();
  const { addPending } = useSync();
  const { user } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+256 ",
    village: "",
    district: "",
    gender: "M" as "M" | "F" | "Other",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => form.firstName.trim() && form.lastName.trim() && form.village.trim();

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addFarmer({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone,
      village: form.village.trim(),
      district: form.district.trim(),
      country: user?.country ?? "UG",
      gender: form.gender,
      coopId: user?.orgId ?? "coop_1",
      householdCode: "BKM-" + String(Math.floor(Math.random() * 900 + 100)),
      plotCount: 0,
    });
    addPending();
    setSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Gender picker */}
        <Text style={[styles.label, { color: colors.foreground }]}>Gender</Text>
        <View style={styles.genderRow}>
          {(["M", "F", "Other"] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setForm((f) => ({ ...f, gender: g }))}
              style={[styles.genderBtn, { borderColor: form.gender === g ? colors.primary : colors.border, backgroundColor: form.gender === g ? colors.amberLight : colors.surface }]}
            >
              <Text style={[styles.genderText, { color: form.gender === g ? colors.primary : colors.mutedForeground }]}>{g === "M" ? "Male" : g === "F" ? "Female" : "Other"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {[
          { label: "First name *", key: "firstName" as const, ph: "Amara", icon: "person-outline" as const },
          { label: "Last name *", key: "lastName" as const, ph: "Kone", icon: "person-outline" as const },
          { label: "Phone", key: "phone" as const, ph: "+256 700 000 000", icon: "phone-portrait-outline" as const },
          { label: "Village *", key: "village" as const, ph: "Bukomero", icon: "location-outline" as const },
          { label: "District", key: "district" as const, ph: "Kiboga", icon: "map-outline" as const },
        ].map(({ label, key, ph, icon }) => (
          <View key={key} style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Ionicons name={icon} size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={form[key]}
                onChangeText={set(key)}
                placeholder={ph}
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>
        ))}

        <View style={[styles.offlineNote, { backgroundColor: colors.amberLight, borderColor: colors.warning + "30" }]}>
          <Ionicons name="cloud-upload-outline" size={14} color={colors.amber} />
          <Text style={[styles.offlineText, { color: colors.amber }]}>Saved locally. Will sync when online.</Text>
        </View>

        <PrimaryButton label="Register Farmer" onPress={handleSave} loading={saving} disabled={!validate()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  genderRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  genderBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  genderText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  offlineNote: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  offlineText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
