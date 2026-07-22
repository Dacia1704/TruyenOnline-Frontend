"use client";

import { PageLayout } from "@/components/PageLayout";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getStories } from "@/lib/api/stories";
import { getGenres } from "@/lib/api/admin";
import type { Story, StoryType, StoryStatus, Genre } from "@/lib/types/stories";

type SortType = "NEWEST" | "UPDATED" | "VIEW" | "FOLLOW" | "ALPHABET_ASC" | "ALPHABET_DESC" | "OLDEST";

const STORY_TYPES: { value: StoryType | ""; label: string }[] = [
  { value: "", label: "Tất cả loại" },
  { value: "NOVEL", label: "Light novel" },
  { value: "MANGA", label: "Truyện tranh" },
];

const STORY_STATUSES: { value: StoryStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ONGOING", label: "Đang ra" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "HIATUS", label: "Tạm dừng" },
  { value: "DROPPED", label: "Đã drop" },
];

const SORT_TYPES: { value: SortType | ""; label: string }[] = [
  { value: "", label: "Mặc định" },
  { value: "NEWEST", label: "Mới nhất" },
  { value: "UPDATED", label: "Mới cập nhật" },
  { value: "VIEW", label: "Lượt xem" },
  { value: "FOLLOW", label: "Theo dõi" },
  { value: "ALPHABET_ASC", label: "A -> Z" },
  { value: "ALPHABET_DESC", label: "Z -> A" },
  { value: "OLDEST", label: "Cũ nhất" },
];

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-500/20 text-emerald-400" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-500/20 text-sky-400" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-500/20 text-amber-400" },
  DROPPED: { text: "Đã drop", className: "bg-rose-500/20 text-rose-400" },
};

export default function StoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [type, setType] = useState<StoryType | "">(searchParams.get("type") as StoryType | "" || "");
  const [status, setStatus] = useState<StoryStatus | "">(searchParams.get("status") as StoryStatus | "" || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("genres")?.split(",").filter(Boolean) ?? []
  );
  const [sortType, setSortType] = useState<SortType | "">(searchParams.get("sort") as SortType | "" || "");

  const [showFilters, setShowFilters] = useState(false);

  const loadGenres = useCallback(async () => {
    try {
      const data = await getGenres();
      setGenres(data ?? []);
    } catch {
      // Silently fail
    } finally {
      setGenresLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGenres();
  }, [loadGenres]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getStories({
          isPublished: true,
          page,
          size: 24,
          search: search || undefined,
          type: type || undefined,
          status: status || undefined,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
          sortType: sortType || undefined,
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
  }, [page, search, type, status, selectedGenres, sortType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","));
    if (sortType) params.set("sort", sortType);
    router.push(`/stories?${params.toString()}`);
  };

  const handleFilterChange = (key: "type" | "status" | "sortType", value: string) => {
    if (key === "type") setType(value as StoryType | "");
    else if (key === "status") setStatus(value as StoryStatus | "");
    else if (key === "sortType") setSortType(value as SortType | "");
    setPage(1);
  };

  const toggleGenre = (genreSlug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreSlug)
        ? prev.filter((g) => g !== genreSlug)
        : [...prev, genreSlug]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setType("");
    setStatus("");
    setSelectedGenres([]);
    setSortType("");
    setPage(1);
    router.push("/stories");
  };

  const hasActiveFilters = search || type || status || selectedGenres.length > 0 || sortType;

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
    <PageLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground">Danh sách truyện</h1>
        <p className="mt-2 text-muted-foreground">
          Khám phá hàng ngàn truyện hay từ cộng đồng.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm truyện..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-foreground"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Bộ lọc
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                  {(!!type ? 1 : 0) + (!!status ? 1 : 0) + selectedGenres.length + (!!sortType ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Loại truyện</label>
                  <select
                    value={type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 text-foreground"
                  >
                    {STORY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 text-foreground"
                  >
                    {STORY_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Sắp xếp</label>
                  <select
                    value={sortType}
                    onChange={(e) => handleFilterChange("sortType", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 text-foreground"
                  >
                    {SORT_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Thể loại</label>
                {genresLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-7 w-20 bg-muted animate-pulse rounded-full" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <button
                        key={genre.slug}
                        type="button"
                        onClick={() => toggleGenre(genre.slug)}
                        className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                          selectedGenres.includes(genre.slug)
                            ? "bg-indigo-600 text-white"
                            : "bg-muted text-muted-foreground hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedGenres.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Đã chọn:</span>
                  {selectedGenres.map((slug) => {
                    const genre = genres.find((g) => g.slug === slug);
                    return (
                      <span
                        key={slug}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                      >
                        {genre?.name ?? slug}
                        <button
                          type="button"
                          onClick={() => toggleGenre(slug)}
                          className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900 p-6 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {totalElements > 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            Tìm thấy {totalElements.toLocaleString()} truyện
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading &&
            Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}

          {!loading &&
            stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                className="group rounded-xl border border-border bg-card overflow-hidden transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                {story.coverImageUrl ? (
                  <img src={story.coverImageUrl} alt={story.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm group-hover:text-indigo-400 transition line-clamp-1 text-foreground">
                    {story.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {story.storyType === "NOVEL" ? "Light novel" : "Truyện tranh"}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusConfig[story.status]?.className ?? "bg-muted"
                      }`}
                    >
                      {statusConfig[story.status]?.text ?? story.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {story.viewCount?.toLocaleString() ?? 0} view
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {!loading && stories.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Không tìm thấy truyện nào.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-indigo-400 hover:underline"
              >
                Xóa bộ lọc và thử lại
              </button>
            )}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition ${
                      p === page
                        ? "bg-indigo-600 text-white"
                        : "border border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
