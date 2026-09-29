import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Activity } from '../types/Activity';

type ActivityCardProps = {
  activity: Activity;
  onToggleCompleted: () => void;
};

export default function ActivityCard({
  activity,
  onToggleCompleted,
}: ActivityCardProps) {
  function formatDate(value: Date) {
    return value.toLocaleDateString('pt-BR');
  }

  function formatTime(value: Date) {
    return value.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <View
      style={[
        styles.card,
        activity.completed && styles.completedCard,
      ]}
    >
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
        {activity.completed && (
          <Text style={styles.check}>✓</Text>
        )}
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            activity.completed && styles.completedText,
          ]}
        >
          {activity.title}
        </Text>

        <Text
          style={[
            styles.info,
            activity.completed && styles.completedText,
          ]}
        >
          {formatDate(activity.date)} •{' '}
          {formatTime(activity.time)}
        </Text>

        {activity.location && (
          <Text
            style={[
              styles.location,
              activity.completed && styles.completedText,
            ]}
          >
            {activity.location}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,

    padding: 16,
    marginBottom: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },

  completedCard: {
    opacity: 0.6,
  },

  checkbox: {
    width: 24,
    height: 24,

    borderWidth: 2,
    borderColor: '#98A2B3',
    borderRadius: 6,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 14,
  },

  checkboxCompleted: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  check: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },

  info: {
    fontSize: 14,
    color: '#475467',
  },

  location: {
    fontSize: 14,
    color: '#667085',
    marginTop: 4,
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: '#98A2B3',
  },
});