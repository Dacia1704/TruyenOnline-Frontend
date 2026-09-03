import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse, AuthTokenResponse, RefreshTokenResponse } from "../types/api";
import { LoginResponse } from "../types/auth";
import { toast } from "@/lib/toast";
import { getSessionId } from "./session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ============ Device ID ============

const DEVICE_ID_KEY = "deviceId";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;

const failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });

  failedQueue.length = 0;
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Device-ID for tracking
    const deviceId = getDeviceId();
    if (deviceId) {
      config.headers["Device-Id"] = deviceId;
    }

    // Add session ID for guest users
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers["Session-Id"] = sessionId;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequest;

    if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");

        // Không có refresh token = khách (guest), không redirect về login
        // Chỉ cần hiển thị lỗi, các API công khai không yêu cầu login
        if (!refreshToken) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(apiClient(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await refreshClient.post<ApiResponse<RefreshTokenResponse>>("/auth/refresh", {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          setAccessToken(accessToken);
          setRefreshToken(newRefreshToken);
          processQueue(null, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          clearTokens();
          window.location.href = "/login";

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }

    const message =
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      "Đã xảy ra lỗi. Vui lòng thử lại.";

    toast.error(message);

    return Promise.reject(error);
  },
);

export function setAccessToken(token: string) {
  localStorage.setItem("accessToken", token);
}

export function setRefreshToken(token: string) {
  localStorage.setItem("refreshToken", token);
}

export function setUserInfo(userInfo: LoginResponse | AuthTokenResponse) {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

export function getUserInfo(): LoginResponse | null {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
}
