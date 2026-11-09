
import axios from "axios";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import * as SecureStore from "expo-secure-store";

import {
  AUTH_TOKEN_KEY,
  api,
  getApiErrorMessage,
} from "../services/api";

import {
  AuthUser,
  LoginData,
  getAuthenticatedUser,
  loginUser,
} from "../services/auth.service";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthContextData = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;

  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  retrySession: () => Promise<void>;
};

const AuthContext = createContext<
  AuthContextData | undefined
>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(
    null
  );

  const [status, setStatus] = useState<AuthStatus>(
    "loading"
  );

  const [error, setError] = useState<string | null>(
    null
  );

  // Recupera e valida a sessão ao abrir o aplicativo.
  const retrySession = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const token = await SecureStore.getItemAsync(
        AUTH_TOKEN_KEY
      );

      if (!token) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      const authenticatedUser =
        await getAuthenticatedUser();

      setUser(authenticatedUser);
      setStatus("authenticated");
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        try {
          await SecureStore.deleteItemAsync(
            AUTH_TOKEN_KEY
          );
        } catch (storageError) {
          console.warn(
            "Falha ao remover token inválido:",
            storageError
          );
        }

        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      // Em erros de rede, preserva o token
      // e permite ao usuário tentar novamente.
      setError(getApiErrorMessage(err));
      setStatus("error");
    }
  }, []);

  // Trata tokens rejeitados nas rotas protegidas.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (err: unknown) => {
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 401
        ) {
          const url = err.config?.url ?? "";

          const publicRoutes = [
            "/auth/login",
            "/auth/register",
          ];

          if (!publicRoutes.includes(url)) {
            try {
              await SecureStore.deleteItemAsync(
                AUTH_TOKEN_KEY
              );
            } catch (storageError) {
              console.warn(
                "Falha ao remover token:",
                storageError
              );
            }

            setUser(null);
            setStatus("unauthenticated");
          }
        }

        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    void retrySession();
  }, [retrySession]);

  async function login(data: LoginData) {
    const response = await loginUser(data);

    // Salva o JWT antes de liberar as telas.
    await SecureStore.setItemAsync(
      AUTH_TOKEN_KEY,
      response.accessToken
    );

    setUser(response.user);
    setError(null);
    setStatus("authenticated");
  }

  async function logout() {
    await SecureStore.deleteItemAsync(
      AUTH_TOKEN_KEY
    );

    setUser(null);
    setError(null);
    setStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        login,
        logout,
        retrySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider."
    );
  }

  return context;
}
