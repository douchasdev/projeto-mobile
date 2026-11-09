
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProfileStatCard from "../../components/ProfileStatCard/ProfileStatCard";

import { useActivities } from "../../contexts/ActivitiesContext";
import { useAuth } from "../../contexts/AuthContext";

import { styles } from "../../styles/profile.styles";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const {
    myActivities,
    showCompleted,
    setShowCompleted,
  } = useActivities();

  const pendingCount = myActivities.filter(
    (activity) => !activity.completed
  ).length;

  const completedCount = myActivities.filter(
    (activity) => activity.completed
  ).length;

  function handleLogout() {
    Alert.alert(
      "Sair da conta",
      "Deseja realmente sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            void logout().catch(() => {
              Alert.alert(
                "Erro",
                "Não foi possível encerrar a sessão."
              );
            });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Image
            source={require(
              "../../../assets/images/avatar.png"
            )}
            style={styles.avatar}
          />

          <Text style={styles.name}>
            {user?.name ?? "Usuário"}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#667085",
              marginTop: 6,
            }}
          >
            {user?.email ?? ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Resumo
          </Text>

          <View style={styles.stats}>
            <ProfileStatCard
              value={pendingCount}
              label="Pendentes"
            />

            <ProfileStatCard
              value={completedCount}
              label="Concluídas"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Preferências
          </Text>

          <View style={styles.settingCard}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>
                Mostrar atividades concluídas
              </Text>

              <Text style={styles.settingDescription}>
                Exibir atividades concluídas nas listas.
              </Text>
            </View>

            <Switch
              value={showCompleted}
              onValueChange={setShowCompleted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={handleLogout}
            accessibilityRole="button"
            style={{
              minHeight: 48,
              borderWidth: 1,
              borderColor: "#D92D20",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#D92D20",
              }}
            >
              Sair da conta
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
