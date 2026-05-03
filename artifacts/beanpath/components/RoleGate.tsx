import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, ROLE_LABELS, type Permission } from "@/lib/rbac";
import { useColors } from "@/hooks/useColors";

type Props = {
  permission: Permission;
  /** What to render when access is denied. Pass null to render nothing. */
  fallback?: React.ReactNode | null;
  children: React.ReactNode;
};

/**
 * Conditionally renders children only when the signed-in user holds the
 * required permission. Uses the RBAC matrix from lib/rbac.ts.
 *
 * Usage:
 *   <RoleGate permission="delivery.create">
 *     <PrimaryButton label="Enregistrer livraison" ... />
 *   </RoleGate>
 *
 *   <RoleGate permission="finance.view" fallback={<AccessDeniedBanner />}>
 *     <FinancialSummary />
 *   </RoleGate>
 */
export function RoleGate({ permission, fallback = null, children }: Props) {
  const { user } = useAuth();
  if (hasPermission(user?.role, permission)) return <>{children}</>;
  return <>{fallback}</>;
}

/** Standard "access denied" banner — use as fallback for visible sections */
export function AccessDeniedBanner({ message }: { message?: string }) {
  const colors = useColors();
  const { user } = useAuth();
  return (
    <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.bannerTitle, { color: colors.foreground }]}>
          {message ?? "Accès restreint"}
        </Text>
        <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
          {user?.role ? `Rôle actuel: ${ROLE_LABELS[user.role]}` : "Connexion requise"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  bannerTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bannerSub:   { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
