import type { PageResponse, Story, StoryPublishRequestResponse, StoryStatus, StoryType, StoryPublishRequestStatus, Chapter, ChapterPage, User } from "@/lib/types/stories";
import { apiClient } from "./client";

// ============ Stories ============

export async function getStories(params: {
  page?: number;
  size?: number;
  search?: string;
  uploaderId?: string;
  type?: StoryType;
  status?: StoryStatus;
  isPublished?: boolean;
}) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<Story> }>("/api/stories", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 12,
      search: params.search ?? "",
      uploaderId: params.uploaderId ?? undefined,
      type: params.type,
      status: params.status,
      isPublished: params.isPublished,
    },
  });
  return data.data;
}

export async function getStory(slug: string) {
  const { data } = await apiClient.get<{ code: number; data: Story }>(`/api/stories/${slug}`);
  return data.data;
}

export async function createStory(payload: {
  title: string;
  description?: string;
  coverImageUrl?: string;
  storyType: StoryType;
  status?: StoryStatus;
  isPublished?: boolean;
  freeChapterLimit?: number | null;
  coverImageFile?: File | null;
}) {
  if (payload.coverImageFile) {
    const formData = new FormData();
    formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    formData.append("coverImageFile", payload.coverImageFile);
    formData.append("storyType", payload.storyType);
    if (payload.status) formData.append("status", payload.status);
    if (payload.isPublished !== undefined) formData.append("isPublished", String(payload.isPublished));
    if (payload.freeChapterLimit !== null && payload.freeChapterLimit !== undefined) {
      formData.append("freeChapterLimit", String(payload.freeChapterLimit));
    }
    const { data } = await apiClient.post<{ code: number; data: Story }>("/api/stories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  }

  const { data } = await apiClient.post<{ code: number; data: Story }>("/api/stories", {
    title: payload.title,
    description: payload.description,
    coverImageUrl: payload.coverImageUrl,
    storyType: payload.storyType,
    status: payload.status,
    isPublished: payload.isPublished,
    freeChapterLimit: payload.freeChapterLimit,
  });
  return data.data;
}

export async function updateStory(id: string, payload: Partial<{
  title: string;
  description: string;
  coverImageUrl: string;
  storyType: StoryType;
  status: StoryStatus;
  isPublished: boolean;
  freeChapterLimit: number | null;
  coverImageFile: File;
}>) {
  if (payload.coverImageFile) {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    formData.append("coverImageFile", payload.coverImageFile);
    if (payload.storyType) formData.append("storyType", payload.storyType);
    if (payload.status) formData.append("status", payload.status);
    if (payload.isPublished !== undefined) formData.append("isPublished", String(payload.isPublished));
    if (payload.freeChapterLimit !== null && payload.freeChapterLimit !== undefined) {
      formData.append("freeChapterLimit", String(payload.freeChapterLimit));
    }
    const { data } = await apiClient.patch<{ code: number; data: Story }>(`/api/stories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  }

  const { data } = await apiClient.patch<{ code: number; data: Story }>(`/api/stories/${id}`, payload);
  return data.data;
}

export async function deleteStory(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/stories/${id}`);
  return data;
}

export async function banStory(id: string) {
  const { data } = await apiClient.patch<{ code: number; data: Story }>(`/api/stories/${id}/ban`);
  return data.data;
}

export async function unbanStory(id: string) {
  const { data } = await apiClient.patch<{ code: number; data: Story }>(`/api/stories/${id}/unban`);
  return data.data;
}

// ============ Chapters ============

export async function getChapters(storyId: string, params?: { page?: number; size?: number; search?: string }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<Chapter> }>(`/api/stories/${storyId}/chapters`, {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 50,
      search: params?.search ?? "",
    },
  });
  return data.data;
}

export async function getChaptersBySlug(slug: string, params?: { page?: number; size?: number; search?: string }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<Chapter> }>(`/api/stories/${slug}/chapters`, {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 50,
      search: params?.search ?? "",
    },
  });
  return data.data;
}

export async function createChapter(storyId: string, payload: { chapterNumber?: number; title?: string; isPublished?: boolean }) {
  const { data } = await apiClient.post<{ code: number; data: Chapter }>(`/api/stories/${storyId}/chapters`, {
    chapterNumber: payload.chapterNumber,
    title: payload.title,
    isPublished: payload.isPublished ?? false,
  });
  return data.data;
}

export async function getChapter(chapterId: string) {
  const { data } = await apiClient.get<{ code: number; data: Chapter }>(`/api/chapters/${chapterId}`);
  return data.data;
}

export async function updateChapter(chapterId: string, payload: Partial<{
  chapterNumber: number;
  title: string;
  isPublished: boolean;
}>) {
  const { data } = await apiClient.patch<{ code: number; data: Chapter }>(`/api/chapters/${chapterId}`, payload);
  return data.data;
}

export async function updateChapterContent(chapterId: string, content: string) {
  const { data } = await apiClient.patch<{ code: number; data: Chapter }>(`/api/chapters/${chapterId}/update-content`, { content });
  return data.data;
}

export async function updateChapterPublishStatus(chapterIds: string[], publishStatus: boolean) {
  const { data } = await apiClient.patch<{ code: number; message: string }>(`/api/chapters/update-publish-status`, {
    chapterIdList: chapterIds,
    publishStatus,
  });
  return data;
}

export async function deleteChapter(chapterId: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/chapters/${chapterId}`);
  return data;
}

// ============ Chapter Pages ============

export async function getChapterPages(chapterId: string) {
  const { data } = await apiClient.get<{ code: number; data: ChapterPage[] }>(`/api/chapters/${chapterId}/pages`);
  return data.data;
}

export async function uploadChapterPages(chapterId: string, files: File[], pageRequests: { pageNumber: number }[]) {
  const formData = new FormData();
  formData.append("chapterId", chapterId);
  const requests = files.map((_, i) => ({
    chapterId,
    pageNumber: pageRequests[i]?.pageNumber ?? i + 1,
  }));
  formData.append("chapterPageRequests", new Blob([JSON.stringify(requests)], { type: "application/json" }));
  files.forEach((file) => formData.append("files", file));
  const { data } = await apiClient.post<{ code: number; data: ChapterPage[] }>("/api/chapters/pages", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data ?? [];
}

export async function deleteAllPages(chapterId: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/chapters/${chapterId}/page`);
  return data;
}

// ============ Publish Requests ============

export async function requestPublish(storyId: string, requesterNote?: string) {
  const { data } = await apiClient.post<{ code: number; data: StoryPublishRequestResponse }>(
    `/api/stories/${storyId}/publish-requests`,
    { requesterNote }
  );
  return data.data;
}

export async function getMyPublishRequests(params?: { page?: number; size?: number; status?: StoryPublishRequestStatus }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<StoryPublishRequestResponse> }>(
    "/api/stories/publish-requests/me",
    {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        ...(params?.status ? { status: params.status } : {}),
      },
    }
  );
  return data.data.data;
}

export async function getPublishRequests(params?: { page?: number; size?: number; status?: StoryPublishRequestStatus; uploaderId?: string }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<StoryPublishRequestResponse> }>(
    "/api/stories/publish-requests",
    {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.uploaderId ? { uploaderId: params.uploaderId } : {}),
      },
    }
  );
  return data.data.data;
}

export async function approvePublishRequest(id: string, reviewerNote?: string) {
  const { data } = await apiClient.patch<{ code: number; data: StoryPublishRequestResponse }>(
    `/api/stories/publish-requests/approve/${id}`,
    { reviewerNote }
  );
  return data.data;
}

export async function rejectPublishRequest(id: string, reviewerNote?: string) {
  const { data } = await apiClient.patch<{ code: number; data: StoryPublishRequestResponse }>(
    `/api/stories/publish-requests/reject/${id}`,
    { reviewerNote }
  );
  return data.data;
}

export async function deletePublishRequest(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/api/stories/publish-requests/${id}`);
  return data;
}

// ============ User Info ============

export async function getMyInfo() {
  const { data } = await apiClient.get<{ code: number; data: User }>("/api/users/me");
  return data.data;
}

// ============ Upload ============

export async function uploadStoryCover(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ code: number; data: { url: string } }>(
    "/api/stories/upload-cover",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data.url;
}
