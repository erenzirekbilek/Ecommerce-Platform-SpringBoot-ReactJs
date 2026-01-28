export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role?: string;
}

export interface LoginResponse {
  user?: unknown; // ← Optional yap!
  accessToken: string;
}