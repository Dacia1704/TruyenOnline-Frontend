"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { UploaderLayout } from "@/features/uploader/components/UploaderLayout";
import {
  getChapter,
  getChapterPages,
  updateChapter,
  updateChapterContent,
  uploadChapterPages,
} from "@/lib/api/stories";
import type { Chapter, ChapterPage } from "@/lib/api/stories";

function EditorToolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded-md px-2 py-1 text-xs font-bold transition ${editor.isActive("bold") ? "bg-indigo-100 text-indigo-700" : "hover:bg-muted"}`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded-md px-2 py-1 text-xs italic transition ${editor.isActive("italic") ? "bg-indigo-100 text-indigo-700" : "hover:bg-muted"}`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded-md px-2 py-1 text-xs transition ${editor.isActive("bulletList") ? "bg-indigo-100 text-indigo-700" : "hover:bg-muted"}`}
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded-md px-2 py-1 text-xs transition ${editor.isActive("blockquote") ? "bg-indigo-100 text-indigo-700" : "hover:bg-muted"}`}
      >
        &ldquo; &rdquo;
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`rounded-md px-2 py-1 text-xs transition ${editor.isActive("paragraph") && !editor.isActive("bulletList") && !editor.isActive("blockquote") ? "bg-indigo-100 text-indigo-700" : "hover:bg-muted"}`}
      >
        P
      </button>
    </div>
  );
}

export default function ChapterContentManagerPage() {
  const params = useParams<{ slug?: string; chapterId?: string }>();
  const router = useRouter();
  const chapterId = params?.chapterId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [chapterType, setChapterType] = useState<"NOVEL" | "MANGA">("MANGA");
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const chapterPageInputRef = useRef<HTMLInputElement>(null);

  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewPages, setPreviewPages] = useState<ChapterPage[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!chapterId) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [chapterData, pagesData] = await Promise.all([
          getChapter(chapterId),
          getChapterPages(chapterId).catch(() => []),
        ]);
        setChapter(chapterData);
        setPages(pagesData);
        if (chapterData.content) {
          setContent(chapterData.content);
          if (editor) editor.commands.setContent(chapterData.content);
        }
        if (pagesData.length > 0) {
          setChapterType("MANGA");
        } else {
          setChapterType("NOVEL");
        }
      } catch {
        setError("Không tải được thông tin chương.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [chapterId, editor]);

  useEffect(() => {
    if (!chapterId) return;

    cancelledRef.current = false;
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewContent(null);
    setPreviewPages([]);

    const loadPreview = async () => {
      try {
        const data = await getChapter(chapterId);
        if (cancelledRef.current) return;
        setPreviewContent(data.content ?? null);
        setPreviewPages(data.pages ?? []);
      } catch {
        if (cancelledRef.current) return;
        setPreviewError("Không tải được nội dung demo.");
      } finally {
        if (!cancelledRef.current) setPreviewLoading(false);
      }
    };

    loadPreview();
    return () => {
      cancelledRef.current = true;
    };
  }, [chapterId, chapterType, pages.length, pendingFiles.length]);

  const handleChapterTypeChange = (value: "NOVEL" | "MANGA") => {
    setChapterType(value);
    if (value === "MANGA") {
      setContent("");
      if (editor) editor.commands.setContent("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles((prev) => {
      const nextFiles = [...prev, ...files];
      const nextPreviews: Record<number, string> = { ...previewUrls };
      nextFiles.forEach((file, index) => {
        nextPreviews[index] = URL.createObjectURL(file);
      });
      setPreviewUrls(nextPreviews);
      return nextFiles;
    });
    if (chapterPageInputRef.current) chapterPageInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!chapterId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (chapterType === "NOVEL") {
        await updateChapterContent(chapterId, content);
      } else {
        if (pendingFiles.length > 0) {
          await uploadChapterPages(
            chapterId,
            pendingFiles,
            pendingFiles.map((_, i) => ({ pageNumber: pages.length + i + 1, isNewPage: true })),
          );
        }
        await updateChapter(chapterId, {
          pageCount: pages.length + pendingFiles.length,
          isPublished: chapter?.isPublished,
        });
      }

      setSuccess("Đã lưu nội dung thành công.");

      const [chapterData, pagesData] = await Promise.all([
        getChapter(chapterId),
        getChapterPages(chapterId).catch(() => []),
      ]);

      if (!cancelledRef.current) {
        setPreviewContent(chapterData.content ?? null);
        setPreviewPages(pagesData);
      }

      setChapter(chapterData);
      setPages(pagesData);
      setPendingFiles([]);
      setPreviewUrls({});
    } catch {
      setError("Không thể lưu nội dung. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <UploaderLayout>
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        </div>
      </UploaderLayout>
    );
  }

  if (!chapter) {
    return (
      <UploaderLayout>
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-sm text-muted-foreground">Không tìm thấy chương.</p>
          <button
            onClick={() => router.push(`/uploader/stories/${params?.slug}/chapters`)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Quay lại
          </button>
        </div>
      </UploaderLayout>
    );
  }

  return (
    <UploaderLayout maxWidth="wide">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nội dung chương</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chương {chapter.chapterNumber}: {chapter.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/uploader/stories/${params?.slug}/chapters`)}
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
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>
      )}

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Nội dung chương</h2>
          <p className="mt-1 text-sm text-muted-foreground">Chọn loại nội dung và nhập nội dung cho chương.</p>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-medium">Loại chương</label>
              <select
                value={chapterType}
                onChange={(e) => handleChapterTypeChange(e.target.value as "NOVEL" | "MANGA")}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="NOVEL">NOVEL - Nội dung văn bản</option>
                <option value="MANGA">MANGA - Ảnh trang</option>
              </select>
            </div>

            {chapterType === "NOVEL" && editor && (
              <div>
                <label className="text-sm font-medium">Nội dung chương</label>
                <div className="mt-2 rounded-lg border border-border bg-background">
                  <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
                    <EditorToolbar editor={editor} />
                  </div>
                  <EditorContent
                    editor={editor}
                    className="min-h-[320px] px-3 py-3 text-sm [&_.ProseMirror]:outline-none"
                  />
                </div>
              </div>
            )}

            {chapterType === "MANGA" && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Ảnh trang chương</p>
                    <p className="text-xs text-muted-foreground">Kéo thả ảnh để sắp xếp thứ tự trang.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => chapterPageInputRef.current?.click()}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                    >
                      Chọn ảnh
                    </button>
                    {pendingFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingFiles([]);
                          setPreviewUrls({});
                        }}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={chapterPageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  className="mt-4 rounded-xl border-2 border-dashed border-border p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-indigo-500", "bg-indigo-50/40");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50/40");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50/40");
                    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                    if (!files.length) return;
                    setPendingFiles((prev) => {
                      const nextFiles = [...prev, ...files];
                      const nextPreviews: Record<number, string> = { ...previewUrls };
                      nextFiles.forEach((file, index) => {
                        nextPreviews[index] = URL.createObjectURL(file);
                      });
                      setPreviewUrls(nextPreviews);
                      return nextFiles;
                    });
                  }}
                >
                  <p className="text-sm text-muted-foreground">Kéo thả ảnh vào đây hoặc nhấn Chọn ảnh</p>
                  <p className="mt-1 text-xs text-muted-foreground">Hỗ trợ JPG, PNG, WEBP, GIF.</p>
                </div>

                {pendingFiles.length > 0 && (
                  <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {pendingFiles.map((_file, index) => (
                      <div
                        key={previewUrls[index] ?? index}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = dragIndex;
                          const to = index;
                          if (from === null || from === to) return;
                          setPendingFiles((prev) => {
                            const nextFiles = [...prev];
                            const [moved] = nextFiles.splice(from, 1);
                            nextFiles.splice(to, 0, moved);
                            const nextPreviews: Record<number, string> = {};
                            nextFiles.forEach((f, i) => {
                              nextPreviews[i] = URL.createObjectURL(f);
                            });
                            setPreviewUrls(nextPreviews);
                            return nextFiles;
                          });
                          setDragIndex(null);
                        }}
                        className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted cursor-grab active:cursor-grabbing"
                      >
                        <img
                          src={previewUrls[index]}
                          alt={`Trang ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                          <span className="text-xs text-white font-medium">Kéo để đổi vị trí</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingFiles((prev) => {
                                const nextFiles = prev.filter((_, i) => i !== index);
                                const nextPreviews: Record<number, string> = {};
                                nextFiles.forEach((f, i) => {
                                  nextPreviews[i] = URL.createObjectURL(f);
                                });
                                setPreviewUrls(nextPreviews);
                                return nextFiles;
                              });
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
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu nội dung"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Demo chương</h2>
          <p className="mt-1 text-sm text-muted-foreground">Xem trước nội dung chương</p>

          <div className="mt-4 rounded-xl border border-border bg-background">
            <div className="min-h-[320px] max-h-[640px] overflow-y-auto p-3 text-sm">
              {previewLoading ? (
                <p className="text-muted-foreground">Đang tải demo...</p>
              ) : previewError ? (
                <p className="text-red-600">{previewError}</p>
              ) : chapterType === "NOVEL" ? (
                <div
                  className="prose prose-sm max-w-none [&_.ProseMirror]:outline-none"
                  dangerouslySetInnerHTML={{
                    __html: previewContent || "<p class='text-muted-foreground'>Chưa có nội dung.</p>",
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {(previewPages.length > 0 ? previewPages : pendingFiles.length > 0 ? [] : null) === null && (
                    <p className="text-muted-foreground">Chưa có trang nào.</p>
                  )}
                  {previewPages.length > 0 && (
                    <div className="space-y-3">
                      {previewPages.map((page) => (
                        <div key={page.id} className="w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <img src={page.imageUrl} alt={`Trang ${page.pageNumber}`} className="w-full h-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                  {previewPages.length === 0 &&
                    pendingFiles.length > 0 &&
                    pendingFiles.map((file, index) => (
                      <div
                        key={previewUrls[index] ?? index}
                        className="w-full overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img src={previewUrls[index]} alt={`Trang ${index + 1}`} className="w-full h-auto" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </UploaderLayout>
  );
}
