import Link from "next/link";
import type { Story, StoryPublishRequestStatus } from "@/lib/types/stories";

const storyTypeLabel: Record<string, string> = {
  COMICS: "Truyện tranh",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  NOVEL: "Light novel",
};

const statusLabel: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-100 text-sky-700" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-100 text-amber-700" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-100 text-rose-700" },
};

const publishStatusConfig: Record<
  StoryPublishRequestStatus,
  { text: string; className: string; icon: JSX.Element }
> = {
  PENDING: {
    text: "Chờ phê duyệt",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-500/30",
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  APPROVED: {
    text: "Đã phê duyệt",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  REJECTED: {
    text: "Đã từ chối",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 cursor-pointer hover:bg-rose-200 dark:hover:bg-rose-500/30",
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

interface StoryCardProps {
  story: Story;
  onDelete?: () => void;
  isDeleting?: boolean;
  onRequestPublish?: () => void;
  isRequestingPublish?: boolean;
  onViewBanReason?: () => void;
  publishRequestStatus?: StoryPublishRequestStatus;
  publishRequestNote?: string;
  publishRequestId?: string;
  onViewPublishRequestDetail?: (requesterNote?: string, reviewerNote?: string, reviewerName?: string, requestId?: string) => void;
}

export function StoryCard({
  story,
  onDelete,
  isDeleting,
  onRequestPublish,
  isRequestingPublish,
  onViewBanReason,
  publishRequestStatus,
  publishRequestNote,
  publishRequestId,
  onViewPublishRequestDetail,
}: StoryCardProps) {
  const status = statusLabel[story.status] ?? statusLabel.ONGOING;
  const storyHref = `/uploader/stories/${story.id}`;

  const publishStatus = publishRequestStatus ? publishStatusConfig[publishRequestStatus] : null;

  return (
    <Link
      href={storyHref}
      className={`rounded-2xl border bg-card p-4 flex gap-4 transition cursor-pointer hover:border-indigo-500/40 ${
        story.isBanned
          ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30"
          : "border-border"
      }`}
    >
      <div className="hidden sm:block w-24 h-36 shrink-0 overflow-hidden rounded-xl bg-muted relative">
        {story.coverImageUrl ? (
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="h-full w-full object-cover"
            onError={(event) => {
              const target = event.target as HTMLImageElement;
              target.style.display = "none";
              target.parentElement?.classList.add("bg-muted");
            }}
          />
        ) : null}
        {story.isBanned && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold truncate">{story.title}</h3>
            <p className="text-sm text-muted-foreground">
              {storyTypeLabel[story.storyType] ?? story.storyType}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {story.isPublished && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Đã xuất bản
              </span>
            )}
            {story.isBanned && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Đã bị ẩn
              </span>
            )}
            {/* Status tag */}
            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
              {status.text}
            </span>
            {/* Publish request status tag (clickable for PENDING/REJECTED) */}
            {publishStatus && publishRequestStatus !== "APPROVED" && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewPublishRequestDetail?.(publishRequestNote, undefined, undefined, publishRequestId);
                }}
                className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${publishStatus.className}`}
                title="Xem chi tiết phê duyệt"
              >
                {publishStatus.icon}
                {publishStatus.text}
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {story.description ?? "Chưa có mô tả."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {story.isBanned && onViewBanReason && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewBanReason();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
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
              Xem lý do
            </button>
          )}
          <Link
            href={`/uploader/stories/${story.id}/chapters`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7" />
            </svg>
            Quản lý chương
          </Link>
          <Link
            href={`/uploader/stories/${story.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Chỉnh sửa
          </Link>
          {onRequestPublish && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestPublish();
              }}
              disabled={isRequestingPublish || story.isBanned}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed dark:border-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {isRequestingPublish ? "Đang gửi..." : "Yêu cầu xuất bản"}
            </button>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
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
            {story.viewCount.toLocaleString()}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
