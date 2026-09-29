import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ProfileStatCardProps = {
  value: number;
  label: string;
};

export default function ProfileStatCard({
  value,
  label,
}: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 100,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',

    padding: 16,
  },

  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },

  label: {
    fontSize: 14,
    color: '#667085',
  },
});