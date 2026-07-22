"use client";

import { PageLayout } from "@/components/PageLayout";
import { CommentsList } from "@/components/CommentsList";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getStory, getChaptersBySlug, getBookmark, createBookmark, deleteBookmark, getReadingHistory, createOrUpdateReadingHistory, getComments, createComment } from "@/lib/api/stories";
import { getUserInfo } from "@/lib/api/client";
import type { Story, Chapter, Bookmark, ReadingHistory, Comment } from "@/lib/types/stories";
import { toast } from "sonner";

const storyTypeLabel: Record<string, string> = {
  COMICS: "Truyện tranh",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  NOVEL: "Light novel",
};

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-500/20 text-emerald-400" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-500/20 text-sky-400" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-500/20 text-amber-400" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-500/20 text-rose-400" },
};

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [lastReadChapter, setLastReadChapter] = useState<ReadingHistory | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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
          getStory(slug),
          getChaptersBySlug(slug, { size: 100 }),
        ]);
        setStory(storyData);
        const sortedChapters = (chaptersData.data ?? []).sort(
          (a, b) => Number(a.chapterNumber) - Number(b.chapterNumber)
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
    
    // Create reading history with STORY type (for view count)
    await createOrUpdateReadingHistory(chapters[0].id, story.id, "STORY");
    
    // Navigate to first chapter
    router.push(`/stories/${slug}/chapters/${chapters[0].id}`);
  };

  const handleContinueReading = async () => {
    if (!story?.id || !lastReadChapter?.chapter) return;
    
    // Update reading history with STORY type
    await createOrUpdateReadingHistory(lastReadChapter.chapter.id, story.id, "STORY");
    
    // Navigate to last read chapter
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
        toast.success("Đã xóa khỏi bookmark");
      } else {
        const newBookmark = await createBookmark(story.id);
        setBookmark(newBookmark);
        toast.success("Đã thêm vào bookmark");
      }
    } catch {
      toast.error("Không thể cập nhật bookmark");
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
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !story) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-muted-foreground">{error ?? "Truyện không tồn tại."}</p>
          <Link href="/stories" className="mt-4 inline-block text-indigo-400 hover:underline">
            Quay lại danh sách truyện
          </Link>
        </div>
      </PageLayout>
    );
  }

  const firstChapter = chapters[0];

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-48 shrink-0">
            <div className="aspect-[3/4] rounded-xl bg-muted overflow-hidden">
              {story.coverImageUrl ? (
                <img
                  src={story.coverImageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[story.status]?.className ?? "bg-muted"}`}>
                {statusConfig[story.status]?.text ?? story.status}
              </span>
              <span className="rounded-full bg-indigo-500/20 text-indigo-400 px-3 py-1 text-xs font-medium">
                {storyTypeLabel[story.storyType] ?? story.storyType}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-foreground">{story.title}</h1>

            {story.uploader && (
              <p className="mt-2 text-sm text-muted-foreground">
                Tác giả: <span className="text-foreground">{story.uploader.username}</span>
              </p>
            )}

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{story.viewCount?.toLocaleString() ?? 0} lượt xem</span>
              <span>{chapters.length} chương</span>
            </div>

            {story.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {story.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {firstChapter && (
                <button
                  onClick={handleStartReading}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Bắt đầu đọc
                </button>
              )}
              {lastReadChapter?.chapter && lastReadChapter.chapter.id !== firstChapter?.id && (
                <button
                  onClick={handleContinueReading}
                  className="rounded-lg border border-indigo-500 bg-indigo-500/20 text-indigo-400 px-6 py-2.5 text-sm font-medium transition hover:bg-indigo-500/30"
                >
                  Tiếp tục đọc (Chap {lastReadChapter.chapter.chapterNumber})
                </button>
              )}
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`rounded-lg border px-6 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                  bookmark
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                    : "border-border hover:bg-muted text-foreground"
                }`}
              >
                {bookmarkLoading ? "..." : bookmark ? "Đã bookmark" : "Bookmark"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Danh sách chương</h2>

          {chapters.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Chưa có chương nào.</p>
          ) : (
            <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/stories/${slug}/chapters/${chapter.id}`}
                    className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition text-foreground"
                  >
                    <div>
                      <span className="font-medium">Chương {chapter.chapterNumber}</span>
                      {chapter.title && (
                        <span className="ml-2 text-sm text-muted-foreground">{chapter.title}</span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {chapter.viewCount?.toLocaleString() ?? 0} lượt xem
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-12 pt-6 border-t border-border">
          <h3 className="text-lg font-bold mb-4 text-foreground">Bình luận ({comments.length})</h3>

          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận về truyện..."
              className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-foreground"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </div>
          </form>

          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">Chưa có bình luận nào.</p>
          ) : (
            <CommentsList
              comments={comments}
              storyId={story.id}
              onReload={loadComments}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
