
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
import { getApiErrorMessage } from "../services/api";
import { styles } from "../styles/auth.styles";

export default function LoginScreen() {
  const { login } = useAuth();

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

    if (loading) return;

    setLoading(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // O Stack.Protected abrirá automaticamente
      // as abas quando a autenticação for concluída.
    } catch (error) {
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
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Entrar
          </Text>

          <Text style={styles.subtitle}>
            Entre com sua conta para acessar suas atividades.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              E-mail
            </Text>

            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading && (
              <ActivityIndicator color="#FFFFFF" />
            )}

            <Text style={styles.buttonText}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.link}
            onPress={() => router.push("/register")}
            disabled={loading}
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
