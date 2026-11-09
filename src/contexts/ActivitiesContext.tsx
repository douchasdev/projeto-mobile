
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import type {
  Activity,
  NewActivity,
  UpdateActivity,
} from "../types/Activity";

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

type ActivitiesContextData = {
  currentUserId: string;

  activities: Activity[];
  myActivities: Activity[];

  showCompleted: boolean;
  setShowCompleted: (value: boolean) => void;

  loading: boolean;
  refreshing: boolean;
  error: string | null;

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

const ActivitiesContext = createContext<
  ActivitiesContextData | undefined
>(undefined);

// Insere ou substitui uma atividade,
// mantendo a ordenação por data e horário.
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

export function ActivitiesProvider({
  children,
}: ActivitiesProviderProps) {
  const { user } = useAuth();

  const currentUserId = user?.id ?? "";

  const [activities, setActivities] = useState<
    Activity[]
  >([]);

  const [myActivities, setMyActivities] = useState<
    Activity[]
  >([]);

  const [showCompleted, setShowCompleted] =
    useState(true);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  // Evita atualizar o estado depois do
  // desmonte do provider.
  const mountedRef = useRef(false);

  // Diferencia a primeira carga das
  // atualizações posteriores.
  const loadedOnceRef = useRef(false);

  // Evita buscas duplicadas em andamento.
  const inFlightRefreshRef = useRef<
    Promise<void> | null
  >(null);

  // Impede que uma resposta antiga sobrescreva
  // uma alteração realizada mais recentemente.
  const mutationVersionRef = useRef(0);

  // Busca todas as atividades e as do usuário.
  const refreshActivities =
    useCallback((): Promise<void> => {
      if (inFlightRefreshRef.current) {
        return inFlightRefreshRef.current;
      }

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
          const [allFromApi, mineFromApi] =
            await Promise.all([
              getAllActivities(),
              getMyActivities(),
            ]);

          // Desconsidera resultados obsoletos.
          if (
            !mountedRef.current ||
            startedVersion !==
              mutationVersionRef.current
          ) {
            return;
          }

          setActivities(
            allFromApi.map(fromApiActivity)
          );

          setMyActivities(
            mineFromApi.map(fromApiActivity)
          );
        } catch (err: unknown) {
          if (mountedRef.current) {
            setError(
              getApiErrorMessage(err)
            );
          }

          throw err;
        } finally {
          if (mountedRef.current) {
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
    }, []);

  // Carrega as atividades quando o usuário
  // entra na área autenticada do aplicativo.
  useEffect(() => {
    mountedRef.current = true;

    void refreshActivities().catch(() => {
      // A mensagem já foi registrada no estado error.
    });

    return () => {
      mountedRef.current = false;
    };
  }, [refreshActivities]);

  // POST /activities
  async function addActivity(
    activity: NewActivity
  ): Promise<void> {
    const title = activity.title.trim();
    const location = activity.location.trim();

    if (!title || !location) {
      throw new Error(
        "Informe o título e o local da atividade."
      );
    }

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

    setActivities((current) =>
      upsertActivity(current, mapped)
    );

    setMyActivities((current) =>
      upsertActivity(current, mapped)
    );

    setError(null);
  }

  // PATCH /activities/:id
  async function updateActivity(
    id: string,
    changes: UpdateActivity
  ): Promise<boolean> {
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

    const updated = await updateActivityRequest(
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

    return true;
  }

  // PATCH /activities/:id/status
  async function toggleActivityCompleted(
    id: string
  ): Promise<void> {
    const existing = activities.find(
      (activity) => activity.id === id
    );

    if (!existing) {
      throw new Error(
        "Atividade não encontrada na lista."
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
  }

  // DELETE /activities/:id
  async function deleteActivity(
    id: string
  ): Promise<void> {
    // O backend verifica novamente o proprietário.
    await deleteActivityRequest(id);

    mutationVersionRef.current += 1;

    setActivities((current) =>
      current.filter(
        (activity) => activity.id !== id
      )
    );

    setMyActivities((current) =>
      current.filter(
        (activity) => activity.id !== id
      )
    );

    setError(null);
  }

  return (
    <ActivitiesContext.Provider
      value={{
        currentUserId,

        activities,
        myActivities,

        showCompleted,
        setShowCompleted,

        loading,
        refreshing,
        error,

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

export function useActivities() {
  const context = useContext(
    ActivitiesContext
  );

  if (!context) {
    throw new Error(
      "useActivities deve ser utilizado dentro de ActivitiesProvider."
    );
  }

  return context;
}
