import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  detail?: string;
};

type ToastContextType = {
  showToast: (type: ToastType, message: string, detail?: string) => void;
  showSuccess: (message: string, detail?: string) => void;
  showError: (message: string, detail?: string) => void;
  showWarning: (message: string, detail?: string) => void;
  showInfo: (message: string, detail?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const CONFIG: Record<ToastType, { bg: string; border: string; icon: string; name: any }> = {
  success: { bg: "#f0fdf4", border: "#16a34a", icon: "#16a34a", name: "checkmark-circle" },
  error:   { bg: "#fef2f2", border: "#dc2626", icon: "#dc2626", name: "close-circle" },
  warning: { bg: "#fffbeb", border: "#d97706", icon: "#d97706", name: "warning" },
  info:    { bg: "#eff6ff", border: "#2563eb", icon: "#2563eb", name: "information-circle" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const cfg = CONFIG[toast.type];
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity,    { toValue: 1, useNativeDriver: true, tension: 90, friction: 10 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 90, friction: 10 }),
    ]).start();
    const timer = setTimeout(onDismiss, 3800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: cfg.bg, borderLeftColor: cfg.border, opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={cfg.name} size={20} color={cfg.icon} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.toastMsg}>{toast.message}</Text>
        {toast.detail ? <Text style={styles.toastDetail}>{toast.detail}</Text> : null}
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={15} color="#78716c" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, detail?: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev.slice(-2), { id, type, message, detail }]);
  }, []);

  const showSuccess = useCallback((msg: string, det?: string) => showToast("success", msg, det), [showToast]);
  const showError   = useCallback((msg: string, det?: string) => showToast("error",   msg, det), [showToast]);
  const showWarning = useCallback((msg: string, det?: string) => showToast("warning", msg, det), [showToast]);
  const showInfo    = useCallback((msg: string, det?: string) => showToast("info",    msg, det), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <View
        style={[styles.container, { top: insets.top + (Platform.OS === "web" ? 8 : 8) }]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
    pointerEvents: "box-none",
  } as any,
  toast: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },
  toastMsg:    { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1c1917", lineHeight: 19 },
  toastDetail: { fontSize: 12, fontFamily: "Inter_400Regular",  color: "#78716c", lineHeight: 17 },
});
