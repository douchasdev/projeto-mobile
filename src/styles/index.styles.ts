import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
  },

  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginTop: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
  },
});