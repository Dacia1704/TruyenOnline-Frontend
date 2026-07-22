"use client";

import { useState } from "react";
import { createComment } from "@/lib/api/stories";
import type { Comment } from "@/lib/types/stories";
import { toast } from "sonner";

interface CommentItemProps {
  comment: Comment;
  storyId?: string;
  chapterId?: string;
  depth?: number;
  onReload: () => void;
}

export function CommentItem({ comment, storyId, chapterId, depth = 0, onReload }: CommentItemProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

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

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const indentWidth = Math.min(depth * 16, 64); // Max indent 64px

  return (
    <div className="relative">
      {depth > 0 && (
        <div
          className="absolute top-0 w-4 border-l-2 border-border h-full"
          style={{ left: -12 }}
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground shrink-0"
          style={{ opacity: Math.max(1 - depth * 0.15, 0.6) }}
        >
          {comment.author?.username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">{comment.author?.username ?? "Ẩn danh"}</span>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("vi-VN") : ""}
            </span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">{comment.content}</p>
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Trả lời
          </button>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 pl-4 border-l-2 border-indigo-500/30">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Trả lời ${comment.author?.username ?? "ẩn danh"}...`}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-foreground"
                rows={2}
                autoFocus
              />
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  onClick={handleCancelReply}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submittingReply || !replyContent.trim()}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingReply ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && (
            <div className="mt-3 space-y-3">
              {showReplies && comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  storyId={storyId}
                  chapterId={chapterId}
                  depth={depth + 1}
                  onReload={onReload}
                />
              ))}
              {!showReplies && (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition ml-8"
                >
                  Hiện {comment.replies!.length} câu trả lời
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentsListProps {
  comments: Comment[];
  storyId?: string;
  chapterId?: string;
  onReload: () => void;
}

export function CommentsList({ comments, storyId, chapterId, onReload }: CommentsListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-lg border border-border p-4 bg-card">
          <CommentItem
            comment={comment}
            storyId={storyId}
            chapterId={chapterId}
            depth={0}
            onReload={onReload}
          />
        </div>
      ))}
    </div>
  );
}
