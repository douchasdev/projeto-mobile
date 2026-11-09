
import { StyleSheet } from "react-native";

import type { AppColors } from "../theme/colors";

export function createHomeStyles(colors: AppColors) {
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
      justifyContent: "center",
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
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 6,
      color: colors.text,
      textAlign: "center",
    },

    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
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
