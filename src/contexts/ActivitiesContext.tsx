import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

import {
  Activity,
  NewActivity,
  UpdateActivity,
} from "../types/Activity";

// Identificador temporário até a implementação
// da autenticação no backend.
const DEMO_CURRENT_USER_ID = "local-user";

type ActivitiesContextData = {
  currentUserId: string;
  activities: Activity[];
  myActivities: Activity[];
  showCompleted: boolean;

  addActivity: (activity: NewActivity) => void;

  updateActivity: (
    id: string,
    changes: UpdateActivity
  ) => boolean;

  toggleActivityCompleted: (id: string) => void;

  setShowCompleted: (value: boolean) => void;
};

type ActivitiesProviderProps = {
  children: ReactNode;
};

const ActivitiesContext =
  createContext<ActivitiesContextData | undefined>(
    undefined
  );

export function ActivitiesProvider({
  children,
}: ActivitiesProviderProps) {
  const currentUserId = DEMO_CURRENT_USER_ID;

  const [activities, setActivities] = useState<
    Activity[]
  >([]);

  const [showCompleted, setShowCompleted] =
    useState(true);

  // Retorna apenas as atividades criadas
  // pelo usuário atual.
  const myActivities = activities.filter(
    (activity) => activity.ownerId === currentUserId
  );

  function addActivity(activity: NewActivity) {
    const newActivity: Activity = {
      ...activity,
      id: `${Date.now()}-${Math.random()}`,
      ownerId: currentUserId,
      completed: false,
    };

    setActivities((current) => [
      ...current,
      newActivity,
    ]);
  }

  function updateActivity(
    id: string,
    changes: UpdateActivity
  ): boolean {
    const existing = activities.find(
      (activity) => activity.id === id
    );

    // Somente o autor pode editar.
    // No backend, essa regra deverá ser
    // validada no servidor.
    if (
      !existing ||
      existing.ownerId !== currentUserId
    ) {
      return false;
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

    setActivities((current) =>
      current.map((activity) =>
        activity.id === id &&
        activity.ownerId === currentUserId
          ? {
              ...activity,
              ...changes,
              title,
              location,
            }
          : activity
      )
    );

    return true;
  }

  function toggleActivityCompleted(id: string) {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id &&
        activity.ownerId === currentUserId
          ? {
              ...activity,
              completed: !activity.completed,
            }
          : activity
      )
    );
  }

  return (
    <ActivitiesContext.Provider
      value={{
        currentUserId,
        activities,
        myActivities,
        showCompleted,
        addActivity,
        updateActivity,
        toggleActivityCompleted,
        setShowCompleted,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);

  if (!context) {
    throw new Error(
      "useActivities deve ser utilizado dentro de ActivitiesProvider."
    );
  }

  return context;
}