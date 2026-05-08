import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "@/hooks/useColors";
import { SyncChip } from "@/components/SyncChip";

export default function ConsoleLayout() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
        headerTintColor: colors.foreground,
        headerRight: () => <SyncChip />,
        headerRightContainerStyle: { paddingRight: 14 },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("nav.console") }} />
      <Stack.Screen name="lots/index" options={{ title: t("nav.lotExplorer") }} />
      <Stack.Screen name="lots/[id]" options={{ title: t("nav.lotDossier") }} />
      <Stack.Screen name="registers" options={{ title: t("nav.registers") }} />
      <Stack.Screen name="reports" options={{ title: t("nav.reports") }} />
      <Stack.Screen name="reconciliation" options={{ title: t("nav.reconciliation") }} />
    </Stack>
  );
}
