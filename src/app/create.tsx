import { SafeAreaView } from "react-native-safe-area-context";

import ActivityForm from "../components/ActivityForm/ActivityForm";
import { styles } from "../styles/create.styles";

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityForm />
    </SafeAreaView>
  );
}
