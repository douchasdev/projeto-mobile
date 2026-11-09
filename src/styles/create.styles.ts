
import { StyleSheet } from "react-native";

import type { AppColors } from "../theme/colors";

export function createCreateStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
}
