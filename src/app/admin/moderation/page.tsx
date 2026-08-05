"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import {
  getAllBanAppeals,
  approveBanAppeal,
  rejectBanAppeal,
  getModerationActions,
  type BanAppeal,
  type ModerationAction,
  type ModerationObjectType,
  type ViolationType,
} from "@/lib/api/stories";
import { toast } from "sonner";

type AppealStatus = "PENDING" | "APPROVED" | "REJECTED";
type BanTab = "appeals" | "moderations";
type ModerationObjectTypeFilter = ModerationObjectType | "ALL";

const statusLabels: Record<AppealStatus, string> = {
  PENDING: "Đang chờ",
  APPROVED: "Đã chấp nhận",
  REJECTED: "Đã từ chối",
};

const statusColors: Record<AppealStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const violationTypeLabels: Record<ViolationType, string> = {
  COPYRIGHT: "Vi phạm bản quyền",
  PORNOGRAPHY: "Nội dung đồi trụy",
  VIOLENCE: "Bạo lực",
  SPAM: "Spam",
  HARASSMENT: "Quấy rối",
  OTHER: "Khác",
};

const objectTypeLabels: Record<ModerationObjectType, string> = {
  STORY: "Truyện",
  CHAPTER: "Chương",
  COMMENT: "Bình luận",
  USER: "Người dùng",
};

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<BanTab>("appeals");
  const [filterStatus, setFilterStatus] = useState<AppealStatus | "ALL">("PENDING");

  // Appeals state
  const [appeals, setAppeals] = useState<BanAppeal[]>([]);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [appealsPage, setAppealsPage] = useState(1);
  const [appealsTotalPages, setAppealsTotalPages] = useState(1);

  // Moderations state
  const [moderations, setModerations] = useState<ModerationAction[]>([]);
  const [moderationsLoading, setModerationsLoading] = useState(true);
  const [moderationsPage, setModerationsPage] = useState(1);
  const [moderationsTotalPages, setModerationsTotalPages] = useState(1);
  const [moderationObjectFilter, setModerationObjectFilter] = useState<ModerationObjectTypeFilter>("ALL");

  // Review modal
  const [reviewModal, setReviewModal] = useState<{
    appeal: BanAppeal;
    action: "approve" | "reject";
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAppeals = useCallback(async (page: number, status: AppealStatus | "ALL") => {
    setAppealsLoading(true);
    try {
      const result = await getAllBanAppeals({ page, size: 20 });
      // Filter by status on client side since API might not support it
      let filteredData = result.data;
      if (status !== "ALL") {
        filteredData = result.data.filter((a) => a.status === status);
      }
      setAppeals(filteredData);
      setAppealsTotalPages(result.totalPages);
      setAppealsPage(result.currentPage);
    } catch {
      toast.error("Không tải được danh sách khiếu nại");
    } finally {
      setAppealsLoading(false);
    }
  }, []);

  const loadModerations = useCallback(async (page: number, objectType: ModerationObjectTypeFilter) => {
    setModerationsLoading(true);
    try {
      const result = await getModerationActions({
        page,
        size: 20,
        objectType: objectType !== "ALL" ? objectType : undefined,
      });
      setModerations(result.data);
      setModerationsTotalPages(result.totalPages);
      setModerationsPage(result.currentPage);
    } catch {
      toast.error("Không tải được danh sách hành động kiểm duyệt");
    } finally {
      setModerationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "appeals") {
      loadAppeals(1, filterStatus);
    } else {
      loadModerations(1, moderationObjectFilter);
    }
  }, [activeTab, filterStatus, moderationObjectFilter, loadAppeals, loadModerations]);

  const handleReviewAppeal = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      if (reviewModal.action === "approve") {
        await approveBanAppeal(reviewModal.appeal.id, reviewNote || undefined);
        toast.success("Đã chấp nhận khiếu nại");
      } else {
        if (!reviewNote.trim()) {
          toast.error("Vui lòng nhập lý do từ chối");
          setSubmitting(false);
          return;
        }
        await rejectBanAppeal(reviewModal.appeal.id, reviewNote.trim());
        toast.success("Đã từ chối khiếu nại");
      }
      setReviewModal(null);
      setReviewNote("");
      loadAppeals(appealsPage, filterStatus);
    } catch {
      toast.error("Không thể xử lý khiếu nại");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý kiểm duyệt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý khiếu nại và các hành động kiểm duyệt
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("appeals")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "appeals"
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Khiếu nại
          </button>
          <button
            onClick={() => setActiveTab("moderations")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "moderations"
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Lịch sử kiểm duyệt
          </button>
        </div>

        {activeTab === "appeals" ? (
          <>
            {/* Status filter */}
            <div className="flex items-center gap-2">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    filterStatus === status
                      ? "bg-indigo-500 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status === "ALL" ? "Tất cả" : statusLabels[status]}
                </button>
              ))}
            </div>

            {/* Appeals list */}
            {appealsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : appeals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-sm text-muted-foreground">Chưa có khiếu nại nào.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {appeals.map((appeal) => (
                    <div key={appeal.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusColors[appeal.status]}`}>
                              {statusLabels[appeal.status]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {appeal.user?.username ?? "Người dùng"}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-foreground">
                              <span className="font-medium">Loại vi phạm: </span>
                              {appeal.moderationAction?.violationType &&
                                violationTypeLabels[appeal.moderationAction.violationType as ViolationType]}
                            </p>
                            <p className="text-sm text-foreground">
                              <span className="font-medium">Lý do ban: </span>
                              {appeal.moderationAction?.reason || "—"}
                            </p>
                            <p className="text-sm text-foreground">
                              <span className="font-medium">Nội dung khiếu nại: </span>
                              {appeal.content}
                            </p>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Gửi lúc: {formatDate(appeal.createdAt)}
                            {appeal.resolvedAt && ` • Xử lý lúc: ${formatDate(appeal.resolvedAt)}`}
                          </p>
                          {appeal.reviewerNote && (
                            <p className="mt-2 text-sm text-foreground bg-muted/50 p-2 rounded-lg">
                              <span className="font-medium">Ghi chú của người duyệt: </span>
                              {appeal.reviewerNote}
                            </p>
                          )}
                        </div>
                        {appeal.status === "PENDING" && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => setReviewModal({ appeal, action: "approve" })}
                              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-600 transition"
                            >
                              Chấp nhận
                            </button>
                            <button
                              onClick={() => setReviewModal({ appeal, action: "reject" })}
                              className="rounded-lg bg-red-500 px-4 py-2 text-xs font-medium text-white hover:bg-red-600 transition"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {appealsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => loadAppeals(appealsPage - 1, filterStatus)}
                      disabled={appealsPage <= 1}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                    >
                      Trước
                    </button>
                    <span className="px-3 text-sm text-muted-foreground">
                      Trang {appealsPage} / {appealsTotalPages}
                    </span>
                    <button
                      onClick={() => loadAppeals(appealsPage + 1, filterStatus)}
                      disabled={appealsPage >= appealsTotalPages}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Object type filter */}
            <div className="flex items-center gap-2">
              {(["ALL", "STORY", "CHAPTER", "COMMENT", "USER"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setModerationObjectFilter(type)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    moderationObjectFilter === type
                      ? "bg-indigo-500 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "ALL" ? "Tất cả" : objectTypeLabels[type]}
                </button>
              ))}
            </div>

            {/* Moderations list */}
            {moderationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : moderations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-sm text-muted-foreground">Chưa có hành động kiểm duyệt nào.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {moderations.map((mod) => (
                    <div key={mod.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                              mod.actionType === "BAN"
                                ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            }`}>
                              {mod.actionType === "BAN" ? "Ban" : "Unban"}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {objectTypeLabels[mod.objectType]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ID: {mod.objectId.slice(0, 8)}...
                            </span>
                          </div>
                          {mod.violationType && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Loại vi phạm: {violationTypeLabels[mod.violationType as ViolationType]}
                            </p>
                          )}
                          {mod.reason && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Lý do: {mod.reason}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-muted-foreground">{mod.adminUsername}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(mod.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {moderationsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => loadModerations(moderationsPage - 1, moderationObjectFilter)}
                      disabled={moderationsPage <= 1}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                    >
                      Trước
                    </button>
                    <span className="px-3 text-sm text-muted-foreground">
                      Trang {moderationsPage} / {moderationsTotalPages}
                    </span>
                    <button
                      onClick={() => loadModerations(moderationsPage + 1, moderationObjectFilter)}
                      disabled={moderationsPage >= moderationsTotalPages}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {reviewModal.action === "approve" ? "Chấp nhận khiếu nại" : "Từ chối khiếu nại"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {reviewModal.appeal.user?.username} - {reviewModal.appeal.moderationAction?.reason}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {reviewModal.action === "approve" ? "Ghi chú (tùy chọn)" : "Lý do từ chối (bắt buộc)"}
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewModal.action === "approve"
                      ? "Nhập ghi chú nếu cần..."
                      : "Nhập lý do từ chối..."
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewNote("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition"
              >
                Hủy
              </button>
              <button
                onClick={handleReviewAppeal}
                disabled={submitting || (reviewModal.action === "reject" && !reviewNote.trim())}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                  reviewModal.action === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {submitting
                  ? "Đang xử lý..."
                  : reviewModal.action === "approve"
                    ? "Chấp nhận"
                    : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
