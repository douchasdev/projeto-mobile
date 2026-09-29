import { useState } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProfileStatCard from "../components/ProfileStatCard/ProfileStatCard";
import { useActivities } from "../contexts/ActivitiesContext";
import { styles } from "../styles/profile.styles";

export default function ProfileScreen() {
  const { activities, showCompleted, setShowCompleted } = useActivities();

  const [name, setName] = useState("Douglas");

  const [editingName, setEditingName] = useState(false);

  const pendingCount = activities.filter(
    (activity) => !activity.completed,
  ).length;

  const completedCount = activities.filter(
    (activity) => activity.completed,
  ).length;

  function handleEditName() {
    setEditingName(true);
  }

  function handleSaveName() {
    if (!name.trim()) {
      return;
    }

    setName(name.trim());
    setEditingName(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil */}
        <View style={styles.profileHeader}>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />

          {editingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={30}
                placeholder="Digite seu nome"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleSaveName}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.name}>{name}</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleEditName}
              >
                <Text style={styles.editButtonText}>Editar nome</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Resumo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>

          <View style={styles.stats}>
            <ProfileStatCard value={pendingCount} label="Pendentes" />

            <ProfileStatCard value={completedCount} label="Concluídas" />
          </View>
        </View>

        {/* Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>
                Mostrar atividades concluídas
              </Text>

              <Text style={styles.settingDescription}>
                Exibir atividades concluídas na tela inicial.
              </Text>
            </View>

            <Switch value={showCompleted} onValueChange={setShowCompleted} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
