import { Stack } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { SyncChip } from "@/components/SyncChip";

export default function LotsLayout() {
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
      <Stack.Screen name="index" options={{ title: "My Lots" }} />
    </Stack>
  );
}
