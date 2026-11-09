
import { useState } from "react";

import { router } from "expo-router";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import axios from "axios";

import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

import { getApiErrorMessage } from "../services/api";

import { createAuthStyles } from "../styles/auth.styles";

export default function LoginScreen() {
  // Autenticação do usuário.
  const { login } = useAuth();

  // Tema escolhido pelo usuário.
  const { colors } = useTheme();

  // Estilos atualizados conforme o tema.
  const styles = createAuthStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Campos obrigatórios",
        "Informe seu e-mail e senha."
      );
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // O Stack.Protected libera automaticamente
      // as abas quando o usuário é autenticado.
    } catch (error: unknown) {
      const invalidCredentials =
        axios.isAxiosError(error) &&
        error.response?.status === 401;

      Alert.alert(
        "Não foi possível entrar",
        invalidCredentials
          ? "E-mail ou senha inválidos."
          : getApiErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Título */}
          <Text style={styles.title}>
            Entrar
          </Text>

          <Text style={styles.subtitle}>
            Entre com sua conta para acessar
            suas atividades.
          </Text>

          {/* E-mail */}
          <View style={styles.field}>
            <Text style={styles.label}>
              E-mail
            </Text>

            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
              accessibilityLabel="E-mail"
            />
          </View>

          {/* Senha */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Senha"
            />
          </View>

          {/* Botão Entrar */}
          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={() => {
              void handleLogin();
            }}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Entrar na conta"
          >
            {loading && (
              <ActivityIndicator
                size="small"
                color={colors.onPrimary}
              />
            )}

            <Text style={styles.buttonText}>
              {loading
                ? "Entrando..."
                : "Entrar"}
            </Text>
          </Pressable>

          {/* Navegação para Cadastro */}
          <Pressable
            style={styles.link}
            onPress={() => {
              router.push("/register");
            }}
            disabled={loading}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>
              Não possui uma conta? Cadastre-se
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
