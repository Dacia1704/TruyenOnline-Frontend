"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { getPublishRequests, approvePublishRequest, rejectPublishRequest } from "@/lib/api/stories";
import type { StoryPublishRequestStatus } from "@/lib/types/stories";

type ReviewAction = "APPROVED" | "REJECTED";

const statusConfig: Record<StoryPublishRequestStatus, { label: string; className: string }> = {
  PENDING: { label: "Đang chờ", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã phê duyệt", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Đã từ chối", className: "bg-rose-100 text-rose-700" },
};

export default function AdminStoryApprovalPage() {
  const [requests, setRequests] = useState<
    {
      id: string;
      storyId: string;
      title: string;
      requesterNote?: string;
      reviewerNote?: string;
      reviewerUsername?: string;
      status: StoryPublishRequestStatus;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StoryPublishRequestStatus>("PENDING");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublishRequests({ status: filter, size: 50 });
      setRequests(
        (data ?? []).map((item) => ({
          id: item.id,
          storyId: item.story.id,
          title: item.story.title,
          requesterNote: item.requesterNote,
          reviewerNote: item.reviewerNote,
          reviewerUsername: item.reviewer?.username,
          status: item.status,
        })),
      );
    } catch {
      setError("Không tải được danh sách yêu cầu xuất bản.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const openReview = (id: string, action: ReviewAction) => {
    setReviewingId(id);
    setReviewAction(action);
    setReviewNote("");
  };

  const submitReview = async () => {
    if (!reviewingId || !reviewAction) return;
    try {
      setLoading(true);
      setError(null);
      if (reviewAction === "APPROVED") {
        await approvePublishRequest(reviewingId, reviewNote || undefined);
      } else {
        await rejectPublishRequest(reviewingId, reviewNote || undefined);
      }
      await loadRequests();
    } catch {
      setError("Không thể xử lý yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setReviewingId(null);
      setReviewAction(null);
      setReviewNote("");
    }
  };

  const modalOpen = Boolean(reviewingId);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Duyệt yêu cầu xuất bản</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phê duyệt, từ chối hoặc theo dõi trạng thái yêu cầu xuất bản.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StoryPublishRequestStatus)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="PENDING">Đang chờ</option>
          <option value="APPROVED">Đã phê duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-8 grid gap-4">
        {loading && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Đang tải danh sách yêu cầu...
          </div>
        )}
        {!loading && requests.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Không có yêu cầu xuất bản trong trạng thái này.
          </div>
        )}
        {!loading &&
          requests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{request.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {request.requesterNote || "Không có ghi chú từ người tạo."}
                  </p>
                  {request.reviewerNote && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Ghi chú phê duyệt:</span> {request.reviewerNote}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    statusConfig[request.status]?.className
                  }`}
                >
                  {statusConfig[request.status]?.label}
                </span>
              </div>

              {request.status === "PENDING" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openReview(request.id, "APPROVED")}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Phê duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => openReview(request.id, "REJECTED")}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold">
                {reviewAction === "APPROVED" ? "Phê duyệt yêu cầu xuất bản" : "Từ chối yêu cầu xuất bản"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thêm ghi chú nếu cần. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="px-6 py-4">
              <label className="text-sm font-medium">Ghi chú của bạn</label>
              <textarea
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                rows={4}
                placeholder="Nhập ghi chú phản hồi..."
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setReviewingId(null);
                  setReviewAction(null);
                  setReviewNote("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitReview}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Đang xử lý..." : reviewAction === "APPROVED" ? "Phê duyệt" : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
