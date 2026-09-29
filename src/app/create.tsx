// src/app/create.tsx

import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityForm from "../components/ActivityForm";

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
