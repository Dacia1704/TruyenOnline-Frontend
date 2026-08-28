"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import {
  getStoryById,
  getChapters,
  getChapter,
  banStory,
  unbanStory,
  banChapter,
  unbanChapter,
} from "@/lib/api/stories";
import { Chapter, Story, ViolationType } from "@/lib/types/stories";
import { toast } from "sonner";

const VIOLATION_TYPES = [
  { value: "COPYRIGHT", label: "Bản quyền" },
  { value: "PORNOGRAPHY", label: "Khiêu dâm" },
  { value: "VIOLENCE", label: "Bạo lực" },
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Quấy rối" },
  { value: "OTHER", label: "Khác" },
];

export default function AdminStoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // Chapter demo modal
  const [demoModal, setDemoModal] = useState<{
    open: boolean;
    chapter: Chapter | null;
  }>({ open: false, chapter: null });
  const [demoContent, setDemoContent] = useState<{
    pages?: { imageUrl: string }[];
    title?: string;
    content?: string;
  } | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // Ban modal state
  const [banModal, setBanModal] = useState<{
    open: boolean;
    type: "STORY" | "CHAPTER";
    id: string;
    isBanned: boolean;
  }>({ open: false, type: "STORY", id: "", isBanned: false });
  const [banReason, setBanReason] = useState("");
  const [violationType, setViolationType] = useState<string>("COPYRIGHT");
  const [banLoading, setBanLoading] = useState(false);

  const loadStory = useCallback(async () => {
    try {
      const storyData = await getStoryById(storyId);
      setStory(storyData);
    } catch {
      toast.error("Không tải được thông tin truyện");
      router.push("/admin/stories");
    }
  }, [storyId, router]);

  const loadChapters = useCallback(async () => {
    setChaptersLoading(true);
    try {
      const result = await getChapters(storyId, { size: 500 });
      setChapters(result.data ?? []);
    } catch {
      toast.error("Không tải được danh sách chương");
    } finally {
      setChaptersLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStory(), loadChapters()]);
      setLoading(false);
    };
    loadData();
  }, [loadStory, loadChapters]);

  const handleOpenDemo = async (chapter: Chapter) => {
    setDemoModal({ open: true, chapter });
    setDemoContent(null);
    setDemoLoading(true);
    try {
      const fullChapter = await getChapter(chapter.id);
      setDemoContent({
        pages: fullChapter.pages ?? [],
        title: fullChapter.title,
        content: fullChapter.content,
      });
    } catch {
      toast.error("Không tải được nội dung chương");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCloseDemo = () => {
    setDemoModal({ open: false, chapter: null });
    setDemoContent(null);
  };

  const handleOpenBanModal = (type: "STORY" | "CHAPTER", id: string, isBanned: boolean) => {
    setBanModal({ open: true, type, id, isBanned });
    setBanReason("");
    setViolationType("COPYRIGHT");
  };

  const handleCloseBanModal = () => {
    setBanModal({ open: false, type: "STORY", id: "", isBanned: false });
    setBanReason("");
    setViolationType("COPYRIGHT");
  };

  const handleBanSubmit = async () => {
    if (!banReason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }
    setBanLoading(true);
    try {
      if (banModal.type === "STORY") {
        await banStory(banModal.id, violationType as ViolationType, banReason);
        setStory((prev) => (prev ? { ...prev, isBanned: true } : prev));
      } else {
        await banChapter(banModal.id, violationType as ViolationType, banReason);
        setChapters((prev) => prev.map((c) => (c.id === banModal.id ? { ...c, isBanned: true } : c)));
        if (demoModal.chapter?.id === banModal.id) {
          setDemoModal((prev) => ({ ...prev, chapter: { ...prev.chapter!, isBanned: true } }));
        }
      }
      toast.success("Đã ban thành công");
      handleCloseBanModal();
    } catch {
      toast.error("Không thể thực hiện thao tác");
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnbanSubmit = async () => {
    if (!banReason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }
    setBanLoading(true);
    try {
      if (banModal.type === "STORY") {
        await unbanStory(banModal.id, banReason);
        setStory((prev) => (prev ? { ...prev, isBanned: false } : prev));
      } else {
        await unbanChapter(banModal.id, banReason);
        setChapters((prev) => prev.map((c) => (c.id === banModal.id ? { ...c, isBanned: false } : c)));
        if (demoModal.chapter?.id === banModal.id) {
          setDemoModal((prev) => ({ ...prev, chapter: { ...prev.chapter!, isBanned: false } }));
        }
      }
      toast.success("Đã unban thành công");
      handleCloseBanModal();
    } catch {
      toast.error("Không thể thực hiện thao tác");
    } finally {
      setBanLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl mt-6" />
        </div>
      </AdminLayout>
    );
  }

  if (!story) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy truyện</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/stories")} className="p-2 hover:bg-muted rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{story.title}</h1>
          </div>
        </div>

        {/* Story Info Card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex gap-6 p-6">
            {story.coverImageUrl && (
              <img src={story.coverImageUrl} alt={story.title} className="w-32 h-44 object-cover rounded-lg shrink-0" />
            )}
            <div className="flex-1 space-y-3">
              {/* Kiểu truyện */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Kiểu truyện:</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  {story.storyType}
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  {story.status}
                </span>
              </div>

              {/* Người đăng */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Người đăng:</span>
                <span className="font-medium">{story.uploader?.username ?? "—"}</span>
              </div>

              {/* Tổng số chương */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tổng số chương:</span>
                <span className="font-medium">{chapters.length}</span>
              </div>

              {/* Tổng lượt xem */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tổng lượt xem:</span>
                <span className="font-medium">{story.viewCount?.toLocaleString() ?? 0}</span>
              </div>

              {/* Tác giả */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tác giả:</span>
                <span className="font-medium">
                  {story.authors && story.authors.length > 0
                    ? story.authors.map((a) => a.author.name).join(", ")
                    : "Chưa có tác giả"}
                </span>
              </div>

              {/* Trạng thái xuất bản */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Trạng thái xuất bản:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      story.isBanned
                        ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        : story.isPublished
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                    }`}
                  >
                    {story.isBanned ? "Bị ban" : story.isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenBanModal("STORY", story.id, story.isBanned ?? false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    story.isBanned
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {story.isBanned ? "Unban" : "Ban"}
                </button>
              </div>

              {/* Trạng thái ra chương */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Trạng thái ra chương:</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  {story.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Danh sách chương</h2>
            <span className="text-sm text-muted-foreground">{chapters.length} chương</span>
          </div>

          {chaptersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Chưa có chương nào.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium w-32">Chương</th>
                      <th className="px-4 py-3 text-left font-medium">Tiêu đề</th>
                      <th className="px-4 py-3 text-left font-medium w-32">Trạng thái</th>
                      <th className="px-4 py-3 text-left font-medium w-32">Lượt xem</th>
                      <th className="px-4 py-3 text-right font-medium w-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters
                      .sort((a, b) => a.chapterNumber - b.chapterNumber)
                      .map((chapter) => (
                        <tr key={chapter.id} className="border-t border-border">
                          <td className="px-4 py-3 font-medium">{chapter.chapterNumber}</td>
                          <td className="px-4 py-3">
                            <span className={chapter.isBanned ? "text-red-500 line-through" : ""}>
                              {chapter.title || `Chương ${chapter.chapterNumber}`}
                            </span>
                            {chapter.isBanned && <span className="ml-2 text-xs text-red-500">(Bị ban)</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                chapter.isPublished
                                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              }`}
                            >
                              {chapter.isPublished ? "Đã đăng" : "Chưa đăng"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {chapter.viewCount?.toLocaleString() ?? 0}
                          </td>
                          <td className="px-4 py-3 text-right w-40">
                            <span className="inline-flex gap-2">
                              <button
                                onClick={() => handleOpenBanModal("CHAPTER", chapter.id, chapter.isBanned ?? false)}
                                className={`px-2 py-1.5 rounded text-xs font-medium transition whitespace-nowrap ${
                                  chapter.isBanned
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                              >
                                {chapter.isBanned ? "Unban" : "Ban"}
                              </button>
                              <button
                                onClick={() => handleOpenDemo(chapter)}
                                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition whitespace-nowrap"
                              >
                                Xem demo
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Demo Modal */}
      {demoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">
                    {demoModal.chapter?.title || `Chương ${demoModal.chapter?.chapterNumber}`}
                    {demoModal.chapter?.isBanned && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                        Bị ban
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{story.title}</p>
                </div>
                <button
                  onClick={() =>
                    handleOpenBanModal("CHAPTER", demoModal.chapter!.id, demoModal.chapter!.isBanned ?? false)
                  }
                  className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                    demoModal.chapter?.isBanned
                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400"
                  }`}
                >
                  {demoModal.chapter?.isBanned ? "Unban" : "Ban"}
                </button>
              </div>
              <button onClick={handleCloseDemo} className="p-2 hover:bg-muted rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
              {demoLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : demoContent?.pages && demoContent.pages.length > 0 ? (
                <div className="space-y-4">
                  {demoContent.pages.map((page, index) => (
                    <img
                      key={index}
                      src={page.imageUrl}
                      alt={`Trang ${index + 1}`}
                      className="w-full h-auto mx-auto rounded-lg"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : demoContent?.content ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: demoContent.content }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Không có nội dung để hiển thị</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Modal */}
      {banModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {banModal.isBanned ? "Unban" : "Ban"} {banModal.type === "STORY" ? "truyện" : "chương"}
              </h3>

              {!banModal.isBanned && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Loại vi phạm</label>
                  <select
                    value={violationType}
                    onChange={(e) => setViolationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    {VIOLATION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Lý do</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Nhập lý do..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseBanModal}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  onClick={banModal.isBanned ? handleUnbanSubmit : handleBanSubmit}
                  disabled={banLoading}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition ${
                    banModal.isBanned ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  } disabled:opacity-50`}
                >
                  {banLoading ? "Đang xử lý..." : banModal.isBanned ? "Unban" : "Ban"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
