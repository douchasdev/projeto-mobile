
import {
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
};

export default function ActivityCard({
  activity,
  onToggleCompleted,
  onEdit,
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

  return (
    <View
      style={[
        styles.card,
        activity.completed && styles.completedCard,
      ]}
    >
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
        <Text
          style={[
            styles.title,
            activity.completed &&
              styles.completedText,
          ]}
        >
          {activity.title}
        </Text>

        {!!activity.description?.trim() && (
          <Text style={styles.description}>
            {activity.description}
          </Text>
        )}

        <Text style={styles.info}>
          {date} • {time}
        </Text>

        <Text style={styles.location}>
          {activity.location}
        </Text>

        <Text style={styles.status}>
          Status:{" "}
          {activity.completed
            ? "Concluída"
            : "Pendente"}
        </Text>

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
