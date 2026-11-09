
import { StyleSheet } from "react-native";

import type { AppColors } from "../theme/colors";

export function createMyActivitiesStyles(
  colors: AppColors
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    listContent: {
      paddingHorizontal: 20,
      paddingTop: 80,
      paddingBottom: 20,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    header: {
      marginBottom: 20,
    },

    title: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.text,
    },

    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },

    emptyContainer: {
      alignItems: "center",
      paddingHorizontal: 32,
      paddingTop: 36,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 6,
      textAlign: "center",
      color: colors.text,
    },

    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },

    activityContainer: {
      marginBottom: 16,
    },

    deleteButton: {
      alignSelf: "flex-end",
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: 8,
    },

    deleteButtonDisabled: {
      opacity: 0.6,
    },

    deleteButtonText: {
      color: colors.danger,
      fontWeight: "600",
    },

    errorBox: {
      marginTop: 16,
      padding: 14,
      backgroundColor: colors.dangerSurface,
      borderRadius: 8,
    },

    errorText: {
      color: colors.danger,
    },

    retryButton: {
      marginTop: 10,
      alignSelf: "flex-start",
      paddingVertical: 6,
    },

    retryText: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
}
