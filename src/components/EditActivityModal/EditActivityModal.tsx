
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
import { useTheme } from "../../contexts/ThemeContext";
import { getApiErrorMessage } from "../../services/api";

import type { Activity } from "../../types/Activity";

import { createEditActivityModalStyles } from "./EditActivityModal.styles";

type Props = {
  activity: Activity;
  onClose: () => void;
};

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

// Limita o tempo de espera de uma operação assíncrona.
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

export default function EditActivityModal({
  activity,
  onClose,
}: Props) {
  // Dark Mode.
  const { colors } = useTheme();
  const styles = createEditActivityModalStyles(colors);

  // Integração com a API.
  const { updateActivity } = useActivities();

  // Dados atuais da atividade.
  const [title, setTitle] = useState(activity.title);

  const [description, setDescription] = useState(
    activity.description ?? ""
  );

  const [location, setLocation] = useState(
    activity.location
  );

  const [date, setDate] = useState(activity.date);
  const [time, setTime] = useState(activity.time);

  // Seletores de data e horário.
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estados de carregamento.
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  // Impede múltiplas requisições simultâneas.
  const savingRef = useRef(false);
  const requestId = useRef(0);

  // Invalida consultas de GPS ao desmontar.
  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  function handleLocationTextChange(value: string) {
    // A entrada manual tem prioridade sobre o GPS.
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
          "Ative a localização do celular e tente novamente. Você também pode digitar o local manualmente."
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

        // 4. Tenta recuperar a última posição conhecida.
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
            "Falha ao recuperar última posição:",
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
              ? "O celular demorou mais de 10 segundos para obter sua posição e não encontramos uma localização recente. Tente novamente ou digite o local manualmente."
              : "Não foi possível determinar sua posição nem recuperar uma localização recente. Verifique o sinal e tente novamente."
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

      // 5. Mantém as coordenadas como alternativa.
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

      // 7. Atualiza o campo Local.
      setLocation(formattedLocation);

      // 8. Informa quando a última posição foi usada.
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
        "Erro ao obter localização na edição:",
        error
      );

      Alert.alert(
        "Erro de localização",
        "Ocorreu um problema ao acessar os serviços de localização. Verifique as permissões, tente novamente ou digite o local manualmente."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoadingLocation(false);
      }
    }
  }

  // ==================================================
  // SALVAMENTO DAS ALTERAÇÕES NO BACKEND
  // ==================================================

  async function handleSave() {
    if (savingRef.current) {
      return;
    }

    if (loadingLocation) {
      Alert.alert(
        "Aguarde",
        "Espere a localização ser obtida antes de salvar."
      );
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!trimmedTitle || !trimmedLocation) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha a atividade e o local."
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

    savingRef.current = true;
    setSaving(true);

    try {
      // Aguarda o NestJS confirmar a edição.
      const updated = await updateActivity(
        activity.id,
        {
          title: trimmedTitle,
          description: trimmedDescription,
          location: trimmedLocation,
          date,
          time,
        }
      );

      if (!updated) {
        Alert.alert(
          "Não foi possível editar",
          "Verifique os campos informados."
        );
        return;
      }

      // Fecha apenas depois da confirmação do backend.
      onClose();

      Alert.alert(
        "Sucesso",
        "Atividade atualizada com sucesso."
      );
    } catch (error: unknown) {
      console.error(
        "Erro ao atualizar atividade:",
        error
      );

      Alert.alert(
        "Erro ao atualizar atividade",
        getApiErrorMessage(error)
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function handleClose() {
    if (savingRef.current) {
      return;
    }

    // Invalida consultas pendentes de GPS.
    requestId.current += 1;
    onClose();
  }

  // ==================================================
  // INTERFACE
  // ==================================================

  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Editar atividade
          </Text>

          <Text style={styles.subtitle}>
            Altere as informações e salve suas modificações.
          </Text>

          {/* Atividade */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Atividade
            </Text>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Nome da atividade"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
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
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição da atividade"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
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
              style={[
                styles.selector,
                saving && { opacity: 0.6 },
              ]}
              onPress={() => {
                setShowDatePicker(true);
              }}
              disabled={saving}
              accessibilityRole="button"
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
                  if (
                    selectedDate &&
                    !savingRef.current
                  ) {
                    setDate(selectedDate);
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
              style={[
                styles.selector,
                saving && { opacity: 0.6 },
              ]}
              onPress={() => {
                setShowTimePicker(true);
              }}
              disabled={saving}
              accessibilityRole="button"
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
                  if (
                    selectedTime &&
                    !savingRef.current
                  ) {
                    setTime(selectedTime);
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
              value={location}
              onChangeText={handleLocationTextChange}
              placeholder="Digite o local ou use sua localização"
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.primary}
              maxLength={240}
              editable={!saving}
            />

            <Pressable
              style={({ pressed }) => [
                styles.locationButton,
                pressed && styles.pressed,
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
                pressed && styles.pressed,
                saving && { opacity: 0.6 },
              ]}
              onPress={handleClose}
              disabled={saving}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
                (saving || loadingLocation) && {
                  opacity: 0.6,
                },
              ]}
              onPress={() => {
                void handleSave();
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

              <Text style={styles.saveButtonText}>
                {saving
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
