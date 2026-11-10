
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { useTheme } from "../../contexts/ThemeContext";

import type { Activity } from "../../types/Activity";

import { createActivityCardStyles } from "./ActivityCard.styles";

type ActivityCardProps = {
  activity: Activity;

  onToggleCompleted?: () => void;
  onEdit?: () => void;

  // Propriedades utilizadas pela Home.
  showInterestAction?: boolean;
  onToggleInterest?: () => void;
  interestLoading?: boolean;
  interestDisabled?: boolean;
};

export default function ActivityCard({
  activity,
  onToggleCompleted,
  onEdit,
  showInterestAction = false,
  onToggleInterest,
  interestLoading = false,
  interestDisabled = false,
}: ActivityCardProps) {
  const { colors } = useTheme();

  const styles = createActivityCardStyles(colors);

  const date = activity.date.toLocaleDateString(
    "pt-BR"
  );

  const time = activity.time.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const names = activity.interestedUsers
    .map((user) => user.name)
    .join(", ");

  const cannotInteract =
    interestDisabled || interestLoading;

  return (
    <View
      style={[
        styles.card,
        activity.completed && styles.completedCard,
      ]}
    >
      {/* Marcar como concluída */}
      {onToggleCompleted && (
        <Pressable
          style={[
            styles.checkbox,
            activity.completed &&
              styles.checkboxCompleted,
          ]}
          onPress={onToggleCompleted}
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: activity.completed,
          }}
          accessibilityLabel={
            activity.completed
              ? `Marcar ${activity.title} como pendente`
              : `Marcar ${activity.title} como concluída`
          }
        >
          {activity.completed && (
            <Text style={styles.check}>
              ✓
            </Text>
          )}
        </Pressable>
      )}

      <View style={styles.content}>
        {/* Título */}
        <Text
          style={[
            styles.title,
            activity.completed &&
              styles.completedText,
          ]}
        >
          {activity.title}
        </Text>

        {/* Nome do criador */}
        <Text style={styles.owner}>
          Criado por:{" "}
          {activity.owner?.name ||
            "Criador não informado"}
        </Text>

        {/* Descrição */}
        {!!activity.description?.trim() && (
          <Text style={styles.description}>
            {activity.description}
          </Text>
        )}

        {/* Data e horário */}
        <Text style={styles.info}>
          {date} • {time}
        </Text>

        {/* Local */}
        <Text style={styles.location}>
          {activity.location}
        </Text>

        {/* Status */}
        <Text style={styles.status}>
          Status:{" "}
          {activity.completed
            ? "Concluída"
            : "Pendente"}
        </Text>

        {/* Pessoas interessadas */}
        <View style={styles.interestsSection}>
          <Text style={styles.interestsHeading}>
            Interessados em participar (
            {activity.interestCount})
          </Text>

          <Text style={styles.interestedNames}>
            {names ||
              "Ninguém demonstrou interesse ainda."}
          </Text>

          {/* Registrar ou retirar interesse */}
          {showInterestAction &&
            onToggleInterest && (
              <Pressable
                style={({ pressed }) => [
                  styles.interestButton,
                  activity.hasInterest &&
                    styles.interestButtonActive,
                  cannotInteract &&
                    styles.interestButtonDisabled,
                  pressed &&
                    !cannotInteract &&
                    styles.pressed,
                ]}
                onPress={onToggleInterest}
                disabled={cannotInteract}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: cannotInteract,
                  busy: interestLoading,
                }}
                accessibilityLabel={
                  activity.hasInterest
                    ? `Retirar interesse em ${activity.title}`
                    : `Demonstrar interesse em ${activity.title}`
                }
              >
                {interestLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
                ) : (
                  <Text
                    style={[
                      styles.interestButtonText,
                      activity.hasInterest &&
                        styles.interestButtonTextActive,
                    ]}
                  >
                    {interestDisabled
                      ? "Interesse indisponível offline"
                      : activity.hasInterest
                        ? "Retirar interesse"
                        : "Tenho interesse em participar"}
                  </Text>
                )}
              </Pressable>
            )}
        </View>

        {/* Editar atividade */}
        {onEdit && (
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${activity.title}`}
          >
            <Text style={styles.editButtonText}>
              Editar atividade
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
