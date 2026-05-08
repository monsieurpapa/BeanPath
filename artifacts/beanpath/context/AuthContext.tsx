import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n";
import { supabase } from "@/lib/supabase";
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
  signIn: (role: UserRole, credentials: { phone?: string; email?: string; password?: string }) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "@beanpath:user";

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

async function fetchOrCreateProfile(
  userId: string,
  role: UserRole,
  email?: string,
): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;

  if (data) {
    return {
      id: userId,
      name: data.name ?? DEMO_NAMES[data.role as UserRole] ?? "Utilisateur",
      email,
      phone: data.phone,
      role: (data.role as UserRole) ?? role,
      orgId: data.org_id ?? "org_unknown",
      orgName: data.org_name ?? MOCK_ORG_BY_ROLE[role].orgName,
      orgCurrency: data.org_currency ?? MOCK_ORG_BY_ROLE[role].orgCurrency,
      cropFocus: (data.crop_focus as CropFocus) ?? MOCK_ORG_BY_ROLE[role].cropFocus,
      locale: data.locale ?? "fr",
      country: data.country ?? "CD",
    };
  }

  // First login — create a profile with the selected role
  const org = MOCK_ORG_BY_ROLE[role];
  const newProfile = {
    id: userId,
    name: DEMO_NAMES[role],
    role,
    org_id: "org_" + org.orgName.replace(/\W+/g, "_").toLowerCase(),
    org_name: org.orgName,
    org_currency: org.orgCurrency,
    crop_focus: org.cropFocus,
    locale: "fr",
    country: org.country,
  };

  await supabase.from("profiles").upsert(newProfile);

  return {
    id: userId,
    name: newProfile.name,
    email,
    role,
    orgId: newProfile.org_id,
    orgName: newProfile.org_name,
    orgCurrency: newProfile.org_currency,
    cropFocus: newProfile.crop_focus as CropFocus,
    locale: newProfile.locale,
    country: newProfile.country,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    const loadFromStorage = async () => {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        try {
          const parsed: User = JSON.parse(raw);
          if (parsed.isDemo && parsed.loggedInAt && Date.now() - parsed.loggedInAt > TWO_HOURS) {
            await AsyncStorage.removeItem(AUTH_KEY);
          } else {
            setUser(parsed);
            if (parsed.locale) i18n.changeLanguage(parsed.locale);
          }
        } catch {
          await AsyncStorage.removeItem(AUTH_KEY);
        }
      }
    };

    // Check Supabase session first, then fall back to AsyncStorage (for demo/phone users)
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchOrCreateProfile(
            session.user.id,
            "field_agent",
            session.user.email ?? undefined,
          );
          if (profile) {
            setUser(profile);
            if (profile.locale) i18n.changeLanguage(profile.locale);
            return;
          }
        }
        await loadFromStorage();
      } catch {
        // Supabase unavailable — load from local storage
        await loadFromStorage();
      } finally {
        setLoading(false);
      }
    })();

    // Keep in sync with Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        AsyncStorage.removeItem(AUTH_KEY);
      } else if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchOrCreateProfile(
          session.user.id,
          "field_agent",
          session.user.email ?? undefined,
        );
        if (profile) {
          setUser(profile);
          if (profile.locale) i18n.changeLanguage(profile.locale);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (role: UserRole, credentials: { phone?: string; email?: string; password?: string }) => {
    if (credentials.email) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password ?? "",
      });
      if (error) throw error;

      const profile = await fetchOrCreateProfile(
        data.user.id,
        role,
        data.user.email ?? undefined,
      );
      if (!profile) throw new Error("Impossible de charger le profil utilisateur");

      setUser(profile);
      if (profile.locale) i18n.changeLanguage(profile.locale);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(profile));
    } else {
      // Phone login — OTP not yet configured; use local session
      const org = MOCK_ORG_BY_ROLE[role];
      const u: User = {
        id:          "usr_" + Math.random().toString(36).slice(2, 10),
        name:        DEMO_NAMES[role],
        phone:       credentials.phone,
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
    }
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
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(next));
      if (updates.locale) i18n.changeLanguage(updates.locale);
      // Sync profile updates to Supabase (best-effort)
      if (!prev.isDemo) {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.locale)      dbUpdates.locale       = updates.locale;
        if (updates.role)        dbUpdates.role         = updates.role;
        if (updates.orgName)     dbUpdates.org_name     = updates.orgName;
        if (updates.orgCurrency) dbUpdates.org_currency = updates.orgCurrency;
        if (updates.cropFocus)   dbUpdates.crop_focus   = updates.cropFocus;
        if (Object.keys(dbUpdates).length > 0) {
          supabase.from("profiles").update(dbUpdates).eq("id", prev.id).then(() => {});
        }
      }
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
