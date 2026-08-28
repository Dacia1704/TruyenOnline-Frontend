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

export async function updateUserRoles(userId: string, roleIds: string[]) {
  const { data } = await apiClient.post<{ code: number; data: User }>(`/api/users/${userId}/roles`, {
    roles: roleIds,
  });
  return data.data;
}

// ============ Roles ============

export async function getRoles() {
  const { data } = await apiClient.get<{ code: number; data: Role[] }>("/api/users/roles");
  return data.data;
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

// ============ Authors ============

export interface Author {
  id: string;
  name: string;
  nameNoAccent?: string;
  slug?: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
}

export async function getAuthors(params?: { page?: number; size?: number; search?: string }) {
  const { data } = await apiClient.get<{
    code: number;
    data: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      data: Author[];
    };
  }>("/api/authors", {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
      search: params?.search,
    },
  });
  return data.data;
}

export async function createAuthor(payload: { name: string; bio?: string; country?: string; avatarFile?: File }) {
  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.bio) formData.append("bio", payload.bio);
  if (payload.country) formData.append("country", payload.country);
  if (payload.avatarFile) formData.append("avatarFile", payload.avatarFile);

  const { data } = await apiClient.post<{ code: number; data: Author }>("/api/authors", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateAuthor(
  id: string,
  payload: {
    name?: string;
    bio?: string;
    country?: string;
    avatarFile?: File;
  },
) {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.bio !== undefined) formData.append("bio", payload.bio);
  if (payload.country !== undefined) formData.append("country", payload.country);
  if (payload.avatarFile) formData.append("avatarFile", payload.avatarFile);

  const { data } = await apiClient.patch<{ code: number; data: Author }>(`/api/authors/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function deleteAuthor(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/authors/${id}`);
  return data;
}
