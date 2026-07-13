export type StoryType = "COMICS" | "MANHWA" | "MANHUA" | "NOVEL";
export type StoryStatus = "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED";

export interface Story {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  storyType: StoryType;
  status: StoryStatus;
  freeChapterLimit?: number | null;
  viewCount: number;
  authorId?: string;
  authorUsername?: string;
  published?: boolean;
  isPublished?: boolean;
  uploader?: {
    id: string;
    email?: string;
    username?: string;
    avatarUrl?: string | null;
    roles?: unknown[];
    active?: boolean;
  };
  createdAt?: string;
}

export interface PageResponse<T> {
  code: number;
  message: string;
  data: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    data: T[];
  };
}

export interface ApiPageResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  roles?: Role[];
  createdAt?: string;
  enabled?: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalStories?: number;
  totalChapters?: number;
  totalPendingRequests?: number;
}
