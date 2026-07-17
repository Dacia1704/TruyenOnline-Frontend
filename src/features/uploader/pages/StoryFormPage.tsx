"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import { createStory, getGenres, getMyInfo, getStories, updateStory } from "@/lib/api/stories";
import type { Story, StoryStatus, StoryType } from "@/lib/types/stories";
import type { Genre } from "@/lib/api/stories";

interface StoryFormPageProps {
  storyId?: string;
}

export default function StoryFormPage({ storyId }: StoryFormPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    coverImageUrl: "",
    coverImageFile: null as File | null,
    storyType: "NOVEL" as StoryType,
    status: "ONGOING" as StoryStatus,
    freeChapterLimit: "" as number | string,
    viewCount: 0,
  });
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prepare = async () => {
      setLoading(true);
      setError(null);
      try {
        const [myInfo, allGenres] = await Promise.all([getMyInfo(), getGenres()]);
        setGenres(allGenres);

        if (storyId) {
          const result = await getStories({ size: 50 });
          const story = result.data.find((item) => item.id === storyId);
          if (story && story.uploader?.id === myInfo.id) {
            setForm({
              title: story.title,
              description: story.description ?? "",
              coverImageUrl: story.coverImageUrl ?? "",
              coverImageFile: null,
              storyType: story.storyType,
              status: story.status,
              freeChapterLimit: story.freeChapterLimit ?? "",
              viewCount: story.viewCount,
            });
            if ((story as unknown as { genreIds?: number[] }).genreIds) {
              setSelectedGenres((story as unknown as { genreIds: number[] }).genreIds);
            }
          } else {
            setError("Không tìm thấy truyện hoặc bạn không có quyền chỉnh sửa.");
          }
        }
      } catch {
        setError("Không tải được thông tin. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    prepare();
  }, [storyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, coverImageFile: file, coverImageUrl: "" }));
  };

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]));
  };

  const handleSubmitInternal = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        coverImageUrl: form.coverImageUrl.trim() || undefined,
        storyType: form.storyType,
        status: form.status,
        isPublished: false,
        freeChapterLimit:
          form.freeChapterLimit === "" || form.freeChapterLimit === null ? null : Number(form.freeChapterLimit),
        viewCount: Number(form.viewCount) || 0,
        coverImageFile: form.coverImageFile,
      };

      let saved: Story;
      if (storyId) {
        saved = await updateStory(storyId, payload);
        setResult("Cập nhật truyện thành công.");
      } else {
        saved = await createStory(payload);
        setResult("Tạo truyện thành công.");
      }

      router.push(`/uploader/stories/${saved.id}/chapters`);
      router.refresh();
    } catch {
      setError("Không thể lưu truyện. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitInternal();
  };

  const isEdit = Boolean(storyId);

  return (
    <UploaderLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa truyện" : "Tạo truyện mới"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Điền thông tin bộ truyện trước khi thêm chương.</p>
      </div>

      <form className="mt-8 max-w-2xl space-y-5" onSubmit={handleFormSubmit}>
        <div>
          <label className="block text-sm font-medium">Tiêu đề</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium">Loại truyện</label>
            <select
              name="storyType"
              value={form.storyType}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="NOVEL">Light novel</option>
              <option value="COMICS">Truyện tranh</option>
              <option value="MANHWA">Manhwa</option>
              <option value="MANHUA">Manhua</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ONGOING">Đang ra</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="HIATUS">Tạm dừng</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Thể loại</label>
          {genres.length === 0 ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Chưa có thể loại nào. Vui lòng liên hệ admin để thêm.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {genres.map((genre) => {
                const checked = selectedGenres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      checked
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-background text-muted-foreground border-border hover:border-indigo-400"
                    }`}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Ảnh bìa</label>
          <div className="mt-1.5 flex flex-col gap-3">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {form.coverImageFile && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Đã chọn: {form.coverImageFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, coverImageFile: null }));
                    if (coverInputRef.current) coverInputRef.current.value = "";
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-xs text-muted-foreground">Hoặc dán URL:</span>
              </div>
              <input
                name="coverImageUrl"
                value={form.coverImageUrl}
                onChange={handleChange}
                disabled={form.coverImageFile !== null}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-background pl-24 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium">Giới hạn chapter free</label>
            <input
              name="freeChapterLimit"
              value={form.freeChapterLimit}
              onChange={handleChange}
              type="number"
              min={0}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">Để trống nếu muốn tất cả chương đều Premium.</p>
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
              Tính năng yêu cầu xuất bản sẽ thực hiện sau khi lưu truyện, tại trang danh sách truyện.
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        {result && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            {result}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading || submitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu truyện"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={() => router.push("/uploader/stories")}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </UploaderLayout>
  );
}
