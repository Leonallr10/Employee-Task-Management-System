export type UserRole = "admin" | "employee";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string | null;
  designation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    rememberMe?: boolean;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}
