import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { UserRole } from "@/context/AuthContext";

const { height } = Dimensions.get("window");

type RoleCard = {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  accent: string;
};

const ROLES: RoleCard[] = [
  {
    role: "field_agent",
    title: "I work in the field",
    subtitle: "Farmer registration, collection, weighing, payments",
    icon: "leaf",
    accent: "#b45309",
  },
  {
    role: "station_operator",
    title: "Station or office",
    subtitle: "Washing station, mill, exporter, logistics",
    icon: "business",
    accent: "#15803d",
  },
  {
    role: "buyer",
    title: "Buyer or consumer",
    subtitle: "Incoming shipments, dossiers, origin stories",
    icon: "bag-handle",
    accent: "#1d4ed8",
  },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const [locale, setLocale] = useState("EN");

  const handleRole = (role: UserRole) => {
    router.push({ pathname: "/(auth)/login", params: { role } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1c1006" }}>
      <LinearGradient
        colors={["#1c1006", "#2d1a06", "#1a2e10"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, Platform.OS === "web" && { paddingTop: 80, paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Locale picker */}
          <View style={styles.topRow}>
            <View />
            <TouchableOpacity
              style={styles.localePill}
              onPress={() => setLocale((l) => (l === "EN" ? "FR" : "EN"))}
            >
              <Ionicons name="globe-outline" size={13} color="rgba(255,255,255,0.6)" />
              <Text style={styles.localeText}>{locale}</Text>
            </TouchableOpacity>
          </View>

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoRing}>
              <Ionicons name="leaf" size={28} color="#b45309" />
            </View>
            <Text style={styles.wordmark}>BeanPath</Text>
            <Text style={styles.tagline}>
              From the farmer's plot to the roaster's bag — every step, verified.
            </Text>
          </View>

          {/* Role cards */}
          <View style={styles.cards}>
            {ROLES.map((r) => (
              <Pressable
                key={r.role}
                onPress={() => handleRole(r.role)}
                style={({ pressed }) => [
                  styles.card,
                  { borderColor: pressed ? r.accent : "rgba(255,255,255,0.1)" },
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={[styles.cardIcon, { backgroundColor: r.accent + "22" }]}>
                  <Ionicons name={r.icon} size={22} color={r.accent} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{r.title}</Text>
                  <Text style={styles.cardSub}>{r.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </Pressable>
            ))}
          </View>

          <Text style={styles.footer}>
            Region-agnostic · Offline-first · Cryptographically verified
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginBottom: 8 },
  localePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  localeText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  brand: { alignItems: "center", paddingVertical: 40 },
  logoRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(180,83,9,0.15)", borderWidth: 1, borderColor: "rgba(180,83,9,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  wordmark: { fontSize: 38, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -1 },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 8, lineHeight: 20, paddingHorizontal: 20, fontFamily: "Inter_400Regular" },
  cards: { gap: 12, marginTop: 8 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1 },
  cardIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#ffffff" },
  cardSub: { fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter_400Regular", marginTop: 2 },
  footer: { textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 40, lineHeight: 16 },
});
