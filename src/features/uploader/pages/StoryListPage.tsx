"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploaderLayout } from "../components/UploaderLayout";
import { StoryCard } from "../components/StoryCard";
import { deleteStory, getMyInfo, getStories, requestPublish } from "@/lib/api/stories";
import { clearTokens } from "@/lib/api/client";
import type { Story } from "@/lib/types/stories";

export default function StoryListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      try {
        const [myInfo, result] = await Promise.all([getMyInfo(), getStories({ size: 50 })]);
        setMyId(myInfo.id);
        console.log(result);
        setStories(result ?? []);
      } catch {
        setError("Không tải được danh sách truyện. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const handleDelete = async (story: Story) => {
    if (!story.id) return;
    const confirmed = window.confirm(`Xóa truyện "${story.title}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      setActionLoading(story.id);
      setError(null);
      await deleteStory(story.id);
      setStories((prev) => prev.filter((item) => item.id !== story.id));
    } catch {
      setError("Không thể xóa truyện. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestPublish = async (story: Story) => {
    if (!story.id) return;
    const confirmed = window.confirm(`Gửi yêu cầu xuất bản truyện "${story.title}"?`);
    if (!confirmed) return;

    try {
      setPublishLoading(story.id);
      setError(null);
      await requestPublish(story.id);
      setStories((prev) => prev.map((item) => (item.id === story.id ? { ...item, published: true } : item)));
    } catch {
      setError("Không thể gửi yêu cầu xuất bản. Vui lòng thử lại.");
    } finally {
      setPublishLoading(null);
    }
  };

  const myStories = myId ? stories.filter((story) => story.uploader?.id === myId) : stories;

  return (
    <UploaderLayout>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Truyện của tôi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý truyện, chương và trạng thái xuất bản.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/uploader/stories/new")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Tạo truyện mới
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-8 grid gap-4">
        {loading && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Đang tải truyện...
          </div>
        )}
        {!loading && myStories.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Bạn chưa có truyện nào. Tạo truyện mới để bắt đầu thêm chương.
          </div>
        )}
        {myStories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onDelete={() => handleDelete(story)}
            isDeleting={actionLoading === story.id}
            onRequestPublish={() => handleRequestPublish(story)}
            isRequestingPublish={publishLoading === story.id}
          />
        ))}
      </div>
    </UploaderLayout>
  );
}
