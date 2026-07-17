import type { PageResponse, User } from "@/lib/types/stories";
import { apiClient } from "./client";

// ============ Users ============

export async function getUsers(params: { page?: number; size?: number }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<User> }>("/api/users", {
    params: { page: params.page ?? 1, size: params.size ?? 20 },
  });
  return data.data;
}

export async function banUser(userId: string, reason?: string) {
  const { data } = await apiClient.patch<{ code: number; data: User }>(`/api/users/${userId}/ban`, {
    reason: reason ?? "No reason provided",
  });
  return data.data;
}

export async function unbanUser(userId: string, reason?: string) {
  const { data } = await apiClient.patch<{ code: number; data: User }>(`/api/users/${userId}/unban`, {
    reason: reason ?? "Unbanned",
  });
  return data.data;
}

export async function updateUserRoles(userId: string, roleIds: number[]) {
  const { data } = await apiClient.post<{ code: number; data: User }>(`/api/users/${userId}/roles`, {
    roles: roleIds,
  });
  return data.data;
}

// ============ Roles ============

export const ROLES = [
  { id: 1, name: "USER", description: "Người dùng thông thường" },
  { id: 2, name: "UPLOADER", description: "Người đăng nội dung" },
  { id: 3, name: "ADMIN", description: "Quản trị viên" },
];

export function getRoles() {
  return Promise.resolve(ROLES);
}

// ============ Genres ============

import type { Genre } from "@/lib/types/stories";

export async function getGenres() {
  const { data } = await apiClient.get<{ code: number; data: Genre[] }>("/api/genres", {
    params: { search: "" },
  });
  return data.data;
}

export async function createGenre(payload: { name: string }) {
  const { data } = await apiClient.post<{ code: number; data: Genre }>("/api/genres", payload);
  return data.data;
}

export async function updateGenre(id: number, payload: { name: string }) {
  const { data } = await apiClient.patch<{ code: number; data: Genre }>(`/api/genres/${id}`, payload);
  return data.data;
}

export async function deleteGenre(id: number) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/genres/${id}`);
  return data;
}
