import { useAuth } from "@/context/AuthContext";
import { hasPermission, type Permission } from "@/lib/rbac";

/**
 * Returns true if the currently signed-in user holds the given permission.
 *
 * Usage:
 *   const canCreate = usePermission("delivery.create");
 *   if (!canCreate) return <AccessDeniedBanner />;
 */
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  return hasPermission(user?.role, permission);
}
