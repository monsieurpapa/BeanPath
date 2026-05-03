import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const colors = useColors();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+256 ");
  const [orgCode, setOrgCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    await signIn("field_agent", { phone });
    setLoading(false);
    router.replace("/(tabs)/");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scroll, Platform.OS === "web" && { paddingTop: 80 }]} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>Register with your cooperative's join code.</Text>
            </View>
            <View style={styles.form}>
              {[
                { label: "Full name", val: name, set: setName, ph: "Amara Kone", icon: "person-outline" as const, type: "default" as const },
                { label: "Phone (E.164)", val: phone, set: setPhone, ph: "+256 700 000 000", icon: "phone-portrait-outline" as const, type: "phone-pad" as const },
                { label: "Org join code", val: orgCode, set: setOrgCode, ph: "BKM-2024", icon: "key-outline" as const, type: "default" as const },
              ].map(({ label, val, set, ph, icon, type }) => (
                <View key={label}>
                  <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Ionicons name={icon} size={18} color={colors.mutedForeground} />
                    <TextInput style={[styles.input, { color: colors.foreground }]} value={val} onChangeText={set} placeholder={ph} placeholderTextColor={colors.mutedForeground} keyboardType={type} />
                  </View>
                </View>
              ))}
            </View>
            <PrimaryButton label="Register" onPress={handleRegister} loading={loading} disabled={!name.trim() || phone.length < 8} />
            <TouchableOpacity style={{ marginTop: 20, alignItems: "center" }} onPress={() => router.back()}>
              <Text style={{ color: colors.primary, fontSize: 14, fontFamily: "Inter_500Medium" }}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  back: { paddingTop: 16, paddingBottom: 8, alignSelf: "flex-start" },
  header: { marginBottom: 28, marginTop: 8 },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 6 },
  form: { gap: 16, marginBottom: 28 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
});
