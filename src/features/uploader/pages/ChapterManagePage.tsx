"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import {
  createChapter,
  deleteChapter,
  getChaptersBySlug,
  getMyInfo,
  getStories,
  updateChapter,
} from "@/lib/api/stories";
import type { Chapter } from "@/lib/api/stories";
import type { Story } from "@/lib/types/stories";

export default function ChapterManagePage() {
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [loading, setLoading] = useState(false);
  const [savingChapter, setSavingChapter] = useState<string | null>(null);
  // eslint-disable-next-line
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    chapterNumber: "",
    isPublished: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", chapterNumber: "", isPublished: true });

  useEffect(() => {
    if (!slug || Array.isArray(slug)) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [myInfo, storiesData, chaptersResult] = await Promise.all([
          getMyInfo(),
          getStories({ size: 50 }),
          getChaptersBySlug(slug, { size: 100 }),
        ]);
        const matched = storiesData.find((item) => item.slug === slug) ?? null;
        if (!matched || matched.uploader?.id !== myInfo.id) {
          setError("Không tìm thấy truyện hoặc bạn không có quyền quản lý chương.");
          setStory(null);
          setChapters([]);
          return;
        }
        setStory(matched);
        setChapters(chaptersResult.data?.data ?? []);
      } catch {
        setError("Không tải được danh sách chương. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [slug]);

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || Array.isArray(slug) || !story?.id) return;

    try {
      setSavingChapter("create");
      setCreatingId("create");
      setError(null);
      const nextNumber = chapters.length === 0 ? 1 : Math.max(...chapters.map((chapter) => chapter.chapterNumber)) + 1;

      const saved = await createChapter(story.id, {
        title: form.title.trim() || `Chương ${nextNumber}`,
        chapterNumber: Number(form.chapterNumber) || nextNumber,
        isPublished: form.isPublished,
      });
      setChapters((prev) => [...prev, saved].sort((a, b) => a.chapterNumber - b.chapterNumber));

      setForm({
        title: "",
        chapterNumber: "",
        isPublished: true,
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

  if (!slug || Array.isArray(slug) || !story?.id) {
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
            <div className="grid gap-4 sm:grid-cols-[1fr_120px_auto]">
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
              <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => setForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                />
                Xuất bản
              </label>
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
              className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  Chương {chapter.chapterNumber}: {chapter.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Trạng thái: {chapter.isPublished ? "Đã xuất bản" : "Bản nháp"} · Số trang: {chapter.pageCount}
                </p>
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
                      onClick={() => router.push(`/uploader/stories/${story.id}/chapters/${chapter.id}/content`)}
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
    </UploaderLayout>
  );
}
