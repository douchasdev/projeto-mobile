
import { StyleSheet } from "react-native";

import type { AppColors } from "../theme/colors";

export function createAuthStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 32,
    },

    field: {
      marginBottom: 18,
    },

    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 6,
      color: colors.text,
    },

    input: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: colors.text,
    },

    button: {
      minHeight: 50,
      backgroundColor: colors.primary,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },

    buttonDisabled: {
      opacity: 0.6,
    },

    buttonText: {
      color: colors.onPrimary,
      fontWeight: "600",
      fontSize: 16,
    },

    link: {
      marginTop: 24,
      paddingVertical: 10,
      alignItems: "center",
    },

    linkText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
  });
}
