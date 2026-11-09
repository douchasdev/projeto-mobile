
import type { ApiActivity } from "../types/ApiActivity";

// Converte data + horário selecionados no aplicativo
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
    throw new Error(
      "Data ou horário inválido."
    );
  }

  return scheduledAt.toISOString();
}

// Converte uma atividade recebida do MySQL
// para o formato usado pelos componentes do app.
export function fromApiActivity(
  activity: ApiActivity
) {
  const scheduledAt = new Date(
    activity.scheduledAt
  );

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description ?? "",
    date: new Date(scheduledAt),
    time: new Date(scheduledAt),
    location: activity.location,
    completed: activity.completed,
    ownerId: activity.ownerId,
  };
}
