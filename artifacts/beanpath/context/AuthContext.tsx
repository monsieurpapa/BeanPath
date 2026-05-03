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
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (role: UserRole, credentials: { phone?: string; email?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "@beanpath:user";

const MOCK_ORG_BY_ROLE: Record<UserRole, { orgName: string; orgCurrency: string; cropFocus: CropFocus; country: string }> = {
  field_agent: { orgName: "Bukomero Coffee Cooperative", orgCurrency: "UGX", cropFocus: "coffee", country: "UG" },
  lead_farmer: { orgName: "Bukomero Coffee Cooperative", orgCurrency: "UGX", cropFocus: "coffee", country: "UG" },
  station_operator: { orgName: "Kigezi Washing Station", orgCurrency: "UGX", cropFocus: "coffee", country: "UG" },
  transporter: { orgName: "Safari Logistics Ltd", orgCurrency: "KES", cropFocus: "both", country: "KE" },
  mill_operator: { orgName: "Kampala Dry Mill", orgCurrency: "UGX", cropFocus: "coffee", country: "UG" },
  qc_grader: { orgName: "EAFCA Quality Labs", orgCurrency: "USD", cropFocus: "coffee", country: "ET" },
  exporter: { orgName: "Great Lakes Exports", orgCurrency: "USD", cropFocus: "both", country: "RW" },
  buyer: { orgName: "Nordic Roasters AS", orgCurrency: "EUR", cropFocus: "coffee", country: "NO" },
  coop_admin: { orgName: "Bukomero Coffee Cooperative", orgCurrency: "UGX", cropFocus: "coffee", country: "UG" },
  certifier: { orgName: "FLO-CERT GmbH", orgCurrency: "EUR", cropFocus: "both", country: "DE" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((raw) => {
      if (raw) setUser(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (role: UserRole, credentials: { phone?: string; email?: string }) => {
    const org = MOCK_ORG_BY_ROLE[role];
    const u: User = {
      id: "usr_" + Math.random().toString(36).slice(2, 10),
      name: credentials.phone ? "Amara Kone" : "Jean-Pierre Habimana",
      phone: credentials.phone,
      email: credentials.email,
      role,
      orgId: "org_" + org.orgName.replace(/\s/g, "_").toLowerCase(),
      orgName: org.orgName,
      orgCurrency: org.orgCurrency,
      cropFocus: org.cropFocus,
      locale: "en",
      country: org.country,
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
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
