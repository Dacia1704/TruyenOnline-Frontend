"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getChapter } from "@/lib/api/stories";
import { getChaptersBySlug } from "@/lib/api/stories";
import type { Chapter, ChapterPage } from "@/lib/types/stories";

export default function ChapterReadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const isMangaMode = pages.length > 0;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
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
      } catch {
        setError("Không tải được nội dung chương.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, chapterId]);

  const currentChapterIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">{error ?? "Không tìm thấy chương."}</p>
        <Link href={`/stories/${slug}`} className="mt-4 text-indigo-600 hover:underline">
          Quay lại truyện
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-3">
          <Link href={`/stories/${slug}`} className="flex items-center gap-2 text-sm hover:text-indigo-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {chapter.story?.title ?? slug}
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Chương {chapter.chapterNumber}
              {chapter.title && ` - ${chapter.title}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {prevChapter && (
              <Link
                href={`/stories/${slug}/chapters/${prevChapter.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
              >
                ← Chap trước
              </Link>
            )}
            {nextChapter && (
              <Link
                href={`/stories/${slug}/chapters/${nextChapter.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
              >
                Chap kế →
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
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
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {chapter.content ?? "Chưa có nội dung."}
            </div>
          </article>
        )}

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
          <div>
            {prevChapter ? (
              <Link
                href={`/stories/${slug}/chapters/${prevChapter.id}`}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
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
                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
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
      </main>
    </div>
  );
}
