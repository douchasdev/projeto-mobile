
import {
  Stack,
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "expo-router";

import { StatusBar } from "expo-status-bar";

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

import {
  ThemeProvider,
  useTheme,
} from "../contexts/ThemeContext";

function RootNavigation() {
  const {
    status,
    error,
    retrySession,
  } = useAuth();

  const {
    colors,
    isDark,
    ready,
  } = useTheme();

  const baseTheme = isDark
    ? DarkTheme
    : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  const loading =
    !ready || status === "loading";

  return (
    <NavigationThemeProvider
      value={navigationTheme}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
      />

      {loading ? (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={{ color: colors.text }}>
            Carregando aplicativo...
          </Text>
        </View>
      ) : status === "error" ? (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              textAlign: "center",
            }}
          >
            Não foi possível verificar sua sessão
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            {error}
          </Text>

          <Pressable
            onPress={() => {
              void retrySession();
            }}
            style={{
              backgroundColor: colors.primary,
              padding: 14,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: colors.onPrimary,
                fontWeight: "600",
              }}
            >
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
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
      )}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </ThemeProvider>
  );
}
