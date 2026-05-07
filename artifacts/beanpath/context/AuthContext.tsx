import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole =
  | "field_agent"
  | "lead_farmer"
  | "station_operator"
  | "transporter"
  | "mill_operator"
  | "qc_grader"
  | "exporter"
  | "buyer"
  | "coop_admin"
  | "certifier";

export type CropFocus = "coffee" | "cocoa" | "both";

export type User = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  orgId: string;
  orgName: string;
  orgCurrency: string;
  cropFocus: CropFocus;
  locale: string;
  country: string;
  isDemo?: boolean;
  loggedInAt?: number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (role: UserRole, credentials: { phone?: string; email?: string }) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "@beanpath:user";

/**
 * Mock org data per role — all DRC-context organisations.
 * In production this comes from the SaaS tenant API.
 */
const MOCK_ORG_BY_ROLE: Record<UserRole, {
  orgName: string;
  orgCurrency: string;
  cropFocus: CropFocus;
  country: string;
}> = {
  field_agent:      { orgName: "TCC — Tounga wa Café Congo",     orgCurrency: "FC",  cropFocus: "coffee", country: "CD" },
  lead_farmer:      { orgName: "TCC — Tounga wa Café Congo",     orgCurrency: "FC",  cropFocus: "coffee", country: "CD" },
  station_operator: { orgName: "Station de lavage KAHISA",       orgCurrency: "FC",  cropFocus: "coffee", country: "CD" },
  transporter:      { orgName: "Transport Kivu SARL",            orgCurrency: "FC",  cropFocus: "both",   country: "CD" },
  mill_operator:    { orgName: "Moulin de Bukavu SARL",          orgCurrency: "FC",  cropFocus: "coffee", country: "CD" },
  qc_grader:        { orgName: "Coffee Quality Institute — DRC", orgCurrency: "USD", cropFocus: "coffee", country: "CD" },
  exporter:         { orgName: "Great Lakes Export DRC",         orgCurrency: "USD", cropFocus: "both",   country: "CD" },
  buyer:            { orgName: "Nordic Roasters AS",             orgCurrency: "EUR", cropFocus: "coffee", country: "NO" },
  coop_admin:       { orgName: "NAKEZA SARL",                    orgCurrency: "FC",  cropFocus: "coffee", country: "CD" },
  certifier:        { orgName: "FLO-CERT GmbH",                  orgCurrency: "EUR", cropFocus: "both",   country: "DE" },
};

/** Sample names per role for demo realism */
const DEMO_NAMES: Record<UserRole, string> = {
  field_agent:      "Bulonza MUDUMBI",
  lead_farmer:      "Shamavu MIRUHO",
  station_operator: "Jean-Baptiste KABILA",
  transporter:      "Serge MUHINDO",
  mill_operator:    "Alexis NGOIE",
  qc_grader:        "Dr. Marie LUKUSA",
  exporter:         "Patrick MWAMBA",
  buyer:            "Lars ERIKSEN",
  coop_admin:       "Bishops KAJEREGE",
  certifier:        "Sophie MÜLLER",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    AsyncStorage.getItem(AUTH_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed: User = JSON.parse(raw);
            if (parsed.isDemo && parsed.loggedInAt && Date.now() - parsed.loggedInAt > TWO_HOURS) {
              AsyncStorage.removeItem(AUTH_KEY);
            } else {
              setUser(parsed);
            }
          } catch {
            AsyncStorage.removeItem(AUTH_KEY);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (role: UserRole, credentials: { phone?: string; email?: string }) => {
    const org = MOCK_ORG_BY_ROLE[role];
    const u: User = {
      id:          "usr_" + Math.random().toString(36).slice(2, 10),
      name:        DEMO_NAMES[role],
      phone:       credentials.phone,
      email:       credentials.email,
      role,
      orgId:       "org_" + org.orgName.replace(/\W+/g, "_").toLowerCase(),
      orgName:     org.orgName,
      orgCurrency: org.orgCurrency,
      cropFocus:   org.cropFocus,
      locale:      "fr",
      country:     org.country,
    };
    setUser(u);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
  }, []);

  const loginAsDemo = useCallback(async (role: UserRole) => {
    const org = MOCK_ORG_BY_ROLE[role];
    const u: User = {
      id:          "demo_" + Math.random().toString(36).slice(2, 10),
      name:        DEMO_NAMES[role],
      role,
      orgId:       "org_" + org.orgName.replace(/\W+/g, "_").toLowerCase(),
      orgName:     org.orgName,
      orgCurrency: org.orgCurrency,
      cropFocus:   org.cropFocus,
      locale:      "fr",
      country:     org.country,
      isDemo:      true,
      loggedInAt:  Date.now(),
    };
    setUser(u);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, loginAsDemo, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
