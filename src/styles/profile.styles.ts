import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 14,
  },

  name: {
    fontSize: 22,
    fontWeight: '600',
  },

  editButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  editButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },

  nameEditContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },

  nameInput: {
    width: '100%',
    height: 44,

    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 12,

    fontSize: 16,
    textAlign: 'center',
  },

  saveButton: {
    marginTop: 10,

    backgroundColor: '#2563EB',

    paddingVertical: 10,
    paddingHorizontal: 20,

    borderRadius: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  stats: {
    flexDirection: 'row',
    gap: 12,
  },

  settingCard: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  settingText: {
    flex: 1,
    marginRight: 16,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },

  settingDescription: {
    fontSize: 13,
    color: '#667085',
    marginTop: 4,
  },

  pressed: {
    opacity: 0.6,
  },
});