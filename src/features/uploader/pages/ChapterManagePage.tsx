"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import {
  createChapter,
  deleteChapter,
  getChapters,
  getChapter,
  getChapterPages,
  getMyInfo,
  getStoryById,
  updateChapter,
  updateChapterPublishStatus,
} from "@/lib/api/stories";
import type { Chapter, ChapterPage } from "@/lib/types/stories";
import type { Story } from "@/lib/types/stories";

type PublishStatus = "PUBLISH" | "DRAFT";

export default function ChapterManagePage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const storyId = params?.id;

  const [loading, setLoading] = useState(false);
  const [savingChapter, setSavingChapter] = useState<string | null>(null);
  // eslint-disable-next-line
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", chapterNumber: "" });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", chapterNumber: "", isPublished: true });

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("PUBLISH");
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [chapterDropdownOpen, setChapterDropdownOpen] = useState(false);

  const [previewChapter, setPreviewChapter] = useState<Chapter | null>(null);
  const [previewPages, setPreviewPages] = useState<ChapterPage[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!storyId) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [myInfo, storyData, chaptersResult] = await Promise.all([
          getMyInfo(),
          getStoryById(storyId),
          getChapters(storyId, { size: 100 }),
        ]);
        if (!storyData || storyData.uploader?.id !== myInfo.id) {
          setError("Không tìm thấy truyện hoặc bạn không có quyền quản lý chương.");
          setStory(null);
          setChapters([]);
          return;
        }
        setStory(storyData);
        setChapters(chaptersResult.data ?? []);
      } catch {
        setError("Không tải được danh sách chương. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [storyId]);

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId || !story?.id) return;

    try {
      setSavingChapter("create");
      setCreatingId("create");
      setError(null);
      const nextNumber = chapters.length === 0 ? 1 : Math.max(...chapters.map((chapter) => chapter.chapterNumber)) + 1;

      const saved = await createChapter(story.id, {
        title: form.title.trim() || `Chương ${nextNumber}`,
        chapterNumber: Number(form.chapterNumber) || nextNumber,
      });
      setChapters((prev) => [...prev, saved].sort((a, b) => a.chapterNumber - b.chapterNumber));

      setForm({
        title: "",
        chapterNumber: "",
      });
      setCreatingId(null);
    } catch {
      setError("Không thể tạo chương. Vui lòng thử lại.");
      setCreatingId(null);
    } finally {
      setSavingChapter(null);
    }
  };

  const startEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditForm({
      title: chapter.title,
      chapterNumber: String(chapter.chapterNumber),
      isPublished: chapter.isPublished,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", chapterNumber: "", isPublished: true });
  };

  const submitEdit = async (chapter: Chapter) => {
    try {
      setSavingChapter(chapter.id);
      setError(null);
      const saved = await updateChapter(chapter.id, {
        title: editForm.title.trim() || chapter.title,
        chapterNumber: Number(editForm.chapterNumber) || chapter.chapterNumber,
        isPublished: editForm.isPublished,
      });
      setChapters((prev) =>
        prev.map((item) => (item.id === chapter.id ? saved : item)).sort((a, b) => a.chapterNumber - b.chapterNumber),
      );
      cancelEdit();
    } catch {
      setError("Không thể cập nhật chương. Vui lòng thử lại.");
    } finally {
      setSavingChapter(null);
    }
  };

  const handleDelete = async (chapter: Chapter) => {
    if (!chapter.id) return;
    const confirmed = window.confirm(`Xóa chương "${chapter.title}"?`);
    if (!confirmed) return;

    try {
      setSavingChapter(chapter.id);
      setError(null);
      await deleteChapter(chapter.id);
      setChapters((prev) => prev.filter((item) => item.id !== chapter.id));
    } catch {
      setError("Không thể xóa chương. Vui lòng thử lại.");
    } finally {
      setSavingChapter(null);
    }
  };

  const handlePreviewChapter = async (chapter: Chapter) => {
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const [fullChapter, pages] = await Promise.all([
        getChapter(chapter.id),
        getChapterPages(chapter.id),
      ]);
      setPreviewChapter(fullChapter);
      setPreviewPages(pages.length > 0 ? pages : []);
    } catch {
      setError("Không tải được nội dung chương.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewChapter(null);
    setPreviewPages([]);
  };

  if (!storyId || !story?.id) {
    return (
      <UploaderLayout>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Không hợp lệ truyện được chọn.
        </div>
      </UploaderLayout>
    );
  }

  return (
    <UploaderLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý chương</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {story ? `Truyện: ${story.title}` : "Chọn truyện để thêm chương."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/uploader/stories")}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Danh sách truyện
          </button>
          {story && (
            <button
              type="button"
              onClick={() => router.push("/uploader/stories/new")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Tạo truyện mới
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowPublishModal(true);
              setPublishStatus("PUBLISH");
              setSelectedChapterIds([]);
              setChapterDropdownOpen(false);
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Xuất bản chương
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {story && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Thêm chương mới</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo chương mới. Sau khi tạo, bấm &quot;Nội dung&quot; để thêm nội dung văn bản hoặc ảnh trang.
          </p>
          <form className="mt-5 space-y-5" onSubmit={handleCreateChapter}>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Tiêu đề chương"
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                value={form.chapterNumber}
                onChange={(event) => setForm((prev) => ({ ...prev, chapterNumber: event.target.value }))}
                placeholder="Số chương"
                inputMode="numeric"
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingChapter === "create"}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingChapter === "create" ? "Đang tạo..." : "Tạo chương"}
              </button>
            </div>
          </form>
        </section>
      )}

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Cập nhật trạng thái xuất bản</h3>
            <p className="mt-2 text-sm text-muted-foreground">Chọn chương và trạng thái xuất bản mong muốn.</p>
            <div className="mt-5 space-y-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setChapterDropdownOpen((prev) => !prev)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {selectedChapterIds.length === 0
                    ? "Chọn chương..."
                    : `Đã chọn ${selectedChapterIds.length} chương`}
                </button>
                {chapterDropdownOpen && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-background shadow">
                    {chapters.length === 0 && (
                      <p className="px-3 py-2 text-xs text-muted-foreground">Chưa có chương nào.</p>
                    )}
                    {chapters.map((chapter) => (
                      <label
                        key={chapter.id}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={selectedChapterIds.includes(chapter.id)}
                          onChange={(event) =>
                            setSelectedChapterIds((prev) =>
                              event.target.checked ? [...prev, chapter.id] : prev.filter((item) => item !== chapter.id),
                            )
                          }
                          className="h-4 w-4 rounded border-border"
                        />
                        <span className="truncate">
                          Chương {chapter.chapterNumber}: {chapter.title}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={publishStatus}
                onChange={(event) => setPublishStatus(event.target.value as PublishStatus)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="PUBLISH">Xuất bản</option>
                <option value="DRAFT">Bản nháp</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  setPublishStatus("PUBLISH");
                  setSelectedChapterIds([]);
                  setChapterDropdownOpen(false);
                }}
                disabled={publishingLoading}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (selectedChapterIds.length === 0) {
                    setError("Vui lòng chọn ít nhất 1 chương.");
                    return;
                  }
                  try {
                    setPublishingLoading(true);
                    setError(null);
                    const publishStatusValue = publishStatus === "PUBLISH";
                    await updateChapterPublishStatus(selectedChapterIds, publishStatusValue);
                    setChapters((prev) =>
                      prev.map((item) =>
                        selectedChapterIds.includes(item.id) ? { ...item, isPublished: publishStatusValue } : item,
                      ),
                    );
                    setShowPublishModal(false);
                    setPublishStatus("PUBLISH");
                    setSelectedChapterIds([]);
                    setChapterDropdownOpen(false);
                  } catch {
                    setError("Không thể cập nhật trạng thái xuất bản. Vui lòng thử lại.");
                  } finally {
                    setPublishingLoading(false);
                  }
                }}
                disabled={publishingLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {publishingLoading ? "Đang xử lý..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {loading && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Đang tải...
          </div>
        )}
        {!loading && chapters.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Chưa có chương nào. Tạo chương đầu tiên để bắt đầu.
          </div>
        )}
        {chapters.map((chapter) => {
          const isEditing = editingId === chapter.id;
          return (
            <div
              key={chapter.id}
              className={`rounded-2xl border bg-card p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
                chapter.isPublished ? "border-emerald-200 bg-emerald-50/40" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    chapter.isPublished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {chapter.isPublished ? "Đã xuất bản" : "Bản nháp"}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">
                    Chương {chapter.chapterNumber}: {chapter.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Số trang: {chapter.pageCount}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      value={editForm.title}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      value={editForm.chapterNumber}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, chapterNumber: event.target.value }))}
                      inputMode="numeric"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editForm.isPublished}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                      />
                      Xuất bản
                    </label>
                    <button
                      type="button"
                      onClick={() => submitEdit(chapter)}
                      disabled={savingChapter === chapter.id}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handlePreviewChapter(chapter)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                  >
                    Xem demo
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/uploader/stories/${storyId}/chapters/${chapter.id}/content`)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Nội dung
                  </button>
                    <button
                      type="button"
                      onClick={() => startEdit(chapter)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(chapter)}
                      disabled={savingChapter === chapter.id}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                    >
                      {savingChapter === chapter.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex bg-black/80" onClick={handleClosePreview}>
          <div
            className="w-full max-w-2xl bg-background h-full overflow-y-auto ml-auto transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {previewChapter ? `Chương ${previewChapter.chapterNumber}: ${previewChapter.title}` : "Đang tải..."}
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted ml-4 shrink-0"
              >
                Đóng
              </button>
            </div>
            <div className="p-4">
              {previewLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : previewPages.length > 0 ? (
                <div className="space-y-4">
                  {previewPages.sort((a, b) => a.pageNumber - b.pageNumber).map((page) => (
                    <div key={page.id} className="bg-muted rounded overflow-hidden">
                      <img src={page.imageUrl} alt={`Trang ${page.pageNumber}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              ) : previewChapter?.content ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewChapter.content }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Chương này chưa có nội dung.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UploaderLayout>
  );
}
