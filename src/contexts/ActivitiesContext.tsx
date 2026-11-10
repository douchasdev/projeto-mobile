
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  Activity,
  NewActivity,
  UpdateActivity,
} from "../types/Activity";

import type { ApiActivity } from "../types/ApiActivity";

import { useAuth } from "./AuthContext";

import {
  addActivityInterestRequest,
  createActivityRequest,
  deleteActivityRequest,
  getAllActivities,
  getMyActivities,
  removeActivityInterestRequest,
  updateActivityRequest,
  updateActivityStatusRequest,
} from "../services/activities.service";

import {
  fromApiActivity,
  toScheduledAt,
} from "../services/activity.mapper";

import { getApiErrorMessage } from "../services/api";

import {
  readCachedActivities,
  replaceCachedActivities,
  removeCachedActivity,
  upsertCachedActivity,
} from "../database/activities.cache";

import type {
  CacheScope,
} from "../database/activities.cache";

const SHOW_COMPLETED_STORAGE_KEY =
  "@projeto-mobile:showCompleted";

// ==================================================
// TIPOS
// ==================================================

type ActivitiesContextData = {
  currentUserId: string;

  activities: Activity[];
  myActivities: Activity[];

  showCompleted: boolean;
  preferencesReady: boolean;
  setShowCompleted: (value: boolean) => void;

  loading: boolean;
  refreshing: boolean;
  error: string | null;

  usingOfflineCache: boolean;
  cachedAt: string | null;

  interestPendingIds: string[];

  toggleActivityInterest: (
    id: string
  ) => Promise<void>;

  refreshActivities: () => Promise<void>;

  addActivity: (
    activity: NewActivity
  ) => Promise<void>;

  updateActivity: (
    id: string,
    changes: UpdateActivity
  ) => Promise<boolean>;

  toggleActivityCompleted: (
    id: string
  ) => Promise<void>;

  deleteActivity: (
    id: string
  ) => Promise<void>;
};

type ActivitiesProviderProps = {
  children: ReactNode;
};

type LoadedCollection = {
  items: Activity[];
  fromCache: boolean;
  syncedAt: string | null;
};

const ActivitiesContext =
  createContext<ActivitiesContextData | undefined>(
    undefined
  );

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

// Insere ou substitui uma atividade na lista.
function upsertActivity(
  list: Activity[],
  activity: Activity
): Activity[] {
  return [
    ...list.filter(
      (item) => item.id !== activity.id
    ),
    activity,
  ].sort(
    (a, b) =>
      a.date.getTime() - b.date.getTime()
  );
}

// Substitui somente se a atividade já estiver
// presente na lista. Evita inserir atividades
// de outras pessoas em "Minhas atividades".
function replaceActivityIfPresent(
  list: Activity[],
  activity: Activity
): Activity[] {
  return list.map((item) =>
    item.id === activity.id
      ? activity
      : item
  );
}

// O fallback para SQLite só pode ocorrer em
// falhas de comunicação ou erros temporários.
function canUseOfflineCache(
  requestError: unknown
): boolean {
  if (!axios.isAxiosError(requestError)) {
    return false;
  }

  const status = requestError.response?.status;

  // Falha de rede ou timeout.
  if (status === undefined) {
    return true;
  }

  // Problemas temporários.
  if (status === 408 || status === 429) {
    return true;
  }

  // Erros internos do servidor.
  return status >= 500;
}

// Busca dados no backend.
// Em caso de indisponibilidade, recupera
// a última versão armazenada no SQLite.
async function loadCollection(
  accountId: string,
  scope: CacheScope,
  request: () => Promise<ApiActivity[]>
): Promise<LoadedCollection> {
  try {
    const response = await request();

    return {
      items: response.map(fromApiActivity),
      fromCache: false,
      syncedAt: null,
    };
  } catch (requestError: unknown) {
    if (!canUseOfflineCache(requestError)) {
      // Nunca contorna 401 ou 403.
      throw requestError;
    }

    console.warn(
      `API indisponível para ${scope}. Tentando SQLite.`
    );

    try {
      const cached =
        await readCachedActivities(
          accountId,
          scope
        );

      if (cached) {
        return {
          items: cached.activities,
          fromCache: true,
          syncedAt: cached.syncedAt,
        };
      }
    } catch (cacheError: unknown) {
      console.error(
        "Erro ao consultar SQLite:",
        cacheError
      );
    }

    throw requestError;
  }
}

// ==================================================
// PROVIDER
// ==================================================

export function ActivitiesProvider({
  children,
}: ActivitiesProviderProps) {
  const { user } = useAuth();

  const currentUserId = user?.id ?? "";

  // Atividades.
  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [myActivities, setMyActivities] =
    useState<Activity[]>([]);

  // Preferência: mostrar atividades concluídas.
  const [
    showCompleted,
    setShowCompletedState,
  ] = useState(true);

  const [
    preferencesReady,
    setPreferencesReady,
  ] = useState(false);

  // Estados de carregamento.
  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // SQLite.
  const [
    usingOfflineCache,
    setUsingOfflineCache,
  ] = useState(false);

  const [cachedAt, setCachedAt] =
    useState<string | null>(null);

  // Interesses em processamento.
  const [
    interestPendingIds,
    setInterestPendingIds,
  ] = useState<string[]>([]);

  const interestLocksRef =
    useRef<Set<string>>(new Set());

  // Controle de requisições.
  const mountedRef = useRef(false);
  const loadedOnceRef = useRef(false);

  const inFlightRefreshRef = useRef<
    Promise<void> | null
  >(null);

  const mutationVersionRef = useRef(0);

  // Proteção contra troca de contas.
  const activeUserRef = useRef(currentUserId);

  activeUserRef.current = currentUserId;

  // ==================================================
  // CARREGAR PREFERÊNCIA DO ASYNCSTORAGE
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    async function loadPreference() {
      setPreferencesReady(false);
      setShowCompletedState(true);

      if (!currentUserId) {
        setPreferencesReady(true);
        return;
      }

      const storageKey =
        `${SHOW_COMPLETED_STORAGE_KEY}:${currentUserId}`;

      try {
        const storedValue =
          await AsyncStorage.getItem(
            storageKey
          );

        if (!cancelled) {
          setShowCompletedState(
            storedValue !== "false"
          );
        }
      } catch (storageError: unknown) {
        console.error(
          "Erro ao recuperar preferência:",
          storageError
        );
      } finally {
        if (!cancelled) {
          setPreferencesReady(true);
        }
      }
    }

    void loadPreference();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // ==================================================
  // SALVAR PREFERÊNCIA NO ASYNCSTORAGE
  // ==================================================

  const setShowCompleted = useCallback(
    (value: boolean) => {
      if (
        !preferencesReady ||
        !currentUserId
      ) {
        return;
      }

      setShowCompletedState(value);

      const storageKey =
        `${SHOW_COMPLETED_STORAGE_KEY}:${currentUserId}`;

      void AsyncStorage.setItem(
        storageKey,
        String(value)
      ).catch((storageError) => {
        console.error(
          "Erro ao salvar preferência:",
          storageError
        );
      });
    },
    [currentUserId, preferencesReady]
  );

  // ==================================================
  // GET /activities e GET /activities/my
  // ==================================================

  const refreshActivities = useCallback(
    (): Promise<void> => {
      if (!currentUserId) {
        return Promise.resolve();
      }

      // Evita chamadas simultâneas duplicadas.
      if (inFlightRefreshRef.current) {
        return inFlightRefreshRef.current;
      }

      const requestedUserId = currentUserId;
      const startedVersion =
        mutationVersionRef.current;

      const request = (async () => {
        if (loadedOnceRef.current) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const [
            allResult,
            mineResult,
          ] = await Promise.all([
            loadCollection(
              requestedUserId,
              "all",
              getAllActivities
            ),
            loadCollection(
              requestedUserId,
              "mine",
              getMyActivities
            ),
          ]);

          // Descarta dados de outra sessão
          // ou anteriores a uma alteração.
          if (
            !mountedRef.current ||
            requestedUserId !==
              activeUserRef.current ||
            startedVersion !==
              mutationVersionRef.current
          ) {
            return;
          }

          setActivities(allResult.items);
          setMyActivities(mineResult.items);

          const offline =
            allResult.fromCache ||
            mineResult.fromCache;

          setUsingOfflineCache(offline);

          const cacheDates = [
            allResult,
            mineResult,
          ]
            .filter(
              (result) =>
                result.fromCache &&
                result.syncedAt !== null
            )
            .map(
              (result) =>
                result.syncedAt as string
            );

          setCachedAt(
            cacheDates.length > 0
              ? cacheDates.sort()[0]
              : null
          );

          setError(null);

          // Atualiza o SQLite somente quando
          // a API retornou os dados.
          const cacheWrites: Promise<void>[] = [];

          if (!allResult.fromCache) {
            cacheWrites.push(
              replaceCachedActivities(
                requestedUserId,
                "all",
                allResult.items
              )
            );
          }

          if (!mineResult.fromCache) {
            cacheWrites.push(
              replaceCachedActivities(
                requestedUserId,
                "mine",
                mineResult.items
              )
            );
          }

          await Promise.all(
            cacheWrites.map((write) =>
              write.catch((cacheError) => {
                console.error(
                  "Falha ao atualizar cache:",
                  cacheError
                );
              })
            )
          );
        } catch (requestError: unknown) {
          if (
            mountedRef.current &&
            requestedUserId ===
              activeUserRef.current &&
            startedVersion ===
              mutationVersionRef.current
          ) {
            setError(
              getApiErrorMessage(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current &&
            requestedUserId ===
              activeUserRef.current
          ) {
            loadedOnceRef.current = true;
            setLoading(false);
            setRefreshing(false);
          }
        }
      })();

      inFlightRefreshRef.current = request;

      const clearRequest = () => {
        if (
          inFlightRefreshRef.current === request
        ) {
          inFlightRefreshRef.current = null;
        }
      };

      void request.then(
        clearRequest,
        clearRequest
      );

      return request;
    },
    [currentUserId]
  );

  // ==================================================
  // CARREGAMENTO INICIAL
  // ==================================================

  useEffect(() => {
    mountedRef.current = true;

    // Invalida requisições anteriores.
    mutationVersionRef.current += 1;
    inFlightRefreshRef.current = null;
    loadedOnceRef.current = false;

    setActivities([]);
    setMyActivities([]);

    setLoading(true);
    setRefreshing(false);
    setError(null);

    setUsingOfflineCache(false);
    setCachedAt(null);

    interestLocksRef.current.clear();
    setInterestPendingIds([]);

    void refreshActivities().catch(() => {
      // Erro disponível no contexto.
    });

    return () => {
      mountedRef.current = false;
    };
  }, [refreshActivities]);

  // ==================================================
  // POST /activities
  // ==================================================

  async function addActivity(
    activity: NewActivity
  ): Promise<void> {
    if (!currentUserId) {
      throw new Error(
        "É necessário estar autenticado."
      );
    }

    if (usingOfflineCache) {
      throw new Error(
        "Não é possível criar atividades no modo offline."
      );
    }

    const title = activity.title.trim();
    const location = activity.location.trim();

    if (!title || !location) {
      throw new Error(
        "Informe o título e o local da atividade."
      );
    }

    const saved =
      await createActivityRequest({
        title,
        description:
          activity.description?.trim() ?? "",
        scheduledAt: toScheduledAt(
          activity.date,
          activity.time
        ),
        location,
      });

    const mapped = fromApiActivity(saved);

    mutationVersionRef.current += 1;

    setActivities((current) =>
      upsertActivity(current, mapped)
    );

    setMyActivities((current) =>
      upsertActivity(current, mapped)
    );

    setError(null);

    // Persiste após sucesso da API.
    try {
      await upsertCachedActivity(
        currentUserId,
        mapped
      );
    } catch (cacheError: unknown) {
      console.error(
        "Falha ao atualizar SQLite após criação:",
        cacheError
      );
    }
  }

  // ==================================================
  // PATCH /activities/:id
  // ==================================================

  async function updateActivity(
    id: string,
    changes: UpdateActivity
  ): Promise<boolean> {
    if (!currentUserId) {
      throw new Error(
        "É necessário estar autenticado."
      );
    }

    if (usingOfflineCache) {
      throw new Error(
        "Não é possível editar atividades no modo offline."
      );
    }

    const title = changes.title.trim();
    const location = changes.location.trim();

    if (!title || !location) {
      return false;
    }

    if (
      Number.isNaN(changes.date.getTime()) ||
      Number.isNaN(changes.time.getTime())
    ) {
      return false;
    }

    const updated =
      await updateActivityRequest(
        id,
        {
          title,
          description:
            changes.description?.trim(),
          scheduledAt: toScheduledAt(
            changes.date,
            changes.time
          ),
          location,
        }
      );

    const mapped = fromApiActivity(updated);

    mutationVersionRef.current += 1;

    setActivities((current) =>
      upsertActivity(current, mapped)
    );

    setMyActivities((current) =>
      upsertActivity(current, mapped)
    );

    setError(null);

    try {
      await upsertCachedActivity(
        currentUserId,
        mapped
      );
    } catch (cacheError: unknown) {
      console.error(
        "Falha ao atualizar SQLite após edição:",
        cacheError
      );
    }

    return true;
  }

  // ==================================================
  // PATCH /activities/:id/status
  // ==================================================

  async function toggleActivityCompleted(
    id: string
  ): Promise<void> {
    if (!currentUserId) {
      throw new Error(
        "É necessário estar autenticado."
      );
    }

    if (usingOfflineCache) {
      throw new Error(
        "Não é possível alterar o status no modo offline."
      );
    }

    const existing = myActivities.find(
      (activity) => activity.id === id
    );

    if (!existing) {
      throw new Error(
        "Atividade não encontrada."
      );
    }

    if (existing.ownerId !== currentUserId) {
      throw new Error(
        "Você não pode modificar esta atividade."
      );
    }

    const updated =
      await updateActivityStatusRequest(
        id,
        !existing.completed
      );

    const mapped = fromApiActivity(updated);

    mutationVersionRef.current += 1;

    setActivities((current) =>
      upsertActivity(current, mapped)
    );

    setMyActivities((current) =>
      upsertActivity(current, mapped)
    );

    setError(null);

    try {
      await upsertCachedActivity(
        currentUserId,
        mapped
      );
    } catch (cacheError: unknown) {
      console.error(
        "Falha ao atualizar SQLite após conclusão:",
        cacheError
      );
    }
  }

  // ==================================================
  // POST /activities/:id/interests
  // DELETE /activities/:id/interests/me
  // ==================================================

  async function toggleActivityInterest(
    id: string
  ): Promise<void> {
    if (!currentUserId) {
      throw new Error(
        "É necessário estar autenticado."
      );
    }

    if (usingOfflineCache) {
      throw new Error(
        "Não é possível alterar interesses no modo offline."
      );
    }

    const existing = activities.find(
      (activity) => activity.id === id
    );

    if (!existing) {
      throw new Error(
        "Atividade não encontrada."
      );
    }

    if (existing.ownerId === currentUserId) {
      throw new Error(
        "Você não pode demonstrar interesse na sua própria atividade."
      );
    }

    // Impede múltiplos toques simultâneos.
    if (interestLocksRef.current.has(id)) {
      return;
    }

    const requestedUserId = currentUserId;

    interestLocksRef.current.add(id);

    setInterestPendingIds((current) => [
      ...current,
      id,
    ]);

    try {
      let updated: Activity;

      if (existing.hasInterest) {
        // Retira o interesse no backend.
        // DELETE retorna 204, sem corpo JSON.
        await removeActivityInterestRequest(id);

        const interestedUsers =
          existing.interestedUsers.filter(
            (user) =>
              user.id !== requestedUserId
          );

        updated = {
          ...existing,
          interestedUsers,
          interestCount: Math.max(
            0,
            existing.interestCount - 1
          ),
          hasInterest: false,
        };
      } else {
        // Registra o interesse no backend.
        // POST retorna a atividade atualizada.
        const response =
          await addActivityInterestRequest(id);

        updated = fromApiActivity(response);
      }

      // Não modifica dados de outra conta.
      if (
        requestedUserId !==
        activeUserRef.current
      ) {
        return;
      }

      mutationVersionRef.current += 1;

      // Atualiza os cartões sem precisar
      // recarregar toda a Home.
      setActivities((current) =>
        replaceActivityIfPresent(
          current,
          updated
        )
      );

      setMyActivities((current) =>
        replaceActivityIfPresent(
          current,
          updated
        )
      );

      setError(null);

      // Mantém a cópia local sincronizada.
      try {
        await upsertCachedActivity(
          requestedUserId,
          updated
        );
      } catch (cacheError: unknown) {
        console.error(
          "Falha ao atualizar SQLite após alteração de interesse:",
          cacheError
        );
      }
    } finally {
      interestLocksRef.current.delete(id);

      if (
        requestedUserId ===
        activeUserRef.current
      ) {
        setInterestPendingIds((current) =>
          current.filter(
            (pendingId) =>
              pendingId !== id
          )
        );
      }
    }
  }

  // ==================================================
  // DELETE /activities/:id
  // ==================================================

  async function deleteActivity(
    id: string
  ): Promise<void> {
    if (!currentUserId) {
      throw new Error(
        "É necessário estar autenticado."
      );
    }

    if (usingOfflineCache) {
      throw new Error(
        "Não é possível excluir atividades no modo offline."
      );
    }

    // A API verifica se o usuário é o criador.
    await deleteActivityRequest(id);

    mutationVersionRef.current += 1;

    setActivities((current) =>
      current.filter(
        (activity) =>
          activity.id !== id
      )
    );

    setMyActivities((current) =>
      current.filter(
        (activity) =>
          activity.id !== id
      )
    );

    setError(null);

    try {
      await removeCachedActivity(
        currentUserId,
        id
      );
    } catch (cacheError: unknown) {
      console.error(
        "Falha ao remover atividade do SQLite:",
        cacheError
      );
    }
  }

  // ==================================================
  // PROVIDER
  // ==================================================

  return (
    <ActivitiesContext.Provider
      value={{
        currentUserId,

        activities,
        myActivities,

        showCompleted,
        preferencesReady,
        setShowCompleted,

        loading,
        refreshing,
        error,

        usingOfflineCache,
        cachedAt,

        interestPendingIds,
        toggleActivityInterest,

        refreshActivities,

        addActivity,
        updateActivity,
        toggleActivityCompleted,
        deleteActivity,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

// ==================================================
// HOOK
// ==================================================

export function useActivities() {
  const context = useContext(
    ActivitiesContext
  );

  if (!context) {
    throw new Error(
      "useActivities deve ser usado dentro de ActivitiesProvider."
    );
  }

  return context;
}
