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
  isPublished: boolean;
  freeChapterLimit?: number | null;
  viewCount: number;
  uploader?: User;
  createdAt?: string;
}

export interface User {
  id: string;
  email?: string;
  username: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface PageResponse<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  data: T[];
}

export type StoryPublishRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface StoryPublishRequestResponse {
  id: string;
  story: Story;
  requesterNote?: string;
  reviewerNote?: string;
  reviewer?: User;
  status: StoryPublishRequestStatus;
}

export interface Chapter {
  id: string;
  story?: Story;
  chapterNumber: number;
  title?: string;
  isPublished: boolean;
  viewCount?: number;
  content?: string;
  pageCount?: number;
  pages?: ChapterPage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  width?: number;
  height?: number;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  storyQuantity?: number;
}

// ============ Bookmark ============

export interface Bookmark {
  id: string;
  user?: User;
  story?: Story;
  createdAt?: string;
}

// ============ Reading History ============

export interface ReadingHistory {
  id: string;
  story?: Story;
  chapter?: Chapter;
  lastReadAt?: string;
}

// ============ Comment ============

export interface Comment {
  id: string;
  type?: "STORY" | "CHAPTER";
  content: string;
  author?: User;
  chapterId?: string;
  storyId?: string;
  parentId?: string | null;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}
