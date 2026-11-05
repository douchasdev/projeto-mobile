
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";

import { useActivities } from "../../contexts/ActivitiesContext";
import { styles } from "./ActivityForm.styles";

// Tempo máximo para obter a localização atual.
const LOCATION_TIMEOUT_MS = 10000;

// Aceita posição anterior com até 60 segundos.
const LAST_LOCATION_MAX_AGE_MS = 60000;

// Tempo máximo para consultar a última posição.
const FALLBACK_TIMEOUT_MS = 3000;

// Tempo máximo para converter coordenadas em endereço.
const GEOCODING_TIMEOUT_MS = 5000;

class LocationTimeoutError extends Error {
  constructor() {
    super("Tempo limite para obter a localização excedido.");
    this.name = "LocationTimeoutError";
  }
}

// Limita o tempo de espera de uma operação assíncrona.
// Não cancela a operação nativa, apenas deixa de aguardá-la.
function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number
): Promise<T> {
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

export default function ActivityForm() {
  const { addActivity } = useActivities();

  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [loadingLocation, setLoadingLocation] = useState(false);

  // Identifica a solicitação de localização mais recente.
  const requestId = useRef(0);

  // Evita atualizar o estado após desmontar o componente.
  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  function resetForm() {
    // Invalida resultados de solicitações anteriores.
    requestId.current += 1;

    setActivity("");
    setLocation("");
    setDate(null);
    setTime(null);

    setShowDatePicker(false);
    setShowTimePicker(false);
    setLoadingLocation(false);
  }

  function handleDateChange(selectedDate: Date) {
    setDate(selectedDate);
    setShowDatePicker(false);
  }

  function handleTimeChange(selectedTime: Date) {
    setTime(selectedTime);
    setShowTimePicker(false);
  }

  function formatDate(value: Date) {
    return value.toLocaleDateString("pt-BR");
  }

  function formatTime(value: Date) {
    return value.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleLocationTextChange(value: string) {
    // A digitação manual tem prioridade sobre
    // uma solicitação de GPS que ainda esteja em andamento.
    requestId.current += 1;

    setLoadingLocation(false);
    setLocation(value);
  }

  async function handleGetLocation() {
    if (loadingLocation) return;

    const currentRequest = ++requestId.current;

    setLoadingLocation(true);

    try {
      // 1. Verifica se os serviços de localização estão ativos.
      const enabled = await Location.hasServicesEnabledAsync();

      if (currentRequest !== requestId.current) return;

      if (!enabled) {
        Alert.alert(
          "Localização desativada",
          "Ative a localização do celular e tente novamente. Você também pode informar o local manualmente."
        );
        return;
      }

      // 2. Solicita permissão de localização em primeiro plano.
      const permission =
        await Location.requestForegroundPermissionsAsync();

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
                    "Não foi possível abrir as configurações do celular."
                  );
                });
              },
            },
          ]
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
          LOCATION_TIMEOUT_MS
        );
      } catch (currentPositionError) {
        if (currentRequest !== requestId.current) return;

        console.warn(
          "Falha ao obter posição atual:",
          currentPositionError
        );

        // 4. Tenta recuperar a última posição conhecida.
        let lastKnownPosition: Location.LocationObject | null = null;

        try {
          lastKnownPosition = await withTimeout(
            Location.getLastKnownPositionAsync({
              maxAge: LAST_LOCATION_MAX_AGE_MS,
            }),
            FALLBACK_TIMEOUT_MS
          );
        } catch (fallbackError) {
          console.warn(
            "Falha ao consultar última localização:",
            fallbackError
          );
        }

        if (currentRequest !== requestId.current) return;

        // Verifica novamente a idade da posição recuperada.
        const isRecent =
          lastKnownPosition !== null &&
          lastKnownPosition.timestamp <= Date.now() &&
          Date.now() - lastKnownPosition.timestamp <=
            LAST_LOCATION_MAX_AGE_MS;

        if (!lastKnownPosition || !isRecent) {
          const timedOut =
            currentPositionError instanceof LocationTimeoutError;

          Alert.alert(
            timedOut
              ? "Tempo de espera excedido"
              : "Localização indisponível",
            timedOut
              ? "O celular demorou mais de 10 segundos para obter sua posição e não encontramos uma localização recente. Tente novamente em um local com melhor sinal ou informe o endereço manualmente."
              : "Não foi possível determinar sua posição atual nem recuperar uma localização recente. Verifique o sinal e tente novamente ou informe o local manualmente."
          );

          return;
        }

        position = lastKnownPosition;
        usedLastKnownPosition = true;
      }

      if (currentRequest !== requestId.current) return;

      const { latitude, longitude } = position.coords;

      // 5. Prepara as coordenadas como fallback.
      let formattedLocation =
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      let addressFound = false;

      // 6. Tenta converter as coordenadas em endereço.
      try {
        const addresses = await withTimeout(
          Location.reverseGeocodeAsync({
            latitude,
            longitude,
          }),
          GEOCODING_TIMEOUT_MS
        );

        if (currentRequest !== requestId.current) return;

        const address = addresses[0];

        if (address) {
          const street = [
            address.street,
            address.streetNumber,
          ]
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
          geocodingError
        );
      }

      if (currentRequest !== requestId.current) return;

      // 7. Preenche o campo Local.
      setLocation(formattedLocation);

      // 8. Informa quando uma posição anterior foi utilizada.
      if (usedLastKnownPosition) {
        const secondsAgo = Math.max(
          0,
          Math.round(
            (Date.now() - position.timestamp) / 1000
          )
        );

        Alert.alert(
          "Última localização conhecida",
          `Não foi possível obter sua posição atual. Utilizamos uma localização registrada há aproximadamente ${secondsAgo} segundos. Confira o local antes de criar a atividade.`
        );
      } else if (!addressFound) {
        Alert.alert(
          "Endereço não identificado",
          "Sua posição foi obtida, mas não foi possível identificar o endereço. As coordenadas foram preenchidas no campo Local."
        );
      }
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      console.error(
        "Erro inesperado ao obter localização:",
        error
      );

      Alert.alert(
        "Erro de localização",
        "Ocorreu um problema ao acessar os serviços de localização. Verifique as permissões, tente novamente ou informe o local manualmente."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoadingLocation(false);
      }
    }
  }

  function handleCreate() {
    if (loadingLocation) {
      Alert.alert(
        "Aguarde",
        "Espere a localização ser obtida antes de criar a atividade."
      );
      return;
    }

    if (!activity.trim()) {
      Alert.alert(
        "Campo obrigatório",
        "Informe o nome da atividade."
      );
      return;
    }

    if (!date) {
      Alert.alert(
        "Campo obrigatório",
        "Selecione uma data."
      );
      return;
    }

    if (!time) {
      Alert.alert(
        "Campo obrigatório",
        "Selecione um horário."
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        "Campo obrigatório",
        "Informe o local da atividade ou utilize sua localização atual."
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
      "Sucesso",
      "Atividade criada com sucesso."
    );

    resetForm();
  }

  function handleCancel() {
    resetForm();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Nova atividade</Text>

        {/* Atividade */}
        <View style={styles.field}>
          <Text style={styles.label}>Atividade</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Vôlei"
            value={activity}
            onChangeText={setActivity}
          />
        </View>

        {/* Data */}
        <View style={styles.field}>
          <Text style={styles.label}>Data</Text>

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
                : "Selecione uma data"}
            </Text>

            <Text style={styles.selectorIcon}>▾</Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date ?? new Date()}
              mode="date"
              display="default"
              onValueChange={(_, selectedDate) => {
                if (selectedDate) {
                  handleDateChange(selectedDate);
                }
              }}
              onDismiss={() => {
                setShowDatePicker(false);
              }}
            />
          )}
        </View>

        {/* Horário */}
        <View style={styles.field}>
          <Text style={styles.label}>Horário</Text>

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
                : "Selecione um horário"}
            </Text>

            <Text style={styles.selectorIcon}>▾</Text>
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={time ?? new Date()}
              mode="time"
              display="default"
              is24Hour={true}
              onValueChange={(_, selectedTime) => {
                if (selectedTime) {
                  handleTimeChange(selectedTime);
                }
              }}
              onDismiss={() => {
                setShowTimePicker(false);
              }}
            />
          )}
        </View>

        {/* Local */}
        <View style={styles.field}>
          <Text style={styles.label}>Local</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite o local ou use sua localização"
            value={location}
            onChangeText={handleLocationTextChange}
            editable={true}
          />

          <Pressable
            style={({ pressed }) => [
              styles.locationButton,
              pressed && styles.buttonPressed,
              loadingLocation &&
                styles.locationButtonDisabled,
            ]}
            onPress={handleGetLocation}
            disabled={loadingLocation}
            accessibilityRole="button"
            accessibilityLabel="Usar minha localização atual"
          >
            {loadingLocation && (
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />
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
