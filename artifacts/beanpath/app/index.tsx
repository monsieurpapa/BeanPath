import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ActivityIndicator, View } from "react-native";

const CONSOLE_ROLES = new Set(["buyer", "exporter", "qc_grader", "coop_admin", "certifier", "mill_operator"]);

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const colors = useColors();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (CONSOLE_ROLES.has(user.role)) return <Redirect href="/(console)/" />;
  return <Redirect href="/(tabs)/" />;
}
