"use client";

import { UploaderLayout } from "@/features/uploader/components/UploaderLayout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStory, getChaptersBySlug, getChapter, getChapterPages, getMyInfo, deleteStory } from "@/lib/api/stories";
import type { Story, Chapter, ChapterPage } from "@/lib/types/stories";
import { toast } from "sonner";

const storyTypeLabel: Record<string, string> = {
  COMICS: "Truyện tranh",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  NOVEL: "Light novel",
};

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-100 text-emerald-700" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-100 text-sky-700" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-100 text-amber-700" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-100 text-rose-700" },
};

export default function UploaderStoryDetailPage() {
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"intro" | "chapters">("chapters");
  const [searchChapter, setSearchChapter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [previewChapter, setPreviewChapter] = useState<Chapter | null>(null);
  const [previewPages, setPreviewPages] = useState<ChapterPage[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!slug || Array.isArray(slug)) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const myInfo = await getMyInfo();
        const [storyData, chaptersData] = await Promise.all([
          getStory(slug),
          getChaptersBySlug(slug, { size: 100 }),
        ]);
        if (storyData.uploader?.id !== myInfo.id) {
          setError("Bạn không có quyền xem truyện này.");
          return;
        }
        setStory(storyData);
        setChapters((chaptersData.data ?? []).sort((a, b) => a.chapterNumber - b.chapterNumber));
      } catch {
        setError("Không tải được thông tin truyện.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const filteredChapters = chapters.filter((c) =>
    searchChapter === "" || c.title?.toLowerCase().includes(searchChapter.toLowerCase()) ||
    String(c.chapterNumber).includes(searchChapter)
  );

  const totalPages = Math.max(1, Math.ceil(filteredChapters.length / pageSize));
  const paginatedChapters = filteredChapters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePreviewChapter = async (chapter: Chapter) => {
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const [fullChapter, pages] = await Promise.all([
        getChapter(chapter.id),
        getChapterPages(chapter.id),
      ]);
      setPreviewChapter(fullChapter);
      setPreviewPages(pages);
    } catch {
      toast.error("Không tải được nội dung chương.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewChapter(null);
    setPreviewPages([]);
  };

  const handleDeleteStory = async () => {
    if (!story?.id) return;
    const confirmed = window.confirm(`Xóa truyện "${story.title}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;
    try {
      await deleteStory(story.id);
      toast.success("Đã xóa truyện.");
      router.push("/uploader/stories");
    } catch {
      toast.error("Không thể xóa truyện.");
    }
  };

  if (loading) {
    return (
      <UploaderLayout>
        <div className="h-64 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 animate-pulse rounded-xl" />
        <div className="flex gap-6 mt-6">
          <div className="w-44 shrink-0">
            <div className="aspect-[3/4] rounded-xl bg-muted shadow-xl animate-pulse" />
          </div>
          <div className="flex-1 pt-4 space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </UploaderLayout>
    );
  }

  if (error || !story) {
    return (
      <UploaderLayout>
        <div className="py-16 text-center">
          <p className="text-muted-foreground">{error ?? "Truyện không tồn tại."}</p>
          <button onClick={() => router.push("/uploader/stories")} className="mt-4 text-indigo-400 hover:underline">
            Quay lại danh sách truyện
          </button>
        </div>
      </UploaderLayout>
    );
  }

  return (
    <UploaderLayout>
      {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pt-8">
          {/* Story Header */}
          <div className="flex gap-6 mb-6">
            {/* Cover */}
            <div className="w-44 shrink-0">
              <div className="aspect-[3/4] rounded-xl bg-muted overflow-hidden shadow-xl border-4 border-background relative">
                {story.coverImageUrl ? (
                  <img src={story.coverImageUrl} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pb-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[story.status]?.className ?? "bg-muted"}`}>
                  {statusConfig[story.status]?.text ?? story.status}
                </span>
                <span className="rounded-full bg-white/10 text-white/80 px-3 py-1 text-xs font-medium">
                  {storyTypeLabel[story.storyType] ?? story.storyType}
                </span>
                {story.isBanned && (
                  <span className="rounded-full bg-red-500/20 text-red-400 px-3 py-1 text-xs font-medium">Bị ban</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground">{story.title}</h1>

              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Tác giả: <span className="text-foreground">{story.authors?.map(a => a.author.name).join(", ") || "Chưa có"}</span></p>
                <p>Tình trạng: <span className="text-foreground">{statusConfig[story.status]?.text ?? story.status}</span></p>
                <p>Thể loại: <span className="text-foreground">{story.genres?.map(g => g.name).join(", ") || "Chưa có"}</span></p>
                <p>Lượt xem: <span className="text-foreground">{story.viewCount?.toLocaleString() ?? 0}</span></p>
                <p>Lượt theo dõi: <span className="text-foreground">{story.followCount?.toLocaleString() ?? 0}</span></p>
                <p>Số chương: <span className="text-foreground">{chapters.length}</span></p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/uploader/stories/new?edit=${story.id}`)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Chỉnh sửa truyện
                </button>
                <button
                  onClick={handleDeleteStory}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Xóa truyện
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-0">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("intro")}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "intro"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Giới thiệu
              </button>
              <button
                onClick={() => setActiveTab("chapters")}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "chapters"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Danh sách chương
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "intro" ? (
            <div className="py-8">
              {story.description ? (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-3">Mô tả</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{story.description}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Chưa có mô tả cho truyện này.
                </div>
              )}
              {story.freeChapterLimit && (
                <div className="mt-4 rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-2">Miễn phí</h2>
                  <p className="text-sm text-muted-foreground">
                    {story.freeChapterLimit} chương đầu tiên được đọc miễn phí.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6">
              {/* Search & Filter */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm kiếm chương..."
                      value={searchChapter}
                      onChange={(e) => { setSearchChapter(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {filteredChapters.length} chương
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/uploader/stories/${slug}/chapters`)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted whitespace-nowrap"
                >
                  Quản lý chương
                </button>
              </div>

              {/* Chapter List */}
              {filteredChapters.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                  {searchChapter ? "Không tìm thấy chương nào." : "Chưa có chương nào."}
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border overflow-hidden">
                    {paginatedChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Chương {chapter.chapterNumber}</span>
                            {chapter.title && (
                              <span className="text-sm text-muted-foreground truncate">{chapter.title}</span>
                            )}
                            {!chapter.isPublished && (
                              <span className="shrink-0 rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs">Bản nháp</span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {chapter.pageCount ?? 0} trang · {chapter.viewCount?.toLocaleString() ?? 0} lượt xem
                        </span>
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => handlePreviewChapter(chapter)}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                          >
                            Xem demo
                          </button>
                          <button
                            onClick={() => router.push(`/uploader/stories/${slug}/chapters/${chapter.id}/content`)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Nội dung
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-muted disabled:opacity-40"
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            page === currentPage
                              ? "bg-indigo-600 text-white"
                              : "border border-border hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-muted disabled:opacity-40"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex bg-black/80" onClick={handleClosePreview}>
          <div
            className="w-full max-w-3xl bg-background h-full overflow-y-auto ml-auto transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold truncate text-sm">
                  {previewChapter ? `Chương ${previewChapter.chapterNumber}: ${previewChapter.title}` : "Đang tải..."}
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted ml-4"
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
              ) : previewPages.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">Chương này chưa có nội dung.</div>
              ) : (
                <div className="space-y-4">
                  {previewPages.sort((a, b) => a.pageNumber - b.pageNumber).map((page) => (
                    <div key={page.id} className="bg-muted rounded overflow-hidden">
                      <img src={page.imageUrl} alt={`Trang ${page.pageNumber}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UploaderLayout>
  );
}
