
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

import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../contexts/ThemeContext";

import {
  registerUser,
} from "../services/auth.service";

import {
  getApiErrorMessage,
} from "../services/api";

import {
  createAuthStyles,
} from "../styles/auth.styles";

export default function RegisterScreen() {
  // Tema atual do aplicativo.
  const { colors } = useTheme();

  // Estilos dinâmicos para claro e escuro.
  const styles = createAuthStyles(colors);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleRegister() {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha todos os campos."
      );
      return;
    }

    // Apenas verifica se as duas senhas coincidem.
    // Não existe tamanho mínimo de senha.
    if (password !== confirmPassword) {
      Alert.alert(
        "Senhas diferentes",
        "A confirmação não corresponde à senha informada."
      );
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      // Envia o cadastro ao NestJS pelo Axios.
      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert(
        "Cadastro concluído",
        "Sua conta foi criada. Agora faça login.",
        [
          {
            text: "Ir para login",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error: unknown) {
      console.error(
        "Erro ao cadastrar usuário:",
        error
      );

      Alert.alert(
        "Não foi possível cadastrar",
        getApiErrorMessage(error)
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
            Criar conta
          </Text>

          <Text style={styles.subtitle}>
            Cadastre-se para criar e gerenciar
            suas atividades.
          </Text>

          {/* Nome */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Nome
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              value={name}
              onChangeText={setName}
              maxLength={120}
              autoCapitalize="words"
              editable={!loading}
              accessibilityLabel="Nome"
            />
          </View>

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
              placeholder="Digite uma senha"
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

          {/* Confirmar senha */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Confirmar senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Repita sua senha"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Confirmar senha"
            />
          </View>

          {/* Botão Cadastrar */}
          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={() => {
              void handleRegister();
            }}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Cadastrar usuário"
          >
            {loading && (
              <ActivityIndicator
                size="small"
                color={colors.onPrimary}
              />
            )}

            <Text style={styles.buttonText}>
              {loading
                ? "Cadastrando..."
                : "Cadastrar"}
            </Text>
          </Pressable>

          {/* Voltar ao Login */}
          <Pressable
            style={styles.link}
            onPress={() => {
              router.replace("/login");
            }}
            disabled={loading}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>
              Já possui uma conta? Entrar
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
