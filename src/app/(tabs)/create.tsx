
import { SafeAreaView } from "react-native-safe-area-context";

import ActivityForm from "../../components/ActivityForm/ActivityForm";

import { useTheme } from "../../contexts/ThemeContext";

import { createCreateStyles } from "../../styles/create.styles";

export default function CreateScreen() {
  const { colors } = useTheme();
  const styles = createCreateStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ActivityForm />
    </SafeAreaView>
  );
}
