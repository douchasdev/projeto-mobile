
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Appearance,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  themes,
  type AppColors,
  type ThemeMode,
} from "../theme/colors";

const THEME_STORAGE_KEY = "@projeto-mobile:theme";

type ThemeContextData = {
  mode: ThemeMode;
  setMode: (value: ThemeMode) => void;
  isDark: boolean;
  colors: AppColors;
  ready: boolean;
};

const ThemeContext = createContext<
  ThemeContextData | undefined
>(undefined);

function isValidMode(
  value: string | null
): value is ThemeMode {
  return (
    value === "light" ||
    value === "dark" ||
    value === "system"
  );
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemScheme = useColorScheme();

  const [mode, setModeState] =
    useState<ThemeMode>("system");

  const [ready, setReady] = useState(false);

  // Recupera o tema armazenado no AsyncStorage.
  useEffect(() => {
    let active = true;

    async function loadTheme() {
      try {
        const storedMode =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY
          );

        if (active && isValidMode(storedMode)) {
          setModeState(storedMode);
        }
      } catch (error) {
        console.error(
          "Erro ao recuperar tema:",
          error
        );
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    void loadTheme();

    return () => {
      active = false;
    };
  }, []);

  // Aplica o tema também aos componentes nativos.
  useEffect(() => {
    if (!ready) return;

    Appearance.setColorScheme(
      mode === "system" ? "unspecified" : mode
    );
  }, [mode, ready]);

  // Identifica qual paleta deve ser utilizada.
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      systemScheme === "dark");

  const colors = isDark
    ? themes.dark
    : themes.light;

  // Atualiza a aparência e salva a preferência.
  const setMode = useCallback(
    (value: ThemeMode) => {
      if (!ready) return;

      setModeState(value);

      void AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        value
      ).catch((error) => {
        console.error(
          "Erro ao salvar tema:",
          error
        );
      });
    },
    [ready]
  );

  const contextValue = useMemo(
    () => ({
      mode,
      setMode,
      isDark,
      colors,
      ready,
    }),
    [mode, setMode, isDark, colors, ready]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme deve ser utilizado dentro de ThemeProvider."
    );
  }

  return context;
}
