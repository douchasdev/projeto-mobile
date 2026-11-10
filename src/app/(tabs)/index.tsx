
import { useCallback } from "react";

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

import { useActivities } from "../../contexts/ActivitiesContext";
import { useTheme } from "../../contexts/ThemeContext";

import { getApiErrorMessage } from "../../services/api";

import { createHomeStyles } from "../../styles/index.styles";

export default function HomeScreen() {
  const { colors } = useTheme();

  const styles = createHomeStyles(colors);

  const {
    currentUserId,
    activities,
    showCompleted,
    loading,
    refreshing,
    error,
    usingOfflineCache,
    cachedAt,
    interestPendingIds,
    toggleActivityInterest,
    refreshActivities,
  } = useActivities();

  // Atualiza as atividades quando a Home
  // recebe o foco.
  useFocusEffect(
    useCallback(() => {
      void refreshActivities().catch(() => {});
    }, [refreshActivities])
  );

  const visibleActivities = showCompleted
    ? activities
    : activities.filter(
        (activity) => !activity.completed
      );

  function handleRefresh() {
    void refreshActivities().catch(() => {});
  }

  async function handleToggleInterest(
    id: string
  ) {
    try {
      await toggleActivityInterest(id);
    } catch (requestError: unknown) {
      Alert.alert(
        "Não foi possível alterar o interesse",
        getApiErrorMessage(requestError)
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            showInterestAction={
              item.ownerId !== currentUserId
            }
            onToggleInterest={() => {
              void handleToggleInterest(item.id);
            }}
            interestLoading={
              interestPendingIds.includes(item.id)
            }
            interestDisabled={usingOfflineCache}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        progressViewOffset={20}
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

            {/* Aviso do SQLite */}
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
                  Dados locais — somente leitura
                </Text>

                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                  }}
                >
                  A API está indisponível para uma
                  ou mais listas. Os dados,
                  incluindo os interessados,
                  foram recuperados do SQLite
                  e podem estar desatualizados.
                </Text>

                {cachedAt && (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
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
                  accessibilityRole="button"
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

            {/* Erro de conexão */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  style={styles.retryButton}
                  onPress={handleRefresh}
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
                {error && activities.length === 0
                  ? "Erro ao carregar atividades"
                  : "Nenhuma atividade disponível"}
              </Text>

              <Text style={styles.emptyText}>
                {error && activities.length === 0
                  ? "Verifique sua conexão e tente novamente."
                  : activities.length === 0
                    ? "As atividades cadastradas aparecerão aqui."
                    : "Nenhuma atividade corresponde ao filtro atual."}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
