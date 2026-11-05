import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";

import { useActivities } from "../../contexts/ActivitiesContext";
import { Activity } from "../../types/Activity";
import { styles } from "./EditActivityModal.styles";

type Props = {
  activity: Activity;
  onClose: () => void;
};

const LOCATION_TIMEOUT_MS = 10000;
const LAST_LOCATION_MAX_AGE_MS = 60000;
const FALLBACK_TIMEOUT_MS = 3000;
const GEOCODING_TIMEOUT_MS = 5000;

class LocationTimeoutError extends Error {
  constructor() {
    super("Tempo limite para obter a localização excedido.");
    this.name = "LocationTimeoutError";
  }
}

// Limita a espera por uma operação assíncrona.
// Não cancela necessariamente a operação nativa.
function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new LocationTimeoutError());
    }, milliseconds);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });
}

export default function EditActivityModal({ activity, onClose }: Props) {
  const { updateActivity } = useActivities();

  const [title, setTitle] = useState(activity.title);
  const [location, setLocation] = useState(activity.location);
  const [date, setDate] = useState(activity.date);
  const [time, setTime] = useState(activity.time);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Identifica a solicitação de GPS mais recente.
  const requestId = useRef(0);

  // Invalida consultas pendentes quando o modal for fechado.
  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  function handleLocationTextChange(value: string) {
    // Impede que uma consulta antiga sobrescreva
    // o endereço digitado pelo usuário.
    requestId.current += 1;
    setLoadingLocation(false);
    setLocation(value);
  }

  async function handleGetLocation() {
    if (loadingLocation) return;

    const currentRequest = ++requestId.current;
    setLoadingLocation(true);

    try {
      // 1. Verifica se a localização está ativada.
      const enabled = await Location.hasServicesEnabledAsync();

      if (currentRequest !== requestId.current) return;

      if (!enabled) {
        Alert.alert(
          "Localização desativada",
          "Ative a localização do celular e tente novamente. Você também pode digitar o local manualmente.",
        );
        return;
      }

      // 2. Solicita permissão em primeiro plano.
      const permission = await Location.requestForegroundPermissionsAsync();

      if (currentRequest !== requestId.current) return;

      if (!permission.granted) {
        Alert.alert(
          "Permissão de localização negada",
          "O aplicativo precisa de acesso à localização para preencher o campo automaticamente.",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Abrir configurações",
              onPress: () => {
                Linking.openSettings().catch(() => {
                  Alert.alert(
                    "Erro",
                    "Não foi possível abrir as configurações do celular.",
                  );
                });
              },
            },
          ],
        );
        return;
      }

      let position: Location.LocationObject;
      let usedLastKnownPosition = false;

      // 3. Tenta obter a posição atual.
      try {
        position = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          LOCATION_TIMEOUT_MS,
        );
      } catch (currentPositionError) {
        if (currentRequest !== requestId.current) return;

        console.warn("Falha ao obter posição atual:", currentPositionError);

        // 4. Caso falhe, tenta a última posição conhecida.
        let lastKnownPosition: Location.LocationObject | null = null;

        try {
          lastKnownPosition = await withTimeout(
            Location.getLastKnownPositionAsync({
              maxAge: LAST_LOCATION_MAX_AGE_MS,
            }),
            FALLBACK_TIMEOUT_MS,
          );
        } catch (fallbackError) {
          console.warn("Falha ao recuperar última posição:", fallbackError);
        }

        if (currentRequest !== requestId.current) return;

        const now = Date.now();

        const isRecent =
          lastKnownPosition !== null &&
          lastKnownPosition.timestamp <= now &&
          now - lastKnownPosition.timestamp <= LAST_LOCATION_MAX_AGE_MS;

        if (!lastKnownPosition || !isRecent) {
          const timedOut = currentPositionError instanceof LocationTimeoutError;

          Alert.alert(
            timedOut ? "Tempo de espera excedido" : "Localização indisponível",
            timedOut
              ? "O celular demorou mais de 10 segundos para obter sua posição e não encontramos uma localização recente. Tente novamente ou digite o local manualmente."
              : "Não foi possível determinar sua posição nem recuperar uma localização recente. Verifique o sinal e tente novamente.",
          );
          return;
        }

        position = lastKnownPosition;
        usedLastKnownPosition = true;
      }

      if (currentRequest !== requestId.current) return;

      const { latitude, longitude } = position.coords;

      // 5. Coordenadas como alternativa ao endereço.
      let formattedLocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      let addressFound = false;

      // 6. Tenta converter coordenadas em endereço.
      try {
        const addresses = await withTimeout(
          Location.reverseGeocodeAsync({
            latitude,
            longitude,
          }),
          GEOCODING_TIMEOUT_MS,
        );

        if (currentRequest !== requestId.current) return;

        const address = addresses[0];

        if (address) {
          const street = [address.street, address.streetNumber]
            .filter(Boolean)
            .join(", ");

          const parts = [
            street,
            address.district,
            address.city,
            address.region,
          ].filter(Boolean);

          if (parts.length > 0) {
            formattedLocation = parts.join(" - ");
            addressFound = true;
          }
        }
      } catch (geocodingError) {
        console.warn(
          "Falha ao converter coordenadas em endereço:",
          geocodingError,
        );
      }

      if (currentRequest !== requestId.current) return;

      // 7. Preenche o campo Local.
      setLocation(formattedLocation);

      // 8. Informa a utilização de dados alternativos.
      if (usedLastKnownPosition) {
        const secondsAgo = Math.max(
          0,
          Math.round((Date.now() - position.timestamp) / 1000),
        );

        const warning = addressFound
          ? "Confira o endereço antes de salvar."
          : "O endereço não foi identificado. As coordenadas foram preenchidas. Confira o local antes de salvar.";

        Alert.alert(
          "Última localização conhecida",
          `Não foi possível obter sua posição atual. Utilizamos uma localização registrada há aproximadamente ${secondsAgo} segundos. ${warning}`,
        );
      } else if (!addressFound) {
        Alert.alert(
          "Endereço não identificado",
          "Sua posição foi obtida, mas não foi possível identificar o endereço. As coordenadas foram preenchidas no campo Local.",
        );
      }
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      console.error("Erro ao obter localização na edição:", error);

      Alert.alert(
        "Erro de localização",
        "Ocorreu um problema ao acessar os serviços de localização. Verifique as permissões, tente novamente ou digite o local manualmente.",
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoadingLocation(false);
      }
    }
  }

  function handleSave() {
    if (loadingLocation) {
      Alert.alert(
        "Aguarde",
        "Espere a localização ser obtida antes de salvar.",
      );
      return;
    }

    if (!title.trim() || !location.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha a atividade e o local.");
      return;
    }

    if (Number.isNaN(date.getTime()) || Number.isNaN(time.getTime())) {
      Alert.alert(
        "Data ou horário inválido",
        "Selecione uma data e um horário válidos.",
      );
      return;
    }

    const updated = updateActivity(activity.id, {
      title: title.trim(),
      location: location.trim(),
      date,
      time,
    });

    if (!updated) {
      Alert.alert(
        "Não foi possível editar",
        "A atividade não foi encontrada ou não pertence ao usuário atual.",
      );
      return;
    }

    onClose();

    Alert.alert("Sucesso", "Atividade atualizada com sucesso.");
  }

  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Editar atividade</Text>

          <Text style={styles.subtitle}>
            Altere as informações e salve suas modificações.
          </Text>

          {/* Nome */}
          <View style={styles.field}>
            <Text style={styles.label}>Atividade</Text>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Nome da atividade"
              maxLength={120}
            />
          </View>

          {/* Data */}
          <View style={styles.field}>
            <Text style={styles.label}>Data</Text>

            <Pressable
              style={styles.selector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.selectorText}>
                {date.toLocaleDateString("pt-BR")}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onValueChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }

                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                }}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}
          </View>

          {/* Horário */}
          <View style={styles.field}>
            <Text style={styles.label}>Horário</Text>

            <Pressable
              style={styles.selector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.selectorText}>
                {time.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                is24Hour
                onValueChange={(_, selectedTime) => {
                  if (selectedTime) {
                    setTime(selectedTime);
                  }

                  if (Platform.OS === "android") {
                    setShowTimePicker(false);
                  }
                }}
                onDismiss={() => setShowTimePicker(false)}
              />
            )}
          </View>

          {/* Local */}
          <View style={styles.field}>
            <Text style={styles.label}>Local</Text>

            <TextInput
              style={styles.input}
              value={location}
              onChangeText={handleLocationTextChange}
              placeholder="Digite o local ou use sua localização"
              maxLength={240}
            />

            <Pressable
              style={({ pressed }) => [
                styles.locationButton,
                pressed && styles.pressed,
                loadingLocation && styles.locationButtonDisabled,
              ]}
              onPress={handleGetLocation}
              disabled={loadingLocation}
              accessibilityRole="button"
              accessibilityLabel="Usar minha localização atual"
            >
              {loadingLocation && (
                <ActivityIndicator size="small" color="#2563EB" />
              )}

              <Text style={styles.locationButtonText}>
                {loadingLocation
                  ? "Obtendo localização..."
                  : "Usar minha localização"}
              </Text>
            </Pressable>
          </View>

          {/* Botões */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
              ]}
              onPress={handleSave}
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>Salvar alterações</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
