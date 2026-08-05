"use client";

import { useState } from "react";
import { createComment, banComment, unbanComment, type ViolationType } from "@/lib/api/stories";
import type { Comment } from "@/lib/types/stories";
import { getUserInfo } from "@/lib/api/client";
import { toast } from "sonner";

interface CommentItemProps {
  comment: Comment;
  storyId?: string;
  chapterId?: string;
  storyUploaderId?: string;
  depth?: number;
  onReload: () => void;
}

export function CommentItem({ comment, storyId, chapterId, storyUploaderId, depth = 0, onReload }: CommentItemProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banViolationType, setBanViolationType] = useState<ViolationType>("SPAM");
  const [banning, setBanning] = useState(false);
  const [unbanning, setUnbanning] = useState(false);
  const [showOriginalContent, setShowOriginalContent] = useState(false);

  const currentUser = getUserInfo();
  const isAdmin = currentUser?.roles?.includes("ADMIN");
  const isUploader = currentUser?.roles?.includes("UPLOADER");
  const canBan = isAdmin || (isUploader && currentUser?.id === storyUploaderId);
  const canViewOriginal = canBan;

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      await createComment({
        storyId,
        chapterId,
        content: replyContent.trim(),
        parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      onReload();
      toast.success("Đã gửi trả lời");
    } catch {
      toast.error("Bạn cần đăng nhập để trả lời");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleBanComment = async () => {
    if (!banReason.trim()) {
      toast.error("Vui lòng nhập lý do ban");
      return;
    }
    setBanning(true);
    try {
      await banComment(comment.id, banViolationType, banReason.trim());
      toast.success("Đã ẩn bình luận");
      setShowBanModal(false);
      setBanReason("");
      onReload();
    } catch {
      toast.error("Không thể ẩn bình luận");
    } finally {
      setBanning(false);
    }
  };

  const handleUnbanComment = async () => {
    setUnbanning(true);
    try {
      await unbanComment(comment.id, "Bỏ ban");
      toast.success("Đã bỏ ẩn bình luận");
      onReload();
    } catch {
      toast.error("Không thể bỏ ẩn bình luận");
    } finally {
      setUnbanning(false);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length ?? 0;

  const violationTypes: { value: ViolationType; label: string }[] = [
    { value: "COPYRIGHT", label: "Vi phạm bản quyền" },
    { value: "PORNOGRAPHY", label: "Nội dung đồi trụy" },
    { value: "VIOLENCE", label: "Bạo lực" },
    { value: "SPAM", label: "Spam" },
    { value: "HARASSMENT", label: "Quấy rối" },
    { value: "OTHER", label: "Khác" },
  ];

  return (
    <div className={`relative ${depth > 0 ? "mt-4" : ""}`}>
      {/* Vertical indentation line for nested comments */}
      {depth > 0 && (
        <div
          className="absolute top-0 w-0.5 h-full bg-slate-300 dark:bg-slate-600 rounded-full"
          style={{ left: -16 }}
        />
      )}

      <div
        className={`flex items-start gap-4 ${comment.isBanned ? "p-3 rounded-xl bg-red-500/5 border border-red-500/20" : ""}`}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-semibold text-white shrink-0 shadow-sm"
          style={{ opacity: Math.max(1 - depth * 0.12, 0.65) }}
        >
          {comment.author?.username?.[0]?.toUpperCase() ?? "?"}
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Header: Username, time, badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">{comment.author?.username ?? "Ẩn danh"}</span>
            <span className="text-xs text-muted-foreground/70">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("vi-VN") : ""}
            </span>
          </div>

          {/* Content */}
          {comment.isBanned && comment.author?.id !== currentUser?.id ? (
            canViewOriginal && showOriginalContent ? (
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-amber-700 dark:text-amber-300">
                {comment.content}
              </p>
            ) : (
              <p className="text-red-500/70 mt-2 text-sm leading-relaxed whitespace-pre-wrap text-foreground/50">
                Bình luận đã bị ẩn do vi phạm tiêu chuẩn cộng đồng.
              </p>
            )
          ) : (
            <p
              className={`mt-2 text-sm leading-relaxed whitespace-pre-wrap ${comment.isBanned ? "text-foreground/50" : "text-foreground/90"}`}
            >
              {comment.content}
            </p>
          )}

          {comment.isBanned && comment.author?.id === currentUser?.id && (
            <p className="mt-1 text-xs text-red-500/70 italic">
              Bình luận của bạn đã bị ẩn do vi phạm tiêu chuẩn cộng đồng.
            </p>
          )}

          {comment.isBanned && canViewOriginal && comment.author?.id !== currentUser?.id && (
            <button
              onClick={() => setShowOriginalContent(!showOriginalContent)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {showOriginalContent ? "Ẩn nội dung gốc" : "Xem nội dung gốc"}
            </button>
          )}

          {/* Action buttons row */}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              Trả lời
            </button>

            {/* Toggle replies button */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                {showReplies ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Ẩn {replyCount} câu trả lời
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Xem {replyCount} câu trả lời
                  </>
                )}
              </button>
            )}

            {/* Ban/Unban buttons */}
            {canBan && (
              <>
                {comment.isBanned ? (
                  <button
                    onClick={handleUnbanComment}
                    disabled={unbanning}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
                  >
                    {unbanning ? "Đang xử lý..." : "Bỏ ẩn"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBanModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500/80 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    Ẩn
                  </button>
                )}
              </>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-4 ml-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Trả lời ${comment.author?.username ?? "ẩn danh"}...`}
                className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground/50 transition-all"
                rows={2}
                autoFocus
              />
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  onClick={handleCancelReply}
                  className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submittingReply || !replyContent.trim()}
                  className="rounded-lg bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReply ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies Container */}
          {hasReplies && showReplies && (
            <div className="mt-5 ml-2 space-y-4">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  storyId={storyId}
                  chapterId={chapterId}
                  storyUploaderId={storyUploaderId}
                  depth={depth + 1}
                  onReload={onReload}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Ẩn bình luận</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vui lòng chọn lý do và nhập mô tả vi phạm.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Loại vi phạm</label>
                <select
                  value={banViolationType}
                  onChange={(e) => setBanViolationType(e.target.value as ViolationType)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
                >
                  {violationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Lý do</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Nhập lý do vi phạm..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleBanComment}
                disabled={banning || !banReason.trim()}
                className="rounded-lg bg-red-500 hover:bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {banning ? "Đang xử lý..." : "Ẩn bình luận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CommentsListProps {
  comments: Comment[];
  storyId?: string;
  chapterId?: string;
  storyUploaderId?: string;
  onReload: () => void;
}

export function CommentsList({ comments, storyId, chapterId, storyUploaderId, onReload }: CommentsListProps) {
  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <CommentItem
            comment={comment}
            storyId={storyId}
            chapterId={chapterId}
            storyUploaderId={storyUploaderId}
            depth={0}
            onReload={onReload}
          />
        </div>
      ))}
    </div>
  );
}
