import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  completedCard: {
    borderColor: "#D0D5DD",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#98A2B3",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },

  checkboxCompleted: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#98A2B3",
  },

  info: {
    fontSize: 14,
    color: "#475467",
  },

  location: {
    fontSize: 14,
    color: "#667085",
    marginTop: 4,
  },

  status: {
    fontSize: 13,
    color: "#475467",
    marginTop: 8,
  },

  editButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 12,
  },

  editButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },

  pressed: {
    opacity: 0.7,
  },
});