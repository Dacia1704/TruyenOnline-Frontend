export type StoryType = "MANGA" | "NOVEL";
export type StoryStatus = "ONGOING" | "COMPLETED" | "HIATUS" | "DROPPED";

export interface Author {
  id: string;
  name: string;
  nameNoAccent?: string;
  slug?: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
}

export interface StoryAuthor {
  author: Author;
  story?: Story;
  role: "AUTHOR" | "CO_AUTHOR" | "ILLUSTRATOR" | "TRANSLATOR";
  sortOrder: number;
}

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
  followCount?: number;
  uploader?: User;
  authors?: StoryAuthor[];
  genres?: Genre[];
  isBanned?: boolean;
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
  id: string;
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
  isBanned?: boolean;
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
  lastChapter?: Chapter;
  lastReadAt?: string;
}

// ============ Comment ============

export interface Comment {
  id: string;
  type?: "STORY" | "CHAPTER";
  content: string;
  isBanned?: boolean;
  author?: User;
  chapterId?: string;
  storyId?: string;
  parentId?: string | null;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

// ============ Banner ============

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

// ============ Moderation ============

export type ModerationActionType = "BAN" | "UNBAN";
export type ModerationObjectType = "STORY" | "CHAPTER" | "COMMENT" | "USER";
export type ViolationType = "COPYRIGHT" | "PORNOGRAPHY" | "VIOLENCE" | "SPAM" | "HARASSMENT" | "OTHER";

export interface ModerationAction {
  id: string;
  objectId: string;
  objectType: ModerationObjectType;
  // Response objects (for displaying titles)
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

// ============ Ban Appeal ============

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

// ============ Social Account ============

export interface SocialAccount {
  provider: "GOOGLE" | "FACEBOOK" | "LOCAL";
  linked: boolean;
}
