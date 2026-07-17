"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import { StoryCard } from "../components/StoryCard";
import { deleteStory, deletePublishRequest, getMyInfo, getMyPublishRequests, getStories, requestPublish } from "@/lib/api/stories";
import { clearTokens } from "@/lib/api/client";
import type { Story, StoryPublishRequestStatus } from "@/lib/types/stories";

export default function StoryListPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [requestModalStory, setRequestModalStory] = useState<Story | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requests, setRequests] = useState<{ id: string; story: Story; requesterNote?: string; status: StoryPublishRequestStatus }[]>([]);
  const [requestsTab, setRequestsTab] = useState<"list" | "mine">("list");

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      try {
        const [myInfo, result] = await Promise.all([getMyInfo(), getStories({ size: 50 })]);
        setStories(result.data ?? []);
        if (myInfo.id) {
          localStorage.setItem("uploader_profile_id", myInfo.id);
        }
      } catch {
        setError("Không tải được danh sách truyện. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const handleDelete = async (story: Story) => {
    if (!story.id) return;
    const confirmed = window.confirm(`Xóa truyện "${story.title}"? Hành động này không thể hoàn tác.`);
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

  const openRequestModal = (story: Story) => {
    setRequestModalStory(story);
    setRequestNote("");
  };

  const submitPublishRequest = async () => {
    if (!requestModalStory?.id) return;
    try {
      setRequestsLoading(true);
      setError(null);
      await requestPublish(requestModalStory.id, requestNote || undefined);
      setRequestModalStory(null);
      setRequestNote("");
      setStories((prev) =>
        prev.map((item) => (item.id === requestModalStory.id ? { ...item, isPublished: true } : item)),
      );
    } catch {
      setError("Không thể gửi yêu cầu xuất bản. Vui lòng thử lại.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const switchTab = async (tab: "list" | "mine") => {
    setRequestsTab(tab);
    if (tab !== "mine") return;
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await getMyPublishRequests({ size: 20 });
      setRequests(
        (data ?? []).map((item) => ({
          id: item.id,
          story: item.story,
          requesterNote: item.requesterNote,
          status: item.status,
        })),
      );
    } catch {
      setRequestsError("Không tải được danh sách yêu cầu xuất bản.");
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const revokeRequest = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(revokeTarget);
      setError(null);
      await deletePublishRequest(revokeTarget);
      setRequests((prev) => prev.filter((item) => item.id !== revokeTarget));
    } catch {
      setError("Không thể thu hồi yêu cầu. Vui lòng thử lại.");
    } finally {
      setRevoking(null);
      setRevokeTarget(null);
    }
  };

  return (
    <UploaderLayout>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Truyện của tôi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý truyện, chương và trạng thái xuất bản.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/uploader/stories/new")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Tạo truyện mới
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 pt-3">
          <button
            type="button"
            onClick={() => switchTab("list")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              requestsTab === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Danh sách truyện
          </button>
          <button
            type="button"
            onClick={() => switchTab("mine")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              requestsTab === "mine" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Các yêu cầu xuất bản truyện
          </button>
        </div>

        <div className="p-4">
          {requestsTab === "list" ? (
            <div className="grid gap-4">
              {loading && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Đang tải truyện...
                </div>
              )}
              {!loading && stories.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Bạn chưa có truyện nào. Tạo truyện mới để bắt đầu thêm chương.
                </div>
              )}
              {!loading &&
                stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onDelete={() => handleDelete(story)}
                    isDeleting={actionLoading === story.id}
                    onRequestPublish={() => openRequestModal(story)}
                    isRequestingPublish={false}
                  />
                ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {requestsLoading && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Đang tải yêu cầu...
                </div>
              )}
              {!requestsLoading && requestsError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{requestsError}</div>
              )}
              {!requestsLoading && requests.length === 0 && !requestsError && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Bạn chưa có yêu cầu xuất bản nào.
                </div>
              )}
              {!requestsLoading &&
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-border bg-background p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold">{request.story.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {request.requesterNote || "Không có ghi chú."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          request.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : request.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {request.status === "PENDING" ? "Đang chờ" : request.status === "APPROVED" ? "Đã phê duyệt" : "Đã từ chối"}
                      </span>
                      {request.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => setRevokeTarget(request.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Thu hồi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {requestModalStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold">Yêu cầu xuất bản truyện</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {requestModalStory?.title ?? "Truyện"}
              </p>
            </div>
            <div className="px-6 py-4">
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                value={requestNote}
                onChange={(event) => setRequestNote(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                rows={4}
                placeholder="Nhập ghi chú cho người duyệt..."
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => setRequestModalStory(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitPublishRequest}
                disabled={requestsLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {requestsLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold">Thu hồi yêu cầu xuất bản</h3>
              <p className="mt-1 text-sm text-muted-foreground">Bạn có chắc muốn thu hồi yêu cầu này không?</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (revoking) return;
                  setRevokeTarget(null);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={revokeRequest}
                disabled={revoking === revokeTarget}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {revoking === revokeTarget ? "Đang thu hồi..." : "Xác nhận thu hồi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UploaderLayout>
  );
}
