
import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  api,
  API_URL,
  getApiErrorMessage,
} from "../services/api";

type ConnectionStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export default function ApiConnectionTest() {
  const [status, setStatus] =
    useState<ConnectionStatus>("idle");

  const [message, setMessage] = useState("");

  async function handleTestConnection() {
    if (!API_URL) {
      setStatus("error");
      setMessage(
        "EXPO_PUBLIC_API_URL não configurada no .env.local."
      );
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // Consulta a rota pública inicial do NestJS.
      const response = await api.get<string>("/");

      setStatus("success");

      setMessage(
        `Conexão estabelecida! HTTP ${response.status}. Resposta: ${String(response.data)}`
      );
    } catch (error: unknown) {
      console.error(
        "Erro no teste de conexão:",
        error
      );

      setStatus("error");
      setMessage(getApiErrorMessage(error));
    }
  }

  const loading = status === "loading";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Teste de conexão com a API
      </Text>

      <Text style={styles.description}>
        Verifique se o aplicativo consegue
        acessar o backend NestJS.
      </Text>

      <Text style={styles.url}>
        {API_URL || "URL não configurada"}
      </Text>

      <Pressable
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleTestConnection}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Testar conexão com a API"
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        )}

        <Text style={styles.buttonText}>
          {loading
            ? "Conectando..."
            : "Testar conexão"}
        </Text>
      </Pressable>

      {status === "success" && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            {message}
          </Text>
        </View>
      )}

      {status === "error" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {message}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#667085",
    marginBottom: 8,
  },

  url: {
    fontSize: 12,
    color: "#475467",
    marginBottom: 14,
  },

  button: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  successBox: {
    backgroundColor: "#ECFDF3",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },

  successText: {
    color: "#027A48",
    fontSize: 13,
  },

  errorBox: {
    backgroundColor: "#FEF3F2",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },

  errorText: {
    color: "#B42318",
    fontSize: 13,
  },
});
