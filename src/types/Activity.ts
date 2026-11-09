
export type Activity = {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  date: Date;
  time: Date;
  location: string;
  completed: boolean;
};

export type NewActivity = Omit<
  Activity,
  "id" | "ownerId" | "completed"
>;

export type UpdateActivity = Pick<
  Activity,
  "title" | "description" | "date" | "time" | "location"
>;
