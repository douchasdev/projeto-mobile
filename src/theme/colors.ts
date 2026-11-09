
export const themes = {
  light: {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    surfaceAlt: "#F2F4F7",
    text: "#101828",
    textSecondary: "#667085",
    border: "#D0D5DD",
    primary: "#2563EB",
    primarySurface: "#EFF6FF",
    onPrimary: "#FFFFFF",
    placeholder: "#98A2B3",
    danger: "#D92D20",
    dangerSurface: "#FEF3F2",
    success: "#027A48",
    successSurface: "#ECFDF3",
  },

  dark: {
    background: "#0B1220",
    surface: "#1D2939",
    surfaceAlt: "#344054",
    text: "#F9FAFB",
    textSecondary: "#98A2B3",
    border: "#475467",
    primary: "#60A5FA",
    primarySurface: "#172F50",
    onPrimary: "#101828",
    placeholder: "#98A2B3",
    danger: "#FDA29B",
    dangerSurface: "#442027",
    success: "#75E0A7",
    successSurface: "#123E31",
  },
} as const;

export type AppColors =
  | typeof themes.light
  | typeof themes.dark;

export type ThemeMode =
  | "light"
  | "dark"
  | "system";
