import { api } from "../../services/axiosInstance";
import type { LoginRequest, LoginResponse } from "./auth.types";

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("JWT parse edilemedi", e);
    return null;
  }
}

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", data);
  const token = res.data;

  const payload = parseJwt(token);

  const user = {
    id: payload.userId,
    email: payload.email,
    username: payload.username || payload.sub,
    role: payload.role || "USER",
  };

  localStorage.setItem("accessToken", token);

  return {
    accessToken: token,
    user,
  };
};
// Burası Düzeltilecek!!!!!!!!!!!!!!
export const signupApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/signup", data);
  
  const token = res.data;
  const payload = parseJwt(token);

  const user = {
    id: payload.userId,
    email: payload.email,
    username: payload.username || payload.sub,
    role: payload.role || "USER",
  };
  
  localStorage.setItem("accessToken", token);
  
  return { 
    accessToken: token,
    user 
  };
};

export const refreshApi = async (): Promise<LoginResponse> => {
  const res = await api.post("/auth/refresh");
  
  const token = res.data;
  const payload = parseJwt(token);

  const user = {
    id: payload.sub || payload.userId || payload.id,
    email: payload.email,
    username: payload.username || payload.sub,
    role: payload.role || "USER",
  };
  
  localStorage.setItem("accessToken", token);
  
  return { 
    accessToken: token,
    user 
  };
};

export const logoutApi = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("accessToken");
};