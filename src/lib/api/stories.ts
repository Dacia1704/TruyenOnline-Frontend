import type {
  PageResponse,
  Story,
  StoryPublishRequestResponse,
  StoryStatus,
  StoryType,
  StoryPublishRequestStatus,
  Chapter,
  ChapterPage,
  User,
  Bookmark,
  ReadingHistory,
  Comment,
} from "@/lib/types/stories";
import { apiClient } from "./client";

export type { StoryPublishRequestStatus };

// ============ Stories ============

export async function getStories(params: {
  page?: number;
  size?: number;
  search?: string;
  uploaderId?: string;
  type?: StoryType;
  status?: StoryStatus;
  isPublished?: boolean;
  sortType?: "NEWEST" | "UPDATED" | "VIEW" | "FOLLOW" | "ALPHABET_ASC" | "ALPHABET_DESC" | "OLDEST";
  genres?: string[];
}) {
  const { data } = await apiClient.post<{ code: number; data: PageResponse<Story> }>(
    "/stories/list",
    {
      search: params.search ?? "",
      uploaderId: params.uploaderId,
      type: params.type,
      status: params.status,
      isPublished: params.isPublished,
      sortType: params.sortType,
      genres: params.genres,
    },
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 12,
      },
    },
  );
  return data.data;
}

export async function getStoriesAdmin(params: {
  page?: number;
  size?: number;
  search?: string;
  uploaderId?: string;
  type?: StoryType;
  status?: StoryStatus;
  isPublished?: boolean;
  isBanned?: boolean;
  sortType?: "NEWEST" | "UPDATED" | "VIEW" | "FOLLOW" | "ALPHABET_ASC" | "ALPHABET_DESC" | "OLDEST";
  genres?: string[];
}) {
  const { data } = await apiClient.post<{ code: number; data: PageResponse<Story> }>(
    "/stories/list/admin",
    {
      search: params.search ?? "",
      uploaderId: params.uploaderId,
      type: params.type,
      status: params.status,
      isPublished: params.isPublished,
      isBanned: params.isBanned,
      sortType: params.sortType,
      genres: params.genres,
    },
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 12,
      },
    },
  );
  return data.data;
}

export async function getStoryBySlug(slug: string) {
  const { data } = await apiClient.get<{ code: number; data: Story }>(`/stories/slug/${slug}`);
  return data.data;
}

export async function getStoryById(id: string) {
  const { data } = await apiClient.get<{ code: number; data: Story }>(`/stories/id/${id}`);
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
  authors?: StoryAuthorUpdateRequest[];
  genreIds: number[];
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
    if (payload.authors) {
      formData.append("authors", JSON.stringify(payload.authors));
    }
    formData.append("genreIds", payload.genreIds.join(","));
    const { data } = await apiClient.post<{ code: number; data: Story }>("/stories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  }

  const { data } = await apiClient.post<{ code: number; data: Story }>("/stories", {
    title: payload.title,
    description: payload.description,
    coverImageUrl: payload.coverImageUrl,
    storyType: payload.storyType,
    status: payload.status,
    isPublished: payload.isPublished,
    freeChapterLimit: payload.freeChapterLimit,
    authors: payload.authors,
    genreIds: payload.genreIds,
  });
  return data.data;
}

export async function updateStory(
  id: string,
  payload: Partial<{
    title: string;
    description: string;
    coverImageUrl: string;
    storyType: StoryType;
    status: StoryStatus;
    isPublished: boolean;
    freeChapterLimit: number | null;
    viewCount: number;
    coverImageFile: File | null;
    authors: StoryAuthorUpdateRequest[];
    genreIds: number[];
  }>,
) {
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
    if (payload.viewCount !== undefined) formData.append("viewCount", String(payload.viewCount));
    if (payload.authors) formData.append("authors", JSON.stringify(payload.authors));
    if (payload.genreIds) formData.append("genreIds", payload.genreIds.join(","));
    const { data } = await apiClient.patch<{ code: number; data: Story }>(`/stories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  }

  const { data } = await apiClient.patch<{ code: number; data: Story }>(`/stories/${id}`, payload);
  return data.data;
}

export async function deleteStory(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/stories/${id}`);
  return data;
}

export async function banStory(id: string, violationType: ViolationType, reason: string) {
  const { data } = await apiClient.patch<{ code: number; data: Story }>(`/stories/${id}/ban`, {
    violationType,
    reason,
  });
  return data.data;
}

export async function unbanStory(id: string, reason: string) {
  const { data } = await apiClient.patch<{ code: number; data: Story }>(`/stories/${id}/unban`, {
    reason,
  });
  return data.data;
}

// ============ Chapters ============

export async function getChapters(
  storyId: string,
  params?: { page?: number; size?: number; search?: string; from?: number },
) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<Chapter> }>(
    `/stories/id/${storyId}/chapters`,
    {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 50,
        search: params?.search ?? "",
        from: params?.from,
      },
    },
  );
  return data.data;
}

export async function getChaptersBySlug(
  slug: string,
  params?: { page?: number; size?: number; search?: string; from?: number },
) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<Chapter> }>(
    `/stories/slug/${slug}/chapters`,
    {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 50,
        search: params?.search ?? "",
        from: params?.from,
      },
    },
  );
  return data.data;
}

export async function createChapter(
  storyId: string,
  payload: { chapterNumber?: number; title?: string; isPublished?: boolean },
) {
  const { data } = await apiClient.post<{ code: number; data: Chapter }>(`/stories/${storyId}/chapters`, {
    chapterNumber: payload.chapterNumber,
    title: payload.title,
    isPublished: payload.isPublished ?? false,
  });
  return data.data;
}

export async function getChapter(chapterId: string) {
  const { data } = await apiClient.get<{ code: number; data: Chapter }>(`/chapters/${chapterId}`);
  return data.data;
}

export async function updateChapter(
  chapterId: string,
  payload: Partial<{
    chapterNumber: number;
    title: string;
    isPublished: boolean;
  }>,
) {
  const { data } = await apiClient.patch<{ code: number; data: Chapter }>(`/chapters/${chapterId}`, payload);
  return data.data;
}

export async function updateChapterContent(chapterId: string, content: string) {
  const { data } = await apiClient.patch<{ code: number; data: Chapter }>(`/chapters/${chapterId}/update-content`, {
    content,
  });
  return data.data;
}

export async function updateChapterPublishStatus(chapterIds: string[], publishStatus: boolean) {
  const { data } = await apiClient.patch<{ code: number; message: string }>(`/chapters/update-publish-status`, {
    chapterIdList: chapterIds,
    publishStatus,
  });
  return data;
}

export async function deleteChapter(chapterId: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/chapters/${chapterId}`);
  return data;
}

export async function banChapter(chapterId: string, violationType: ViolationType, reason: string) {
  const { data } = await apiClient.patch<{ code: number; data: Chapter }>(`/chapters/${chapterId}/ban`, {
    violationType,
    reason,
  });
  return data.data;
}

export async function unbanChapter(chapterId: string, reason: string) {
  const { data } = await apiClient.patch<{ code: number; data: Chapter }>(`/chapters/${chapterId}/unban`, {
    reason,
  });
  return data.data;
}

// ============ Chapter Pages ============

export async function getChapterPages(chapterId: string) {
  const { data } = await apiClient.get<{ code: number; data: ChapterPage[] }>(`/chapters/${chapterId}/pages`);
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
  const { data } = await apiClient.post<{ code: number; data: ChapterPage[] }>("/chapters/pages", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data ?? [];
}

export async function deleteAllPages(chapterId: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/chapters/${chapterId}/page`);
  return data;
}

// ============ Publish Requests ============

export async function requestPublish(storyId: string, requesterNote?: string) {
  const { data } = await apiClient.post<{ code: number; data: StoryPublishRequestResponse }>(
    `/stories/${storyId}/publish-requests`,
    { requesterNote },
  );
  return data.data;
}

export async function getMyPublishRequests(params?: {
  page?: number;
  size?: number;
  status?: StoryPublishRequestStatus;
}) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<StoryPublishRequestResponse> }>(
    "/stories/publish-requests/me",
    {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        ...(params?.status ? { status: params.status } : {}),
      },
    },
  );
  return data.data.data;
}

export async function getPublishRequests(params?: {
  page?: number;
  size?: number;
  status?: StoryPublishRequestStatus;
  uploaderId?: string;
}) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<StoryPublishRequestResponse> }>(
    "/stories/publish-requests",
    {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.uploaderId ? { uploaderId: params.uploaderId } : {}),
      },
    },
  );
  return data.data.data;
}

export async function approvePublishRequest(id: string, reviewerNote?: string) {
  const { data } = await apiClient.patch<{ code: number; data: StoryPublishRequestResponse }>(
    `/stories/publish-requests/approve/${id}`,
    { reviewerNote },
  );
  return data.data;
}

export async function rejectPublishRequest(id: string, reviewerNote?: string) {
  const { data } = await apiClient.patch<{ code: number; data: StoryPublishRequestResponse }>(
    `/stories/publish-requests/reject/${id}`,
    { reviewerNote },
  );
  return data.data;
}

export async function deletePublishRequest(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/stories/publish-requests/${id}`);
  return data;
}

// ============ User Info ============

export async function getMyInfo() {
  const { data } = await apiClient.get<{ code: number; data: User }>("/users/me");
  return data.data;
}

// ============ Upload ============

export async function uploadStoryCover(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ code: number; data: { url: string } }>("/stories/upload-cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.url;
}

// ============ Bookmarks ============

export async function getMyBookmarks(params?: { page?: number; size?: number }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<Bookmark> }>("/bookmarks/me", {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    },
  });
  return data.data;
}

export async function getBookmark(storyId: string) {
  try {
    const { data } = await apiClient.get<{ code: number; data: Bookmark }>(`/bookmarks/${storyId}`);
    return data.data;
  } catch {
    return null;
  }
}

export async function createBookmark(storyId: string) {
  const { data } = await apiClient.post<{ code: number; data: Bookmark }>(`/bookmarks/${storyId}`);
  return data.data;
}

export async function deleteBookmark(storyId: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/bookmarks/${storyId}`);
  return data;
}

// ============ Reading Histories ============

export async function getMyReadingHistories(params?: { page?: number; size?: number; type?: "STORY" | "CHAPTER" }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<ReadingHistory> }>("/reading-histories", {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
      type: params?.type,
    },
  });
  return data.data;
}

export async function getReadingHistory(storyId: string): Promise<ReadingHistory | null> {
  try {
    const { data } = await apiClient.get<{ code: number; data: ReadingHistory | null }>(
      `/reading-histories/story/${storyId}`,
    );
    return data.data;
  } catch {
    return null;
  }
}

export async function createOrUpdateReadingHistory(
  chapterId: string,
  storyId: string,
  type: "STORY" | "CHAPTER" = "STORY",
) {
  try {
    const { data } = await apiClient.post<{ code: number; data: ReadingHistory }>("/reading-histories", {
      chapterId,
      storyId,
      type,
    });
    return data.data;
  } catch {
    return null;
  }
}

export async function deleteReadingHistory(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/reading-histories/${id}`);
  return data;
}

export async function deleteAllReadingHistories() {
  const { data } = await apiClient.delete<{ code: number; message: string }>("/reading-histories");
  return data;
}

// ============ Comments ============

export async function getComments(params: { chapterId?: string; storyId?: string; page?: number; size?: number }) {
  if (params.chapterId) {
    const { data } = await apiClient.get<{ code: number; data: PageResponse<Comment> }>(
      `/comments/chapter/${params.chapterId}`,
      {
        params: {
          page: params.page ?? 1,
          size: params.size ?? 20,
        },
      },
    );
    return data.data;
  }

  if (params.storyId) {
    const { data } = await apiClient.get<{ code: number; data: PageResponse<Comment> }>(
      `/comments/story/${params.storyId}`,
      {
        params: {
          page: params.page ?? 1,
          size: params.size ?? 20,
        },
      },
    );
    return data.data;
  }

  return { currentPage: 1, pageSize: 20, totalPages: 0, totalElements: 0, data: [] };
}

export async function createComment(payload: {
  chapterId?: string;
  storyId?: string;
  content: string;
  parentId?: string;
}) {
  // Determine comment type based on which ID is provided
  const type = payload.chapterId ? "CHAPTER" : "STORY";

  const { data } = await apiClient.post<{ code: number; data: Comment }>("/comments", {
    type,
    storyId: payload.storyId,
    chapterId: payload.chapterId,
    content: payload.content,
    parentId: payload.parentId,
  });
  return data.data;
}

export async function updateComment(commentId: string, content: string) {
  const { data } = await apiClient.patch<{ code: number; data: Comment }>(`/comments/${commentId}`, { content });
  return data.data;
}

export async function deleteComment(commentId: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/comments/${commentId}`);
  return data;
}

// ============ Genres ============

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export async function getGenres(): Promise<Genre[]> {
  const { data } = await apiClient.get<{ code: number; data: Genre[] }>("/genres");
  return data.data;
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

export interface StoryAuthorUpdateRequest {
  authorId: string;
  role: "AUTHOR" | "CO_AUTHOR" | "ILLUSTRATOR" | "TRANSLATOR";
  sortOrder?: number;
}

export async function getAuthors(params?: { page?: number; size?: number; search?: string }): Promise<{
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  data: Author[];
}> {
  const { data } = await apiClient.get<{
    code: number;
    data: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      data: Author[];
    };
  }>("/authors", {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 50,
      search: params?.search,
    },
  });
  return data.data;
}

export async function createAuthor(payload: {
  name: string;
  bio?: string;
  country?: string;
  avatarFile?: File;
}): Promise<Author> {
  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.bio) formData.append("bio", payload.bio);
  if (payload.country) formData.append("country", payload.country);
  if (payload.avatarFile) formData.append("avatarFile", payload.avatarFile);

  const { data } = await apiClient.post<{ code: number; data: Author }>("/authors", formData, {
    headers: { "Content-Type": undefined },
  } as never);
  return data.data;
}

export async function updateStoryAuthors(storyId: string, authors: StoryAuthorUpdateRequest[]): Promise<unknown> {
  const { data } = await apiClient.put<{ code: number; data: unknown }>(`/authors/story/${storyId}`, authors);
  return data.data;
}

// ============ Ban/Unban Comment ============

export type ViolationType = "COPYRIGHT" | "PORNOGRAPHY" | "VIOLENCE" | "SPAM" | "HARASSMENT" | "OTHER";

export async function banComment(commentId: string, violationType: ViolationType, reason: string) {
  const { data } = await apiClient.patch<{ code: number; data: Comment }>(`/comments/${commentId}/ban`, {
    violationType,
    reason,
  });
  return data.data;
}

export async function unbanComment(commentId: string, reason: string) {
  const { data } = await apiClient.patch<{ code: number; data: Comment }>(`/comments/${commentId}/unban`, {
    reason,
  });
  return data.data;
}

// ============ Moderation Actions ============

export type ModerationActionType = "BAN" | "UNBAN";
export type ModerationObjectType = "STORY" | "CHAPTER" | "COMMENT" | "USER";

export interface ModerationAction {
  id: string;
  objectId: string;
  objectType: ModerationObjectType;
  storyResponse?: Story;
  chapterResponse?: Chapter;
  userResponse?: User;
  commentResponse?: Comment;
  actionType: ModerationActionType;
  violationType?: ViolationType;
  reason?: string;
  adminId?: string;
  adminUsername?: string;
  createdAt?: string;
}

export async function getModerationActions(params: {
  page?: number;
  size?: number;
  objectType?: ModerationObjectType;
  actionType?: ModerationActionType;
  violationType?: ViolationType;
  objectId?: string;
}) {
  const { data } = await apiClient.post<{ code: number; data: PageResponse<ModerationAction> }>("/moderation-actions", {
    page: params.page ?? 1,
    size: params.size ?? 20,
    objectType: params.objectType,
    actionType: params.actionType,
    violationType: params.violationType,
    objectId: params.objectId,
  });
  return data.data;
}

export async function getModerationActionById(id: string): Promise<ModerationAction | null> {
  try {
    const { data } = await apiClient.get<{ code: number; data: ModerationAction | null }>(`/moderation-actions/${id}`);
    return data.data;
  } catch {
    return null;
  }
}

// ============ Ban Appeals ============

export type BanAppealStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface BanAppeal {
  id: string;
  user?: User;
  moderationAction?: ModerationAction;
  content: string;
  status: BanAppealStatus;
  reviewer?: User;
  reviewerNote?: string;
  resolvedAt?: string;
  attachments?: { id: string; attachmentUrl: string; createdAt?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export async function getMyBanAppeals(params?: { page?: number; size?: number }) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<BanAppeal> }>("/ban-appeals/me", {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    },
  });
  return data.data;
}

export async function createBanAppeal(moderationActionId: string, content: string, attachments?: File[]) {
  const formData = new FormData();
  formData.append("moderationActionId", moderationActionId);
  formData.append("content", content);
  if (attachments) {
    attachments.forEach((file) => formData.append("attachments", file));
  }
  const { data } = await apiClient.post<{ code: number; data: BanAppeal }>("/ban-appeals", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function deleteBanAppeal(id: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/ban-appeals/${id}`);
  return data;
}

export async function getAllBanAppeals(params?: {
  page?: number;
  size?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}) {
  const { data } = await apiClient.get<{ code: number; data: PageResponse<BanAppeal> }>("/ban-appeals", {
    params: {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
      ...(params?.status && { status: params.status }),
    },
  });
  return data.data;
}

export async function approveBanAppeal(id: string, reviewerNote?: string) {
  const { data } = await apiClient.patch<{ code: number; data: BanAppeal }>(`/ban-appeals/${id}/approve`, {
    reviewerNote,
  });
  return data.data;
}

export async function rejectBanAppeal(id: string, reviewerNote: string) {
  const { data } = await apiClient.patch<{ code: number; data: BanAppeal }>(`/ban-appeals/${id}/reject`, {
    reviewerNote,
  });
  return data.data;
}
