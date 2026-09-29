import { FlatList, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ActivityCard from "../components/ActivityCard/ActivityCard";
import { useActivities } from "../contexts/ActivitiesContext";
import { styles } from "../styles/index.styles";

export default function HomeScreen() {
  const { activities, showCompleted, toggleActivityCompleted } =
    useActivities();

  const visibleActivities = showCompleted
    ? activities
    : activities.filter((activity) => !activity.completed);

  const pendingCount = activities.filter(
    (activity) => !activity.completed,
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onToggleCompleted={() => toggleActivityCompleted(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          visibleActivities.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={
          visibleActivities.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.title}>Minhas atividades</Text>

              <Text style={styles.subtitle}>
                {pendingCount === 0
                  ? "Nenhuma atividade pendente"
                  : pendingCount === 1
                    ? "1 atividade pendente"
                    : `${pendingCount} atividades pendentes`}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {activities.length === 0
                ? "Nenhuma atividade"
                : "Nenhuma atividade pendente"}
            </Text>

            <Text style={styles.emptyText}>
              {activities.length === 0
                ? "As atividades que você criar aparecerão aqui."
                : "Todas as suas atividades foram concluídas."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
