
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const AUTH_TOKEN_KEY = "projeto_mobile_access_token";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? ""
)
  .trim()
  .replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL || undefined,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Acrescenta o JWT às requisições autenticadas.
api.interceptors.request.use(async (config) => {
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
  ];

  if (publicRoutes.includes(config.url ?? "")) {
    return config;
  }

  const token = await SecureStore.getItemAsync(
    AUTH_TOKEN_KEY
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError(error)) {
    return "Ocorreu um erro inesperado.";
  }

  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 400:
        return "Os dados enviados são inválidos.";

      case 401:
        return "Autenticação necessária ou sessão expirada.";

      case 403:
        return "Você não tem permissão para esta operação.";

      case 404:
        return "O recurso solicitado não foi encontrado.";

      case 409:
        return "Este registro já existe.";

      case 429:
        return "Muitas requisições. Tente novamente mais tarde.";

      default:
        if (status >= 500) {
          return "O servidor apresentou um erro interno.";
        }

        return `Erro HTTP ${status}.`;
    }
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return "A conexão demorou demais. Verifique a rede e tente novamente.";
  }

  if (error.request) {
    return "Não foi possível acessar a API. Verifique o NestJS, o endereço IP e a conexão de rede.";
  }

  return error.message || "Falha na comunicação com a API.";
}
