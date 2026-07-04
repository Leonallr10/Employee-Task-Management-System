import type {
  AuthResponse,
  LoginPayload,
  MeResponse,
  RegisterPayload,
} from "../types/auth";
import api from "./axios";

export async function registerUser(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}

export async function fetchCurrentUser(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}
