import { useState } from "react";

import {
  FlatList,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ActivityCard from "../components/ActivityCard/ActivityCard";

import EditActivityModal from "../components/EditActivityModal/EditActivityModal";

import { useActivities } from "../contexts/ActivitiesContext";

import { styles } from "../styles/my-activities.styles";

import { Activity } from "../types/Activity";

export default function MyActivitiesScreen() {
  const {
    myActivities,
    showCompleted,
    toggleActivityCompleted,
  } = useActivities();

  const [
    editingActivity,
    setEditingActivity,
  ] = useState<Activity | null>(null);

  const visibleActivities = showCompleted
    ? myActivities
    : myActivities.filter(
        (activity) => !activity.completed
      );

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
            onEdit={() =>
              setEditingActivity(item)
            }
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          visibleActivities.length === 0 &&
            styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              Minhas atividades
            </Text>

            <Text style={styles.subtitle}>
              Visualize, conclua ou edite as
              atividades que você criou.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Nenhuma atividade encontrada
            </Text>

            <Text style={styles.emptyText}>
              {myActivities.length === 0
                ? "Crie uma atividade na aba Criar para vê-la aqui."
                : "Todas as suas atividades estão ocultas pelo filtro."}
            </Text>
          </View>
        }
      />

      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() =>
            setEditingActivity(null)
          }
        />
      )}
    </SafeAreaView>
  );
}