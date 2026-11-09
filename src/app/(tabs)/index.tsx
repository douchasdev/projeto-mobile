
import { useCallback } from "react";

import { useFocusEffect } from "expo-router";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ActivityCard from "../../components/ActivityCard/ActivityCard";

import { useActivities } from "../../contexts/ActivitiesContext";
import { useTheme } from "../../contexts/ThemeContext";

import { createHomeStyles } from "../../styles/index.styles";

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  const {
    activities,
    showCompleted,
    loading,
    refreshing,
    error,
    refreshActivities,
  } = useActivities();

  useFocusEffect(
    useCallback(() => {
      void refreshActivities().catch(() => {
        // O contexto registra o erro.
      });
    }, [refreshActivities])
  );

  const visibleActivities = showCompleted
    ? activities
    : activities.filter(
        (activity) => !activity.completed
      );

  function handleRefresh() {
    void refreshActivities().catch(() => {
      // O erro será exibido na tela.
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard activity={item} />
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

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  style={styles.retryButton}
                  onPress={handleRefresh}
                  accessibilityRole="button"
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
