"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import { getChapter, getChapterPages, updateChapterContent, deleteAllPages } from "@/lib/api/stories";
import type { Chapter, ChapterPage } from "@/lib/types/stories";

export default function ChapterContentPage() {
  const params = useParams<{ chapterId?: string }>();
  const router = useRouter();
  const chapterId = params?.chapterId;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chapterId || Array.isArray(chapterId)) return;
    loadData();
  }, [chapterId]);

  const loadData = async () => {
    if (!chapterId || Array.isArray(chapterId)) return;
    setLoading(true);
    setError(null);
    try {
      const [chapterData, pagesData] = await Promise.all([getChapter(chapterId), getChapterPages(chapterId)]);
      setChapter(chapterData);
      setPages(pagesData);
      setContent(chapterData.content ?? "");
    } catch {
      setError("Không tải được thông tin chương. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleContentSave = async () => {
    if (!chapter) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateChapterContent(chapter.id, content);
      setChapter(updated);
      setSuccess("Lưu nội dung thành công.");
    } catch {
      setError("Không thể lưu nội dung. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newFiles = [...pendingFiles, ...files];
    setPendingFiles(newFiles);
    const newPreviews: Record<number, string> = {};
    newFiles.forEach((file, index) => {
      newPreviews[index] = URL.createObjectURL(file);
    });
    setPreviewUrls((prev) => ({ ...prev, ...newPreviews }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePending = (index: number) => {
    setTimeout(() => {
      setPendingFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }, 200);
  };

  const handleUploadPages = async () => {
    if (!chapter || !pendingFiles.length) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("chapterId", chapter.id);
      const pageRequests = pendingFiles.map((_, i) =>
        JSON.stringify({ chapterId: chapter.id, pageNumber: pages.length + i + 1, isNewPage: true }),
      );
      formData.append("chapterPageRequests", pageRequests.join("\n"));
      pendingFiles.forEach((file) => {
        formData.append("files", file);
      });
      const { apiClient } = await import("@/lib/api/client");
      const { data } = await apiClient.post("/chapters/pages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPages((prev) => [...prev, ...(data.data ?? [])]);
      setPendingFiles([]);
      setPreviewUrls({});
      setSuccess(`Đã tải lên ${pendingFiles.length} trang thành công.`);
    } catch {
      setError("Không thể tải lên trang. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAllPages = async () => {
    if (!chapter) return;
    const confirmed = window.confirm("Xóa tất cả trang của chương này?");
    if (!confirmed) return;
    setDeleteLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteAllPages(chapter.id);
      setPages([]);
      setSuccess("Đã xóa tất cả trang.");
    } catch {
      setError("Không thể xóa trang. Vui lòng thử lại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!chapterId || Array.isArray(chapterId)) {
    return (
      <UploaderLayout>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Không hợp lệ chương được chọn.
        </div>
      </UploaderLayout>
    );
  }

  return (
    <UploaderLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {loading ? "Đang tải..." : chapter ? `Chương ${chapter.chapterNumber}: ${chapter.title}` : "Quản lý chương"}
          </h1>
          {chapter && (
            <p className="mt-1 text-sm text-muted-foreground">
              {chapter.isPublished ? "Đã xuất bản" : "Bản nháp"} · {pages.length} trang
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Quay lại
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {loading && (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Đang tải thông tin chương...
        </div>
      )}

      {!loading && chapter && (
        <div className="mt-8 space-y-6">
          {/* Nội dung chương (cho light novel) */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Nội dung chương</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nhập nội dung văn bản của chương (dành cho light novel).
            </p>
            <div className="mt-4 rounded-xl border border-border bg-background">
              <div className="min-h-[320px] max-h-[640px] overflow-y-auto p-3">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung chương tại đây..."
                  className="w-full text-sm outline-none resize-none"
                  style={{ minHeight: "296px" }}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleContentSave}
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu nội dung"}
                </button>
              </div>
            </div>
          </section>

          {/* Upload ảnh trang (cho manga) */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Trang ảnh (Manga)</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tải lên ảnh trang manga. Chọn nhiều ảnh cùng lúc, ảnh sẽ được sắp xếp theo thứ tự chọn.
                </p>
              </div>
              {pages.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllPages}
                  disabled={deleteLoading}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleteLoading ? "Đang xóa..." : `Xóa tất cả (${pages.length})`}
                </button>
              )}
            </div>

            <div
              className="mt-5 rounded-xl border-2 border-dashed border-border p-6 text-center cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50/30"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                if (!files.length) return;
                const newFiles = [...pendingFiles, ...files];
                setPendingFiles(newFiles);
                const newPreviews: Record<number, string> = {};
                newFiles.forEach((file, index) => {
                  newPreviews[index] = URL.createObjectURL(file);
                });
                setPreviewUrls((prev) => ({ ...prev, ...newPreviews }));
              }}
            >
              <p className="text-sm text-muted-foreground">Kéo thả ảnh vào đây hoặc nhấn để chọn tệp</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hỗ trợ JPG, PNG, WEBP, GIF. Có thể chọn nhiều ảnh cùng lúc.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {pendingFiles.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">{pendingFiles.length} ảnh đang chờ tải lên</p>
                  <button
                    type="button"
                    onClick={handleUploadPages}
                    disabled={uploading}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {uploading ? "Đang tải lên..." : `Tải lên (${pendingFiles.length})`}
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {pendingFiles.map((_, index) => (
                    <div
                      key={index}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted group"
                    >
                      <img src={previewUrls[index]} alt={`Trang ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePending(index);
                          }}
                          className="rounded-full bg-rose-600 p-1.5 text-white transition hover:bg-rose-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                        #{pages.length + index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pages.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Các trang đã tải lên ({pages.length})</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted"
                    >
                      <img
                        src={page.imageUrl}
                        alt={`Trang ${page.pageNumber}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23f3f4f6' width='100' height='100'/><text x='50' y='55' text-anchor='middle' font-size='10' fill='%239ca3af'>No image</text></svg>";
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                        #{page.pageNumber}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </UploaderLayout>
  );
}
