import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  form: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },

  input: {
    height: 48,

    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,

    paddingHorizontal: 12,

    fontSize: 16,

    backgroundColor: '#FFFFFF',
  },

  selector: {
    height: 48,

    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,

    paddingHorizontal: 12,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectorPressed: {
    opacity: 0.7,
  },

  selectorText: {
    fontSize: 16,
  },

  placeholderText: {
    fontSize: 16,
    color: '#888888',
  },

  selectorIcon: {
    fontSize: 18,
    color: '#667085',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',

    gap: 12,
    marginTop: 16,
  },

  cancelButton: {
    height: 48,

    paddingHorizontal: 20,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,

    backgroundColor: '#FFFFFF',
  },

  createButton: {
    height: 48,

    paddingHorizontal: 24,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#2563EB',

    borderRadius: 8,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  buttonPressed: {
    opacity: 0.7,
  },
});