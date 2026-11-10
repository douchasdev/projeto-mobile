
import {
  useCallback,
  useRef,
  useState,
} from "react";

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
import { useTheme } from "../../contexts/ThemeContext";

import { getApiErrorMessage } from "../../services/api";

import { createMyActivitiesStyles } from "../../styles/my-activities.styles";

import type { Activity } from "../../types/Activity";

export default function MyActivitiesScreen() {
  const { colors } = useTheme();

  const styles = createMyActivitiesStyles(colors);

  const {
    myActivities,
    showCompleted,
    loading,
    refreshing,
    error,
    usingOfflineCache,
    cachedAt,
    refreshActivities,
    toggleActivityCompleted,
    deleteActivity,
  } = useActivities();

  const [
    editingActivity,
    setEditingActivity,
  ] = useState<Activity | null>(null);

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
    if (
      processingRef.current ||
      usingOfflineCache
    ) {
      return;
    }

    processingRef.current = true;
    setProcessingId(id);

    try {
      await toggleActivityCompleted(id);
    } catch (requestError: unknown) {
      Alert.alert(
        "Erro ao alterar status",
        getApiErrorMessage(requestError)
      );
    } finally {
      processingRef.current = false;
      setProcessingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (
      processingRef.current ||
      usingOfflineCache
    ) {
      return;
    }

    processingRef.current = true;
    setProcessingId(id);

    try {
      await deleteActivity(id);

      setEditingActivity(null);

      Alert.alert(
        "Sucesso",
        "Atividade excluída com sucesso."
      );
    } catch (requestError: unknown) {
      Alert.alert(
        "Erro ao excluir",
        getApiErrorMessage(requestError)
      );
    } finally {
      processingRef.current = false;
      setProcessingId(null);
    }
  }

  function confirmDelete(activity: Activity) {
    if (
      processingRef.current ||
      usingOfflineCache
    ) {
      return;
    }

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
          <View style={styles.activityContainer}>
            <ActivityCard
              activity={item}
              onToggleCompleted={
                usingOfflineCache
                  ? undefined
                  : () => {
                      void handleToggle(item.id);
                    }
              }
              onEdit={
                usingOfflineCache
                  ? undefined
                  : () => {
                      if (!processingRef.current) {
                        setEditingActivity(item);
                      }
                    }
              }
            />

            {!usingOfflineCache && (
              <Pressable
                onPress={() =>
                  confirmDelete(item)
                }
                disabled={processingId !== null}
                accessibilityRole="button"
                accessibilityLabel={`Excluir ${item.title}`}
                style={[
                  styles.deleteButton,
                  processingId !== null &&
                    styles.deleteButtonDisabled,
                ]}
              >
                {processingId === item.id ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.danger}
                  />
                ) : (
                  <Text
                    style={styles.deleteButtonText}
                  >
                    Excluir atividade
                  </Text>
                )}
              </Pressable>
            )}
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

            {usingOfflineCache && (
              <View
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceAlt,
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "700",
                  }}
                >
                  Modo de leitura offline
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                  }}
                >
                  Atividades recuperadas do SQLite.
                  A edição, a conclusão e a
                  exclusão estão indisponíveis
                  enquanto usamos dados locais.
                </Text>

                {cachedAt && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Última sincronização:{" "}
                    {new Date(
                      cachedAt
                    ).toLocaleString("pt-BR")}
                  </Text>
                )}

                <Pressable
                  onPress={handleRefresh}
                  style={{
                    alignSelf: "flex-start",
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "600",
                    }}
                  >
                    Tentar conectar novamente
                  </Text>
                </Pressable>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  onPress={handleRefresh}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>
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
              color={colors.primary}
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
