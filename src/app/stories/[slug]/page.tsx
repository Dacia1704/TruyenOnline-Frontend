"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStory } from "@/lib/api/stories";
import { getChaptersBySlug } from "@/lib/api/stories";
import type { Story, Chapter } from "@/lib/types/stories";

const storyTypeLabel: Record<string, string> = {
  COMICS: "Truyện tranh",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  NOVEL: "Light novel",
};

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-100 text-emerald-700" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-100 text-sky-700" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-100 text-amber-700" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-100 text-rose-700" },
};

export default function StoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        setError("Không tải được thông tin truyện.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl flex items-center px-6 py-4">
            <Link href="/" className="text-xl font-bold">
              Truyện<span className="text-indigo-600">Online</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-muted-foreground">{error ?? "Truyện không tồn tại."}</p>
          <Link href="/stories" className="mt-4 inline-block text-indigo-600 hover:underline">
            Quay lại danh sách truyện
          </Link>
        </div>
      </div>
    );
  }

  const firstChapter = chapters[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Truyện<span className="text-indigo-600">Online</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/stories" className="rounded-full border border-border px-4 py-1.5 text-xs font-medium transition hover:bg-muted">
              Danh sách
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-48 shrink-0">
            <div className="aspect-[3/4] rounded-xl bg-muted overflow-hidden">
              {story.coverImageUrl && (
                <img
                  src={story.coverImageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[story.status]?.className ?? "bg-muted"}`}>
                {statusConfig[story.status]?.text ?? story.status}
              </span>
              <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium">
                {storyTypeLabel[story.storyType] ?? story.storyType}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold">{story.title}</h1>

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
                <Link
                  href={`/stories/${slug}/chapters/${firstChapter.id}`}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Bắt đầu đọc
                </Link>
              )}
              <button
                className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition hover:bg-muted"
                title="Chức năng đang phát triển"
              >
                Tiếp tục đọc
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold">Danh sách chương</h2>

          {chapters.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Chưa có chương nào.</p>
          ) : (
            <div className="mt-4 rounded-xl border border-border overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/stories/${slug}/chapters/${chapter.id}`}
                    className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition"
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
      </main>
    </div>
  );
}
