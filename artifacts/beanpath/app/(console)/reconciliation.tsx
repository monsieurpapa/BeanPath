import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { useSync } from "@/context/SyncContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";

type ConflictItem = {
  id: string;
  kind: string;
  aggregate: string;
  mine: Record<string, string>;
  theirs: Record<string, string>;
  createdAt: string;
  resolved: boolean;
};

const SEED_CONFLICTS: ConflictItem[] = [
  {
    id: "c1",
    kind: "weight.double_record",
    aggregate: "LOT-2024-0041",
    mine: { weight_kg: "840.0", recorded_by: "Amara Kone", recorded_at: "2024-11-12 08:14" },
    theirs: { weight_kg: "837.5", recorded_by: "Station Clerk", recorded_at: "2024-11-12 08:22" },
    createdAt: "2024-11-12",
    resolved: false,
  },
  {
    id: "c2",
    kind: "payment.idempotency_check",
    aggregate: "LOT-2024-0039 / Fatima Nzeyimana",
    mine: { amount: "UGX 70,300", method: "mobile_money", idempotency_key: "abc123" },
    theirs: { amount: "UGX 70,300", method: "cash", idempotency_key: "abc123" },
    createdAt: "2024-11-11",
    resolved: false,
  },
];

const KEEP_LABELS: Record<"mine" | "theirs" | "merge", string> = {
  mine:   "Garder le mien",
  theirs: "Garder le leur",
  merge:  "Fusionner",
};

export default function ReconciliationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { resolveConflict } = useSync();
  const { showSuccess } = useToast();
  const [conflicts, setConflicts] = useState<ConflictItem[]>(SEED_CONFLICTS);
  const [expanded, setExpanded] = useState<string | null>(null);

  const resolve = (id: string, keep: "mine" | "theirs" | "merge") => {
    const conflict = conflicts.find((c) => c.id === id);
    setConflicts((prev) => prev.map((c) => c.id === id ? { ...c, resolved: true } : c));
    setExpanded(null);
    resolveConflict();
    showSuccess(
      "Conflit résolu",
      `${conflict?.aggregate ?? ""} — ${KEEP_LABELS[keep].toLowerCase()}`
    );
  };

  const active = conflicts.filter((c) => !c.resolved);
  const done = conflicts.filter((c) => c.resolved);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }, Platform.OS === "web" && { paddingTop: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: active.length > 0 ? colors.dangerLight : colors.greenLight, borderColor: active.length > 0 ? colors.danger + "30" : colors.accent + "30" }]}>
        <Ionicons name={active.length > 0 ? "warning-outline" : "checkmark-circle-outline"} size={20} color={active.length > 0 ? colors.danger : colors.accent} />
        <Text style={[styles.summaryText, { color: active.length > 0 ? colors.danger : colors.accent }]}>
          {active.length > 0
            ? `${active.length} conflit${active.length > 1 ? "s" : ""} nécessite${active.length > 1 ? "nt" : ""} votre attention`
            : "Tous les conflits sont résolus"}
        </Text>
      </View>

      {active.length === 0 && (
        <EmptyState
          icon="checkmark-circle-outline"
          title="Aucun conflit en attente"
          subtitle="Tous les conflits de synchronisation ont été résolus."
        />
      )}

      {/* Active conflicts */}
      {active.map((c) => (
        <View key={c.id} style={[styles.conflictCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setExpanded(expanded === c.id ? null : c.id)} style={styles.conflictHeader}>
            <View style={[styles.kindBadge, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="git-compare-outline" size={12} color={colors.danger} />
              <Text style={[styles.kindText, { color: colors.danger }]}>{c.kind.replace(/_/g, " ")}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.aggregate, { color: colors.foreground }]}>{c.aggregate}</Text>
              <Text style={[styles.conflictDate, { color: colors.mutedForeground }]}>{c.createdAt}</Text>
            </View>
            <Ionicons name={expanded === c.id ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          {expanded === c.id && (
            <View style={styles.expandedContent}>
              {/* Side by side */}
              <View style={styles.sideRow}>
                <View style={[styles.side, { backgroundColor: colors.amberLight, borderColor: colors.primary + "40" }]}>
                  <Text style={[styles.sideTitle, { color: colors.primary }]}>Mine</Text>
                  {Object.entries(c.mine).map(([k, v]) => (
                    <View key={k} style={styles.fieldRow}>
                      <Text style={[styles.fieldKey, { color: colors.mutedForeground }]}>{k}</Text>
                      <Text style={[styles.fieldVal, { color: colors.foreground }]}>{v}</Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.side, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.sideTitle, { color: colors.mutedForeground }]}>Theirs</Text>
                  {Object.entries(c.theirs).map(([k, v]) => (
                    <View key={k} style={styles.fieldRow}>
                      <Text style={[styles.fieldKey, { color: colors.mutedForeground }]}>{k}</Text>
                      <Text style={[styles.fieldVal, { color: colors.foreground }]}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Resolution buttons */}
              <View style={styles.resolutionRow}>
                <Pressable onPress={() => resolve(c.id, "mine")} style={({ pressed }) => [styles.resolveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
                  <Text style={styles.resolveBtnText}>Garder le mien</Text>
                </Pressable>
                <Pressable onPress={() => resolve(c.id, "theirs")} style={({ pressed }) => [styles.resolveBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, opacity: pressed ? 0.8 : 1 }]}>
                  <Text style={[styles.resolveBtnText, { color: colors.foreground }]}>Garder le leur</Text>
                </Pressable>
                <Pressable onPress={() => resolve(c.id, "merge")} style={({ pressed }) => [styles.resolveBtn, { backgroundColor: colors.greenLight, opacity: pressed ? 0.8 : 1 }]}>
                  <Text style={[styles.resolveBtnText, { color: colors.accent }]}>Fusionner</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ))}

      {/* Resolved */}
      {done.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Résolus</Text>
          {done.map((c) => (
            <View key={c.id} style={[styles.doneCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.aggregate, { color: colors.mutedForeground }]}>{c.aggregate}</Text>
                <Text style={[styles.conflictDate, { color: colors.mutedForeground }]}>{c.kind.replace(/_/g, " ")}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  summary: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  summaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  conflictCard: { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  conflictHeader: { flexDirection: "row", alignItems: "center", padding: 14 },
  kindBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  kindText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.3 },
  aggregate: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  conflictDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  expandedContent: { paddingHorizontal: 14, paddingBottom: 14 },
  sideRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  side: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, gap: 6 },
  sideTitle: { fontSize: 11, fontFamily: "Inter_700Bold", textTransform: "uppercase", marginBottom: 2 },
  fieldRow: { gap: 1 },
  fieldKey: { fontSize: 10, fontFamily: "Inter_400Regular", textTransform: "uppercase" },
  fieldVal: { fontSize: 12, fontFamily: "Inter_500Medium" },
  resolutionRow: { flexDirection: "row", gap: 8 },
  resolveBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  resolveBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
  doneCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});
