
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ActivityCard from "../../components/ActivityCard/ActivityCard";
import EditActivityModal from "../../components/EditActivityModal/EditActivityModal";

import { useActivities } from "../../contexts/ActivitiesContext";
import { getApiErrorMessage } from "../../services/api";
import { styles } from "../../styles/my-activities.styles";

import type { Activity } from "../../types/Activity";

export default function MyActivitiesScreen() {
  const {
    myActivities,
    showCompleted,
    loading,
    refreshing,
    error,
    refreshActivities,
    toggleActivityCompleted,
    deleteActivity,
  } = useActivities();

  const [editingActivity, setEditingActivity] =
    useState<Activity | null>(null);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const processingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void refreshActivities().catch(() => {});
    }, [refreshActivities])
  );

  const visibleActivities = showCompleted
    ? myActivities
    : myActivities.filter(
        (activity) => !activity.completed
      );

  function handleRefresh() {
    void refreshActivities().catch(() => {});
  }

  async function handleToggle(id: string) {
    if (processingRef.current) return;

    processingRef.current = true;
    setProcessingId(id);

    try {
      await toggleActivityCompleted(id);
    } catch (error: unknown) {
      Alert.alert(
        "Erro ao alterar status",
        getApiErrorMessage(error)
      );
    } finally {
      processingRef.current = false;
      setProcessingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (processingRef.current) return;

    processingRef.current = true;
    setProcessingId(id);

    try {
      await deleteActivity(id);

      setEditingActivity(null);

      Alert.alert(
        "Sucesso",
        "Atividade excluída com sucesso."
      );
    } catch (error: unknown) {
      Alert.alert(
        "Erro ao excluir",
        getApiErrorMessage(error)
      );
    } finally {
      processingRef.current = false;
      setProcessingId(null);
    }
  }

  function confirmDelete(activity: Activity) {
    if (processingRef.current) return;

    Alert.alert(
      "Excluir atividade",
      `Deseja excluir "${activity.title}"? Esta ação não poderá ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            void handleDelete(activity.id);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleActivities}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <ActivityCard
              activity={item}
              onToggleCompleted={() => {
                void handleToggle(item.id);
              }}
              onEdit={() => {
                if (!processingRef.current) {
                  setEditingActivity(item);
                }
              }}
            />

            <Pressable
              onPress={() => confirmDelete(item)}
              disabled={processingId !== null}
              accessibilityRole="button"
              accessibilityLabel={`Excluir ${item.title}`}
              style={{
                alignSelf: "flex-end",
                marginTop: 8,
                paddingVertical: 10,
                paddingHorizontal: 14,
                backgroundColor: "#FFFFFF",
                borderColor: "#D92D20",
                borderWidth: 1,
                borderRadius: 8,
                opacity:
                  processingId !== null ? 0.6 : 1,
              }}
            >
              {processingId === item.id ? (
                <ActivityIndicator
                  size="small"
                  color="#D92D20"
                />
              ) : (
                <Text
                  style={{
                    color: "#D92D20",
                    fontWeight: "600",
                  }}
                >
                  Excluir atividade
                </Text>
              )}
            </Pressable>
          </View>
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
              Visualize, conclua, edite ou exclua
              as atividades que você criou.
            </Text>

            {error && (
              <View
                style={{
                  marginTop: 16,
                  padding: 14,
                  backgroundColor: "#FEF3F2",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#B42318" }}>
                  {error}
                </Text>

                <Pressable
                  onPress={handleRefresh}
                  style={{ marginTop: 10 }}
                >
                  <Text
                    style={{
                      color: "#2563EB",
                      fontWeight: "600",
                    }}
                  >
                    Tentar novamente
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {error && myActivities.length === 0
                  ? "Erro ao carregar atividades"
                  : "Nenhuma atividade encontrada"}
              </Text>

              <Text style={styles.emptyText}>
                {error && myActivities.length === 0
                  ? "Verifique sua conexão e tente novamente."
                  : myActivities.length === 0
                    ? "Crie uma atividade na aba Criar para vê-la aqui."
                    : "Todas as suas atividades estão ocultas pelo filtro."}
              </Text>
            </View>
          )
        }
      />

      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => {
            setEditingActivity(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
