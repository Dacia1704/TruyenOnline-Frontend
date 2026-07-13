import Link from "next/link";
import type { Story } from "@/lib/types/stories";

const storyTypeLabel: Record<string, string> = {
  COMICS: "Truyện tranh",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  NOVEL: "Light novel",
};

const statusLabel: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-100 text-emerald-700" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-100 text-sky-700" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-100 text-amber-700" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-100 text-rose-700" },
};

interface StoryCardProps {
  story: Story;
  onDelete?: () => void;
  isDeleting?: boolean;
  onRequestPublish?: () => void;
  isRequestingPublish?: boolean;
}

export function StoryCard({ story, onDelete, isDeleting, onRequestPublish, isRequestingPublish }: StoryCardProps) {
  const status = statusLabel[story.status] ?? statusLabel.ONGOING;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex gap-4 transition hover:border-indigo-500/40">
      <div className="hidden sm:block w-24 h-36 shrink-0 overflow-hidden rounded-xl bg-muted">
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
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold truncate">{story.title}</h3>
            <p className="text-sm text-muted-foreground">
              {storyTypeLabel[story.storyType] ?? story.storyType}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
            {status.text}
          </span>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {story.description ?? "Chưa có mô tả."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={story.slug ? `/uploader/stories/${story.slug}/chapters` : `/uploader/stories/${story.id}/chapters`}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            Quản lý chương
          </Link>
          <Link
            href={`/uploader/stories/${story.id}/edit`}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            Chỉnh sửa
          </Link>
          {onRequestPublish && (
            <button
              type="button"
              onClick={onRequestPublish}
              disabled={isRequestingPublish}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
            >
              {isRequestingPublish ? "Đang gửi..." : "Yêu cầu xuất bản"}
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            Lượt xem: {story.viewCount.toLocaleString()}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="ml-auto rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
