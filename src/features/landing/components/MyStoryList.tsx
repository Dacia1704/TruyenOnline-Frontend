"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyInfo, getStories } from "@/lib/api/stories";
import type { Story } from "@/lib/types/stories";

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

export function MyStoryList() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const myInfo = await getMyInfo();
        const result = await getStories({ uploaderId: myInfo.id, size: 20 });
        setStories(result.data ?? []);
      } catch {
        setError("Không tải được danh sách truyện của bạn.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">Truyện của tôi</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Danh sách truyện bạn đang quản lý. Nhấn vào truyện để thêm hoặc chỉnh sửa chương.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-border bg-card p-6 text-center text-sm text-red-600">{error}</div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        {!loading && stories.length === 0 && !error && (
          <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Bạn chưa có truyện nào. Tạo truyện đầu tiên để bắt đầu.
          </div>
        )}
        {!loading &&
          stories.map((story) => (
            <Link
              key={story.id}
              href={`/uploader/stories/${story.slug}/chapters`}
              className="group rounded-2xl border border-border bg-card overflow-hidden transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="h-40 bg-muted">
                {story.coverImageUrl && (
                  <img
                    src={story.coverImageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-indigo-600 transition line-clamp-1">{story.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {storyTypeLabel[story.storyType] ?? story.storyType}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusConfig[story.status]?.className ?? "bg-muted"
                    }`}
                  >
                    {statusConfig[story.status]?.text ?? story.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{story.viewCount.toLocaleString()} lượt xem</span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
