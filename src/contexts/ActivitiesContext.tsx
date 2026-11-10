
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
  createActivityRequest,
  deleteActivityRequest,
  getAllActivities,
  getMyActivities,
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

// O SQLite só deve ser usado quando a API
// estiver indisponível, não quando ela negar acesso.
function canUseOfflineCache(
  requestError: unknown
): boolean {
  if (!axios.isAxiosError(requestError)) {
    return false;
  }

  const status = requestError.response?.status;

  // Falha de rede, timeout ou servidor inacessível.
  if (status === undefined) {
    return true;
  }

  // Alguns erros temporários de infraestrutura.
  if (status === 408 || status === 429) {
    return true;
  }

  // Erros do servidor.
  return status >= 500;
}

// Consulta a API primeiro e utiliza o SQLite
// somente quando a comunicação falha.
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
    // Não contorna 401, 403 ou outros erros
    // de requisição/autorização usando o cache.
    if (!canUseOfflineCache(requestError)) {
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

    // Sem cache disponível: mantém o erro da API.
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

  // Dados das atividades.
  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [myActivities, setMyActivities] =
    useState<Activity[]>([]);

  // Preferência persistida no AsyncStorage.
  const [
    showCompleted,
    setShowCompletedState,
  ] = useState(true);

  const [
    preferencesReady,
    setPreferencesReady,
  ] = useState(false);

  // Estados de carregamento da API.
  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // Estados do cache local.
  const [
    usingOfflineCache,
    setUsingOfflineCache,
  ] = useState(false);

  const [cachedAt, setCachedAt] =
    useState<string | null>(null);

  // Controle de requisições assíncronas.
  const mountedRef = useRef(false);
  const loadedOnceRef = useRef(false);

  const inFlightRefreshRef = useRef<
    Promise<void> | null
  >(null);

  const mutationVersionRef = useRef(0);

  // Evita aplicar dados de uma conta anterior.
  const activeUserRef =
    useRef(currentUserId);

  activeUserRef.current = currentUserId;

  // ==================================================
  // ASYNCSTORAGE — CARREGAR PREFERÊNCIA
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
  // ASYNCSTORAGE — SALVAR PREFERÊNCIA
  // ==================================================

  const setShowCompleted = useCallback(
    (value: boolean) => {
      if (
        !preferencesReady ||
        !currentUserId
      ) {
        return;
      }

      // Atualiza a interface.
      setShowCompletedState(value);

      const storageKey =
        `${SHOW_COMPLETED_STORAGE_KEY}:${currentUserId}`;

      // Persiste no armazenamento local.
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

      // Evita consultas duplicadas simultâneas.
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
          // Consulta as duas listas em paralelo.
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

          // Ignora resultados de outra conta,
          // de componentes desmontados ou de
          // consultas anteriores a uma mutação.
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

          // Identifica se alguma lista veio
          // do SQLite.
          const offline =
            allResult.fromCache ||
            mineResult.fromCache;

          setUsingOfflineCache(offline);

          // Recupera datas das cópias utilizadas.
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

          // Apresenta a sincronização mais antiga
          // quando duas listas usam o cache.
          setCachedAt(
            cacheDates.length > 0
              ? cacheDates.sort()[0]
              : null
          );

          setError(null);

          // Persiste somente as listas realmente
          // recebidas do servidor.
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

          // Uma falha do SQLite não pode invalidar
          // dados que vieram corretamente da API.
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
          inFlightRefreshRef.current ===
          request
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

    // Invalida consultas anteriores.
    mutationVersionRef.current += 1;
    inFlightRefreshRef.current = null;
    loadedOnceRef.current = false;

    // Limpa os dados que estavam na memória.
    setActivities([]);
    setMyActivities([]);

    setLoading(true);
    setRefreshing(false);
    setError(null);

    setUsingOfflineCache(false);
    setCachedAt(null);

    void refreshActivities().catch(() => {
      // O erro será disponibilizado no contexto.
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

    const title =
      activity.title.trim();

    const location =
      activity.location.trim();

    if (!title || !location) {
      throw new Error(
        "Informe o título e o local da atividade."
      );
    }

    // A criação continua sendo feita na API.
    const saved = await createActivityRequest({
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

    // Atualiza o estado em memória.
    setActivities((current) =>
      upsertActivity(current, mapped)
    );

    setMyActivities((current) =>
      upsertActivity(current, mapped)
    );

    setError(null);

    // Atualiza o SQLite somente depois
    // da confirmação do MySQL.
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

    const title =
      changes.title.trim();

    const location =
      changes.location.trim();

    if (!title || !location) {
      return false;
    }

    if (
      Number.isNaN(
        changes.date.getTime()
      ) ||
      Number.isNaN(
        changes.time.getTime()
      )
    ) {
      return false;
    }

    // Atualiza a atividade no MySQL.
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

    const mapped =
      fromApiActivity(updated);

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

    const existing =
      myActivities.find(
        (activity) =>
          activity.id === id
      );

    if (!existing) {
      throw new Error(
        "Atividade não encontrada."
      );
    }

    if (
      existing.ownerId !==
      currentUserId
    ) {
      throw new Error(
        "Você não pode modificar esta atividade."
      );
    }

    // A API continua sendo responsável
    // pela alteração do status.
    const updated =
      await updateActivityStatusRequest(
        id,
        !existing.completed
      );

    const mapped =
      fromApiActivity(updated);

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

    // A API verifica se o usuário
    // é proprietário da atividade.
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

    // Remove a cópia local após
    // confirmar a exclusão na API.
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
  const context =
    useContext(ActivitiesContext);

  if (!context) {
    throw new Error(
      "useActivities deve ser usado dentro de ActivitiesProvider."
    );
  }

  return context;
}
