import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import {
  Activity,
  NewActivity,
} from '../types/Activity';

type ActivitiesContextData = {
  activities: Activity[];

  showCompleted: boolean;

  addActivity: (activity: NewActivity) => void;

  toggleActivityCompleted: (id: string) => void;

  setShowCompleted: (value: boolean) => void;
};

type ActivitiesProviderProps = {
  children: ReactNode;
};

const ActivitiesContext =
  createContext<ActivitiesContextData | undefined>(undefined);

export function ActivitiesProvider({
  children,
}: ActivitiesProviderProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const [showCompleted, setShowCompleted] =
    useState(true);

  function addActivity(activity: NewActivity) {
    const newActivity: Activity = {
      ...activity,

      id: `${Date.now()}-${Math.random()}`,

      completed: false,
    };

    setActivities((currentActivities) => [
      ...currentActivities,
      newActivity,
    ]);
  }

  function toggleActivityCompleted(id: string) {
    setActivities((currentActivities) =>
      currentActivities.map((activity) =>
        activity.id === id
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
        activities,

        showCompleted,

        addActivity,

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
      'useActivities deve ser utilizado dentro de ActivitiesProvider.'
    );
  }

  return context;
}