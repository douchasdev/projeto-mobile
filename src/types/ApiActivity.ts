
export type ApiActivity = {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  location: string;
  completed: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;

  owner: {
    id: string;
    name: string;
  };
};

export type CreateActivityPayload = {
  title: string;
  description?: string;
  scheduledAt: string;
  location: string;
};

export type UpdateActivityPayload =
  Partial<CreateActivityPayload>;
