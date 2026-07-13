import type { AdminUser, DashboardStats, PageResponse, Permission, Role } from "@/lib/types/stories";
import { apiClient } from "./client";

export async function getUsers(params: { page?: number; size?: number }) {
  const { data } = await apiClient.get<PageResponse<AdminUser>>("/api/users", {
    params: { page: params.page ?? 1, size: params.size ?? 10 },
  });
  return data;
}

export async function banUser(userId: string) {
  const { data } = await apiClient.patch(`/api/users/${userId}/ban`);
  return data;
}

export async function updateUserRoles(userId: string, roleIds: number[]) {
  const { data } = await apiClient.post(`/api/users/${userId}/roles`, {
    roles: roleIds,
  });
  return data;
}

export async function getRoles() {
  const { data } = await apiClient.get<{ code: number; data: Role[] }>("/api/admin/roles");
  return data.data;
}

export async function getPermissions() {
  const { data } = await apiClient.get<{ code: number; data: Permission[] }>("/api/admin/permissions");
  return data.data;
}

export async function getAdminDashboard() {
  const { data } = await apiClient.get<{ code: number; data: DashboardStats }>("/api/admin/dashboard");
  return data.data;
}

export interface Genre {
  id: number;
  name: string;
  description?: string;
}

export async function getGenres() {
  const { data } = await apiClient.get<{ code: number; data: Genre[] }>("/api/genres", {
    params: { search: "" },
  });
  return data.data;
}

export async function createGenre(payload: { name: string; description?: string }) {
  const { data } = await apiClient.post<{ code: number; message: string; data: Genre }>("/api/genres", payload);
  return data.data;
}

export async function updateGenre(id: number, payload: { name: string; description?: string }) {
  const { data } = await apiClient.patch<{ code: number; message: string; data: Genre }>(`/api/genres/${id}`, payload);
  return data.data;
}

export async function deleteGenre(id: number) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/genres/${id}`);
  return data;
}
