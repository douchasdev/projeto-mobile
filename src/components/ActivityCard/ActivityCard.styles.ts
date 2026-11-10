
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

    owner: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
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

    interestsSection: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },

    interestsHeading: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },

    interestedNames: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },

    interestButton: {
      alignSelf: "flex-start",
      backgroundColor: colors.primarySurface,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      minHeight: 40,
      justifyContent: "center",
      marginTop: 6,
    },

    interestButtonActive: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.border,
    },

    interestButtonDisabled: {
      opacity: 0.5,
    },

    interestButtonText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 13,
    },

    interestButtonTextActive: {
      color: colors.text,
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
