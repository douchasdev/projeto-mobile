import { Text, View } from "react-native";

import { styles } from "./ProfileStatCard.styles";

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
      <Text style={styles.value}>{value}</Text>

      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
