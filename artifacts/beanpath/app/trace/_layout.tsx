import { Stack } from "expo-router";
import { useColors } from "@/hooks/useColors";

export default function TraceLayout() {
  const colors = useColors();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[shortCode]" options={{ headerShown: false }} />
    </Stack>
  );
}
