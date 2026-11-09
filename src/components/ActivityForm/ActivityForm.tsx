
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";

import { useActivities } from "../../contexts/ActivitiesContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getApiErrorMessage } from "../../services/api";
import { createActivityFormStyles } from "./ActivityForm.styles";

// Configurações da geolocalização.
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

// Limita a espera sem necessariamente cancelar a operação nativa.
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

  return Promise.race([
    promise,
    timeoutPromise,
  ]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });
}

export default function ActivityForm() {
  // Dark Mode.
  const { colors } = useTheme();
  const styles = createActivityFormStyles(colors);

  // Integração com o backend.
  const { addActivity } = useActivities();

  // Campos do formulário.
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  // Seletores de data e horário.
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estados de carregamento.
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  // Proteção contra múltiplas solicitações.
  const savingRef = useRef(false);
  const requestId = useRef(0);

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  function resetForm() {
    // Invalida solicitações de GPS anteriores.
    requestId.current += 1;

    setActivity("");
    setDescription("");
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
    // Impede que o GPS sobrescreva uma localização digitada.
    requestId.current += 1;
    setLoadingLocation(false);
    setLocation(value);
  }

  // ==================================================
  // GEOLOCALIZAÇÃO
  // ==================================================

  async function handleGetLocation() {
    if (loadingLocation || savingRef.current) {
      return;
    }

    const currentRequest = ++requestId.current;
    setLoadingLocation(true);

    try {
      // 1. Verifica se a localização está ativada.
      const enabled =
        await Location.hasServicesEnabledAsync();

      if (currentRequest !== requestId.current) {
        return;
      }

      if (!enabled) {
        Alert.alert(
          "Localização desativada",
          "Ative a localização do celular e tente novamente. Você também pode informar o local manualmente."
        );
        return;
      }

      // 2. Solicita permissão.
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (currentRequest !== requestId.current) {
        return;
      }

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
        if (currentRequest !== requestId.current) {
          return;
        }

        console.warn(
          "Falha ao obter posição atual:",
          currentPositionError
        );

        // 4. Caso falhe, tenta a última posição conhecida.
        let lastKnownPosition:
          | Location.LocationObject
          | null = null;

        try {
          lastKnownPosition = await withTimeout(
            Location.getLastKnownPositionAsync({
              maxAge: LAST_LOCATION_MAX_AGE_MS,
            }),
            FALLBACK_TIMEOUT_MS
          );
        } catch (fallbackError) {
          console.warn(
            "Falha ao recuperar última localização:",
            fallbackError
          );
        }

        if (currentRequest !== requestId.current) {
          return;
        }

        const now = Date.now();

        const isRecent =
          lastKnownPosition !== null &&
          lastKnownPosition.timestamp <= now &&
          now - lastKnownPosition.timestamp <=
            LAST_LOCATION_MAX_AGE_MS;

        if (!lastKnownPosition || !isRecent) {
          const timedOut =
            currentPositionError instanceof
            LocationTimeoutError;

          Alert.alert(
            timedOut
              ? "Tempo de espera excedido"
              : "Localização indisponível",
            timedOut
              ? "O celular demorou mais de 10 segundos para obter sua posição e não encontramos uma localização recente. Tente novamente ou informe o endereço manualmente."
              : "Não foi possível determinar sua posição atual nem recuperar uma localização recente. Verifique o sinal e tente novamente."
          );

          return;
        }

        position = lastKnownPosition;
        usedLastKnownPosition = true;
      }

      if (currentRequest !== requestId.current) {
        return;
      }

      const { latitude, longitude } = position.coords;

      // 5. Coordenadas como alternativa ao endereço.
      let formattedLocation =
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      let addressFound = false;

      // 6. Converte coordenadas em endereço.
      try {
        const addresses = await withTimeout(
          Location.reverseGeocodeAsync({
            latitude,
            longitude,
          }),
          GEOCODING_TIMEOUT_MS
        );

        if (currentRequest !== requestId.current) {
          return;
        }

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

      if (currentRequest !== requestId.current) {
        return;
      }

      // 7. Preenche o campo Local.
      setLocation(formattedLocation);

      // 8. Informa quando foi usada uma posição anterior.
      if (usedLastKnownPosition) {
        const secondsAgo = Math.max(
          0,
          Math.round(
            (Date.now() - position.timestamp) / 1000
          )
        );

        const warning = addressFound
          ? "Confira o endereço antes de salvar."
          : "O endereço não foi identificado. As coordenadas foram preenchidas. Confira o local antes de salvar.";

        Alert.alert(
          "Última localização conhecida",
          `Não foi possível obter sua posição atual. Utilizamos uma localização registrada há aproximadamente ${secondsAgo} segundos. ${warning}`
        );
      } else if (!addressFound) {
        Alert.alert(
          "Endereço não identificado",
          "Sua posição foi obtida, mas não foi possível identificar o endereço. As coordenadas foram preenchidas no campo Local."
        );
      }
    } catch (error: unknown) {
      if (currentRequest !== requestId.current) {
        return;
      }

      console.error(
        "Erro ao obter localização:",
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

  // ==================================================
  // CRIAÇÃO DA ATIVIDADE
  // ==================================================

  async function handleCreate() {
    if (savingRef.current) {
      return;
    }

    if (loadingLocation) {
      Alert.alert(
        "Aguarde",
        "Espere a localização ser obtida antes de criar a atividade."
      );
      return;
    }

    const title = activity.trim();
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!title) {
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

    if (
      Number.isNaN(date.getTime()) ||
      Number.isNaN(time.getTime())
    ) {
      Alert.alert(
        "Data ou horário inválido",
        "Selecione uma data e um horário válidos."
      );
      return;
    }

    if (!trimmedLocation) {
      Alert.alert(
        "Campo obrigatório",
        "Informe o local da atividade ou utilize sua localização atual."
      );
      return;
    }

    if (trimmedLocation.length > 240) {
      Alert.alert(
        "Local muito longo",
        "O local deve ter no máximo 240 caracteres."
      );
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      await addActivity({
        title,
        description: trimmedDescription,
        date,
        time,
        location: trimmedLocation,
      });

      // Limpa somente após a confirmação da API.
      resetForm();

      Alert.alert(
        "Sucesso",
        "Atividade criada com sucesso."
      );
    } catch (error: unknown) {
      console.error(
        "Erro ao criar atividade:",
        error
      );

      Alert.alert(
        "Erro ao criar atividade",
        getApiErrorMessage(error)
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function handleCancel() {
    if (savingRef.current) {
      return;
    }

    resetForm();
  }

  // ==================================================
  // INTERFACE
  // ==================================================

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>
            Nova atividade
          </Text>

          {/* Nome */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Atividade
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex.: Vôlei"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              value={activity}
              onChangeText={setActivity}
              maxLength={120}
              editable={!saving}
            />
          </View>

          {/* Descrição */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Descrição (opcional)
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  minHeight: 90,
                  paddingTop: 12,
                  textAlignVertical: "top",
                },
              ]}
              placeholder="Descreva sua atividade"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={1000}
              editable={!saving}
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
                saving && { opacity: 0.6 },
              ]}
              onPress={() => {
                setShowDatePicker(true);
              }}
              disabled={saving}
              accessibilityRole="button"
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
                  if (
                    selectedDate &&
                    !savingRef.current
                  ) {
                    handleDateChange(selectedDate);
                  }

                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
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
            <Text style={styles.label}>
              Horário
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.selector,
                pressed && styles.selectorPressed,
                saving && { opacity: 0.6 },
              ]}
              onPress={() => {
                setShowTimePicker(true);
              }}
              disabled={saving}
              accessibilityRole="button"
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

              <Text style={styles.selectorIcon}>
                ▾
              </Text>
            </Pressable>

            {showTimePicker && (
              <DateTimePicker
                value={time ?? new Date()}
                mode="time"
                display="default"
                is24Hour
                onValueChange={(_, selectedTime) => {
                  if (
                    selectedTime &&
                    !savingRef.current
                  ) {
                    handleTimeChange(selectedTime);
                  }

                  if (Platform.OS === "android") {
                    setShowTimePicker(false);
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
            <Text style={styles.label}>
              Local
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite o local ou use sua localização"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              value={location}
              onChangeText={handleLocationTextChange}
              maxLength={240}
              editable={!saving}
            />

            <Pressable
              style={({ pressed }) => [
                styles.locationButton,
                pressed && styles.buttonPressed,
                (loadingLocation || saving) &&
                  styles.locationButtonDisabled,
              ]}
              onPress={() => {
                void handleGetLocation();
              }}
              disabled={loadingLocation || saving}
              accessibilityRole="button"
              accessibilityLabel="Usar minha localização atual"
            >
              {loadingLocation && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
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
                saving && { opacity: 0.6 },
              ]}
              onPress={handleCancel}
              disabled={saving}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                pressed && styles.buttonPressed,
                (saving || loadingLocation) && {
                  opacity: 0.6,
                },
              ]}
              onPress={() => {
                void handleCreate();
              }}
              disabled={saving || loadingLocation}
              accessibilityRole="button"
            >
              {saving && (
                <ActivityIndicator
                  size="small"
                  color={colors.onPrimary}
                />
              )}

              <Text style={styles.createButtonText}>
                {saving
                  ? "Salvando..."
                  : "Criar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
