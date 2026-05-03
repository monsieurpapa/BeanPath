import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type Mode = "phone" | "email";

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { signIn } = useAuth();
  const colors = useColors();
  const [mode, setMode] = useState<Mode>(role === "buyer" ? "email" : "phone");
  const [phone, setPhone] = useState("+256 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isFieldWorker = role === "field_agent" || role === "lead_farmer";

  const handleSignIn = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    await signIn(role ?? "field_agent", mode === "phone" ? { phone } : { email });
    setLoading(false);
    if (role === "buyer" || role === "exporter" || role === "qc_grader" || role === "coop_admin" || role === "certifier" || role === "mill_operator") {
      router.replace("/(console)/");
    } else {
      router.replace("/(tabs)/");
    }
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
              <Text style={[styles.title, { color: colors.foreground }]}>Sign in</Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                {isFieldWorker ? "Use your phone number for quick access." : "Enter your credentials to continue."}
              </Text>
            </View>

            {/* Mode toggle */}
            <View style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === "phone" && { backgroundColor: colors.card }]}
                onPress={() => setMode("phone")}
              >
                <Ionicons name="phone-portrait-outline" size={14} color={mode === "phone" ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.toggleText, { color: mode === "phone" ? colors.primary : colors.mutedForeground }]}>Phone OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === "email" && { backgroundColor: colors.card }]}
                onPress={() => setMode("email")}
              >
                <Ionicons name="mail-outline" size={14} color={mode === "email" ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.toggleText, { color: mode === "email" ? colors.primary : colors.mutedForeground }]}>Email</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.form}>
              {mode === "phone" ? (
                <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons name="phone-portrait-outline" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+256 700 000 000"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              ) : (
                <>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="you@example.com"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholder="Password"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Biometric hint for returning users */}
            <TouchableOpacity style={styles.biometric}>
              <Ionicons name="finger-print-outline" size={18} color={colors.primary} />
              <Text style={[styles.biometricText, { color: colors.primary }]}>Use biometric unlock</Text>
            </TouchableOpacity>

            <PrimaryButton label="Sign in" onPress={handleSignIn} loading={loading} />

            <TouchableOpacity style={styles.register} onPress={() => router.push("/(auth)/register")}>
              <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
                New here? <Text style={{ color: colors.primary }}>Register your account</Text>
              </Text>
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
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 6, lineHeight: 20 },
  toggle: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 20, gap: 4 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 9 },
  toggleText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  form: { gap: 12, marginBottom: 16 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  biometric: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 24, alignSelf: "center" },
  biometricText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  register: { marginTop: 20, alignItems: "center" },
  registerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
