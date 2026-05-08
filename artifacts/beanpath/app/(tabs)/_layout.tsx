import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "@/hooks/useColors";
import { SyncChip } from "@/components/SyncChip";

function NativeTabLayout() {
  const { t } = useTranslation();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "calendar", selected: "calendar.fill" }} />
        <Label>{t("nav.dashboard")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="farmers">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>{t("nav.farmers")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="collect">
        <Icon sf={{ default: "scalemass", selected: "scalemass.fill" }} />
        <Label>{t("nav.collect")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="lots">
        <Icon sf={{ default: "archivebox", selected: "archivebox.fill" }} />
        <Label>{t("nav.lots")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>{t("nav.profile")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { t } = useTranslation();
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
        headerTintColor: colors.foreground,
        headerRight: () => <SyncChip />,
        headerRightContainerStyle: { paddingRight: 14 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 60,
          paddingBottom: isWeb ? 34 : 6,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ color }) => <Ionicons name="today-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farmers"
        options={{
          title: t("nav.farmers"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collect"
        options={{
          title: t("nav.collect"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="scale-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lots"
        options={{
          title: t("nav.lots"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="layers-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t("nav.profile"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
