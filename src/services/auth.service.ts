
import { api } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

// POST /auth/register
export async function registerUser(
  data: RegisterData
): Promise<AuthUser> {
  const response = await api.post<AuthUser>(
    "/auth/register",
    data
  );

  return response.data;
}

// POST /auth/login
export async function loginUser(
  data: LoginData
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

// GET /auth/me
export async function getAuthenticatedUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/auth/me");

  return response.data;
}
