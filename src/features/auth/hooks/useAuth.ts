"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { login, register } from "@/lib/api/auth";
import {
  setAccessToken,
  setRefreshToken,
} from "@/lib/api/client";
import type { LoginRequest, RegisterRequest } from "@/lib/types/api";

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Đã xảy ra lỗi, vui lòng thử lại"
    );
  }
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi, vui lòng thử lại";
}

function saveAuthTokens(accessToken: string, refreshToken: string) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken } = response.data;
      saveAuthTokens(accessToken, refreshToken);
      router.push("/");
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken } = response.data;
      if (accessToken && refreshToken) {
        saveAuthTokens(accessToken, refreshToken);
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    },
  });
}

export { getErrorMessage };
