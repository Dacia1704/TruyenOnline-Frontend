"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getStories } from "@/lib/api/stories";
import type { Story, StoryType, StoryStatus } from "@/lib/types/stories";

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

const STORY_TYPES: { value: StoryType | ""; label: string }[] = [
  { value: "", label: "Tất cả loại" },
  { value: "NOVEL", label: "Light novel" },
  { value: "MANGA", label: "Truyện tranh" },
  { value: "COMICS", label: "Comics" },
  { value: "MANHWA", label: "Manhwa" },
  { value: "MANHUA", label: "Manhua" },
];

const STORY_STATUSES: { value: StoryStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ONGOING", label: "Đang ra" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "HIATUS", label: "Tạm dừng" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function StoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [type, setType] = useState<StoryType | "">(searchParams.get("type") as StoryType | "" || "");
  const [status, setStatus] = useState<StoryStatus | "">(searchParams.get("status") as StoryStatus | "" || "");

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
  }, [page, search, type, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    router.push(`/stories?${params.toString()}`);
  };

  const handleFilterChange = (key: "type" | "status", value: string) => {
    if (key === "type") setType(value as StoryType | "");
    else setStatus(value as StoryStatus | "");
    setPage(1);
  };

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Truyện<span className="text-indigo-600">Online</span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            Trang chủ
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-bold">Danh sách truyện</h1>
        <p className="mt-2 text-muted-foreground">
          Khám phá hàng ngàn truyện hay từ cộng đồng.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm truyện..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            {STORY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            {STORY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Tìm kiếm
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
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
                <div className="h-48 bg-muted" />
                <div className="p-3">
                  <h3 className="font-semibold text-sm group-hover:text-indigo-600 transition line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {storyTypeLabel[story.storyType] ?? story.storyType}
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
                      {story.viewCount.toLocaleString()} view
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {!loading && stories.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Không tìm thấy truyện nào.</p>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
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
                        : "border border-border hover:bg-muted"
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
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
