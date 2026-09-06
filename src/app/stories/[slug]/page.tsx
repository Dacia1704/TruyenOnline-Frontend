"use client";

import { PageLayout } from "@/components/PageLayout";
import { CommentsList } from "@/components/CommentsList";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getStoryBySlug,
  getChaptersBySlug,
  getBookmark,
  createBookmark,
  deleteBookmark,
  getReadingHistory,
  createOrUpdateReadingHistory,
  getComments,
  createComment,
  getStories,
} from "@/lib/api/stories";
import { getUserInfo } from "@/lib/api/client";
import type { Story, Chapter, Bookmark, ReadingHistory, Comment, Genre } from "@/lib/types/stories";
import { toast } from "sonner";
import Modal from "@/components/Modal";

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang cập nhật", className: "bg-emerald-500/20 text-emerald-600" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-500/20 text-sky-600" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-500/20 text-amber-600" },
  DROPPED: { text: "Bỏ dở", className: "bg-rose-500/20 text-rose-600" },
};

const rankColors: Record<number, string> = {
  0: "text-blue-600",
  1: "text-green-600",
  2: "text-orange-600",
};

// ============ Helper Components ============

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatViews(count?: number): string {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toLocaleString();
}

// ============ Rating Stars ============

function RatingStars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Xếp hạng: {rating}/5 - {count} Lượt đánh giá
      </span>
    </div>
  );
}

// ============ Genre Tags ============

function GenreTags({ genres }: { genres?: Genre[] }) {
  if (!genres || genres.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-gray-500 dark:text-gray-400">Thể loại:</span>
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/stories?genre=${genre.slug}`}
          className="text-blue-500 hover:text-blue-600 hover:underline text-sm"
        >
          {genre.name}
        </Link>
      ))}
    </div>
  );
}

// ============ Reading History Widget ============

function ReadingHistoryWidget({ currentStoryId }: { currentStoryId?: string }) {
  const [history, setHistory] = useState<ReadingHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentStoryId) {
        setLoading(false);
        return;
      }
      try {
        const result = await getReadingHistory(currentStoryId);
        setHistory(result);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentStoryId]);

  if (!currentStoryId) return null;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Đã đọc gần đây
        </h3>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="flex gap-3 animate-pulse">
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ) : history?.chapter ? (
          <Link
            href={`/stories/${history.story?.slug}/chapters/${history.chapter.id}`}
            className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-500 transition">
                Chapter {history.chapter.chapterNumber}
              </h4>
              <p className="text-xs text-blue-500 mt-0.5">{history.chapter.title ?? "Tiếp tục đọc"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(history.lastReadAt)}</p>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Chưa có lịch sử đọc</p>
        )}
      </div>
    </div>
  );
}

// ============ Ranking Widget ============

function RankingWidget() {
  const [topViewStories, setTopViewStories] = useState<Story[]>([]);
  const [topFollowStories, setTopFollowStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "follow">("view");

  useEffect(() => {
    const load = async () => {
      try {
        const [viewResult, followResult] = await Promise.all([
          getStories({ isPublished: true, size: 10, sortType: "VIEW" }),
          getStories({ isPublished: true, size: 10, sortType: "FOLLOW" }),
        ]);
        setTopViewStories(viewResult.data ?? []);
        setTopFollowStories(followResult.data ?? []);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topStories = activeTab === "view" ? topViewStories : topFollowStories;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("view")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
            activeTab === "view"
              ? "text-gray-900 dark:text-white border-b-2 border-purple-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Top View
        </button>
        <button
          onClick={() => setActiveTab("follow")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
            activeTab === "follow"
              ? "text-gray-900 dark:text-white border-b-2 border-purple-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          Top Follow
        </button>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : topStories.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Không có dữ liệu</p>
        ) : (
          <div className="space-y-2">
            {topStories.slice(0, 7).map((story, index) => (
              <Link
                key={story.id}
                href={story.slug ? `/stories/${story.slug}` : "#"}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold text-lg ${rankColors[index] ?? "text-gray-400"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                  {story.coverImageUrl ? (
                    <img src={story.coverImageUrl} alt={story.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-lg">📖</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-500 transition line-clamp-1">
                    {story.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                    Chapter {story.viewCount ?? "?"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 italic">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{formatViews(activeTab === "view" ? story.viewCount : story.followCount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Main Page Component ============

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [lastReadChapter, setLastReadChapter] = useState<ReadingHistory | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  // eslint-disable-next-line
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Premium modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumChapter, setPremiumChapter] = useState<Chapter | null>(null);

  // Check if user is logged in
  const isLoggedIn = () => !!getUserInfo();

  // Check if user has premium permission
  const hasPremiumPermission = () => {
    const user = getUserInfo();
    if (!user) return false;

    // Check permission first
    if (user.permissions?.includes("chapter:read_premium")) return true;

    // Check if user is uploader of this story
    if (story?.uploader?.id === user.id) return true;

    // Check if user is admin
    if (user.roles?.includes("ADMIN")) return true;

    return false;
  };

  // Handle clicking on chapter (premium or free)
  const handleChapterClick = (chapter: Chapter) => {
    if (!story) return;

    const isPremiumChapter =
      story.freeChapterLimit !== null &&
      story.freeChapterLimit !== undefined &&
      Number(chapter.chapterNumber) > story.freeChapterLimit;

    if (isPremiumChapter && !hasPremiumPermission()) {
      // Show premium modal if user doesn't have permission
      setPremiumChapter(chapter);
      setShowPremiumModal(true);
    } else {
      // Navigate directly to chapter
      router.push(`/stories/${slug}/chapters/${chapter.id}`);
    }
  };

  // Handle go to premium/subscription page
  const handleGoToPremium = () => {
    if (!isLoggedIn()) {
      // Show login modal instead
      setShowPremiumModal(false);
      const confirmed = window.confirm("Bạn cần đăng nhập để nâng cấp Premium. Bạn có muốn đăng nhập ngay?");
      if (confirmed) {
        router.push("/login");
      }
      return;
    }
    router.push("/premium");
  };

  // Mock rating data (in real app, this would come from API)
  const [rating] = useState(5);
  const [ratingCount] = useState(1);

  const loadComments = useCallback(async () => {
    if (!story?.id) return;
    setCommentsLoading(true);
    try {
      const result = await getComments({ storyId: story.id, size: 50 });
      setComments(result.data ?? []);
    } catch {
      // Silently fail
    } finally {
      setCommentsLoading(false);
    }
  }, [story?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [storyData, chaptersData] = await Promise.all([
          getStoryBySlug(slug),
          getChaptersBySlug(slug, { size: 100 }),
        ]);
        setStory(storyData);
        const sortedChapters = (chaptersData.data ?? []).sort(
          (a, b) => Number(a.chapterNumber) - Number(b.chapterNumber),
        );
        setChapters(sortedChapters);

        if (storyData.id) {
          const [bookmarkData, readingHistory] = await Promise.all([
            getBookmark(storyData.id).catch(() => null),
            getReadingHistory(storyData.id),
          ]);
          setBookmark(bookmarkData);
          setLastReadChapter(readingHistory);
        }
      } catch {
        setError("Không tải được thông tin truyện.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleStartReading = async () => {
    if (!story?.id || !chapters[0]) return;
    await createOrUpdateReadingHistory(chapters[0].id, story.id, "STORY");
    router.push(`/stories/${slug}/chapters/${chapters[0].id}`);
  };

  const handleContinueReading = async () => {
    if (!story?.id || !lastReadChapter?.chapter) return;
    await createOrUpdateReadingHistory(lastReadChapter.chapter.id, story.id, "STORY");
    router.push(`/stories/${slug}/chapters/${lastReadChapter.chapter.id}`);
  };

  const handleBookmarkToggle = async () => {
    if (!story?.id) return;

    const user = getUserInfo();
    if (!user) {
      const confirmed = window.confirm("Bạn cần đăng nhập để sử dụng tính năng bookmark. Bạn có muốn đăng nhập ngay?");
      if (confirmed) {
        router.push("/login");
      }
      return;
    }

    setBookmarkLoading(true);
    try {
      if (bookmark) {
        await deleteBookmark(story.id);
        setBookmark(null);
        toast.success("Đã xóa khỏi theo dõi");
      } else {
        const newBookmark = await createBookmark(story.id);
        setBookmark(newBookmark);
        toast.success("Đã thêm vào theo dõi");
      }
    } catch {
      toast.error("Không thể cập nhật theo dõi");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !story?.id) return;

    setSubmittingComment(true);
    try {
      await createComment({
        storyId: story.id,
        content: newComment.trim(),
      });
      setNewComment("");
      loadComments();
      toast.success("Đã gửi bình luận");
    } catch {
      toast.error("Bạn cần đăng nhập để bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !story) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">{error ?? "Truyện không tồn tại."}</p>
          <Link href="/stories" className="mt-4 inline-block text-blue-500 hover:underline">
            Quay lại danh sách truyện
          </Link>
        </div>
      </PageLayout>
    );
  }

  const firstChapter = chapters[0];
  const lastChapter = chapters[chapters.length - 1];
  const descriptionPreview = story.description?.slice(0, 300);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* ============ Breadcrumb ============ */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center gap-2 text-blue-500">
            <li>
              <Link href="/" className="hover:underline">
                Trang chủ
              </Link>
            </li>
            <li className="text-gray-400">»</li>

            <li className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">{story.title}</li>
          </ol>
        </nav>

        {/* ============ Main Layout: 2 Columns ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============ Left Column: Main Content ============ */}
          <div className="lg:col-span-2 space-y-8">
            {/* ============ Header & Story Info ============ */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              {/* Title & Update Time */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{story.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">
                Cập nhật lúc: {formatDate(story.createdAt)}
              </p>

              {/* Grid: Cover Image + Meta Data */}
              {/* Cover Image + Meta Data */}
              <div className="flex gap-6 mt-6 items-start mb-6">
                {/* Cover Image */}
                <div className="flex-shrink-0">
                  <div className="w-44 aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-gray-200 dark:bg-gray-700">
                    {story.coverImageUrl ? (
                      <img src={story.coverImageUrl} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src="/images/icon/main.png"
                          alt="placeholder"
                          className="w-12 h-12 object-contain opacity-50"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta Data */}
                <div className="flex-1 space-y-3">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">
                      {story.authors?.[0]?.author.name ?? "Đang cập nhật"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[story.status]?.className ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {statusConfig[story.status]?.text ?? story.status}
                    </span>
                  </div>

                  {/* Genres */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <GenreTags genres={story.genres} />
                  </div>

                  {/* View Count */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">{formatViews(story.viewCount)} lượt xem</span>
                  </div>

                  {/* Rating */}
                  <div className="pt-2">
                    <RatingStars rating={rating} count={ratingCount} />
                  </div>

                  {/* Follow Count */}
                  <div className="pt-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatViews(story.followCount ?? 84)} Người Đã Theo Dõi
                    </span>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    {/* Follow Button */}
                    <button
                      onClick={handleBookmarkToggle}
                      disabled={bookmarkLoading}
                      className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                        bookmark ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-400 hover:bg-gray-500 text-white"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={bookmark ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {bookmarkLoading ? "Đang xử lý..." : bookmark ? "Đã Theo dõi" : "Theo dõi"}
                    </button>

                    {/* Read Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleStartReading}
                        className="flex-1 px-6 py-2.5 rounded-lg font-medium bg-orange-400 hover:bg-orange-500 text-white transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        Đọc từ đầu
                      </button>
                      {lastReadChapter?.chapter && lastReadChapter.chapter.id !== firstChapter?.id ? (
                        <button
                          onClick={handleContinueReading}
                          className="flex-1 px-6 py-2.5 rounded-lg font-medium bg-orange-400 hover:bg-orange-500 text-white transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          Đọc mới nhất
                        </button>
                      ) : lastChapter ? (
                        <button
                          onClick={async () => {
                            if (story.id) {
                              await createOrUpdateReadingHistory(lastChapter.id, story.id, "STORY");
                              router.push(`/stories/${slug}/chapters/${lastChapter.id}`);
                            }
                          }}
                          className="flex-1 px-6 py-2.5 rounded-lg font-medium bg-orange-400 hover:bg-orange-500 text-white transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          Đọc mới nhất
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* ============ Story Content ============ */}
              <div className="mb-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2 pb-2 border-b-2 border-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  NỘI DUNG TRUYỆN {story.title.toUpperCase()} TRÊN NETTRUYEN
                </h2>
                <div className="mt-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {showFullDescription ? story.description : descriptionPreview}
                    {(story.description?.length ?? 0) > 300 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-blue-500 hover:text-blue-600 ml-1"
                      >
                        {showFullDescription ? " Thu gọn" : " Xem thêm >"}
                      </button>
                    )}
                  </p>
                </div>
              </div>

              {/* ============ Chapter List ============ */}
              <div className="mb-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  DANH SÁCH CHƯƠNG
                </h2>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <div className="col-span-5 text-left">Số chương</div>
                  <div className="col-span-4 text-center">Cập nhật</div>
                  <div className="col-span-3 text-right">Lượt xem</div>
                </div>

                {/* Chapter List */}
                {chapters.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Chưa có chương nào.</div>
                ) : (
                  <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
                    {chapters.slice(0, 20).map((chapter) => {
                      const isPremiumChapter =
                        story.freeChapterLimit !== null &&
                        story.freeChapterLimit !== undefined &&
                        Number(chapter.chapterNumber) > story.freeChapterLimit;
                      const canReadChapter = !isPremiumChapter || hasPremiumPermission();
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => handleChapterClick(chapter)}
                          className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group w-full text-left"
                        >
                          <div className="col-span-5 flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition">
                              Chapter {chapter.chapterNumber}
                            </span>
                            {chapter.title && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">{chapter.title}</span>
                            )}
                            {/* Premium Icon */}
                            {isPremiumChapter && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {canReadChapter ? "PRE" : "🔒 PRE"}
                              </span>
                            )}
                          </div>
                          <div className="col-span-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                            {formatDate(chapter.updatedAt ?? chapter.createdAt)}
                          </div>
                          <div className="col-span-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatViews(chapter.viewCount)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* View More */}
                {chapters.length > 20 && (
                  <div className="px-6 py-4 text-center border-t border-gray-200 dark:border-gray-700">
                    <button className="text-blue-500 hover:text-blue-600 font-medium">
                      + Xem thêm ({chapters.length - 20} chương)
                    </button>
                  </div>
                )}
              </div>

              {/* ============ Comments ============ */}
              <div className="mb-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Comment Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {comments.length === 0 ? "Chưa có bình luận nào" : `${comments.length} bình luận`}
                  </h3>
                </div>

                {/* Comment Input */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  {(() => {
                    const user = getUserInfo();
                    if (!user) {
                      return (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Đăng nhập để tham gia cuộc trò chuyện
                          </span>
                          <Link
                            href="/login"
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium ml-2"
                          >
                            Đăng nhập →
                          </Link>
                        </div>
                      );
                    }
                    return (
                      <form onSubmit={handleSubmitComment}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Tham gia thảo luận..."
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
                          rows={3}
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            type="submit"
                            disabled={submittingComment || !newComment.trim()}
                            className="rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
                          >
                            {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                          </button>
                        </div>
                      </form>
                    );
                  })()}
                </div>

                {/* Empty State */}
                {comments.length === 0 ? (
                  <div className="px-6 py-12 text-center bg-yellow-50/50 dark:bg-yellow-900/10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Chưa có bình luận nào</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Hãy là người đầu tiên bình luận!</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <CommentsList
                      comments={comments}
                      storyId={story.id}
                      storyUploaderId={story.uploader?.id}
                      onReload={loadComments}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* ============ Right Column: Sidebar ============ */}
          <div className="lg:col-span-1 space-y-6">
            <ReadingHistoryWidget currentStoryId={story.id} />
            <RankingWidget />
          </div>
        </div>
      </div>

      {/* Premium Chapter Modal */}
      <Modal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} title="Chương Premium">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {premiumChapter ? `Chapter ${premiumChapter.chapterNumber}` : ""} Yêu cầu Premium
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Chương này chỉ dành cho thành viên Premium. Đăng ký ngay để đọc trọn bộ truyện không giới hạn!
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToPremium}
              className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 transition"
            >
              Nâng cấp Premium
            </button>
            <button
              onClick={() => setShowPremiumModal(false)}
              className="w-full py-2.5 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
