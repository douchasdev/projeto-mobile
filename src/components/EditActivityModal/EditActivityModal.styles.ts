
import { StyleSheet } from "react-native";

import type { AppColors } from "../../theme/colors";

export function createEditActivityModalStyles(
  colors: AppColors
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 32,
    },

    title: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.text,
    },

    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 6,
      marginBottom: 28,
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
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },

    selector: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      justifyContent: "center",
    },

    selectorText: {
      fontSize: 16,
      color: colors.text,
    },

    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 12,
    },

    cancelButton: {
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },

    cancelButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    saveButton: {
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 14,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },

    saveButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.onPrimary,
    },

    pressed: {
      opacity: 0.7,
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
  });
}
