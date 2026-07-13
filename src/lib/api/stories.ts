import type { PageResponse, Story, StoryStatus, StoryType } from "@/lib/types/stories";
import { apiClient } from "./client";

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

export async function getStories(params: {
  page?: number;
  size?: number;
  search?: string;
  type?: StoryType;
  status?: StoryStatus;
  isPublished?: boolean;
}) {
  const { data } = await apiClient.get<PageResponse<Story>>("/api/stories", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 12,
      search: params.search ?? "",
      type: params.type,
      status: params.status,
      isPublished: params.isPublished,
    },
  });
  return data.data.data;
}

export async function createStory(payload: {
  title: string;
  description?: string;
  coverImageUrl?: string;
  storyType: StoryType;
  status?: StoryStatus;
  isPublished?: boolean;
  freeChapterLimit?: number | null;
  viewCount?: number;
  coverImageFile?: File | null;
}) {
  const hasFile = Boolean(payload.coverImageFile);
  if (hasFile) {
    const formData = new FormData();
    formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    if (payload.coverImageFile) formData.append("coverImageFile", payload.coverImageFile);
    formData.append("storyType", payload.storyType);
    if (payload.status) formData.append("status", payload.status);
    if (payload.isPublished !== undefined) formData.append("isPublished", String(payload.isPublished));
    if (payload.freeChapterLimit !== null && payload.freeChapterLimit !== undefined) {
      formData.append("freeChapterLimit", String(payload.freeChapterLimit));
    }
    formData.append("viewCount", String(payload.viewCount ?? 0));
    const { data } = await apiClient.post<ApiStoryResponse>("/api/stories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  }

  const { data } = await apiClient.post<ApiStoryResponse>("/api/stories", {
    ...payload,
    viewCount: payload.viewCount ?? 0,
  });
  return data.data;
}

export async function updateStory(
  id: string,
  payload: {
    title?: string;
    description?: string;
    coverImageUrl?: string;
    storyType?: StoryType;
    status?: StoryStatus;
    isPublished?: boolean;
    freeChapterLimit?: number | null;
    viewCount?: number;
    coverImageFile?: File | null;
  },
) {
  const hasFile = Boolean(payload.coverImageFile);
  if (hasFile) {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    if (payload.coverImageFile) formData.append("coverImageFile", payload.coverImageFile);
    if (payload.storyType) formData.append("storyType", payload.storyType);
    if (payload.status) formData.append("status", payload.status);
    if (payload.isPublished !== undefined) formData.append("isPublished", String(payload.isPublished));
    if (payload.freeChapterLimit !== null && payload.freeChapterLimit !== undefined) {
      formData.append("freeChapterLimit", String(payload.freeChapterLimit));
    }
    if (payload.viewCount !== undefined) formData.append("viewCount", String(payload.viewCount));
    const { data } = await apiClient.patch<ApiStoryResponse>(`/api/stories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  }

  const { data } = await apiClient.patch<ApiStoryResponse>(`/api/stories/${id}`, payload);
  return data.data;
}

export async function deleteStory(id: string) {
  const { data } = await apiClient.delete<ApiMessageResponse>(`/api/stories/${id}`);
  return data.data;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  isPublished: boolean;
  pageCount: number;
  createdAt?: string;
  updatedAt?: string;
  content?: string;
}

export interface ChapterPage {
  id: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  width?: number;
  height?: number;
}

export async function getChapters(storyId: string, params?: { page?: number; size?: number; search?: string }) {
  const { data } = await apiClient.get<PageResponse<Chapter>>(`/api/stories/${storyId}/chapters`, {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 50,
      search: params?.search ?? "",
    },
  });
  return data;
}

export async function getChaptersBySlug(slug: string, params?: { page?: number; size?: number; search?: string }) {
  const { data } = await apiClient.get<PageResponse<Chapter>>(`/api/stories/${slug}/chapters`, {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 50,
      search: params?.search ?? "",
    },
  });
  return data;
}

export async function createChapter(
  storyId: string,
  payload: {
    chapterNumber?: number;
    title?: string;
    isPublished?: boolean;
  },
) {
  const { data } = await apiClient.post<ApiChapterResponse>(`/api/stories/${storyId}/chapters`, {
    chapterNumber: payload.chapterNumber,
    title: payload.title,
    isPublished: payload.isPublished ?? false,
  });
  return data.data;
}

export async function uploadChapterPages(
  chapterId: string,
  files: File[],
  pageRequests: { pageNumber: number; isNewPage?: boolean }[],
) {
  const formData = new FormData();
  const requests = files.map((_, i) => ({
    chapterId,
    pageNumber: pageRequests[i]?.pageNumber ?? i + 1,
    isNewPage: pageRequests[i]?.isNewPage ?? true,
  }));
  formData.append(
    "chapterPageRequests",
    new Blob([JSON.stringify(requests)], {
      type: "application/json",
    }),
  );

  formData.append("chapterId", chapterId);

  files.forEach((file) => formData.append("files", file));
  const { data } = await apiClient.post("/api/chapters/pages", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data ?? [];
}

export async function updateChapterContent(chapterId: string, content: string) {
  const { data } = await apiClient.patch<ApiChapterResponse>(`/api/chapters/${chapterId}/update-content`, {
    content,
  });
  return data.data;
}

export async function updateChapter(
  chapterId: string,
  payload: {
    chapterNumber?: number;
    title?: string;
    isPublished?: boolean;
    pageCount?: number;
    content?: string;
    pages?: unknown[];
  },
) {
  const { data } = await apiClient.patch<ApiChapterResponse>(`/api/chapters/${chapterId}`, payload);
  return data.data;
}

export async function deleteChapter(chapterId: string) {
  const { data } = await apiClient.delete<ApiMessageResponse>(`/api/chapters/${chapterId}`);
  return data.data;
}

export async function getChapter(chapterId: string) {
  const { data } = await apiClient.get<{ code: number; message: string; data: Chapter }>(`/api/chapters/${chapterId}`);
  return data.data;
}

export async function getChapterPages(chapterId: string) {
  const { data } = await apiClient.get<{ code: number; message: string; data: ChapterPage[] }>(
    `/api/chapters/${chapterId}/pages`,
  );
  return data.data;
}

export async function deleteAllPages(chapterId: string) {
  const { data } = await apiClient.delete<ApiMessageResponse>(`/api/chapters/${chapterId}/page`);
  return data.data;
}

export async function requestPublish(storyId: string, requesterNote?: string) {
  const { data } = await apiClient.post<{
    code: number;
    message: string;
    data: {
      id: string;
      requesterNote?: string;
      reviewerNote?: string;
      status: string;
    };
  }>(`/api/stories/${storyId}/publish-requests`, {
    requesterNote,
  });
  return data.data;
}

export async function getMyInfo() {
  const { data } = await apiClient.get<{
    code: number;
    data: { id: string; email: string; username: string; avatarUrl?: string; roles?: string[] };
  }>("/api/users/me");
  return data.data;
}

export async function uploadStoryCover(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ code: number; message: string; data: { url: string } }>(
    "/api/stories/upload-cover",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.data.url;
}

interface ApiStoryResponse {
  code: number;
  message: string;
  data: Story;
}

interface ApiChapterResponse {
  code: number;
  message: string;
  data: Chapter;
}

interface ApiMessageResponse {
  code: number;
  message: string;
  data: string;
}
