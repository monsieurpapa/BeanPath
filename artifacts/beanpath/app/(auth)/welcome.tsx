/**
 * BeanPath — Landing Page (v2)
 *
 * Fully responsive (mobile / tablet / desktop).
 * Sections:
 *  1. Nav bar            — logo + lang switcher + sign-in CTA
 *  2. Hero               — wordmark, taglines, dual CTA + phone mockup (desktop split)
 *  3. Stats strip        — 4 key numbers
 *  4. Product demo       — animated phone cycling through 3 app screens
 *  5. Supply chain       — 5-node visual
 *  6. Feature grid       — 4 cards (2×2 mobile / 4-col desktop)
 *  7. Certifications     — 4 compliance badges
 *  8. Audience           — 3 groups
 *  9. App download       — QR codes for iOS & Android
 * 10. Waitlist form      — email + role capture
 * 11. Footer
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const NATIVE = Platform.OS !== "web";
const MOCK_H = 480; // height of one mock screen inside the phone

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "20+",   label: "Coopératives" },
  { value: "15K+",  label: "Agriculteurs" },
  { value: "2.3M",  label: "kg tracés" },
  { value: "100%",  label: "Hors-ligne" },
];

const CHAIN = [
  { icon: "leaf-outline",    label: "Agriculteur", color: "#b45309" },
  { icon: "water-outline",   label: "Station",     color: "#15803d" },
  { icon: "layers-outline",  label: "Lot",          color: "#0891b2" },
  { icon: "boat-outline",    label: "Export",       color: "#7c3aed" },
  { icon: "cafe-outline",    label: "Torréfacteur", color: "#92400e" },
];

const FEATURES = [
  { icon: "git-network-outline"    as const, title: "Traçabilité totale",    desc: "Chaque bidon, reçu et lot — du champ au conteneur d'exportation.",      accent: "#b45309", bg: "rgba(180,83,9,0.12)"    },
  { icon: "cloud-offline-outline"  as const, title: "Hors-ligne natif",      desc: "Fonctionne sans réseau en zone rurale. Sync automatique au retour.",      accent: "#15803d", bg: "rgba(21,128,61,0.12)"   },
  { icon: "shield-checkmark-outline" as const, title: "EUDR & Certif.",      desc: "Déclarations de diligence raisonnable, Bio, Fair Trade — intégrés.",     accent: "#1d4ed8", bg: "rgba(29,78,216,0.12)"   },
  { icon: "business-outline"       as const, title: "Multi-coopérative",     desc: "TCC, NAKEZA et vos propres coopératives sur une seule plateforme.",       accent: "#7c3aed", bg: "rgba(124,58,237,0.12)"  },
];

const CERTS = [
  { label: "Bio",                 accent: "#15803d", icon: "leaf-outline"              as const },
  { label: "Fair Trade",          accent: "#92400e", icon: "heart-outline"             as const },
  { label: "Rainforest Alliance", accent: "#065f46", icon: "earth-outline"             as const },
  { label: "EUDR",                accent: "#1d4ed8", icon: "shield-checkmark-outline"  as const },
];

const AUDIENCES = [
  { icon: "leaf-outline"         as const, title: "Terrain",        desc: "Agents collecteurs, agriculteurs leaders, groupements villageois", accent: "#b45309" },
  { icon: "business-outline"     as const, title: "Station & Coop", desc: "Opérateurs, administrateurs, transporteurs, moulins",              accent: "#15803d" },
  { icon: "bag-handle-outline"   as const, title: "Marché",         desc: "Exportateurs, acheteurs, torréfacteurs, certificateurs",           accent: "#1d4ed8" },
];

const LANGS = ["FR", "EN", "SW"];

const MOCK_SCREENS = [
  { label: "Tableau de bord", color: "#15803d" },
  { label: "Collecte",        color: "#b45309" },
  { label: "Agriculteurs",    color: "#1d4ed8" },
];

// ─── Phone mockup sub-components ─────────────────────────────────────────────

function MockDashboard() {
  return (
    <View style={mk.screen}>
      <LinearGradient colors={["#0d1a0a", "#1a2e10"]} style={mk.header}>
        <Text style={mk.headerGreet}>Bonjour, Bahati 🌅</Text>
        <Text style={mk.headerRole}>Agent de terrain · TCC KAHISA</Text>
        <View style={mk.statsRow}>
          {[["12", "Livraisons"], ["108", "Bidons"], ["2 560 kg", "Poids"]].map(([v, l]) => (
            <View key={l} style={mk.statCard}>
              <Text style={mk.statVal}>{v}</Text>
              <Text style={mk.statLbl}>{l}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
      <View style={mk.body}>
        <Text style={mk.sectionLbl}>Actions rapides</Text>
        <View style={mk.actionRow}>
          <View style={[mk.actionBtn, { backgroundColor: "#fef3c7" }]}>
            <Ionicons name="add-circle-outline" size={16} color="#b45309" />
            <Text style={[mk.actionLbl, { color: "#b45309" }]}>Livraison</Text>
          </View>
          <View style={[mk.actionBtn, { backgroundColor: "#dcfce7" }]}>
            <Ionicons name="person-add-outline" size={16} color="#15803d" />
            <Text style={[mk.actionLbl, { color: "#15803d" }]}>Agriculteur</Text>
          </View>
        </View>
        <Text style={mk.sectionLbl}>Récentes</Text>
        {[
          { name: "BULONZA MUDUMBI", detail: "95 bidons · 95 000 FC", time: "2h" },
          { name: "AMANI KIZITO",    detail: "62 bidons · 62 000 FC", time: "4h" },
          { name: "MAPENDO SAFARI",  detail: "48 bidons · 48 000 FC", time: "6h" },
        ].map((d) => (
          <View key={d.name} style={mk.delivCard}>
            <View style={mk.delivDot} />
            <View style={{ flex: 1 }}>
              <Text style={mk.delivName}>{d.name}</Text>
              <Text style={mk.delivDetail}>{d.detail}</Text>
            </View>
            <Text style={mk.delivTime}>{d.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MockCollect() {
  return (
    <View style={mk.screen}>
      <View style={[mk.header, { backgroundColor: "#b45309", paddingTop: 14 }]}>
        <Text style={mk.headerGreet}>Nouvelle livraison</Text>
        <Text style={mk.headerRole}>Enregistrement cerises</Text>
      </View>
      <View style={mk.body}>
        {[
          { label: "Agriculteur",    value: "BULONZA MUDUMBI",  icon: "person-outline" },
          { label: "Nb. bidons",     value: "12 bidons",         icon: "cube-outline" },
          { label: "Poids estimé",   value: "120 kg",            icon: "scale-outline" },
          { label: "Montant (FC)",   value: "120 000 FC",        icon: "cash-outline" },
        ].map((f) => (
          <View key={f.label} style={mk.field}>
            <Text style={mk.fieldLabel}>{f.label}</Text>
            <View style={mk.fieldRow}>
              <Ionicons name={f.icon as any} size={12} color="#78716c" />
              <Text style={mk.fieldValue}>{f.value}</Text>
            </View>
          </View>
        ))}
        <View style={mk.submitBtn}>
          <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
          <Text style={mk.submitLbl}>Enregistrer la livraison</Text>
        </View>
        <Text style={mk.receiptHint}>Reçu PDF généré automatiquement</Text>
      </View>
    </View>
  );
}

function MockFarmers() {
  const farmers = [
    { name: "BULONZA MUDUMBI",   code: "TCC BUS 021", kg: "320 kg" },
    { name: "AMANI KIZITO",      code: "TCC AKZ 019", kg: "284 kg" },
    { name: "MAPENDO SAFARI",    code: "TCC MSF 034", kg: "196 kg" },
    { name: "BAHATI KASEREKA",   code: "TCC BKS 012", kg: "412 kg" },
  ];
  return (
    <View style={mk.screen}>
      <View style={[mk.header, { backgroundColor: "#1d4ed8", paddingTop: 14 }]}>
        <Text style={mk.headerGreet}>Agriculteurs</Text>
        <Text style={mk.headerRole}>47 inscrits · TCC KAHISA</Text>
      </View>
      <View style={mk.body}>
        <View style={mk.searchBar}>
          <Ionicons name="search-outline" size={12} color="#78716c" />
          <Text style={mk.searchText}>Rechercher...</Text>
        </View>
        {farmers.map((f) => (
          <View key={f.code} style={mk.farmerRow}>
            <View style={mk.farmerAvatar}>
              <Text style={mk.farmerInitial}>{f.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={mk.farmerName}>{f.name}</Text>
              <Text style={mk.farmerCode}>{f.code}</Text>
            </View>
            <Text style={mk.farmerKg}>{f.kg}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Animated phone mockup ────────────────────────────────────────────────────

function PhoneMockup() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function cycle() {
      while (!cancelled) {
        for (let i = 0; i < 3; i++) {
          if (cancelled) break;
          await new Promise<void>((res) =>
            Animated.timing(scrollY, {
              toValue: -(i * MOCK_H),
              duration: 800,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: NATIVE,
            }).start(() => {
              if (!cancelled) setActive(i);
              res();
            }),
          );
          await new Promise((res) => setTimeout(res, 2800));
        }
      }
    }

    cycle();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={ph.wrapper}>
      {/* Phone frame */}
      <View style={ph.frame}>
        {/* Notch */}
        <View style={ph.notch} />
        {/* Screen area */}
        <View style={ph.screen}>
          <Animated.View style={[ph.slider, { transform: [{ translateY: scrollY }] }]}>
            <MockDashboard />
            <MockCollect />
            <MockFarmers />
          </Animated.View>
        </View>
        {/* Home indicator */}
        <View style={ph.homeBar} />
      </View>
      {/* Screen labels */}
      <View style={ph.labels}>
        {MOCK_SCREENS.map((s, i) => (
          <View key={s.label} style={[ph.label, active === i && { borderColor: s.color }]}>
            <View style={[ph.labelDot, { backgroundColor: active === i ? s.color : "rgba(255,255,255,0.20)" }]} />
            <Text style={[ph.labelText, active === i && { color: "#fff" }]}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Waitlist form ────────────────────────────────────────────────────────────

const ROLES = [
  { id: "buyer",    label: "Acheteur / Torréfacteur",    icon: "bag-handle-outline" as const },
  { id: "provider", label: "Coopérative / Exportateur",  icon: "business-outline"   as const },
];

function WaitlistSection({ isDesktop }: { isDesktop: boolean }) {
  const [email, setEmail]         = useState("");
  const [role, setRole]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");
  const successScale = useRef(new Animated.Value(0.8)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const submit = useCallback(async () => {
    setError("");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) { setError("Adresse e-mail invalide."); return; }
    if (!role) { setError("Veuillez choisir votre profil."); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
    Animated.parallel([
      Animated.spring(successScale,   { toValue: 1,   useNativeDriver: NATIVE, tension: 60, friction: 8 }),
      Animated.timing(successOpacity, { toValue: 1,   useNativeDriver: NATIVE, duration: 400 }),
    ]).start();
  }, [email, role]);

  return (
    <View style={[wl.section, isDesktop && wl.sectionDesktop]}>
      <Text style={wl.eyebrow}>Accès anticipé</Text>
      <Text style={wl.title}>Rejoignez la liste{"\n"}d'attente</Text>
      <Text style={wl.sub}>
        BeanPath est en phase de déploiement. Inscrivez-vous pour être parmi les premiers à accéder à la plateforme et recevoir nos mises à jour.
      </Text>

      {submitted ? (
        <Animated.View style={[wl.success, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
          <View style={wl.successIcon}>
            <Ionicons name="checkmark-circle" size={36} color="#15803d" />
          </View>
          <Text style={wl.successTitle}>Vous êtes inscrit !</Text>
          <Text style={wl.successSub}>
            Nous vous contacterons à{" "}
            <Text style={{ color: "#b45309" }}>{email}</Text>
            {" "}dès que votre accès est prêt.
          </Text>
        </Animated.View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[wl.form, isDesktop && wl.formDesktop]}>
            {/* Email input */}
            <View style={wl.inputWrap}>
              <Ionicons name="mail-outline" size={16} color="rgba(255,255,255,0.35)" style={wl.inputIcon} />
              <TextInput
                style={wl.input}
                placeholder="votre@email.com"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Role selector */}
            <View style={wl.roleRow}>
              {ROLES.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => setRole(r.id)}
                  style={[wl.roleBtn, role === r.id && wl.roleBtnActive]}
                >
                  <Ionicons
                    name={r.icon}
                    size={14}
                    color={role === r.id ? "#b45309" : "rgba(255,255,255,0.40)"}
                  />
                  <Text style={[wl.roleLbl, role === r.id && wl.roleLblActive]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {!!error && <Text style={wl.error}>{error}</Text>}

            <Pressable
              onPress={submit}
              style={({ pressed }) => [wl.submitBtn, pressed && { opacity: 0.85 }]}
              disabled={submitting}
            >
              {submitting ? (
                <Text style={wl.submitText}>Inscription en cours…</Text>
              ) : (
                <>
                  <Text style={wl.submitText}>M'inscrire sur la liste d'attente</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </>
              )}
            </Pressable>

            <Text style={wl.privacy}>
              Aucun spam. Vos données restent confidentielles.
            </Text>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// ─── Download / QR section ────────────────────────────────────────────────────

const IOS_URL     = "https://apps.apple.com/app/expo-go/id982107779";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=host.exp.exponent";
const EXPO_URL    = "https://bean-path-trace--monsieurpapa.replit.app/";

function DownloadSection({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={[dl.section, isDesktop && dl.sectionDesktop]}>
      <Text style={dl.eyebrow}>Application mobile</Text>
      <Text style={dl.title}>Téléchargez{"\n"}BeanPath</Text>
      <Text style={dl.sub}>
        Scannez le code QR avec votre téléphone pour télécharger Expo Go et accéder à l'application directement sur votre appareil.
      </Text>

      <View style={[dl.cards, isDesktop && dl.cardsDesktop]}>
        {[
          { label: "iPhone / iPad",    store: "App Store",    url: IOS_URL,     icon: "logo-apple"    as const, color: "#f5f5f5" },
          { label: "Android",          store: "Google Play",  url: ANDROID_URL, icon: "logo-google"   as const, color: "#34a853" },
        ].map((d) => (
          <View key={d.label} style={dl.card}>
            <View style={dl.cardTop}>
              <Ionicons name={d.icon} size={20} color={d.color} />
              <View>
                <Text style={dl.deviceLabel}>{d.label}</Text>
                <Text style={dl.storeLabel}>{d.store}</Text>
              </View>
            </View>
            <View style={dl.qrWrap}>
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=130x130&bgcolor=0d1a0a&color=ffffff&data=${encodeURIComponent(d.url)}` }}
                style={{ width: 130, height: 130, borderRadius: 4 }}
              />
            </View>
            <TouchableOpacity
              onPress={() => { if (Platform.OS === "web") { (globalThis as any).open?.(d.url, "_blank"); } }}
              style={dl.storeBtn}
            >
              <Ionicons name={d.icon} size={14} color="#fff" />
              <Text style={dl.storeBtnText}>Ouvrir dans {d.store}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Web / Expo Go */}
        <View style={[dl.card, { borderColor: "rgba(180,83,9,0.35)" }]}>
          <View style={dl.cardTop}>
            <Ionicons name="qr-code-outline" size={20} color="#b45309" />
            <View>
              <Text style={dl.deviceLabel}>Expo Go</Text>
              <Text style={dl.storeLabel}>Accès développeur</Text>
            </View>
          </View>
          <View style={dl.qrWrap}>
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=130x130&bgcolor=0d1a0a&color=b45309&data=${encodeURIComponent(EXPO_URL)}` }}
              style={{ width: 130, height: 130, borderRadius: 4 }}
            />
          </View>
          <Text style={dl.expoHint}>
            Scannez avec Expo Go pour prévisualiser l'application
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet  = width >= 768;
  const CONTAINER = { maxWidth: 1100, width: "100%" as const, alignSelf: "center" as const };
  const PX = isDesktop ? 48 : isTablet ? 32 : 20;

  const [lang, setLang]       = useState("FR");
  const logoScale             = useRef(new Animated.Value(0.75)).current;
  const logoOpacity           = useRef(new Animated.Value(0)).current;
  const heroOpacity           = useRef(new Animated.Value(0)).current;
  const heroY                 = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: NATIVE, tension: 60, friction: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, useNativeDriver: NATIVE, duration: 460 }),
      ]),
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, useNativeDriver: NATIVE, duration: 460 }),
        Animated.spring(heroY,       { toValue: 0, useNativeDriver: NATIVE, tension: 60, friction: 12 }),
      ]),
    ]).start();
  }, []);

  const cardW = isDesktop
    ? (Math.min(width, 1100) - PX * 2 - 36) / 4
    : isTablet
    ? (Math.min(width, 1100) - PX * 2 - 12) / 2
    : (width - PX * 2 - 12) / 2;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#080f06", "#0d1a0a", "#091520"]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          {/* ── Nav bar ── */}
          <View style={[s.nav, { paddingHorizontal: PX }]}>
            <View style={[CONTAINER, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
              <View style={s.logoMark}>
                <Ionicons name="leaf" size={14} color="#b45309" />
                <Text style={s.logoMarkText}>BeanPath</Text>
                <View style={s.betaBadge}><Text style={s.betaText}>BETA</Text></View>
              </View>
              <View style={s.navRight}>
                <View style={s.langRow}>
                  {LANGS.map((l) => (
                    <TouchableOpacity key={l} onPress={() => setLang(l)} style={[s.langBtn, lang === l && s.langBtnActive]}>
                      <Text style={[s.langText, lang === l && s.langTextActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/(auth)/login", params: { role: "field_agent" } })}
                  style={[s.signinBtn, isDesktop && s.signinBtnDesktop]}
                >
                  <Text style={s.signinText}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Hero ── */}
          <View style={{ paddingHorizontal: PX, paddingTop: isDesktop ? 80 : 40, paddingBottom: isDesktop ? 80 : 40 }}>
            <View style={[CONTAINER, isDesktop && { flexDirection: "row", alignItems: "center", gap: 64 }]}>

              {/* Left: text */}
              <View style={[{ flex: isDesktop ? 1 : undefined }, !isDesktop && { alignItems: "center" }]}>
                {/* Logo ring — only on mobile */}
                {!isDesktop && (
                  <Animated.View style={[s.logoRingOuter, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
                    <View style={s.logoRingMiddle}>
                      <View style={s.logoRingInner}>
                        <Ionicons name="leaf" size={30} color="#b45309" />
                      </View>
                    </View>
                  </Animated.View>
                )}

                <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroY }], alignItems: isDesktop ? "flex-start" : "center" }}>
                  {/* Desktop inline logo */}
                  {isDesktop && (
                    <Animated.View style={[s.logoRingOuterSm, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
                      <View style={s.logoRingMiddleSm}>
                        <View style={s.logoRingInnerSm}>
                          <Ionicons name="leaf" size={18} color="#b45309" />
                        </View>
                      </View>
                    </Animated.View>
                  )}

                  <Text style={[s.wordmark, isDesktop && s.wordmarkDesktop, !isDesktop && { textAlign: "center" }]}>
                    BeanPath
                  </Text>
                  <Text style={[s.tagline, isDesktop && s.taglineDesktop, !isDesktop && { textAlign: "center" }]}>
                    La traçabilité de la filière café et cacao{"\n"}pour les coopératives d'Afrique centrale
                  </Text>
                  <Text style={[s.subTagline, !isDesktop && { textAlign: "center" }]}>
                    De la parcelle au torréfacteur — chaque livraison vérifiée, chaque lot certifié, chaque agriculteur payé.
                  </Text>

                  {/* Trust pills */}
                  <View style={[s.trustRow, !isDesktop && { justifyContent: "center" }]}>
                    {["EUDR conforme", "Hors-ligne natif", "Cryptographié"].map((t, i) => (
                      <View key={t} style={s.trustPill}>
                        <Ionicons name={i === 0 ? "shield-checkmark" : i === 1 ? "wifi" : "lock-closed"} size={10} color="rgba(255,255,255,0.5)" />
                        <Text style={s.trustText}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  {/* CTA buttons */}
                  <View style={[s.ctaGroup, isDesktop && s.ctaGroupDesktop]}>
                    <Pressable
                      onPress={() => router.push("/(auth)/personas" as any)}
                      style={({ pressed }) => [s.ctaPrimary, isDesktop && s.ctaPrimaryDesktop, pressed && { opacity: 0.88 }]}
                    >
                      <Text style={s.ctaPrimaryText}>Commencer maintenant</Text>
                      <Ionicons name="arrow-forward" size={17} color="#fff" />
                    </Pressable>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/(auth)/login", params: { role: "coop_admin" } })}
                      style={[s.ctaSecondary, isDesktop && s.ctaSecondaryDesktop]}
                    >
                      <Text style={s.ctaSecondaryText}>Déjà inscrit ? Se connecter</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </View>

              {/* Right: phone mockup (desktop only in hero) */}
              {isDesktop && (
                <Animated.View style={[{ opacity: heroOpacity }, { flexShrink: 0 }]}>
                  <PhoneMockup />
                </Animated.View>
              )}
            </View>
          </View>

          {/* ── Stats strip ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={[CONTAINER, s.statsStrip]}>
              {STATS.map((st, i) => (
                <React.Fragment key={st.label}>
                  <View style={s.statItem}>
                    <Text style={[s.statValue, isDesktop && { fontSize: 28 }]}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                  {i < STATS.length - 1 && <View style={s.statDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* ── Product demo (mobile only; desktop has it in hero) ── */}
          {!isDesktop && (
            <View style={{ paddingHorizontal: PX, marginBottom: 64, alignItems: "center" }}>
              <Text style={s.eyebrow}>Aperçu de l'application</Text>
              <Text style={[s.sectionTitle, { textAlign: "center", marginBottom: 28 }]}>
                Conçu pour le terrain,{"\n"}partout en RDC
              </Text>
              <PhoneMockup />
            </View>
          )}

          {/* ── Supply chain ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <Text style={s.eyebrow}>Suivi de bout en bout</Text>
              <Text style={[s.sectionTitle, isDesktop && { fontSize: 34 }]}>
                Chaque étape de la filière,{"\n"}sous contrôle
              </Text>
              <Text style={s.sectionBody}>
                BeanPath trace chaque lot depuis le moment où l'agriculteur livre ses cerises jusqu'à l'expédition vers l'acheteur international.
              </Text>
              <View style={s.chainWrap}>
                <View style={s.chainLine} />
                <View style={s.chainRow}>
                  {CHAIN.map((c, i) => (
                    <View key={c.label} style={[s.chainNode, isDesktop && { width: 90 }]}>
                      <View style={[s.chainIconBg, { backgroundColor: c.color + "20", borderColor: c.color + "40" }, isDesktop && { width: 56, height: 56, borderRadius: 28 }]}>
                        <Ionicons name={c.icon as any} size={isDesktop ? 22 : 18} color={c.color} />
                      </View>
                      <Text style={[s.chainLabel, { color: i === 0 ? c.color : "rgba(255,255,255,0.55)" }, isDesktop && { fontSize: 11 }]}>
                        {c.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ── Feature grid ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <Text style={s.eyebrow}>Fonctionnalités clés</Text>
              <Text style={[s.sectionTitle, isDesktop && { fontSize: 34 }]}>
                Tout ce dont votre{"\n"}coopérative a besoin
              </Text>
              <View style={[s.featureGrid, isDesktop && { gap: 16 }]}>
                {FEATURES.map((f) => (
                  <View key={f.title} style={[s.featureCard, { width: cardW }, isDesktop && { paddingVertical: 24 }]}>
                    <View style={[s.featureIconBg, { backgroundColor: f.bg, borderColor: f.accent + "25" }]}>
                      <Ionicons name={f.icon} size={isDesktop ? 24 : 20} color={f.accent} />
                    </View>
                    <Text style={[s.featureTitle, isDesktop && { fontSize: 16 }]}>{f.title}</Text>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ── Certifications ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <Text style={s.eyebrow}>Standards & Conformité</Text>
              <Text style={[s.sectionTitle, isDesktop && { fontSize: 34 }]}>
                Toutes vos certifications,{"\n"}centralisées
              </Text>
              <View style={[s.certGrid, isDesktop && { gap: 14 }]}>
                {CERTS.map((c) => (
                  <View key={c.label} style={[s.certCard, { borderColor: c.accent + "30" }, isDesktop && { flex: 1 }]}>
                    <View style={[s.certIconBg, { backgroundColor: c.accent + "18" }]}>
                      <Ionicons name={c.icon} size={18} color={c.accent} />
                    </View>
                    <Text style={[s.certLabel, { color: c.accent }]}>{c.label}</Text>
                  </View>
                ))}
              </View>
              <View style={s.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.40)" />
                <Text style={s.infoBoxText}>
                  BeanPath génère automatiquement les Déclarations de Diligence Raisonnable (DDR) requises par le règlement EUDR de l'Union européenne à l'exportation.
                </Text>
              </View>
            </View>
          </View>

          {/* ── Audience ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <Text style={s.eyebrow}>Pour qui</Text>
              <Text style={[s.sectionTitle, isDesktop && { fontSize: 34 }]}>
                Une application pour{"\n"}toute la filière
              </Text>
              <View style={[s.audienceList, isDesktop && { flexDirection: "row", gap: 16 }]}>
                {AUDIENCES.map((a, i) => (
                  <View
                    key={a.title}
                    style={[
                      s.audienceCard,
                      !isDesktop && i < AUDIENCES.length - 1 && { marginBottom: 10 },
                      isDesktop && { flex: 1 },
                    ]}
                  >
                    <View style={[s.audienceIcon, { backgroundColor: a.accent + "18", borderColor: a.accent + "30" }]}>
                      <Ionicons name={a.icon} size={20} color={a.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.audienceTitle}>{a.title}</Text>
                      <Text style={s.audienceDesc}>{a.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ── Testimonial ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <LinearGradient colors={["rgba(180,83,9,0.12)", "rgba(21,128,61,0.08)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.quoteCard}>
                <Text style={s.quoteMarkText}>"</Text>
                <Text style={[s.quoteText, isDesktop && { fontSize: 17 }]}>
                  Avec BeanPath, nos agents de terrain saisissent les livraisons même sans connexion. Les registres se synchronisent automatiquement dès qu'ils rentrent au bureau.
                </Text>
                <View style={s.quoteAuthor}>
                  <View style={s.quoteAvatar}><Text style={s.quoteAvatarText}>BK</Text></View>
                  <View>
                    <Text style={s.quoteAuthorName}>Bishops KAJEREGE</Text>
                    <Text style={s.quoteAuthorRole}>Administrateur — NAKEZA SARL · DRC</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* ── Download / QR ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <DownloadSection isDesktop={isDesktop} />
            </View>
          </View>

          {/* ── Waitlist ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <WaitlistSection isDesktop={isDesktop} />
            </View>
          </View>

          {/* ── Final CTA banner ── */}
          <View style={{ paddingHorizontal: PX, marginBottom: 64 }}>
            <View style={CONTAINER}>
              <LinearGradient colors={["rgba(180,83,9,0.20)", "rgba(180,83,9,0.08)"]} style={[s.ctaBanner, isDesktop && { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 32 }]}>
                <View style={[isDesktop && { flex: 1 }]}>
                  <View style={s.ctaBannerIconRing}>
                    <Ionicons name="leaf" size={24} color="#b45309" />
                  </View>
                  <Text style={[s.ctaBannerTitle, isDesktop && { fontSize: 28, textAlign: "left" }]}>
                    Prêt à tracer votre filière ?
                  </Text>
                  <Text style={[s.ctaBannerSub, isDesktop && { textAlign: "left" }]}>
                    Rejoignez les coopératives du Kivu et d'Afrique centrale qui font confiance à BeanPath.
                  </Text>
                </View>
                <View style={[isDesktop && { flexShrink: 0 }, !isDesktop && { alignItems: "center" }]}>
                  <Pressable
                    onPress={() => router.push("/(auth)/personas" as any)}
                    style={({ pressed }) => [s.ctaBannerBtn, isDesktop && { paddingHorizontal: 32 }, pressed && { opacity: 0.88 }]}
                  >
                    <Text style={s.ctaBannerBtnText}>Choisir mon profil</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={{ paddingHorizontal: PX, paddingBottom: 48 }}>
            <View style={[CONTAINER, s.footer]}>
              <View style={s.footerLogoRow}>
                <Ionicons name="leaf" size={14} color="rgba(255,255,255,0.25)" />
                <Text style={s.footerWordmark}>BeanPath</Text>
              </View>
              <Text style={s.footerTagline}>
                Hors-ligne d'abord · Cryptographiquement vérifié · EUDR conforme
              </Text>
              <Text style={s.footerMeta}>v3.0 · DRC Coffee & Cocoa Supply Chain · © 2025</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Phone mockup styles ──────────────────────────────────────────────────────

const ph = StyleSheet.create({
  wrapper:   { alignItems: "center", gap: 20 },
  frame: {
    width: 240, borderRadius: 36,
    backgroundColor: "#1a1a1a",
    borderWidth: 2, borderColor: "#333",
    shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.6, shadowRadius: 40,
    overflow: "hidden",
  },
  notch: { width: 80, height: 20, backgroundColor: "#1a1a1a", borderRadius: 10, alignSelf: "center", marginTop: 8, zIndex: 10 },
  screen: { height: MOCK_H, overflow: "hidden", backgroundColor: "#fafaf9" },
  slider: { width: "100%" },
  homeBar: { width: 60, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginVertical: 10 },
  labels: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  label: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)" },
  labelDot: { width: 6, height: 6, borderRadius: 3 },
  labelText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.35)" },
});

// ─── Mock screen styles ───────────────────────────────────────────────────────

const mk = StyleSheet.create({
  screen:      { width: "100%", height: MOCK_H, backgroundColor: "#fafaf9" },
  header:      { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 12 },
  headerGreet: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  headerRole:  { fontSize: 9, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginBottom: 10 },
  statsRow:    { flexDirection: "row", gap: 6 },
  statCard:    { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 8, padding: 6, alignItems: "center" },
  statVal:     { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  statLbl:     { fontSize: 7, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  body:        { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  sectionLbl:  { fontSize: 8, fontFamily: "Inter_600SemiBold", color: "#78716c", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  actionRow:   { flexDirection: "row", gap: 6, marginBottom: 4 },
  actionBtn:   { flex: 1, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, padding: 8 },
  actionLbl:   { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  delivCard:   { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 5, borderWidth: 1, borderColor: "#e7e5e4" },
  delivDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: "#15803d", flexShrink: 0 },
  delivName:   { fontSize: 8, fontFamily: "Inter_600SemiBold", color: "#1c1917" },
  delivDetail: { fontSize: 7, color: "#78716c", fontFamily: "Inter_400Regular" },
  delivTime:   { fontSize: 7, color: "#a8a29e", fontFamily: "Inter_400Regular" },
  field:       { backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 6, borderWidth: 1, borderColor: "#e7e5e4" },
  fieldLabel:  { fontSize: 7, fontFamily: "Inter_500Medium", color: "#78716c", marginBottom: 3 },
  fieldRow:    { flexDirection: "row", alignItems: "center", gap: 4 },
  fieldValue:  { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#1c1917" },
  submitBtn:   { backgroundColor: "#15803d", borderRadius: 10, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 },
  submitLbl:   { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },
  receiptHint: { fontSize: 7, color: "#78716c", textAlign: "center", marginTop: 6 },
  searchBar:   { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f5f5f4", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, marginBottom: 8, borderWidth: 1, borderColor: "#e7e5e4" },
  searchText:  { fontSize: 9, color: "#a8a29e", fontFamily: "Inter_400Regular" },
  farmerRow:   { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 5, borderWidth: 1, borderColor: "#e7e5e4" },
  farmerAvatar:{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
  farmerInitial:{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#b45309" },
  farmerName:  { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "#1c1917" },
  farmerCode:  { fontSize: 7, color: "#78716c", fontFamily: "Inter_400Regular" },
  farmerKg:    { fontSize: 8, fontFamily: "Inter_500Medium", color: "#15803d" },
});

// ─── Download styles ──────────────────────────────────────────────────────────

const dl = StyleSheet.create({
  section:       {},
  sectionDesktop:{},
  eyebrow:       { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#b45309", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 },
  title:         { fontSize: 28, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.8, lineHeight: 36, marginBottom: 14 },
  sub:           { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.50)", lineHeight: 22, marginBottom: 28 },
  cards:         { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  cardsDesktop:  { flexWrap: "nowrap" },
  card:          { flex: 1, minWidth: 160, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", padding: 18, alignItems: "center", gap: 14 },
  cardTop:       { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start" },
  deviceLabel:   { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  storeLabel:    { fontSize: 10, color: "rgba(255,255,255,0.40)", fontFamily: "Inter_400Regular" },
  qrWrap:        { backgroundColor: "#0d1a0a", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  storeBtn:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  storeBtnText:  { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  expoHint:      { fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center", fontFamily: "Inter_400Regular", paddingHorizontal: 4 },
});

// ─── Waitlist styles ──────────────────────────────────────────────────────────

const wl = StyleSheet.create({
  section:        { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 28 },
  sectionDesktop: { padding: 48 },
  eyebrow:        { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#b45309", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 },
  title:          { fontSize: 28, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.8, lineHeight: 36, marginBottom: 12 },
  sub:            { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.50)", lineHeight: 22, marginBottom: 28 },
  form:           { gap: 12 },
  formDesktop:    { maxWidth: 520 },
  inputWrap:      { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 14, height: 52 },
  inputIcon:      { marginRight: 8 },
  input:          { flex: 1, color: "#fff", fontSize: 15, fontFamily: "Inter_400Regular" },
  roleRow:        { flexDirection: "row", gap: 10 },
  roleBtn:        { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", paddingHorizontal: 12, paddingVertical: 12 },
  roleBtnActive:  { backgroundColor: "rgba(180,83,9,0.12)", borderColor: "rgba(180,83,9,0.40)" },
  roleLbl:        { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.45)", flex: 1 },
  roleLblActive:  { color: "#f5c842" },
  error:          { fontSize: 12, color: "#f87171", fontFamily: "Inter_400Regular", marginTop: -4 },
  submitBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#b45309", borderRadius: 14, paddingVertical: 16, shadowColor: "#b45309", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  submitText:     { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  privacy:        { fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", fontFamily: "Inter_400Regular" },
  success:        { alignItems: "center", gap: 12, paddingVertical: 16 },
  successIcon:    { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(21,128,61,0.15)", borderWidth: 1, borderColor: "rgba(21,128,61,0.35)", alignItems: "center", justifyContent: "center" },
  successTitle:   { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  successSub:     { fontSize: 14, color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 22, fontFamily: "Inter_400Regular" },
});

// ─── Main page styles ─────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  // Nav
  nav: { paddingTop: 14, paddingBottom: 12 },
  logoMark: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoMarkText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.3 },
  betaBadge: { backgroundColor: "rgba(180,83,9,0.25)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(180,83,9,0.35)" },
  betaText: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#b45309", letterSpacing: 0.5 },
  navRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  langRow: { flexDirection: "row", gap: 2, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10, padding: 2 },
  langBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  langBtnActive: { backgroundColor: "rgba(255,255,255,0.15)" },
  langText: { color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  langTextActive: { color: "#fff" },
  signinBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.13)" },
  signinBtnDesktop: { paddingHorizontal: 20, paddingVertical: 10 },
  signinText: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Logo ring (mobile hero)
  logoRingOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(180,83,9,0.08)", borderWidth: 1, borderColor: "rgba(180,83,9,0.20)", alignItems: "center", justifyContent: "center", marginBottom: 24, shadowColor: "#b45309", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 20 },
  logoRingMiddle: { width: 76, height: 76, borderRadius: 38, backgroundColor: "rgba(180,83,9,0.12)", borderWidth: 1, borderColor: "rgba(180,83,9,0.28)", alignItems: "center", justifyContent: "center" },
  logoRingInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(180,83,9,0.22)", borderWidth: 1.5, borderColor: "rgba(180,83,9,0.50)", alignItems: "center", justifyContent: "center" },

  // Logo ring (desktop, smaller inline)
  logoRingOuterSm: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(180,83,9,0.10)", borderWidth: 1, borderColor: "rgba(180,83,9,0.22)", alignItems: "center", justifyContent: "center", marginBottom: 20, shadowColor: "#b45309", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.20, shadowRadius: 12 },
  logoRingMiddleSm: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(180,83,9,0.14)", borderWidth: 1, borderColor: "rgba(180,83,9,0.30)", alignItems: "center", justifyContent: "center" },
  logoRingInnerSm: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(180,83,9,0.24)", borderWidth: 1.5, borderColor: "rgba(180,83,9,0.50)", alignItems: "center", justifyContent: "center" },

  // Wordmark & taglines
  wordmark: { fontSize: 44, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -1.8, marginBottom: 16 },
  wordmarkDesktop: { fontSize: 56, letterSpacing: -2 },
  tagline: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)", lineHeight: 26, letterSpacing: -0.3, marginBottom: 12 },
  taglineDesktop: { fontSize: 22, lineHeight: 32 },
  subTagline: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", lineHeight: 21, marginBottom: 22 },

  // Trust pills
  trustRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  trustPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  trustText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.45)" },

  // CTA buttons
  ctaGroup: { width: "100%", gap: 12, marginTop: 28 },
  ctaGroupDesktop: { flexDirection: "row", alignItems: "center", gap: 16 },
  ctaPrimary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#b45309", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, shadowColor: "#b45309", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.38, shadowRadius: 18 },
  ctaPrimaryDesktop: { paddingHorizontal: 32, paddingVertical: 18, borderRadius: 16 },
  ctaPrimaryText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.1 },
  ctaSecondary: { alignItems: "center", paddingVertical: 10 },
  ctaSecondaryDesktop: { paddingVertical: 18, paddingHorizontal: 0 },
  ctaSecondaryText: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter_500Medium" },

  // Stats
  statsStrip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingVertical: 22 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.40)", marginTop: 3 },
  statDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.09)" },

  // Sections
  eyebrow: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#b45309", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 },
  sectionTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.8, lineHeight: 36, marginBottom: 14 },
  sectionBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.50)", lineHeight: 22, marginBottom: 28 },

  // Supply chain
  chainWrap: { position: "relative", marginTop: 4 },
  chainLine: { position: "absolute", top: 23, left: "10%", right: "10%", height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  chainRow: { flexDirection: "row", justifyContent: "space-between" },
  chainNode: { alignItems: "center", gap: 8, width: 56 },
  chainIconBg: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  chainLabel: { fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center" },

  // Features
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  featureCard: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16 },
  featureIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, marginBottom: 12 },
  featureTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 6, letterSpacing: -0.2 },
  featureDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", lineHeight: 17 },

  // Certs
  certGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  certCard: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, minWidth: "44%" },
  certIconBg: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  certLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14 },
  infoBoxText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.40)", lineHeight: 18 },

  // Audience
  audienceList: {},
  audienceCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16 },
  audienceIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  audienceTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 3 },
  audienceDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", lineHeight: 17 },

  // Quote
  quoteCard: { borderRadius: 22, borderWidth: 1, borderColor: "rgba(180,83,9,0.20)", padding: 24 },
  quoteMarkText: { fontSize: 52, fontFamily: "Inter_700Bold", color: "rgba(180,83,9,0.40)", lineHeight: 40, marginTop: -8, marginBottom: 8 },
  quoteText: { fontSize: 15, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.75)", lineHeight: 24, marginBottom: 20 },
  quoteAuthor: { flexDirection: "row", alignItems: "center", gap: 12 },
  quoteAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#b4530940", alignItems: "center", justifyContent: "center" },
  quoteAvatarText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#b45309" },
  quoteAuthorName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#ffffff" },
  quoteAuthorRole: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.40)", marginTop: 2 },

  // CTA banner
  ctaBanner: { borderRadius: 24, borderWidth: 1, borderColor: "rgba(180,83,9,0.25)", padding: 28, alignItems: "center" },
  ctaBannerIconRing: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(180,83,9,0.18)", borderWidth: 1.5, borderColor: "rgba(180,83,9,0.40)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  ctaBannerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.6, textAlign: "center", marginBottom: 10 },
  ctaBannerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.50)", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  ctaBannerBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#b45309", borderRadius: 14, paddingVertical: 15, paddingHorizontal: 24, shadowColor: "#b45309", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 14 },
  ctaBannerBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  // Footer
  footer: { alignItems: "center" },
  footerLogoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  footerWordmark: { fontSize: 14, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.20)" },
  footerTagline: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.20)", textAlign: "center", marginBottom: 6, lineHeight: 16 },
  footerMeta: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.14)" },
});
