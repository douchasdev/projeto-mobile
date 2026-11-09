
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

import { registerUser } from "../services/auth.service";
import { getApiErrorMessage } from "../services/api";
import { styles } from "../styles/auth.styles";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

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

    if (password !== confirmPassword) {
      Alert.alert(
        "Senhas diferentes",
        "A confirmação não corresponde à senha informada."
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
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
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
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
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Criar conta
          </Text>

          <Text style={styles.subtitle}>
            Cadastre-se para criar e gerenciar atividades.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Nome
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              maxLength={120}
              editable={!loading}
            />
          </View>

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
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite uma senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Confirmar senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading && (
              <ActivityIndicator color="#FFFFFF" />
            )}

            <Text style={styles.buttonText}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.link}
            onPress={() => router.replace("/login")}
            disabled={loading}
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
