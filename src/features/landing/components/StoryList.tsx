"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStories } from "@/lib/api/stories";
import type { Story } from "@/lib/types/stories";

const storyTypeLabel: Record<string, string> = {
  COMICS: "Truyện tranh",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  NOVEL: "Light novel",
};

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-500/20 text-sky-400 border border-sky-500/30" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-500/20 text-rose-400 border border-rose-500/30" },
};

export function StoryList() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getStories({ isPublished: true, size: 12, page, sortType: "NEWEST" });
        setStories(result.data ?? []);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      } catch {
        setError("Không tải được danh sách truyện.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const total = totalPages;
    const current = page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  return (
    <section className="pb-4 pt-8 px-6 bg-background dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">Truyện mới</h2>
            <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
              Những bộ truyện mới nhất trên nền tảng.
            </p>
          </div>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 rounded-lg border border-border dark:border-white/20 bg-background dark:bg-white/5 px-4 py-2 text-sm font-medium text-foreground dark:text-white/80 transition hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Xem tất cả
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading &&
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-slate-800/50 overflow-hidden"
              >
                <div className="h-48 bg-muted dark:bg-slate-700 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 bg-muted dark:bg-slate-700 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}

          {!loading &&
            stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                className="group rounded-xl border border-border dark:border-white/10 bg-card dark:bg-slate-800/50 overflow-hidden transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5"
              >
                {story.coverImageUrl ? (
                  <img src={story.coverImageUrl} alt={story.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <img
                      src="/images/icon/main.png"
                      alt="placeholder"
                      className="w-12 h-12 object-contain opacity-50"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground dark:text-white group-hover:text-indigo-400 dark:group-hover:text-indigo-400 transition line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {storyTypeLabel[story.storyType] ?? story.storyType}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusConfig[story.status]?.className ??
                        "bg-muted dark:bg-slate-700 text-foreground dark:text-slate-300"
                      }`}
                    >
                      {statusConfig[story.status]?.text ?? story.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{story.viewCount.toLocaleString()} lượt</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-border dark:border-white/20 bg-background dark:bg-white/5 px-4 py-2 text-sm font-medium text-foreground dark:text-white/80 transition hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground dark:text-slate-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition ${
                      p === page
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                        : "border border-border dark:border-white/20 bg-background dark:bg-white/5 text-foreground dark:text-white/80 hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-border dark:border-white/20 bg-background dark:bg-white/5 px-4 py-2 text-sm font-medium text-foreground dark:text-white/80 transition hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}

        {!loading && totalElements > 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground dark:text-slate-500">
            Hiển thị {(page - 1) * 12 + 1} - {Math.min(page * 12, totalElements)} của {totalElements.toLocaleString()}{" "}
            truyện
          </p>
        )}
      </div>
    </section>
  );
}
