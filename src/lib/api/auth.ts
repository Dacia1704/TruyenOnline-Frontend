import type {
  ApiResponse,
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenResponse,
} from "@/lib/types/api";
import { apiClient, refreshClient } from "./client";

export interface SocialAccount {
  provider: "GOOGLE" | "FACEBOOK" | "LOCAL";
  linked: boolean;
}

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

export async function loginWithGoogle(data: GoogleLoginRequest) {
  const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(
    "/auth/google",
    data,
  );
  return response.data;
}

export async function logout(refreshToken: string) {
  const response = await apiClient.post<ApiResponse<string>>("/auth/logout", {
    refreshToken,
  });
  return response.data;
}

export async function logoutAllDevices() {
  const response = await apiClient.post<ApiResponse<string>>("/auth/logout/all");
  return response.data;
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  const refreshTokenValue = localStorage.getItem("refreshToken");
  if (!refreshTokenValue) {
    throw new Error("No refresh token");
  }
  const response = await refreshClient.post<ApiResponse<RefreshTokenResponse>>("/auth/refresh", {
    refreshToken: refreshTokenValue,
  });
  return response.data.data;
}

export async function forgotPassword(data: ForgotPasswordRequest) {
  const response = await apiClient.post<ApiResponse<string>>(
    "/auth/forgot-password",
    data,
  );
  return response.data;
}

export async function resetPassword(data: ResetPasswordRequest) {
  const response = await apiClient.post<ApiResponse<string>>(
    "/auth/reset-password",
    data,
  );
  return response.data;
}

// ============ Social Account Linking ============

export async function linkGoogleAccount(idToken: string) {
  const response = await apiClient.post<ApiResponse<string>>(
    "/auth/link/google",
    { idToken },
  );
  return response.data;
}

export async function unlinkGoogleAccount() {
  const response = await apiClient.delete<ApiResponse<string>>(
    "/auth/link/google",
  );
  return response.data;
}

export async function getMySocialAccounts(): Promise<SocialAccount[]> {
  const response = await apiClient.get<ApiResponse<SocialAccount[]>>(
    "/auth/providers",
  );
  return response.data.data;
}
