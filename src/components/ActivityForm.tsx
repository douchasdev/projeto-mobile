// src/components/ActivityForm.tsx

import { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useActivities } from '../contexts/ActivitiesContext';

export default function ActivityForm() {
  const { addActivity } = useActivities();

  // Campos do formulário
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  // Controle dos seletores
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Limpa todos os campos
  function resetForm() {
    setActivity('');
    setLocation('');
    setDate(null);
    setTime(null);

    setShowDatePicker(false);
    setShowTimePicker(false);
  }

  // Seleciona a data
  function handleDateChange(selectedDate: Date) {
    setDate(selectedDate);
    setShowDatePicker(false);
  }

  // Seleciona o horário
  function handleTimeChange(selectedTime: Date) {
    setTime(selectedTime);
    setShowTimePicker(false);
  }

  // Formata a data para o padrão brasileiro
  function formatDate(value: Date) {
    return value.toLocaleDateString('pt-BR');
  }

  // Formata o horário
  function formatTime(value: Date) {
    return value.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Valida e cria uma nova atividade
  function handleCreate() {
    if (!activity.trim()) {
      Alert.alert(
        'Campo obrigatório',
        'Informe o nome da atividade.'
      );
      return;
    }

    if (!date) {
      Alert.alert(
        'Campo obrigatório',
        'Selecione uma data.'
      );
      return;
    }

    if (!time) {
      Alert.alert(
        'Campo obrigatório',
        'Selecione um horário.'
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        'Campo obrigatório',
        'Informe o local da atividade.'
      );
      return;
    }

    addActivity({
      title: activity.trim(),
      date,
      time,
      location: location.trim(),
    });

    Alert.alert(
      'Sucesso',
      'Atividade criada com sucesso.'
    );

    resetForm();
  }

  // Cancela e limpa o formulário
  function handleCancel() {
    resetForm();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>
          Nova atividade
        </Text>

        {/* Atividade */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Atividade
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Vôlei"
            value={activity}
            onChangeText={setActivity}
          />
        </View>

        {/* Data */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Data
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.selectorPressed,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={
                date
                  ? styles.selectorText
                  : styles.placeholderText
              }
            >
              {date
                ? formatDate(date)
                : 'Selecione uma data'}
            </Text>

            <Text style={styles.selectorIcon}>
              ▾
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date ?? new Date()}
              mode="date"
              display="default"

              onValueChange={(_, selectedDate) => {
                handleDateChange(selectedDate);
              }}

              onDismiss={() => {
                setShowDatePicker(false);
              }}
            />
          )}
        </View>

        {/* Horário */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Horário
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.selectorPressed,
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text
              style={
                time
                  ? styles.selectorText
                  : styles.placeholderText
              }
            >
              {time
                ? formatTime(time)
                : 'Selecione um horário'}
            </Text>

            <Text style={styles.selectorIcon}>
              ▾
            </Text>
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={time ?? new Date()}
              mode="time"
              display="default"
              is24Hour={true}

              onValueChange={(_, selectedTime) => {
                handleTimeChange(selectedTime);
              }}

              onDismiss={() => {
                setShowTimePicker(false);
              }}
            />
          )}
        </View>

        {/* Local */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Local
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Praça Santos Dumont"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Botões */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>
              Cancelar
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCreate}
          >
            <Text style={styles.createButtonText}>
              Criar
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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

    // Flexbox
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
    // Flexbox
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