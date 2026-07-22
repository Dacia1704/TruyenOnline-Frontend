"use client";

import { PageLayout } from "@/components/PageLayout";
import { CommentsList } from "@/components/CommentsList";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getChapter } from "@/lib/api/stories";
import { getChaptersBySlug } from "@/lib/api/stories";
import { createOrUpdateReadingHistory } from "@/lib/api/stories";
import { getComments, createComment } from "@/lib/api/stories";
import type { Chapter, ChapterPage, Comment } from "@/lib/types/stories";

export default function ChapterReadPage() {
  const params = useParams();
  const slug = params.slug as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const hasTrackedStoryRef = useRef(false);
  const hasTrackedChapterRef = useRef(false);

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
        const [chapterData, chaptersData] = await Promise.all([
          getChapter(chapterId),
          getChaptersBySlug(slug, { size: 500 }),
        ]);
        setChapter(chapterData);
        setPages(chapterData.pages ?? []);
        setAllChapters(
          (chaptersData.data ?? []).sort(
            (a, b) => Number(a.chapterNumber) - Number(b.chapterNumber)
          )
        );

        // Track STORY view immediately when user starts reading
        if (chapterData.story?.id) {
          createOrUpdateReadingHistory(chapterId, chapterData.story.id, "STORY");
          hasTrackedStoryRef.current = true;
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
        chapterId,
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
      <header className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-3">
          <Link href={`/stories/${slug}`} className="flex items-center gap-2 text-sm hover:text-indigo-400 transition text-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {chapter.story?.title ?? slug}
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Chương {chapter.chapterNumber}
              {chapter.title && ` - ${chapter.title}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {prevChapter && (
              <Link
                href={`/stories/${slug}/chapters/${prevChapter.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted text-foreground"
              >
                ← Chap trước
              </Link>
            )}
            {nextChapter && (
              <Link
                href={`/stories/${slug}/chapters/${nextChapter.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted text-foreground"
              >
                Chap kế →
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
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
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {chapter.content ?? "Chưa có nội dung."}
            </div>
          </article>
        )}

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
          <div>
            {prevChapter ? (
              <Link
                href={`/stories/${slug}/chapters/${prevChapter.id}`}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Chương trước: {prevChapter.chapterNumber}
                {prevChapter.title && ` - ${prevChapter.title}`}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Đây là chương đầu tiên</span>
            )}
          </div>

          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              {chapter.viewCount?.toLocaleString() ?? 0} lượt xem
            </span>
          </div>

          <div>
            {nextChapter ? (
              <Link
                href={`/stories/${slug}/chapters/${nextChapter.id}`}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:underline"
              >
                Chương kế: {nextChapter.chapterNumber}
                {nextChapter.title && ` - ${nextChapter.title}`}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Đây là chương cuối</span>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <h3 className="text-lg font-bold mb-4 text-foreground">Bình luận ({comments.length})</h3>

          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
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
              chapterId={chapterId}
              onReload={loadComments}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
