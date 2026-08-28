"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UploaderLayout } from "./UploaderLayout";
import { getMyBanAppeals, type BanAppeal } from "@/lib/api/stories";

export function MyBanAppeals() {
  const router = useRouter();
  const [appeals, setAppeals] = useState<BanAppeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyBanAppeals({ size: 20 });
        setAppeals(data?.data ?? []);
      } catch {
        setError("Không tải được danh sách khiếu nại.");
        setAppeals([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <UploaderLayout>
      <div className="max-w-7xl mx-auto px-6">
        <button
          type="button"
          onClick={() => router.push("/uploader/stories")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Các khiếu nại</h1>
            <p className="mt-1 text-sm text-muted-foreground">Theo dõi trạng thái khiếu nại của bạn.</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="mt-8 grid gap-3">
        {loading && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Đang tải khiếu nại...
          </div>
        )}
        {!loading && appeals.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Bạn chưa có khiếu nại nào.
          </div>
        )}
        {!loading &&
          appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        appeal.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : appeal.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {appeal.status === "PENDING" ? "Đang chờ" : appeal.status === "APPROVED" ? "Đã chấp nhận" : "Đã từ chối"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {appeal.moderationAction?.violationType ?? "Vi phạm"}
                    </span>
                  </div>
                  <p className="text-sm font-medium">Lý do ban:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {appeal.moderationAction?.reason ?? "Không có"}
                  </p>
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Nội dung khiếu nại:</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {appeal.content}
                    </p>
                  </div>
                  {appeal.attachments && appeal.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">File đính kèm:</p>
                      <div className="flex flex-wrap gap-2">
                        {appeal.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Xem file
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {appeal.reviewerNote && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Phản hồi từ quản trị viên:</p>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {appeal.reviewerNote}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Gửi lúc: {appeal.createdAt ? new Date(appeal.createdAt).toLocaleString("vi-VN") : "Không xác định"}
                    {appeal.resolvedAt && (
                      <> · Xử lý lúc: {new Date(appeal.resolvedAt).toLocaleString("vi-VN")}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
      </div>
    </UploaderLayout>
  );
}
