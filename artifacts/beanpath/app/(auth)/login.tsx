import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  SafeAreaView, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ROLE_LABELS, ROLE_SURFACE } from "@/lib/rbac";
import { useColors } from "@/hooks/useColors";

type Mode = "phone" | "email";

const ROLE_ICONS: Record<UserRole, any> = {
  field_agent:      "leaf-outline",
  lead_farmer:      "people-outline",
  station_operator: "water-outline",
  transporter:      "car-outline",
  mill_operator:    "cog-outline",
  qc_grader:        "checkmark-circle-outline",
  exporter:         "boat-outline",
  buyer:            "bag-handle-outline",
  coop_admin:       "shield-checkmark-outline",
  certifier:        "ribbon-outline",
};

const ROLE_ACCENT: Record<UserRole, string> = {
  field_agent:      "#b45309",
  lead_farmer:      "#92400e",
  station_operator: "#15803d",
  transporter:      "#7c3aed",
  mill_operator:    "#065f46",
  qc_grader:        "#dc2626",
  exporter:         "#0891b2",
  buyer:            "#6d28d9",
  coop_admin:       "#1d4ed8",
  certifier:        "#0369a1",
};

const ROLE_ORGS: Record<UserRole, string> = {
  field_agent:      "TCC — Tounga wa Café Congo",
  lead_farmer:      "TCC — Tounga wa Café Congo",
  station_operator: "Station de lavage KAHISA / NAKEZA",
  coop_admin:       "NAKEZA SARL",
  buyer:            "Nordic Roasters AS",
  certifier:        "FLO-CERT GmbH",
  exporter:         "Great Lakes Export DRC",
  qc_grader:        "Coffee Quality Institute — DRC",
  transporter:      "Transport Kivu SARL",
  mill_operator:    "Moulin de Bukavu SARL",
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { signIn } = useAuth();
  const { showSuccess, showError } = useToast();
  const colors = useColors();

  const effectiveRole: UserRole = role ?? "field_agent";
  const isFieldWorker = effectiveRole === "field_agent" || effectiveRole === "lead_farmer";
  const accent = ROLE_ACCENT[effectiveRole];

  const [mode, setMode]       = useState<Mode>(isFieldWorker ? "phone" : "email");
  const [phone, setPhone]     = useState("+243 ");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const canSubmit = mode === "phone"
    ? phone.trim().length > 8
    : email.includes("@") && password.length >= 4;

  const handleSignIn = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      await signIn(effectiveRole, mode === "phone" ? { phone } : { email });
      const roleLabel = t(`roles.${effectiveRole}`, ROLE_LABELS[effectiveRole]);
      showSuccess(t("auth.loginSuccess"), roleLabel + " connecté(e)");
      const surface = ROLE_SURFACE[effectiveRole];
      if (surface === "console") router.replace("/(console)/" as any);
      else if (surface === "buyer") router.replace("/(console)/" as any);
      else router.replace("/(tabs)/" as any);
    } catch (err: any) {
      showError(t("auth.loginFailed"), err?.message ?? t("auth.loginFailedMsg"));
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = t(`roles.${effectiveRole}`, ROLE_LABELS[effectiveRole]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.scroll, Platform.OS === "web" && { paddingTop: 80 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.back}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
              <Text style={[styles.backText, { color: colors.mutedForeground }]}>{t("auth.changeRole")}</Text>
            </TouchableOpacity>

            {/* Role badge */}
            <View style={[styles.roleBadge, { backgroundColor: accent + "12", borderColor: accent + "30" }]}>
              <View style={[styles.roleIcon, { backgroundColor: accent + "20" }]}>
                <Ionicons name={ROLE_ICONS[effectiveRole]} size={18} color={accent} />
              </View>
              <View>
                <Text style={[styles.roleLabel, { color: accent }]}>{roleLabel}</Text>
                <Text style={[styles.roleSub, { color: colors.mutedForeground }]}>{ROLE_ORGS[effectiveRole]}</Text>
              </View>
            </View>

            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>{t("auth.loginTitle")}</Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                {isFieldWorker ? t("auth.subPhone") : t("auth.subEmail")}
              </Text>
            </View>

            {/* Mode toggle */}
            <View style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {(["phone", "email"] as Mode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.toggleBtn, mode === m && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }]}
                  onPress={() => setMode(m)}
                >
                  <Ionicons
                    name={m === "phone" ? "phone-portrait-outline" : "mail-outline"}
                    size={14}
                    color={mode === m ? accent : colors.mutedForeground}
                  />
                  <Text style={[styles.toggleText, { color: mode === m ? accent : colors.mutedForeground }]}>
                    {m === "phone" ? t("auth.phoneOtp") : t("auth.email")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            <View style={styles.form}>
              {mode === "phone" ? (
                <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
                    <Text style={[styles.countryCodeText, { color: colors.foreground }]}>🇨🇩</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+243 970 000 000"
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
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPass}
                      placeholder={t("auth.password")}
                      placeholderTextColor={colors.mutedForeground}
                    />
                    <TouchableOpacity onPress={() => setShowPass((s) => !s)}>
                      <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.forgot}>
                    <Text style={[styles.forgotText, { color: colors.primary }]}>{t("auth.forgotPassword")}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Biometric shortcut */}
            <TouchableOpacity style={styles.biometric}>
              <Ionicons name="finger-print-outline" size={18} color={accent} />
              <Text style={[styles.biometricText, { color: accent }]}>{t("auth.biometric")}</Text>
            </TouchableOpacity>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={!canSubmit || loading}
              style={[styles.cta, { backgroundColor: accent, opacity: !canSubmit || loading ? 0.6 : 1 }]}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.ctaText}>{t("auth.signIn")}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.register} onPress={() => router.push("/(auth)/register" as any)}>
              <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
                {t("auth.newAccount")}
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
  back: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 14, paddingBottom: 6, alignSelf: "flex-start" },
  backText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 12, marginBottom: 20 },
  roleIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  roleLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  roleSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  header: { marginBottom: 22 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 6, lineHeight: 19 },
  toggle: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 3, marginBottom: 18, gap: 3 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 9 },
  toggleText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  form: { gap: 12, marginBottom: 6 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  countryCode: { paddingRight: 10, borderRightWidth: 1 },
  countryCodeText: { fontSize: 16 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  forgot: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  biometric: { flexDirection: "row", alignItems: "center", gap: 6, marginVertical: 18, alignSelf: "center" },
  biometricText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  cta: { borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  ctaText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  register: { alignItems: "center" },
  registerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
