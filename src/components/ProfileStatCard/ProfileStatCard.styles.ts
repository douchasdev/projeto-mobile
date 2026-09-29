import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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