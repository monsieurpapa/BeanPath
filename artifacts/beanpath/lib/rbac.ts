/**
 * Role-Based Access Control — BeanPath supply chain permission matrix
 *
 * Every feature in the app is gated by a Permission. Roles hold sets of
 * Permissions. `usePermission(perm)` returns true if the signed-in user
 * holds that permission.
 *
 * Supply-chain personas and their primary responsibilities:
 *  field_agent      — records deliveries at farm gate, registers farmers
 *  lead_farmer      — manages a farmer group, submits collective deliveries
 *  station_operator — cherry reception, lot creation, register management
 *  coop_admin       — full cooperative management, financial reports, EUDR
 *  transporter      — updates lot location, confirms transport legs
 *  mill_operator    — records processing stages (pulping → hulling)
 *  qc_grader        — cup scores, quality certifications, audits
 *  exporter         — export documents, DDV, EUDR due diligence statement
 *  buyer            — read-only dossiers, trace records, origin stories
 *  certifier        — issues/revokes Fair Trade / Organic / RA certifications
 */

import type { UserRole } from "@/context/AuthContext";

export type Permission =
  | "farmer.create"
  | "farmer.edit"
  | "farmer.delete"
  | "farmer.view"
  | "delivery.create"
  | "delivery.edit"
  | "delivery.delete"
  | "delivery.view"
  | "register.view"
  | "register.manage"
  | "report.view"
  | "report.manage"
  | "lot.create"
  | "lot.view"
  | "lot.update_stage"
  | "lot.grade"
  | "lot.certify"
  | "lot.delete"
  | "finance.view"
  | "finance.export"
  | "admin.panel"
  | "admin.members"
  | "export.create"
  | "export.eudr"
  | "trace.view"
  | "conflict.resolve"
  | "audit.view";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  field_agent: [
    "farmer.create", "farmer.view",
    "delivery.create", "delivery.view",
    "lot.view",
    "trace.view",
  ],

  lead_farmer: [
    "farmer.create", "farmer.view",
    "delivery.create", "delivery.view",
    "register.view",
    "lot.view",
    "trace.view",
  ],

  station_operator: [
    "farmer.create", "farmer.edit", "farmer.view",
    "delivery.create", "delivery.edit", "delivery.view",
    "register.view", "register.manage",
    "report.view", "report.manage",
    "lot.create", "lot.view", "lot.update_stage",
    "finance.view",
    "conflict.resolve",
    "trace.view",
    "audit.view",
  ],

  transporter: [
    "lot.view", "lot.update_stage",
    "delivery.view",
    "register.view",
    "report.view",
    "trace.view",
  ],

  mill_operator: [
    "lot.view", "lot.update_stage", "lot.grade",
    "delivery.view",
    "register.view", "report.view",
    "finance.view",
    "trace.view",
    "audit.view",
  ],

  qc_grader: [
    "lot.view", "lot.grade", "lot.certify",
    "farmer.view",
    "delivery.view",
    "register.view", "report.view",
    "finance.view",
    "trace.view",
    "audit.view",
  ],

  exporter: [
    "lot.view", "lot.update_stage",
    "export.create", "export.eudr",
    "delivery.view",
    "register.view", "report.view",
    "finance.view", "finance.export",
    "trace.view",
    "audit.view",
  ],

  buyer: [
    "lot.view",
    "report.view",
    "trace.view",
  ],

  coop_admin: [
    "farmer.create", "farmer.edit", "farmer.delete", "farmer.view",
    "delivery.create", "delivery.edit", "delivery.delete", "delivery.view",
    "register.view", "register.manage",
    "report.view", "report.manage",
    "lot.create", "lot.view", "lot.update_stage", "lot.grade", "lot.certify", "lot.delete",
    "finance.view", "finance.export",
    "admin.panel", "admin.members",
    "export.create", "export.eudr",
    "conflict.resolve",
    "trace.view",
    "audit.view",
  ],

  certifier: [
    "lot.view", "lot.certify",
    "farmer.view",
    "delivery.view",
    "register.view", "report.view",
    "finance.view",
    "trace.view",
    "audit.view",
  ],
};

/** Returns true if the given role holds the given permission */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Returns all permissions held by a role */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Human-readable role labels (French, matching DRC coop terminology)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  field_agent:      "Agent de terrain",
  lead_farmer:      "Agriculteur leader",
  station_operator: "Opérateur de station",
  transporter:      "Transporteur",
  mill_operator:    "Opérateur moulin",
  qc_grader:        "Inspecteur qualité",
  exporter:         "Exportateur",
  buyer:            "Acheteur",
  coop_admin:       "Administrateur",
  certifier:        "Certificateur",
};

/**
 * Which surface each role belongs to:
 * "field"   → tabs (field agent app)
 * "console" → console (station/management)
 * "buyer"   → buyer/trace portal
 */
export const ROLE_SURFACE: Record<UserRole, "field" | "console" | "buyer"> = {
  field_agent:      "field",
  lead_farmer:      "field",
  station_operator: "console",
  transporter:      "console",
  mill_operator:    "console",
  qc_grader:        "console",
  exporter:         "console",
  buyer:            "buyer",
  coop_admin:       "console",
  certifier:        "console",
};
