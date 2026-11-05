import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#101828",
  },

  subtitle: {
    fontSize: 14,
    color: "#667085",
    marginTop: 6,
    marginBottom: 28,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },

  selector: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },

  selectorText: {
    fontSize: 16,
    color: "#101828",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },

  cancelButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  saveButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.7,
  },

  // Botão para obter a localização automaticamente
locationButton: {
  minHeight: 44,
  marginTop: 8,
  borderWidth: 1,
  borderColor: "#2563EB",
  borderRadius: 8,
  paddingHorizontal: 12,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  backgroundColor: "#EFF6FF",
},

// Texto do botão
locationButtonText: {
  color: "#2563EB",
  fontSize: 14,
  fontWeight: "600",
},

// Aparência durante a obtenção da localização
locationButtonDisabled: {
  opacity: 0.6,
},

});