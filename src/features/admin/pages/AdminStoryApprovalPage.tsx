"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { getStories } from "@/lib/api/stories";

type StoryStatus = "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED";

const statusConfig: Record<
  StoryStatus,
  { label: string; className: string; query: boolean | undefined }
> = {
  ONGOING: { label: "Đang ra", className: "bg-emerald-100 text-emerald-700", query: true },
  COMPLETED: { label: "Hoàn thành", className: "bg-sky-100 text-sky-700", query: true },
  HIATUS: { label: "Tạm dừng", className: "bg-amber-100 text-amber-700", query: true },
  CANCELLED: { label: "Đã hủy", className: "bg-rose-100 text-rose-700", query: true },
};

export default function AdminStoryApprovalPage() {
  const [stories, setStories] = useState<{ id: string; title: string; status: StoryStatus }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StoryStatus>("ONGOING");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getStories({ isPublished: true, status: filter, size: 50 });
        setStories((result.data?.data ?? []).map((item) => ({ id: item.id, title: item.title, status: item.status })));
      } catch {
        setError("Không tải được danh sách truyện.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Duyệt truyện</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phê duyệt, từ chối hoặc theo dõi trạng thái xuất bản.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StoryStatus)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          {Object.entries(statusConfig).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {loading && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Đang tải danh sách truyện...
          </div>
        )}
        {!loading && stories.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Không có truyện cần duyệt trong trạng thái này.
          </div>
        )}
        {!loading &&
          stories.map((story) => (
            <div
              key={story.id}
              className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold">{story.title}</p>
                <span className={`inline-block mt-2 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[story.status]?.className}`}>
                  {statusConfig[story.status]?.label}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Phê duyệt
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
      </div>
    </AdminLayout>
  );
}
