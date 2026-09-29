// src/app/index.tsx

import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityCard from '../components/ActivityCard';
import { useActivities } from '../contexts/ActivitiesContext';

export default function HomeScreen() {
  const {
    activities,
    showCompleted,
    toggleActivityCompleted,
  } = useActivities();

  // Define quais atividades devem aparecer na Home.
  // Se showCompleted for false, mostra apenas as pendentes.
  const visibleActivities = showCompleted
    ? activities
    : activities.filter(
        (activity) => !activity.completed
      );

  // Quantidade de atividades pendentes
  const pendingCount = activities.filter(
    (activity) => !activity.completed
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleActivities}
        keyExtractor={(item) => item.id}

        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onToggleCompleted={() =>
              toggleActivityCompleted(item.id)
            }
          />
        )}

        contentContainerStyle={[
          styles.listContent,
          visibleActivities.length === 0 &&
            styles.emptyListContent,
        ]}

        ListHeaderComponent={
          visibleActivities.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.title}>
                Minhas atividades
              </Text>

              <Text style={styles.subtitle}>
                {pendingCount === 0
                  ? 'Nenhuma atividade pendente'
                  : pendingCount === 1
                    ? '1 atividade pendente'
                    : `${pendingCount} atividades pendentes`}
              </Text>
            </View>
          ) : null
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {activities.length === 0
                ? 'Nenhuma atividade'
                : 'Nenhuma atividade pendente'}
            </Text>

            <Text style={styles.emptyText}>
              {activities.length === 0
                ? 'As atividades que você criar aparecerão aqui.'
                : 'Todas as suas atividades foram concluídas.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
  },

  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginTop: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
  },
});