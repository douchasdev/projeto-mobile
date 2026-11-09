
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#667085",
    marginBottom: 32,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#344054",
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#101828",
  },

  button: {
    minHeight: 50,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  link: {
    marginTop: 24,
    paddingVertical: 10,
    alignItems: "center",
  },

  linkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
