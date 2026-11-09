
import { StyleSheet } from "react-native";

import type { AppColors } from "../../theme/colors";

export function createActivityFormStyles(
  colors: AppColors
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.background,
    },

    form: {
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
    },

    title: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 24,
      color: colors.text,
    },

    field: {
      marginBottom: 16,
    },

    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 6,
      color: colors.text,
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      backgroundColor: colors.surface,
      color: colors.text,
    },

    selector: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    selectorPressed: {
      opacity: 0.7,
    },

    selectorText: {
      fontSize: 16,
      color: colors.text,
    },

    placeholderText: {
      fontSize: 16,
      color: colors.placeholder,
    },

    selectorIcon: {
      fontSize: 18,
      color: colors.textSecondary,
    },

    locationButton: {
      minHeight: 44,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primarySurface,
    },

    locationButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },

    locationButtonDisabled: {
      opacity: 0.6,
    },

    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 16,
    },

    cancelButton: {
      height: 48,
      paddingHorizontal: 20,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },

    createButton: {
      height: 48,
      paddingHorizontal: 24,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 8,
    },

    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "500",
    },

    createButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "600",
    },

    buttonPressed: {
      opacity: 0.7,
    },
  });
}
