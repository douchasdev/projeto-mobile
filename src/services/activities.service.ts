
import { api } from "./api";

import type {
  ApiActivity,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "../types/ApiActivity";

// ==================================================
// GET /activities
// ==================================================

export async function getAllActivities():
  Promise<ApiActivity[]> {
  const response = await api.get<ApiActivity[]>(
    "/activities"
  );

  return response.data;
}

// ==================================================
// GET /activities/my
// ==================================================

export async function getMyActivities():
  Promise<ApiActivity[]> {
  const response = await api.get<ApiActivity[]>(
    "/activities/my"
  );

  return response.data;
}

// ==================================================
// POST /activities
// ==================================================

export async function createActivityRequest(
  data: CreateActivityPayload
): Promise<ApiActivity> {
  const response = await api.post<ApiActivity>(
    "/activities",
    data
  );

  return response.data;
}

// ==================================================
// PATCH /activities/:id
// ==================================================

export async function updateActivityRequest(
  id: string,
  data: UpdateActivityPayload
): Promise<ApiActivity> {
  const response = await api.patch<ApiActivity>(
    `/activities/${id}`,
    data
  );

  return response.data;
}

// ==================================================
// PATCH /activities/:id/status
// ==================================================

export async function updateActivityStatusRequest(
  id: string,
  completed: boolean
): Promise<ApiActivity> {
  const response = await api.patch<ApiActivity>(
    `/activities/${id}/status`,
    { completed }
  );

  return response.data;
}

// ==================================================
// DELETE /activities/:id
// ==================================================

export async function deleteActivityRequest(
  id: string
): Promise<void> {
  await api.delete(`/activities/${id}`);
}

// ==================================================
// POST /activities/:id/interests
// ==================================================

// O backend obtém o ID do interessado pelo JWT.
// Retorna a atividade com a lista atualizada.
export async function addActivityInterestRequest(
  id: string
): Promise<ApiActivity> {
  const response = await api.post<ApiActivity>(
    `/activities/${id}/interests`
  );

  return response.data;
}

// ==================================================
// DELETE /activities/:id/interests/me
// ==================================================

// O backend remove o interesse do usuário
// autenticado e retorna HTTP 204.
export async function removeActivityInterestRequest(
  id: string
): Promise<void> {
  await api.delete(
    `/activities/${id}/interests/me`
  );
}
