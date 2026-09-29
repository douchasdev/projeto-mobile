export type Activity = {
  id: string;
  title: string;
  date: Date;
  time: Date;
  location: string;
  completed: boolean;
};

export type NewActivity = Omit<Activity, 'id' | 'completed'>;