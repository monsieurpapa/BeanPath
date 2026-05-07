/**
 * BeanPath — Landing Page
 *
 * Premium mobile landing page. Scrollable single-page design with:
 *   1. Animated hero  (logo, wordmark, taglines, dual CTA)
 *   2. Stats strip     (coopératives, agriculteurs, kg tracés, hors-ligne)
 *   3. Supply chain    (visual farm-to-roaster flow)
 *   4. Feature grid    (4 cards 2×2 — traçabilité, offline, EUDR, SaaS)
 *   5. Certifications  (Bio, Fair Trade, Rainforest Alliance, EUDR)
 *   6. "Pour qui"      (3 audience groups)
 *   7. CTA banner
 *   8. Footer
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// useNativeDriver is not supported on Expo Web
const NATIVE = Platform.OS !== "web";

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 56) / 2;

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "20+",   label: "Coopératives" },
  { value: "15K+",  label: "Agriculteurs" },
  { value: "2.3M",  label: "kg tracés" },
  { value: "100%",  label: "Hors-ligne" },
];

const CHAIN = [
  { icon: "leaf-outline",       label: "Agriculteur", color: "#b45309" },
  { icon: "water-outline",      label: "Station",      color: "#15803d" },
  { icon: "layers-outline",     label: "Lot",          color: "#0891b2" },
  { icon: "boat-outline",       label: "Export",       color: "#7c3aed" },
  { icon: "cafe-outline",       label: "Torréfacteur", color: "#92400e" },
];

const FEATURES = [
  {
    icon: "git-network-outline" as const,
    title: "Traçabilité totale",
    desc: "Chaque bidon, chaque reçu, chaque lot — du champ au conteneur.",
    accent: "#b45309",
    bg: "rgba(180,83,9,0.12)",
  },
  {
    icon: "cloud-offline-outline" as const,
    title: "Hors-ligne natif",
    desc: "Fonctionne sans réseau en zone rurale. Sync automatique.",
    accent: "#15803d",
    bg: "rgba(21,128,61,0.12)",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "EUDR & Certif.",
    desc: "Déclarations de diligence raisonnable, Bio, Fair Trade intégrés.",
    accent: "#1d4ed8",
    bg: "rgba(29,78,216,0.12)",
  },
  {
    icon: "business-outline" as const,
    title: "Multi-coopérative",
    desc: "TCC, NAKEZA et vos propres coopératives sur une plateforme.",
    accent: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
  },
];

const CERTS = [
  { label: "Bio",                 accent: "#15803d", icon: "leaf-outline"             as const },
  { label: "Fair Trade",          accent: "#92400e", icon: "heart-outline"            as const },
  { label: "Rainforest Alliance", accent: "#065f46", icon: "earth-outline"            as const },
  { label: "EUDR",                accent: "#1d4ed8", icon: "shield-checkmark-outline" as const },
];

const AUDIENCES = [
  {
    icon: "leaf-outline"             as const,
    title: "Terrain",
    desc: "Agents collecteurs, agriculteurs leaders, groupements villageois",
    accent: "#b45309",
  },
  {
    icon: "business-outline"         as const,
    title: "Station & Coop",
    desc: "Opérateurs, administrateurs, transporteurs, moulins",
    accent: "#15803d",
  },
  {
    icon: "bag-handle-outline"       as const,
    title: "Marché",
    desc: "Exportateurs, acheteurs, torréfacteurs, certificateurs",
    accent: "#1d4ed8",
  },
];

const LANGS = ["FR", "EN", "SW"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const [lang, setLang] = useState("FR");

  // Entrance animations
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY       = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: NATIVE, tension: 60, friction: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, useNativeDriver: NATIVE, duration: 500 }),
      ]),
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, useNativeDriver: NATIVE, duration: 500 }),
        Animated.spring(heroY,       { toValue: 0, useNativeDriver: NATIVE, tension: 60, friction: 12 }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={["#080f06", "#0d1a0a", "#091520"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle radial glows */}
      <View style={styles.glowAmber} pointerEvents="none" />
      <View style={styles.glowBlue}  pointerEvents="none" />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            Platform.OS === "web" && { paddingTop: 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <View style={styles.logoMark}>
              <Ionicons name="leaf" size={14} color="#b45309" />
              <Text style={styles.logoMarkText}>BeanPath</Text>
            </View>
            <View style={styles.topRight}>
              {/* Language switcher */}
              <View style={styles.langRow}>
                {LANGS.map((l) => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setLang(l)}
                    style={[styles.langBtn, lang === l && styles.langBtnActive]}
                  >
                    <Text style={[styles.langText, lang === l && styles.langTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Sign-in shortcut */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(auth)/login", params: { role: "field_agent" } })}
                style={styles.signinBtn}
              >
                <Text style={styles.signinText}>Connexion</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── HERO ── */}
          <View style={styles.hero}>
            {/* Logo ring */}
            <Animated.View style={[styles.logoRingOuter, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
              <View style={styles.logoRingMiddle}>
                <View style={styles.logoRingInner}>
                  <Ionicons name="leaf" size={34} color="#b45309" />
                </View>
              </View>
            </Animated.View>

            {/* Wordmark + taglines */}
            <Animated.View style={[styles.heroText, { opacity: heroOpacity, transform: [{ translateY: heroY }] }]}>
              <Text style={styles.wordmark}>BeanPath</Text>
              <Text style={styles.tagline}>
                La traçabilité de la filière café et cacao{"\n"}pour les coopératives d'Afrique centrale
              </Text>
              <Text style={styles.subTagline}>
                De la parcelle au torréfacteur — chaque livraison vérifiée,{"\n"}chaque lot certifié, chaque agriculteur payé.
              </Text>

              {/* Trust row */}
              <View style={styles.trustRow}>
                {["EUDR conforme", "Hors-ligne natif", "Cryptographié"].map((t, i) => (
                  <View key={t} style={styles.trustPill}>
                    <Ionicons
                      name={i === 0 ? "shield-checkmark" : i === 1 ? "wifi" : "lock-closed"}
                      size={10}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.trustText}>{t}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* CTA buttons */}
            <Animated.View style={[styles.ctaGroup, { opacity: heroOpacity }]}>
              <Pressable
                onPress={() => router.push("/(auth)/personas" as any)}
                style={({ pressed }) => [styles.ctaPrimary, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
              >
                <Text style={styles.ctaPrimaryText}>Commencer maintenant</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(auth)/login", params: { role: "coop_admin" } })}
                style={styles.ctaSecondary}
              >
                <Text style={styles.ctaSecondaryText}>Déjà inscrit ? Se connecter</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* ── STATS STRIP ── */}
          <View style={styles.statsStrip}>
            {STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < STATS.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* ── SUPPLY CHAIN VISUALIZATION ── */}
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Suivi de bout en bout</Text>
            <Text style={styles.sectionTitle}>Chaque étape de la filière,{"\n"}sous contrôle</Text>
            <Text style={styles.sectionBody}>
              BeanPath trace chaque lot depuis le moment où l'agriculteur livre ses cerises jusqu'à l'expédition vers l'acheteur.
            </Text>

            <View style={styles.chainWrap}>
              <View style={[styles.chainLine]} />
              <View style={styles.chainRow}>
                {CHAIN.map((c, i) => (
                  <View key={c.label} style={styles.chainNode}>
                    <View style={[styles.chainIconBg, { backgroundColor: c.color + "20", borderColor: c.color + "40" }]}>
                      <Ionicons name={c.icon as any} size={20} color={c.color} />
                    </View>
                    <Text style={[styles.chainLabel, { color: i === 0 ? c.color : "rgba(255,255,255,0.55)" }]}>
                      {c.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ── FEATURE GRID ── */}
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Fonctionnalités clés</Text>
            <Text style={styles.sectionTitle}>Tout ce dont votre{"\n"}coopérative a besoin</Text>

            <View style={styles.featureGrid}>
              {FEATURES.map((f) => (
                <View key={f.title} style={[styles.featureCard, { width: CARD_W }]}>
                  <View style={[styles.featureIconBg, { backgroundColor: f.bg, borderColor: f.accent + "25" }]}>
                    <Ionicons name={f.icon} size={22} color={f.accent} />
                  </View>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── CERTIFICATIONS ── */}
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Standards & Conformité</Text>
            <Text style={styles.sectionTitle}>Toutes vos certifications,{"\n"}centralisées</Text>

            <View style={styles.certGrid}>
              {CERTS.map((c) => (
                <View key={c.label} style={[styles.certCard, { borderColor: c.accent + "30" }]}>
                  <View style={[styles.certIconBg, { backgroundColor: c.accent + "18" }]}>
                    <Ionicons name={c.icon} size={18} color={c.accent} />
                  </View>
                  <Text style={[styles.certLabel, { color: c.accent }]}>{c.label}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.infoBox]}>
              <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.40)" />
              <Text style={styles.infoBoxText}>
                BeanPath génère automatiquement les Déclarations de Diligence Raisonnable (DDR) requises par le règlement EUDR de l'Union européenne.
              </Text>
            </View>
          </View>

          {/* ── AUDIENCE SECTION ── */}
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Pour qui</Text>
            <Text style={styles.sectionTitle}>Une application pour{"\n"}toute la filière</Text>

            <View style={styles.audienceList}>
              {AUDIENCES.map((a, i) => (
                <View key={a.title} style={[styles.audienceCard, i < AUDIENCES.length - 1 && { marginBottom: 10 }]}>
                  <View style={[styles.audienceIcon, { backgroundColor: a.accent + "18", borderColor: a.accent + "30" }]}>
                    <Ionicons name={a.icon} size={20} color={a.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.audienceTitle}>{a.title}</Text>
                    <Text style={styles.audienceDesc}>{a.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ── SOCIAL PROOF / QUOTE ── */}
          <View style={styles.quoteSection}>
            <LinearGradient
              colors={["rgba(180,83,9,0.12)", "rgba(21,128,61,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteCard}
            >
              <View style={styles.quoteMark}>
                <Text style={styles.quoteMarkText}>"</Text>
              </View>
              <Text style={styles.quoteText}>
                Avec BeanPath, nos agents de terrain saisissent les livraisons même sans connexion. Les registres se synchronisent automatiquement dès qu'ils rentrent au bureau.
              </Text>
              <View style={styles.quoteAuthor}>
                <View style={[styles.quoteAvatar, { backgroundColor: "#b4530940" }]}>
                  <Text style={styles.quoteAvatarText}>BK</Text>
                </View>
                <View>
                  <Text style={styles.quoteAuthorName}>Bishops KAJEREGE</Text>
                  <Text style={styles.quoteAuthorRole}>Administrateur — NAKEZA SARL · DRC</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ── FINAL CTA ── */}
          <View style={styles.ctaBanner}>
            <LinearGradient
              colors={["rgba(180,83,9,0.20)", "rgba(180,83,9,0.08)"]}
              style={styles.ctaBannerGradient}
            >
              <View style={[styles.ctaBannerIconRing]}>
                <Ionicons name="leaf" size={28} color="#b45309" />
              </View>
              <Text style={styles.ctaBannerTitle}>
                Prêt à tracer votre filière ?
              </Text>
              <Text style={styles.ctaBannerSub}>
                Rejoignez les coopératives du Kivu et d'Afrique centrale qui font confiance à BeanPath pour leur traçabilité café et cacao.
              </Text>
              <Pressable
                onPress={() => router.push("/(auth)/personas" as any)}
                style={({ pressed }) => [styles.ctaBannerBtn, pressed && { opacity: 0.88 }]}
              >
                <Text style={styles.ctaBannerBtnText}>Choisir mon profil</Text>
                <Ionicons name="arrow-forward" size={17} color="#fff" />
              </Pressable>
            </LinearGradient>
          </View>

          {/* ── FOOTER ── */}
          <View style={styles.footer}>
            <View style={styles.footerLogoRow}>
              <Ionicons name="leaf" size={14} color="rgba(255,255,255,0.25)" />
              <Text style={styles.footerWordmark}>BeanPath</Text>
            </View>
            <Text style={styles.footerTagline}>
              Hors-ligne d'abord · Cryptographiquement vérifié · EUDR conforme
            </Text>
            <Text style={styles.footerMeta}>
              v3.0 · DRC Coffee & Cocoa Supply Chain · © 2025
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Ambient glows — keep subtle, far from text
  glowAmber: {
    position: "absolute", top: 60, left: W * 0.5 - 70,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(180,83,9,0.16)",
  },
  glowBlue: {
    position: "absolute", top: 820, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(29,78,216,0.07)",
  },

  // Scroll
  scroll: { flexGrow: 1, paddingBottom: 0 },

  // Top bar
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8,
  },
  logoMark: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoMarkText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.3 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  langRow: { flexDirection: "row", gap: 2, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10, padding: 2 },
  langBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  langBtnActive: { backgroundColor: "rgba(255,255,255,0.15)" },
  langText: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  langTextActive: { color: "#ffffff" },
  signinBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.13)",
  },
  signinText: { color: "rgba(255,255,255,0.80)", fontSize: 12, fontFamily: "Inter_600SemiBold" },

  // Hero
  hero: { alignItems: "center", paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },

  // Logo ring
  logoRingOuter: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: "rgba(180,83,9,0.08)",
    borderWidth: 1, borderColor: "rgba(180,83,9,0.20)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#b45309", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.30, shadowRadius: 24, elevation: 8,
  },
  logoRingMiddle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: "rgba(180,83,9,0.12)",
    borderWidth: 1, borderColor: "rgba(180,83,9,0.30)",
    alignItems: "center", justifyContent: "center",
  },
  logoRingInner: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: "rgba(180,83,9,0.22)",
    borderWidth: 1.5, borderColor: "rgba(180,83,9,0.50)",
    alignItems: "center", justifyContent: "center",
  },

  // Hero text
  heroText: { alignItems: "center", width: "100%" },
  wordmark: {
    fontSize: 46, fontFamily: "Inter_700Bold", color: "#ffffff",
    letterSpacing: -1.8, marginBottom: 16, textAlign: "center",
  },
  tagline: {
    fontSize: 18, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)",
    textAlign: "center", lineHeight: 26, letterSpacing: -0.3,
    marginBottom: 12,
  },
  subTagline: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)",
    textAlign: "center", lineHeight: 21, marginBottom: 22,
  },

  // Trust pills row
  trustRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 },
  trustPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  trustText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.45)" },

  // CTA group
  ctaGroup: { width: "100%", gap: 12, marginTop: 28 },
  ctaPrimary: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#b45309", borderRadius: 16,
    paddingVertical: 17, paddingHorizontal: 28,
    shadowColor: "#b45309", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.38, shadowRadius: 18, elevation: 8,
  },
  ctaPrimaryText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  ctaSecondary: { alignItems: "center", paddingVertical: 12 },
  ctaSecondaryText: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter_500Medium" },

  // Stats strip
  statsStrip: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 56,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 20,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.40)", marginTop: 3 },
  statDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.09)" },

  // Generic section
  section: { paddingHorizontal: 20, marginBottom: 56 },
  sectionEyebrow: {
    fontSize: 10, fontFamily: "Inter_600SemiBold",
    color: "#b45309", textTransform: "uppercase", letterSpacing: 1.2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 28, fontFamily: "Inter_700Bold", color: "#ffffff",
    letterSpacing: -0.8, lineHeight: 36, marginBottom: 14,
  },
  sectionBody: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.50)",
    lineHeight: 22, marginBottom: 28,
  },

  // Supply chain
  chainWrap: { position: "relative", marginTop: 4 },
  chainLine: {
    position: "absolute", top: 24, left: "10%", right: "10%", height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chainRow: { flexDirection: "row", justifyContent: "space-between" },
  chainNode: { alignItems: "center", gap: 8, width: 56 },
  chainIconBg: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  chainLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },

  // Feature grid
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  featureCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    padding: 18,
  },
  featureIconBg: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, marginBottom: 14,
  },
  featureTitle: {
    fontSize: 14, fontFamily: "Inter_700Bold", color: "#ffffff",
    marginBottom: 8, letterSpacing: -0.2,
  },
  featureDesc: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)",
    lineHeight: 18,
  },

  // Certs
  certGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  certCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    flex: 1, minWidth: "44%",
  },
  certIconBg: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  certLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
  },
  infoBoxText: {
    flex: 1, fontSize: 12, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.40)", lineHeight: 18,
  },

  // Audience
  audienceList: {},
  audienceCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16,
  },
  audienceIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  audienceTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 3 },
  audienceDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", lineHeight: 17 },

  // Quote / testimonial
  quoteSection: { paddingHorizontal: 20, marginBottom: 56 },
  quoteCard: {
    borderRadius: 22, borderWidth: 1, borderColor: "rgba(180,83,9,0.20)",
    padding: 24,
  },
  quoteMark: { marginBottom: 12 },
  quoteMarkText: {
    fontSize: 56, fontFamily: "Inter_700Bold", color: "rgba(180,83,9,0.40)",
    lineHeight: 44, marginTop: -10,
  },
  quoteText: {
    fontSize: 15, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.75)",
    lineHeight: 24, marginBottom: 20,
  },
  quoteAuthor: { flexDirection: "row", alignItems: "center", gap: 12 },
  quoteAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  quoteAvatarText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#b45309" },
  quoteAuthorName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#ffffff" },
  quoteAuthorRole: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.40)", marginTop: 2 },

  // Final CTA banner
  ctaBanner: { marginHorizontal: 20, marginBottom: 48 },
  ctaBannerGradient: {
    borderRadius: 24, borderWidth: 1, borderColor: "rgba(180,83,9,0.25)",
    padding: 28, alignItems: "center",
  },
  ctaBannerIconRing: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(180,83,9,0.18)", borderWidth: 1.5, borderColor: "rgba(180,83,9,0.40)",
    alignItems: "center", justifyContent: "center", marginBottom: 18,
  },
  ctaBannerTitle: {
    fontSize: 24, fontFamily: "Inter_700Bold", color: "#ffffff",
    letterSpacing: -0.6, textAlign: "center", marginBottom: 12,
  },
  ctaBannerSub: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.50)",
    textAlign: "center", lineHeight: 20, marginBottom: 24,
  },
  ctaBannerBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#b45309", borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 28,
    shadowColor: "#b45309", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 14,
  },
  ctaBannerBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  // Footer
  footer: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
  footerLogoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  footerWordmark: { fontSize: 14, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.20)" },
  footerTagline: {
    fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.20)",
    textAlign: "center", marginBottom: 6, lineHeight: 16,
  },
  footerMeta: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.14)" },
});
