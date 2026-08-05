import type { Banner } from "@/lib/types/stories";
import { apiClient } from "./client";

// ============ Banners ============

export interface Banner {
  id: string;
  title: string;
  bannerUrl: string;
  linkUrl?: string;
  position: "HOME_HERO" | "POPUP";
  sortOrder: number;
  isActive: boolean;
  clickCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getActiveBanners(): Promise<Banner[]> {
  const { data } = await apiClient.get<{ code: number; data: Banner[] }>("/api/banners/active");
  return data.data;
}

export async function getBannerById(id: string): Promise<Banner | null> {
  try {
    const { data } = await apiClient.get<{ code: number; data: Banner }>(`/api/banners/${id}`);
    return data.data;
  } catch {
    return null;
  }
}

export async function getAllBanners(params?: { page?: number; size?: number; isActive?: boolean }) {
  const { data } = await apiClient.get<{ code: number; data: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    data: Banner[];
  }}>("/api/banners", {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
      isActive: params?.isActive,
    },
  });
  return data.data;
}

export async function createBanner(payload: {
  title: string;
  linkUrl?: string;
  bannerUrl?: string;
  imageFile?: File;
  position: "HOME_HERO" | "POPUP";
  sortOrder?: number;
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.linkUrl) formData.append("linkUrl", payload.linkUrl);
  if (payload.bannerUrl) formData.append("bannerUrl", payload.bannerUrl);
  if (payload.imageFile) formData.append("imageFile", payload.imageFile);
  formData.append("position", payload.position);
  if (payload.sortOrder !== undefined) formData.append("sortOrder", String(payload.sortOrder));

  const { data } = await apiClient.post<{ code: number; data: Banner }>("/api/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateBanner(id: string, payload: {
  title: string;
  linkUrl?: string;
  bannerUrl?: string;
  imageFile?: File;
  position: "HOME_HERO" | "POPUP";
  sortOrder: number;
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.linkUrl) formData.append("linkUrl", payload.linkUrl);
  if (payload.bannerUrl) formData.append("bannerUrl", payload.bannerUrl);
  if (payload.imageFile) formData.append("imageFile", payload.imageFile);
  formData.append("position", payload.position);
  formData.append("sortOrder", String(payload.sortOrder));

  const { data } = await apiClient.put<{ code: number; data: Banner }>(`/api/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateBannerStatus(id: string, active: boolean) {
  const { data } = await apiClient.patch<{ code: number; data: Banner }>(`/api/banners/${id}/status`, {
    active,
  });
  return data.data;
}

export async function deleteBanner(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/banners/${id}`);
  return data;
}
