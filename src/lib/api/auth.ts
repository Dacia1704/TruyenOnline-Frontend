import type {
  ApiResponse,
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
} from "@/lib/types/api";
import { apiClient } from "./client";

export async function login(data: LoginRequest) {
  const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(
    "/auth/login",
    data,
  );
  return response.data;
}

export async function register(data: RegisterRequest) {
  const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(
    "/auth/register",
    data,
  );
  return response.data;
}
