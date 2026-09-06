"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStories } from "@/lib/api/stories";
import type { Story } from "@/lib/types/stories";
import { Sidebar } from "./Sidebar";

const storyTypeLabel: Record<string, string> = {
  MANGA: "Truyện tranh",
  NOVEL: "Light novel",
};

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-500/20 text-sky-400 border border-sky-500/30" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  DROPPED: { text: "Bỏ dở", className: "bg-rose-500/20 text-rose-400 border border-rose-500/30" },
};

export function NewestStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortType, setSortType] = useState<"NEWEST" | "UPDATED">("NEWEST");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getStories({
          isPublished: true,
          size: 12,
          page,
          sortType,
        });
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
  }, [page, sortType]);

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
    <section className="py-8 px-6 bg-background dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-white">
                  {sortType === "NEWEST" ? "Truyện mới" : "Mới cập nhật"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                  {sortType === "NEWEST" ? "Những bộ truyện mới nhất" : "Những truyện được cập nhật gần đây"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSortType("NEWEST");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortType === "NEWEST"
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "border border-border dark:border-white/20 bg-background dark:bg-white/5 text-foreground dark:text-white/80 hover:bg-muted dark:hover:bg-white/10"
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => {
                    setSortType("UPDATED");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortType === "UPDATED"
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "border border-border dark:border-white/20 bg-background dark:bg-white/5 text-foreground dark:text-white/80 hover:bg-muted dark:hover:bg-white/10"
                  }`}
                >
                  Mới cập nhật
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading &&
                Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-slate-800/50 overflow-hidden"
                  >
                    <div className="h-56 bg-muted dark:bg-slate-700 animate-pulse" />
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
                    <div className="relative">
                      {story.coverImageUrl ? (
                        <img src={story.coverImageUrl} alt={story.title} className="h-56 w-full object-cover" />
                      ) : (
                        <div className="h-56 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <img
                            src="/images/icon/main.png"
                            alt="placeholder"
                            className="w-12 h-12 object-contain opacity-50"
                          />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <span className="text-xs text-white font-medium">
                          {storyTypeLabel[story.storyType] ?? story.storyType}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground dark:text-white group-hover:text-indigo-400 dark:group-hover:text-indigo-400 transition line-clamp-2 min-h-[2.5rem]">
                        {story.title}
                      </h3>
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
                Hiển thị {(page - 1) * 12 + 1} - {Math.min(page * 12, totalElements)} của{" "}
                {totalElements.toLocaleString()} truyện
              </p>
            )}
          </div>

          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
