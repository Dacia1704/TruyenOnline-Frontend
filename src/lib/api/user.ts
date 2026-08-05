import { apiClient } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { LoginResponse } from "@/lib/types/auth";

export async function upgradeToUploader(): Promise<ApiResponse<LoginResponse>> {
  const { data } = await apiClient.patch<ApiResponse<LoginResponse>>(
    "/api/users/me/upgrade-to-uploader",
  );
  return data;
}

export async function updateMyInfo(payload: {
  username?: string;
  email?: string;
  avatar?: File;
}) {
  const formData = new FormData();
  if (payload.username) formData.append("username", payload.username);
  if (payload.email) formData.append("email", payload.email);
  if (payload.avatar) formData.append("avatar", payload.avatar);

  const { data } = await apiClient.patch<{ code: number; data: LoginResponse }>(
    "/api/users/me",
    formData,
    {
      headers: { "Content-Type": undefined },
    } as never,
  );
  return data.data;
}
