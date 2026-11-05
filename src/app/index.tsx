import {
  FlatList,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ActivityCard from "../components/ActivityCard/ActivityCard";

import { useActivities } from "../contexts/ActivitiesContext";

import { styles } from "../styles/index.styles";

export default function HomeScreen() {
  const {
    activities,
    showCompleted,
  } = useActivities();

  const visibleActivities = showCompleted
    ? activities
    : activities.filter(
        (activity) => !activity.completed
      );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard activity={item} />
        )}
        contentContainerStyle={[
          styles.listContent,
          visibleActivities.length === 0 &&
            styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              Atividades
            </Text>

            <Text style={styles.subtitle}>
              Atividades de todos os usuários,
              inclusive as suas.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Nenhuma atividade disponível
            </Text>

            <Text style={styles.emptyText}>
              {activities.length === 0
                ? "As atividades cadastradas aparecerão aqui."
                : "Nenhuma atividade corresponde ao filtro atual."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}