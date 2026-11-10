
import type { Activity } from "../types/Activity";
import type { ApiActivity } from "../types/ApiActivity";

// Converte data e horário selecionados no aplicativo
// para o formato ISO utilizado pela API.
export function toScheduledAt(
  date: Date,
  time: Date
): string {
  const scheduledAt = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0
  );

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Data ou horário inválido.");
  }

  return scheduledAt.toISOString();
}

// Converte uma atividade recebida do NestJS
// para o formato utilizado no React Native.
export function fromApiActivity(
  activity: ApiActivity
): Activity {
  const scheduledAt = new Date(activity.scheduledAt);
  const interestedUsers = activity.interestedUsers ?? [];

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Data inválida recebida da API.");
  }

  return {
    id: activity.id,
    ownerId: activity.ownerId,

    owner: activity.owner ?? {
      id: activity.ownerId,
      name: "Criador não informado",
    },

    title: activity.title,
    description: activity.description ?? "",

    date: new Date(scheduledAt),
    time: new Date(scheduledAt),

    location: activity.location,
    completed: activity.completed,

    interestedUsers,

    interestCount:
      activity.interestCount ??
      interestedUsers.length,

    hasInterest: activity.hasInterest ?? false,
  };
}
