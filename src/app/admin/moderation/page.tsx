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

  // Attachments modal
  const [attachmentsModal, setAttachmentsModal] = useState<{
    attachments: { id: string; attachmentUrl: string; createdAt?: string }[];
  } | null>(null);

  const loadAppeals = useCallback(async (page: number, status: AppealStatus | "ALL") => {
    setAppealsLoading(true);
    try {
      const apiStatus = status !== "ALL" ? status : undefined;
      const result = await getAllBanAppeals({ page, size: 20, status: apiStatus });
      setAppeals(result.data);
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
                    <div key={appeal.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-transparent border-b border-border/50">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {appeal.user?.username?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appeal.user?.username ?? "Người dùng"}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(appeal.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusColors[appeal.status]}`}>
                          {statusLabels[appeal.status]}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="px-5 py-4">
                        {/* Object info */}
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground uppercase tracking-wide">Loại vi phạm</span>
                              <span className="text-sm font-medium">
                                {appeal.moderationAction?.violationType &&
                                  violationTypeLabels[appeal.moderationAction.violationType as ViolationType]}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground uppercase tracking-wide shrink-0 pt-0.5">Lý do ban</span>
                              <span className="text-sm">{appeal.moderationAction?.reason || "—"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground uppercase tracking-wide shrink-0 pt-0.5">Khiếu nại</span>
                              <span className="text-sm">{appeal.content}</span>
                            </div>
                          </div>
                        </div>

                        {/* Attachments */}
                        {(appeal.attachments && appeal.attachments.length > 0) && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-xs text-muted-foreground font-medium">Minh chứng ({appeal.attachments.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {appeal.attachments.map((att, idx) => (
                                <button
                                  key={att.id}
                                  onClick={() => setAttachmentsModal({ attachments: appeal.attachments! })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Ảnh {idx + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reviewer note */}
                        {appeal.reviewerNote && (
                          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Ghi chú của {appeal.reviewer?.username ?? "người duyệt"}</span>
                            </div>
                            <p className="text-sm text-amber-800 dark:text-amber-200">{appeal.reviewerNote}</p>
                            {appeal.resolvedAt && (
                              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">{formatDate(appeal.resolvedAt)}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {appeal.status === "PENDING" && (
                        <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border/50 flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReviewModal({ appeal, action: "reject" })}
                            className="rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => setReviewModal({ appeal, action: "approve" })}
                            className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600 transition"
                          >
                            Chấp nhận
                          </button>
                        </div>
                      )}
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
                    <div key={mod.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-transparent border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <span className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            mod.actionType === "BAN"
                              ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          }`}>
                            {mod.actionType === "BAN" ? "🔨 Ban" : "✅ Unban"}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm font-medium text-foreground">
                            {mod.objectType === "STORY" && mod.storyResponse && `Truyện: ${mod.storyResponse.title}`}
                            {mod.objectType === "CHAPTER" && mod.chapterResponse && `Chương: ${mod.chapterResponse.title || `Chương ${mod.chapterResponse.chapterNumber}`}${mod.storyResponse ? ` - ${mod.storyResponse.title}` : ""}`}
                            {mod.objectType === "USER" && mod.userResponse && `Người dùng: ${mod.userResponse.username}`}
                            {mod.objectType === "COMMENT" && mod.commentResponse && `Bình luận: ${mod.commentResponse.content.slice(0, 50)}${mod.commentResponse.content.length > 50 ? "..." : ""}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{mod.adminUsername}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{formatDate(mod.createdAt)}</span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="px-5 py-4">
                        <div className="flex flex-wrap gap-4">
                          {mod.violationType && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Loại vi phạm</span>
                              <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-medium">
                                {violationTypeLabels[mod.violationType as ViolationType]}
                              </span>
                            </div>
                          )}
                          {mod.reason && (
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                              <span className="text-xs text-muted-foreground">Lý do</span>
                              <span className="text-sm text-foreground">{mod.reason}</span>
                            </div>
                          )}
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

      {/* Attachments Modal */}
      {attachmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Minh chứng khiếu nại</h3>
              <button
                onClick={() => setAttachmentsModal(null)}
                className="p-2 hover:bg-muted rounded-lg transition"
              >
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {attachmentsModal.attachments.map((attachment) => (
                  <div key={attachment.id} className="relative group">
                    <img
                      src={attachment.attachmentUrl}
                      alt="Minh chứng"
                      className="w-full h-auto rounded-lg border border-border object-contain max-h-96"
                    />
                    <a
                      href={attachment.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setAttachmentsModal(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
