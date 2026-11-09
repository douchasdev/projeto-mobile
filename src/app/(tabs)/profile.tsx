
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

import { useActivities } from "../../contexts/ActivitiesContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

import type { ThemeMode } from "../../theme/colors";

const themeOptions: {
  value: ThemeMode;
  label: string;
  description: string;
}[] = [
  {
    value: "light",
    label: "Claro",
    description: "Usar sempre a aparência clara",
  },
  {
    value: "dark",
    label: "Escuro",
    description: "Usar sempre a aparência escura",
  },
  {
    value: "system",
    label: "Automático",
    description: "Seguir a aparência do celular",
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const {
    myActivities,
    showCompleted,
    preferencesReady,
    setShowCompleted,
  } = useActivities();

  const {
    colors,
    mode,
    setMode,
    ready,
  } = useTheme();

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
            void logout().catch((error) => {
              console.error(
                "Erro ao encerrar sessão:",
                error
              );

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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 48,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Dados do usuário */}
        <View
          style={{
            alignItems: "center",
            gap: 8,
          }}
        >
          <Image
            source={require(
              "../../../assets/images/avatar.png"
            )}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
            }}
          />

          <Text
            style={{
              fontSize: 23,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {user?.name ?? "Usuário"}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {user?.email ?? ""}
          </Text>
        </View>

        {/* Estatísticas */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Resumo
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            {[
              {
                label: "Pendentes",
                value: pendingCount,
              },
              {
                label: "Concluídas",
                value: completedCount,
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  alignItems: "center",
                  padding: 18,
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 27,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {stat.value}
                </Text>

                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Preferências já existentes */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Preferências
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                Mostrar atividades concluídas
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                }}
              >
                Exibir atividades concluídas nas listas.
              </Text>
            </View>

            <Switch
              value={showCompleted}
              onValueChange={setShowCompleted}
              disabled={!preferencesReady}
              trackColor={{
                true: colors.primary,
                false: colors.border,
              }}
              accessibilityLabel="Mostrar atividades concluídas"
            />
          </View>
        </View>

        {/* Seleção do tema */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Aparência
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor: colors.surface,
              overflow: "hidden",
            }}
          >
            {themeOptions.map((option, index) => {
              const selected =
                mode === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() =>
                    setMode(option.value)
                  }
                  disabled={!ready}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selected,
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    gap: 12,
                    borderBottomWidth:
                      index === themeOptions.length - 1
                        ? 0
                        : 1,
                    borderBottomColor: colors.border,
                    backgroundColor: pressed
                      ? colors.surfaceAlt
                      : colors.surface,
                  })}
                >
                  <View
                    style={{
                      flex: 1,
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontWeight: selected
                          ? "700"
                          : "500",
                        fontSize: 15,
                      }}
                    >
                      {option.label}
                    </Text>

                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 13,
                      }}
                    >
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 22,
                      width: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: selected
                        ? colors.primary
                        : colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected && (
                      <View
                        style={{
                          height: 10,
                          width: 10,
                          borderRadius: 5,
                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          style={({ pressed }) => ({
            minHeight: 48,
            borderWidth: 1,
            borderColor: colors.danger,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: colors.danger,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Sair da conta
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
