"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UploaderLayout } from "./UploaderLayout";
import { deletePublishRequest, getMyPublishRequests, type StoryPublishRequestStatus } from "@/lib/api/stories";

export function MyPublishRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<{ id: string; story: { id: string; title: string }; requesterNote?: string; status: StoryPublishRequestStatus }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyPublishRequests({ size: 20 });
        setRequests(data ?? []);
      } catch {
        setError("Không tải được danh sách yêu cầu xuất bản.");
        setRequests([]);
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
            <h1 className="text-2xl font-bold">Các yêu cầu xuất bản truyện</h1>
            <p className="mt-1 text-sm text-muted-foreground">Theo dõi trạng thái yêu cầu xuất bản của bạn.</p>
          </div>
        </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-8 grid gap-3">
        {loading && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Đang tải yêu cầu...
          </div>
        )}
        {!loading && requests.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Bạn chưa có yêu cầu xuất bản nào.
          </div>
        )}
        {!loading &&
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
      </div>

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
