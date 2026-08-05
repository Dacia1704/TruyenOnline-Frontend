"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import {
  createStory,
  getGenres,
  getMyInfo,
  getStories,
  updateStory,
  updateStoryAuthors,
  getAuthors,
  createAuthor,
  type Genre,
  type Author,
  type StoryAuthorUpdateRequest,
} from "@/lib/api/stories";
import type { Story, StoryStatus, StoryType } from "@/lib/types/stories";
import { toast } from "sonner";

interface StoryFormPageProps {
  storyId?: string;
}

type AuthorRole = "AUTHOR" | "CO_AUTHOR" | "ILLUSTRATOR" | "TRANSLATOR";

interface SelectedAuthor {
  authorId: string;
  name: string;
  role: AuthorRole;
  sortOrder: number;
}

const AUTHOR_ROLES: { value: AuthorRole; label: string }[] = [
  { value: "AUTHOR", label: "Tác giả" },
  { value: "CO_AUTHOR", label: "Đồng tác giả" },
  { value: "ILLUSTRATOR", label: "Họa sĩ" },
  { value: "TRANSLATOR", label: "Dịch giả" },
];

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

  // Author state
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<SelectedAuthor[]>([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showCreateAuthor, setShowCreateAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorBio, setNewAuthorBio] = useState("");
  const [newAuthorCountry, setNewAuthorCountry] = useState("");
  const [newAuthorAvatar, setNewAuthorAvatar] = useState<File | null>(null);
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      setLoading(true);
      setError(null);
      try {
        const [myInfo, allGenres, authorsData] = await Promise.all([
          getMyInfo(),
          getGenres(),
          getAuthors({ size: 100 }),
        ]);
        setGenres(allGenres);
        setAllAuthors(authorsData.data);

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
            // Load existing authors from story
            const storyAuthors = (story as unknown as { authors?: Array<{
              authorResponse?: Author;
              authorRole?: AuthorRole;
              sortOrder?: number;
            }> }).authors ?? [];
            const mapped: SelectedAuthor[] = storyAuthors
              .filter((sa) => sa.authorResponse)
              .map((sa) => ({
                authorId: sa.authorResponse!.id,
                name: sa.authorResponse!.name,
                role: (sa.authorRole as AuthorRole) ?? "AUTHOR",
                sortOrder: sa.sortOrder ?? 1,
              }));
            setSelectedAuthors(mapped);
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

  // Author handlers
  const handleAddAuthor = (author: Author) => {
    if (selectedAuthors.some((sa) => sa.authorId === author.id)) {
      toast.error("Tác giả này đã được thêm.");
      return;
    }
    setSelectedAuthors((prev) => [
      ...prev,
      { authorId: author.id, name: author.name, role: "AUTHOR", sortOrder: prev.length + 1 },
    ]);
    setAuthorSearch("");
    setShowAuthorDropdown(false);
  };

  const handleRemoveAuthor = (authorId: string) => {
    setSelectedAuthors((prev) => prev.filter((sa) => sa.authorId !== authorId));
  };

  const handleAuthorRoleChange = (authorId: string, role: AuthorRole) => {
    setSelectedAuthors((prev) =>
      prev.map((sa) => (sa.authorId === authorId ? { ...sa, role } : sa)),
    );
  };

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) {
      toast.error("Tên tác giả không được để trống.");
      return;
    }
    setCreatingAuthor(true);
    try {
      const created = await createAuthor({
        name: newAuthorName.trim(),
        bio: newAuthorBio.trim() || undefined,
        country: newAuthorCountry.trim() || undefined,
        avatarFile: newAuthorAvatar || undefined,
      });
      setAllAuthors((prev) => [...prev, created]);
      handleAddAuthor(created);
      setShowCreateAuthor(false);
      setNewAuthorName("");
      setNewAuthorBio("");
      setNewAuthorCountry("");
      setNewAuthorAvatar(null);
      toast.success("Tạo tác giả thành công!");
    } catch {
      // Error handled by interceptor
    } finally {
      setCreatingAuthor(false);
    }
  };

  const handleSubmitInternal = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    storyType: form.storyType,
    status: form.status,
    isPublished: false,
    freeChapterLimit:
      form.freeChapterLimit === "" || form.freeChapterLimit === null ? null : Number(form.freeChapterLimit),
    coverImageFile: form.coverImageFile,
  } as any;

      let saved: Story;
      if (storyId) {
        saved = await updateStory(storyId, payload);
        setResult("Cập nhật truyện thành công.");
      } else {
        saved = await createStory(payload);
        setResult("Tạo truyện thành công.");
      }

      // Update story authors if there are selected authors
      if (saved && selectedAuthors.length > 0) {
        const authorPayload: StoryAuthorUpdateRequest[] = selectedAuthors.map((sa) => ({
          authorId: sa.authorId,
          role: sa.role,
          sortOrder: sa.sortOrder,
        }));
        try {
          await updateStoryAuthors(saved.id, authorPayload);
        } catch {
          toast.warning("Không thể cập nhật tác giả. Bạn có thể cập nhật sau.");
        }
      }

      router.push("/uploader/stories");
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

  const filteredAuthors = allAuthors.filter(
    (a) =>
      a.name.toLowerCase().includes(authorSearch.toLowerCase()) &&
      !selectedAuthors.some((sa) => sa.authorId === a.id),
  );

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

        {/* Author Section */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Tác giả</label>
            <button
              type="button"
              onClick={() => setShowCreateAuthor(true)}
              className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              + Tạo tác giả mới
            </button>
          </div>

          {/* Selected authors */}
          {selectedAuthors.length > 0 && (
            <div className="mt-2 space-y-2">
              {selectedAuthors.map((sa) => (
                <div
                  key={sa.authorId}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sa.name}</p>
                  </div>
                  <select
                    value={sa.role}
                    onChange={(e) => handleAuthorRoleChange(sa.authorId, e.target.value as AuthorRole)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-indigo-500"
                  >
                    {AUTHOR_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveAuthor(sa.authorId)}
                    className="shrink-0 rounded-md p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add author dropdown */}
          <div className="relative mt-2">
            <input
              type="text"
              value={authorSearch}
              onChange={(e) => {
                setAuthorSearch(e.target.value);
                setShowAuthorDropdown(true);
              }}
              onFocus={() => setShowAuthorDropdown(true)}
              placeholder="Tìm kiếm tác giả..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {showAuthorDropdown && authorSearch && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-xl">
                {filteredAuthors.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Không tìm thấy tác giả.</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredAuthors.map((author) => (
                      <button
                        key={author.id}
                        type="button"
                        onClick={() => handleAddAuthor(author)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted transition"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                          {author.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{author.name}</p>
                          {author.country && (
                            <p className="text-xs text-muted-foreground">{author.country}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Create author modal */}
          {showCreateAuthor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-foreground">Tạo tác giả mới</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Tên tác giả *</label>
                    <input
                      type="text"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      placeholder="Nhập tên tác giả"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Tiểu sử</label>
                    <textarea
                      value={newAuthorBio}
                      onChange={(e) => setNewAuthorBio(e.target.value)}
                      rows={3}
                      placeholder="Giới thiệu ngắn về tác giả"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Quốc gia</label>
                    <input
                      type="text"
                      value={newAuthorCountry}
                      onChange={(e) => setNewAuthorCountry(e.target.value)}
                      placeholder="VD: Nhật Bản, Hàn Quốc"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Ảnh đại diện</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setNewAuthorAvatar(file);
                      }}
                      className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAuthor(false);
                      setNewAuthorName("");
                      setNewAuthorBio("");
                      setNewAuthorCountry("");
                      setNewAuthorAvatar(null);
                    }}
                    className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium transition hover:bg-muted"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAuthor}
                    disabled={creatingAuthor}
                    className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creatingAuthor ? "Đang tạo..." : "Tạo & Thêm"}
                  </button>
                </div>
              </div>
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
