import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/useColors";
import { SyncChip } from "@/components/SyncChip";

export default function ConsoleLayout() {
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
      <Stack.Screen name="index" options={{ title: "Operator Console" }} />
      <Stack.Screen name="lots/index" options={{ title: "Lot Explorer" }} />
      <Stack.Screen name="lots/[id]" options={{ title: "Lot Dossier" }} />
      <Stack.Screen name="reconciliation" options={{ title: "Reconciliation Inbox" }} />
    </Stack>
  );
}
