
import { Stack } from "expo-router";

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  AuthProvider,
  useAuth,
} from "../contexts/AuthContext";

function RootNavigation() {
  const {
    status,
    error,
    retrySession,
  } = useAuth();

  if (status === "loading") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text>Verificando sua sessão...</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          gap: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Não foi possível verificar sua sessão
        </Text>

        <Text
          style={{
            color: "#667085",
            textAlign: "center",
          }}
        >
          {error}
        </Text>

        <Pressable
          onPress={() => void retrySession()}
          style={{
            backgroundColor: "#2563EB",
            padding: 14,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF" }}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected
        guard={status === "unauthenticated"}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      <Stack.Protected
        guard={status === "authenticated"}
      >
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
