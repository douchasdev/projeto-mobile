
import { StyleSheet } from "react-native";

import type { AppColors } from "../../theme/colors";

export function createActivityCardStyles(
  colors: AppColors
) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "flex-start",
    },

    completedCard: {
      borderColor: colors.border,
    },

    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      borderRadius: 6,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      marginTop: 2,
    },

    checkboxCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    check: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "700",
    },

    content: {
      flex: 1,
    },

    title: {
      fontSize: 17,
      fontWeight: "600",
      marginBottom: 6,
      color: colors.text,
    },

    completedText: {
      textDecorationLine: "line-through",
      color: colors.textSecondary,
    },

    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },

    info: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    location: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },

    status: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 8,
    },

    editButton: {
      alignSelf: "flex-start",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primarySurface,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginTop: 12,
    },

    editButtonText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },

    pressed: {
      opacity: 0.7,
    },
  });
}
