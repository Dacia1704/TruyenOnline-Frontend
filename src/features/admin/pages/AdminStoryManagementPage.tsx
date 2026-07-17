"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { getStories, deleteStory } from "@/lib/api/stories";
import type { Story } from "@/lib/types/stories";
import { clearTokens } from "@/lib/api/client";
import { useRouter } from "next/navigation";

type Tab = "published" | "unpublished";

export default function AdminStoryManagementPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("published");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStories({
        size: 100,
        isPublished: tab === "published" ? true : false,
      });
      setStories(result.data ?? []);
    } catch {
      setError("Không tải được danh sách truyện.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [tab]);

  const handleDelete = async (story: Story) => {
    if (!story.id) return;
    const confirmed = window.confirm(`Xóa truyện "${story.title}"?`);
    if (!confirmed) return;
    try {
      setActionLoading(story.id);
      setError(null);
      await deleteStory(story.id);
      setStories((prev) => prev.filter((item) => item.id !== story.id));
    } catch {
      setError("Không thể xóa truyện. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    clearTokens();
    router.push("/login");
  };

  const counts = useMemo(() => {
    return {
      published: stories.filter((story) => story.isPublished !== false).length,
      unpublished: stories.filter((story) => story.isPublished === false).length,
    };
  }, [stories]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý story</h1>
          <p className="mt-1 text-sm text-muted-foreground">Xem, lọc và xóa truyện trên hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTab("published")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            tab === "published"
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Đã xuất bản {counts.published ? `(${counts.published})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setTab("unpublished")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            tab === "unpublished"
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Chưa xuất bản {counts.unpublished ? `(${counts.unpublished})` : ""}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Truyện</th>
                <th className="px-4 py-3 text-left font-medium">Tác giả</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium">Lượt xem</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && stories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Không có truyện nào trong trạng thái này.
                  </td>
                </tr>
              )}
              {!loading &&
                stories.map((story) => (
                  <tr key={story.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{story.title}</td>
                    <td className="px-4 py-3">{story.uploader?.username || "—"}</td>
                    <td className="px-4 py-3">{story.status}</td>
                    <td className="px-4 py-3">{story.viewCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(story)}
                          disabled={actionLoading === story.id}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                        >
                          {actionLoading === story.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
