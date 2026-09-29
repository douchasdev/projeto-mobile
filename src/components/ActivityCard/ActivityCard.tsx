import { Pressable, Text, View } from "react-native";

import { Activity } from "../../types/Activity";
import { styles } from "./ActivityCard.styles";

type ActivityCardProps = {
  activity: Activity;
  onToggleCompleted: () => void;
};

export default function ActivityCard({
  activity,
  onToggleCompleted,
}: ActivityCardProps) {
  function formatDate(value: Date) {
    return value.toLocaleDateString("pt-BR");
  }

  function formatTime(value: Date) {
    return value.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <View style={[styles.card, activity.completed && styles.completedCard]}>
      <Pressable
        style={[
          styles.checkbox,
          activity.completed && styles.checkboxCompleted,
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
        {activity.completed && <Text style={styles.check}>✓</Text>}
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[styles.title, activity.completed && styles.completedText]}
        >
          {activity.title}
        </Text>

        <Text style={[styles.info, activity.completed && styles.completedText]}>
          {formatDate(activity.date)} • {formatTime(activity.time)}
        </Text>

        <Text
          style={[styles.location, activity.completed && styles.completedText]}
        >
          {activity.location}
        </Text>
      </View>
    </View>
  );
}
