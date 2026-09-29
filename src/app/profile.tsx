// src/app/profile.tsx

import { useState } from 'react';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileStatCard from '../components/ProfileStatCard';
import { useActivities } from '../contexts/ActivitiesContext';

export default function ProfileScreen() {
  const {
    activities,
    showCompleted,
    setShowCompleted,
  } = useActivities();

  // Nome do usuário
  const [name, setName] = useState('Douglas');

  // Controla se o nome está sendo editado
  const [editingName, setEditingName] = useState(false);

  // Quantidade de atividades pendentes
  const pendingCount = activities.filter(
    (activity) => !activity.completed
  ).length;

  // Quantidade de atividades concluídas
  const completedCount = activities.filter(
    (activity) => activity.completed
  ).length;

  // Ativa a edição do nome
  function handleEditName() {
    setEditingName(true);
  }

  // Salva o nome
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
            source={require('../../assets/images/avatar.png')}
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
                <Text style={styles.saveButtonText}>
                  Salvar
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.name}>
                {name}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleEditName}
              >
                <Text style={styles.editButtonText}>
                  Editar nome
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Resumo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Resumo
          </Text>

          <View style={styles.stats}>
            <ProfileStatCard
              value={pendingCount}
              label="Pendentes"
            />

            <ProfileStatCard
              value={completedCount}
              label="Concluídas"
            />
          </View>
        </View>

        {/* Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Preferências
          </Text>

          <View style={styles.settingCard}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>
                Mostrar atividades concluídas
              </Text>

              <Text style={styles.settingDescription}>
                Exibir atividades concluídas na tela inicial.
              </Text>
            </View>

            <Switch
              value={showCompleted}
              onValueChange={setShowCompleted}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  content: {
    paddingHorizontal: 20,

    // Espaço adicional no topo
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
    // Flexbox: coloca os dois cards lado a lado
    flexDirection: 'row',
    gap: 12,
  },

  settingCard: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,

    padding: 16,

    // Flexbox
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