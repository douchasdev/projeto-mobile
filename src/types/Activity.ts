
export type ActivityUser = {
  id: string;
  name: string;
};

export type Activity = {
  id: string;
  ownerId: string;
  owner: ActivityUser;
  title: string;
  description?: string;
  date: Date;
  time: Date;
  location: string;
  completed: boolean;
  interestedUsers: ActivityUser[];
  interestCount: number;
  hasInterest: boolean;
};

// Campos informados pelo usuário ao criar uma atividade.
// Proprietário e interessados vêm do backend.
export type NewActivity = Pick<
  Activity,
  "title" | "description" | "date" | "time" | "location"
>;

export type UpdateActivity = Pick<
  Activity,
  "title" | "description" | "date" | "time" | "location"
>;
