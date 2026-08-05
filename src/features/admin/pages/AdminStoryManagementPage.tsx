"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { getStories, deleteStory, banStory, unbanStory, ViolationType } from "@/lib/api/stories";
import type { Story } from "@/lib/types/stories";

type Tab = "published" | "unpublished";

const VIOLATION_TYPES: { value: ViolationType; label: string }[] = [
  { value: "COPYRIGHT", label: "Vi phạm bản quyền" },
  { value: "PORNOGRAPHY", label: "Nội dung khiêu dâm" },
  { value: "VIOLENCE", label: "Nội dung bạo lực" },
  { value: "SPAM", label: "Spam/Quảng cáo" },
  { value: "HARASSMENT", label: "Quấy rối/Lăng mạ" },
  { value: "OTHER", label: "Khác" },
];

export default function AdminStoryManagementPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("published");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Ban modal state
  const [banModal, setBanModal] = useState<{ open: boolean; story: Story | null }>({ open: false, story: null });
  const [banReason, setBanReason] = useState("");
  const [banViolation, setBanViolation] = useState<ViolationType>("OTHER");

  // Unban modal state
  const [unbanModal, setUnbanModal] = useState<{ open: boolean; story: Story | null }>({ open: false, story: null });
  const [unbanReason, setUnbanReason] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleBan = async () => {
    if (!banModal.story?.id || !banReason.trim()) return;
    try {
      setActionLoading(banModal.story.id);
      setError(null);
      await banStory(banModal.story.id, banViolation, banReason);
      setBanModal({ open: false, story: null });
      setBanReason("");
      setBanViolation("OTHER");
      loadStories();
    } catch {
      setError("Không thể ban truyện. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async () => {
    if (!unbanModal.story?.id || !unbanReason.trim()) return;
    try {
      setActionLoading(unbanModal.story.id);
      setError(null);
      await unbanStory(unbanModal.story.id, unbanReason);
      setUnbanModal({ open: false, story: null });
      setUnbanReason("");
      loadStories();
    } catch {
      setError("Không thể unban truyện. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const counts = useMemo(() => {
    return {
      published: stories.filter((story) => story.isPublished !== false).length,
      unpublished: stories.filter((story) => story.isPublished === false).length,
    };
  }, [stories]);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý story</h1>
          <p className="mt-1 text-sm text-muted-foreground">Xem, lọc và xóa truyện trên hệ thống.</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 lg:mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-4 lg:mt-6 flex items-center gap-3">
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
          <table className="w-full text-sm min-w-[600px]">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {story.isBanned && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                            Bị ban
                          </span>
                        )}
                        <span className="font-medium">{story.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{story.uploader?.username || "—"}</td>
                    <td className="px-4 py-3">{story.status}</td>
                    <td className="px-4 py-3">{story.viewCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {story.isBanned ? (
                          <button
                            type="button"
                            onClick={() => setUnbanModal({ open: true, story })}
                            disabled={actionLoading === story.id}
                            className="rounded-lg border border-green-500 px-3 py-1.5 text-xs font-semibold text-green-500 transition hover:bg-green-50 disabled:opacity-60"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBanModal({ open: true, story })}
                            disabled={actionLoading === story.id}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                          >
                            Ban
                          </button>
                        )}
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

      {/* Ban Modal */}
      {banModal.open && banModal.story && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
            <h2 className="text-lg font-bold">Ban truyện</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn đang ban truyện: <span className="font-medium text-foreground">{banModal.story.title}</span>
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">Loại vi phạm</label>
                <select
                  value={banViolation}
                  onChange={(e) => setBanViolation(e.target.value as ViolationType)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  {VIOLATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Lý do (bắt buộc)</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Nhập lý do ban..."
                  maxLength={1000}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">{banReason.length}/1000 ký tự</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setBanModal({ open: false, story: null });
                  setBanReason("");
                  setBanViolation("OTHER");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleBan}
                disabled={!banReason.trim() || actionLoading === banModal.story?.id}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {actionLoading === banModal.story?.id ? "Đang xử lý..." : "Xác nhận Ban"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Modal */}
      {unbanModal.open && unbanModal.story && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
            <h2 className="text-lg font-bold">Unban truyện</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn đang unban truyện: <span className="font-medium text-foreground">{unbanModal.story.title}</span>
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium">Lý do unban (bắt buộc)</label>
              <textarea
                value={unbanReason}
                onChange={(e) => setUnbanReason(e.target.value)}
                placeholder="Nhập lý do unban..."
                maxLength={1000}
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">{unbanReason.length}/1000 ký tự</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setUnbanModal({ open: false, story: null });
                  setUnbanReason("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUnban}
                disabled={!unbanReason.trim() || actionLoading === unbanModal.story?.id}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
              >
                {actionLoading === unbanModal.story?.id ? "Đang xử lý..." : "Xác nhận Unban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
