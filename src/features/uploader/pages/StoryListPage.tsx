"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import { StoryCard } from "../components/StoryCard";
import {
  deleteStory,
  deletePublishRequest,
  getMyInfo,
  getMyPublishRequests,
  getStories,
  requestPublish,
  getModerationActionById,
  createBanAppeal,
  type ModerationAction,
  type ViolationType,
} from "@/lib/api/stories";
import type { Story, StoryPublishRequestStatus } from "@/lib/types/stories";
import { toast } from "sonner";

const violationTypeLabels: Record<ViolationType, string> = {
  COPYRIGHT: "Vi phạm bản quyền",
  PORNOGRAPHY: "Nội dung đồi trụy",
  VIOLENCE: "Bạo lực",
  SPAM: "Spam",
  HARASSMENT: "Quấy rối",
  OTHER: "Khác",
};

interface PublishRequestInfo {
  id: string;
  requesterNote?: string;
  reviewerNote?: string;
  reviewerName?: string;
  status: StoryPublishRequestStatus;
}

export default function StoryListPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [requestModalStory, setRequestModalStory] = useState<Story | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Publish request detail modal
  const [publishRequestDetail, setPublishRequestDetail] = useState<{
    reviewerNote?: string;
    reviewerName?: string;
    status: StoryPublishRequestStatus;
    requesterNote?: string;
    requestId?: string;
  } | null>(null);

  // Ban reason modal state
  const [banReasonModal, setBanReasonModal] = useState<{
    story: Story;
    moderationAction: ModerationAction | null;
    loading: boolean;
  } | null>(null);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealContent, setAppealContent] = useState("");
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  // Map of storyId -> PublishRequestInfo (for non-published stories)
  const [publishRequests, setPublishRequests] = useState<Map<string, PublishRequestInfo>>(new Map());

  const getPublishRequestInfo = (storyId: string): PublishRequestInfo | undefined => {
    return publishRequests.get(storyId);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [myInfo, result, requests] = await Promise.all([
          getMyInfo(),
          getStories({ size: 50 }),
          getMyPublishRequests({ size: 100 }),
        ]);
        setStories(result.data ?? []);

        if (myInfo.id) {
          localStorage.setItem("uploader_profile_id", myInfo.id);
        }

        // Build a map of storyId -> publish request info (only non-published stories)
        const requestMap = new Map<string, PublishRequestInfo>();
        (requests ?? []).forEach((req) => {
          requestMap.set(req.story.id, {
            id: req.id,
            requesterNote: req.requesterNote,
            reviewerNote: req.reviewerNote,
            reviewerName: req.reviewer?.username,
            status: req.status,
          });
        });
        setPublishRequests(requestMap);
      } catch {
        setError("Không tải được danh sách truyện. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

      // Refresh requests
      const requests = await getMyPublishRequests({ size: 100 });
      const requestMap = new Map<string, PublishRequestInfo>();
      (requests ?? []).forEach((req) => {
        requestMap.set(req.story.id, {
          id: req.id,
          requesterNote: req.requesterNote,
          reviewerNote: req.reviewerNote,
          reviewerName: req.reviewer?.username,
          status: req.status,
        });
      });
      setPublishRequests(requestMap);
    } catch {
      setError("Không thể gửi yêu cầu xuất bản. Vui lòng thử lại.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const revokeRequest = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(revokeTarget);
      setError(null);
      await deletePublishRequest(revokeTarget);

      // Remove from publishRequests map
      setPublishRequests((prev) => {
        const next = new Map(prev);
        const keysToDelete: string[] = [];
        next.forEach((req, key) => {
          if (req.id === revokeTarget) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach((key) => next.delete(key));
        return next;
      });

      // If the story was updated to published, refresh stories
      const requests = await getMyPublishRequests({ size: 100 });
      const result = await getStories({ size: 50 });
      setStories(result.data ?? []);

      const requestMap = new Map<string, PublishRequestInfo>();
      (requests ?? []).forEach((req) => {
        requestMap.set(req.story.id, {
          id: req.id,
          requesterNote: req.requesterNote,
          reviewerNote: req.reviewerNote,
          reviewerName: req.reviewer?.username,
          status: req.status,
        });
      });
      setPublishRequests(requestMap);
    } catch {
      setError("Không thể thu hồi yêu cầu. Vui lòng thử lại.");
    } finally {
      setRevoking(null);
      setRevokeTarget(null);
    }
  };

  const handleViewPublishRequestDetail = (
    requesterNote?: string,
    reviewerNote?: string,
    reviewerName?: string,
    requestId?: string,
  ) => {
    setPublishRequestDetail({
      requesterNote,
      reviewerNote,
      reviewerName,
      requestId,
      status: requestId ? getPublishRequestInfoById(requestId)?.status ?? "PENDING" : "PENDING",
    });
  };

  // Helper to find request info by ID
  const getPublishRequestInfoById = (requestId: string): PublishRequestInfo | undefined => {
    for (const req of Array.from(publishRequests.values())) {
      if (req.id === requestId) return req;
    }
    return undefined;
  };

  // View ban reason
  const handleViewBanReason = async (story: Story) => {
    if (!story.id) return;
    setBanReasonModal({ story, moderationAction: null, loading: true });
    try {
      const moderationAction = await getModerationActionById(story.id);
      setBanReasonModal({ story, moderationAction, loading: false });
    } catch {
      setBanReasonModal({ story, moderationAction: null, loading: false });
      toast.error("Không tải được thông tin vi phạm");
    }
  };

  const handleSubmitAppeal = async () => {
    if (!banReasonModal?.moderationAction || !appealContent.trim()) return;
    setSubmittingAppeal(true);
    try {
      await createBanAppeal(banReasonModal.moderationAction.id, appealContent.trim());
      toast.success("Đã gửi khiếu nại thành công");
      setShowAppealForm(false);
      setAppealContent("");
      setBanReasonModal(null);
    } catch {
      toast.error("Không thể gửi khiếu nại");
    } finally {
      setSubmittingAppeal(false);
    }
  };

  return (
    <UploaderLayout>
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Danh sách truyện</h1>
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
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mx-auto max-w-7xl px-3 py-3 mt-6 rounded-2xl border border-border bg-card">
        <div className="p-4">
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
              stories.map((story) => {
                const requestInfo = getPublishRequestInfo(story.id);
                return (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onDelete={() => handleDelete(story)}
                    isDeleting={actionLoading === story.id}
                    onRequestPublish={!story.isPublished && !requestInfo ? () => openRequestModal(story) : undefined}
                    isRequestingPublish={false}
                    onViewBanReason={story.isBanned ? () => handleViewBanReason(story) : undefined}
                    publishRequestStatus={requestInfo?.status}
                    publishRequestNote={requestInfo?.requesterNote}
                    publishRequestId={requestInfo?.id}
                    onViewPublishRequestDetail={
                      requestInfo && requestInfo.status !== "APPROVED"
                        ? () =>
                            handleViewPublishRequestDetail(
                              requestInfo.requesterNote,
                              requestInfo.reviewerNote,
                              requestInfo.reviewerName,
                              requestInfo.id,
                            )
                        : undefined
                    }
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* Publish Request Detail Modal */}
      {publishRequestDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    publishRequestDetail.status === "PENDING"
                      ? "bg-amber-100 dark:bg-amber-500/20"
                      : "bg-rose-100 dark:bg-rose-500/20"
                  }`}
                >
                  {publishRequestDetail.status === "PENDING" ? (
                    <svg
                      className="h-5 w-5 text-amber-600 dark:text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-rose-600 dark:text-rose-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {publishRequestDetail.status === "PENDING" ? "Đang chờ phê duyệt" : "Đã từ chối"}
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {publishRequestDetail.requesterNote && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ghi chú của bạn</p>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">{publishRequestDetail.requesterNote}</p>
                </div>
              )}
              {publishRequestDetail.reviewerNote && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {publishRequestDetail.status === "PENDING" ? "Phản hồi từ quản trị" : "Lý do từ chối"}
                  </p>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">{publishRequestDetail.reviewerNote}</p>
                </div>
              )}
              {publishRequestDetail.reviewerName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người xử lý</p>
                  <p className="mt-1 text-foreground">{publishRequestDetail.reviewerName}</p>
                </div>
              )}
              {!publishRequestDetail.reviewerNote && (
                <p className="text-muted-foreground text-center py-4">
                  {publishRequestDetail.status === "PENDING"
                    ? "Chưa có phản hồi từ quản trị viên."
                    : "Không có lý do từ chối."}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-2">
              {publishRequestDetail.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => {
                    if (publishRequestDetail.requestId) {
                      setRevokeTarget(publishRequestDetail.requestId);
                      setPublishRequestDetail(null);
                    }
                  }}
                  className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-400"
                >
                  Thu hồi
                </button>
              )}
              <button
                type="button"
                onClick={() => setPublishRequestDetail(null)}
                className={`rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition ${publishRequestDetail.status === "PENDING" ? "" : "w-full"}`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Reason Modal */}
      {banReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                  <svg
                    className="h-5 w-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Truyện bị ẩn</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{banReasonModal.story.title}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {banReasonModal.loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ) : banReasonModal.moderationAction ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Loại vi phạm</p>
                    <p className="mt-1 text-foreground">
                      {violationTypeLabels[banReasonModal.moderationAction.violationType as ViolationType] ||
                        banReasonModal.moderationAction.violationType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lý do</p>
                    <p className="mt-1 text-foreground whitespace-pre-wrap">{banReasonModal.moderationAction.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Người xử lý</p>
                    <p className="mt-1 text-foreground">{banReasonModal.moderationAction.adminUsername}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
                    <p className="mt-1 text-foreground">
                      {banReasonModal.moderationAction.createdAt
                        ? new Date(banReasonModal.moderationAction.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Không tìm thấy thông tin vi phạm.</p>
              )}

              {banReasonModal.moderationAction && !showAppealForm && (
                <button
                  type="button"
                  onClick={() => setShowAppealForm(true)}
                  className="mt-6 w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition"
                >
                  Khiếu nại
                </button>
              )}

              {showAppealForm && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Nội dung khiếu nại</label>
                    <textarea
                      value={appealContent}
                      onChange={(e) => setAppealContent(e.target.value)}
                      placeholder="Nhập nội dung khiếu nại của bạn..."
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAppealForm(false);
                        setAppealContent("");
                      }}
                      className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitAppeal}
                      disabled={submittingAppeal || !appealContent.trim()}
                      className="flex-1 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition"
                    >
                      {submittingAppeal ? "Đang gửi..." : "Gửi khiếu nại"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setBanReasonModal(null);
                  setShowAppealForm(false);
                  setAppealContent("");
                }}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {requestModalStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold">Yêu cầu xuất bản truyện</h3>
              <p className="mt-1 text-sm text-muted-foreground">{requestModalStory?.title ?? "Truyện"}</p>
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
