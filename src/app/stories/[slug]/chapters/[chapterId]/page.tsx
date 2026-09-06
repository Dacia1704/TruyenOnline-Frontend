"use client";

import { PageLayout } from "@/components/PageLayout";
import { CommentsList } from "@/components/CommentsList";
import { ChaptersModal } from "@/components/ChaptersModal";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  getChapter,
  getChaptersBySlug,
  createOrUpdateReadingHistory,
  getComments,
  createComment,
  getBookmark,
  createBookmark,
  deleteBookmark,
} from "@/lib/api/stories";
import { getUserInfo } from "@/lib/api/client";
import type { Chapter, ChapterPage, Comment, Bookmark } from "@/lib/types/stories";

export default function ChapterReadPage() {
  const params = useParams();
  const slug = params.slug as string;
  const chapterId = params.chapterId as string;

  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChaptersModal, setShowChaptersModal] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const hasTrackedStoryRef = useRef(false);
  const hasTrackedChapterRef = useRef(false);
  const { resolvedTheme } = useTheme();

  const isMangaMode = pages.length > 0;

  const loadComments = useCallback(async () => {
    if (!chapterId) return;
    setCommentsLoading(true);
    try {
      const result = await getComments({ chapterId, size: 50 });
      setComments(result.data ?? []);
    } catch {
      // Silently fail for comments
    } finally {
      setCommentsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      hasTrackedStoryRef.current = false;
      hasTrackedChapterRef.current = false;
      try {
        const chapterData = await getChapter(chapterId);
        setChapter(chapterData);
        setPages(chapterData.pages ?? []);

        // Get chapters from current chapter number (50 next chapters)
        const currentChapterNumber = chapterData.chapterNumber;
        const chaptersData = await getChaptersBySlug(slug, { size: 50, from: currentChapterNumber });
        setAllChapters((chaptersData.data ?? []).sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber)));

        // Track STORY view and load bookmark
        if (chapterData.story?.id) {
          createOrUpdateReadingHistory(chapterId, chapterData.story.id, "STORY");
          hasTrackedStoryRef.current = true;
          const bookmarkData = await getBookmark(chapterData.story.id).catch(() => null);
          setBookmark(bookmarkData);
        }
      } catch {
        setError("Không tải được nội dung chương.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, chapterId]);

  // Track CHAPTER view after 3 seconds
  useEffect(() => {
    if (!chapter?.story?.id || hasTrackedChapterRef.current) return;

    const timer = setTimeout(() => {
      if (!hasTrackedChapterRef.current && chapter?.story?.id) {
        createOrUpdateReadingHistory(chapterId, chapter.story.id, "CHAPTER");
        hasTrackedChapterRef.current = true;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [chapter, chapterId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await createComment({
        storyId: chapter?.story?.id,
        chapterId: chapterId,
        content: newComment.trim(),
      });
      setNewComment("");
      loadComments();
    } catch {
      alert("Không thể gửi bình luận. Vui lòng đăng nhập.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!chapter?.story?.id) return;

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
        await deleteBookmark(chapter.story.id);
        setBookmark(null);
        toast.success("Đã xóa khỏi theo dõi");
      } else {
        const newBookmark = await createBookmark(chapter.story.id);
        setBookmark(newBookmark);
        toast.success("Đã thêm vào theo dõi");
      }
    } catch {
      toast.error("Không thể cập nhật theo dõi");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const currentChapterIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Đang tải...</div>
        </div>
      </PageLayout>
    );
  }

  if (error || !chapter) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">{error ?? "Không tìm thấy chương."}</p>
          <Link href={`/stories/${slug}`} className="mt-4 text-indigo-400 hover:underline">
            Quay lại truyện
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Main Container */}
      <div className={`min-h-screen ${resolvedTheme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className={`max-w-6xl mx-auto ${resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`}>
          {/* Top Controls Section */}
          <div className="px-4 py-4">
            {/* 1.1 Breadcrumb */}
            <nav className={`text-sm mb-4 ${resolvedTheme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
              <Link href="/" className="hover:underline">
                Trang chủ
              </Link>
              <span className="mx-1">»</span>
              <Link href={`/stories/${slug}`} className="hover:underline">
                {chapter.story?.title ?? slug}
              </Link>
              <span className="mx-1">»</span>
              <span className={`font-medium ${resolvedTheme === "dark" ? "text-blue-300" : "text-blue-800"}`}>
                Chapter {chapter.chapterNumber}
              </span>
            </nav>

            {/* 1.2 Chapter Title */}
            <div className="mb-4">
              <h1 className={`text-2xl font-bold ${resolvedTheme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                {chapter.story?.title} - Chapter {chapter.chapterNumber}
                {chapter.title && ` - ${chapter.title}`}
              </h1>
              <p className={`text-sm italic mt-1 ${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                {chapter.updatedAt && `Cập nhật lúc: ${new Date(chapter.updatedAt).toLocaleString("vi-VN")}`}
              </p>
            </div>

            {/* 1.3 Notification & Server Buttons */}
            <div className="flex flex-col items-center gap-3 my-6">
              <div
                className={`flex items-center gap-2 ${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Nếu không xem được truyện vui lòng đổi &quot;SERVER ẢNH&quot; bên dưới.
              </div>
              <div className="flex gap-2">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition">
                  Server 1
                </button>
              </div>
            </div>

            {/* 1.4 Instruction Banner */}
            <div
              className={`w-full border rounded-lg p-3 mb-4 ${resolvedTheme === "dark" ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200"}`}
            >
              <div
                className={`flex items-center justify-center gap-2 italic text-sm ${resolvedTheme === "dark" ? "text-blue-300" : "text-blue-600"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Sử dụng mũi tên trái (←) hoặc phải (→) để chuyển chapter.
              </div>
            </div>

            {/* 1.5 Navigation Toolbar */}
            <div
              className={`flex justify-center items-center gap-4 py-4 border-t border-b ${resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"}`}
            >
              {/* Left Icons */}
              <div className="flex gap-3">
                <Link
                  href={`/stories/${slug}`}
                  className="text-red-500 hover:text-red-600 transition"
                  title="Trang chủ"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </Link>
                <button
                  className="text-red-500 hover:text-red-600 transition"
                  title="Danh sách chương"
                  onClick={() => setShowChaptersModal(true)}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Chapter Navigation */}
              <div className="flex items-center gap-2">
                {prevChapter ? (
                  <Link
                    href={`/stories/${slug}/chapters/${prevChapter.id}`}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded transition"
                  >
                    ‹
                  </Link>
                ) : (
                  <span className="w-10 h-10 bg-gray-600 text-gray-400 flex items-center justify-center rounded cursor-not-allowed">
                    ‹
                  </span>
                )}

                <select
                  className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${resolvedTheme === "dark" ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                  value={chapterId}
                  onChange={(e) => {
                    window.location.href = `/stories/${slug}/chapters/${e.target.value}`;
                  }}
                >
                  {allChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      Chapter {c.chapterNumber}
                      {c.title && ` - ${c.title}`}
                    </option>
                  ))}
                </select>

                {nextChapter ? (
                  <Link
                    href={`/stories/${slug}/chapters/${nextChapter.id}`}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded transition"
                  >
                    ›
                  </Link>
                ) : (
                  <span className="w-10 h-10 bg-gray-600 text-gray-400 flex items-center justify-center rounded cursor-not-allowed">
                    ›
                  </span>
                )}
              </div>

              {/* Follow Button */}
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${bookmark ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-400 hover:bg-gray-500 text-white"}`}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={bookmark ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {bookmarkLoading ? "Đang xử lý..." : bookmark ? "Đã Theo dõi" : "Theo dõi"}
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-4 pb-8">
            {isMangaMode ? (
              <div className="flex flex-col items-center">
                {pages
                  .sort((a, b) => a.pageNumber - b.pageNumber)
                  .map((page) => (
                    <img
                      key={page.id}
                      src={page.imageUrl}
                      alt={`Trang ${page.pageNumber}`}
                      className="max-w-full h-auto mb-2"
                      loading="lazy"
                    />
                  ))}
              </div>
            ) : (
              <article className="prose prose-sm max-w-none">
                <div
                  className={`text-sm leading-relaxed px-4 ${
                    resolvedTheme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                  dangerouslySetInnerHTML={{ __html: chapter.content ?? "Chưa có nội dung." }}
                />
              </article>
            )}
          </div>

          {/* Bottom Navigation */}
          <div
            className={`px-4 py-6 border-t flex items-center justify-between ${resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"}`}
          >
            <div>
              {prevChapter ? (
                <Link
                  href={`/stories/${slug}/chapters/${prevChapter.id}`}
                  className="flex items-center gap-2 text-sm text-red-500 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Chương trước: {prevChapter.chapterNumber}
                  {prevChapter.title && ` - ${prevChapter.title}`}
                </Link>
              ) : (
                <span className={`text-sm ${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Đây là chương đầu tiên
                </span>
              )}
            </div>

            <div className="text-center">
              <span className={`text-xs ${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                {chapter.viewCount?.toLocaleString() ?? 0} lượt xem
              </span>
            </div>

            <div>
              {nextChapter ? (
                <Link
                  href={`/stories/${slug}/chapters/${nextChapter.id}`}
                  className="flex items-center gap-2 text-sm text-red-500 hover:underline"
                >
                  Chương kế: {nextChapter.chapterNumber}
                  {nextChapter.title && ` - ${nextChapter.title}`}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <span className={`text-sm ${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Đây là chương cuối
                </span>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className={`px-4 py-6 border-t ${resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <h3 className={`text-lg font-bold mb-4 ${resolvedTheme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
              Bình luận ({comments.length})
            </h3>

            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className={`w-full rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${resolvedTheme === "dark" ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300 text-gray-800"}`}
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </form>

            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div
                      className={`h-4 rounded w-1/4 mb-2 ${resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                    />
                    <div className={`h-16 rounded ${resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`} />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className={`text-sm text-center py-4 ${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                Chưa có bình luận nào.
              </p>
            ) : (
              <CommentsList comments={comments} storyId={chapter?.story?.id} chapterId={chapterId} onReload={loadComments} />
            )}
          </div>
        </div>
      </div>

      {/* Chapters Modal */}
      <ChaptersModal
        isOpen={showChaptersModal}
        onClose={() => setShowChaptersModal(false)}
        slug={slug}
        currentChapterId={chapterId}
      />
    </PageLayout>
  );
}
