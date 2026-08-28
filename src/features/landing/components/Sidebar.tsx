"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyReadingHistories, getStories } from "@/lib/api/stories";
import type { ReadingHistory, Story } from "@/lib/types/stories";

const statusConfig: Record<string, { text: string; className: string }> = {
  ONGOING: { text: "Đang ra", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  COMPLETED: { text: "Hoàn thành", className: "bg-sky-500/20 text-sky-400 border border-sky-500/30" },
  HIATUS: { text: "Tạm dừng", className: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  CANCELLED: { text: "Đã hủy", className: "bg-rose-500/20 text-rose-400 border border-rose-500/30" },
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
}

export function Sidebar() {
  const [readingHistories, setReadingHistories] = useState<ReadingHistory[]>([]);
  const [topViewStories, setTopViewStories] = useState<Story[]>([]);
  const [topFollowStories, setTopFollowStories] = useState<Story[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "follow">("view");

  useEffect(() => {
    const loadReadingHistory = async () => {
      setLoadingHistory(true);
      try {
        const result = await getMyReadingHistories({ size: 5, type: "STORY" });
        setReadingHistories(result.data ?? []);
      } catch {
        // Silently fail for reading history
      } finally {
        setLoadingHistory(false);
      }
    };
    loadReadingHistory();
  }, []);

  useEffect(() => {
    const loadTopStories = async () => {
      setLoadingTop(true);
      try {
        const [viewResult, followResult] = await Promise.all([
          getStories({ isPublished: true, size: 10, sortType: "VIEW" }),
          getStories({ isPublished: true, size: 10, sortType: "FOLLOW" }),
        ]);
        setTopViewStories(viewResult.data ?? []);
        setTopFollowStories(followResult.data ?? []);
      } catch {
        // Silently fail
      } finally {
        setLoadingTop(false);
      }
    };
    loadTopStories();
  }, []);

  const topStories = activeTab === "view" ? topViewStories : topFollowStories;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-white/10 bg-muted/50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-foreground dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Lịch sử đọc truyện
          </h3>
        </div>
        <div className="p-3">
          {loadingHistory ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-14 h-[70px] bg-muted dark:bg-slate-700 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-muted dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-3 bg-muted dark:bg-slate-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : readingHistories.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground dark:text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p>Chưa có lịch sử đọc truyện</p>
              <p className="text-xs mt-1">Hãy bắt đầu đọc truyện để xem tại đây</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readingHistories.slice(0, 5).map((history) => (
                <Link
                  key={history.id}
                  href={history.story?.slug ? `/stories/${history.story.slug}` : "#"}
                  className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-slate-700/50 transition group"
                >
                  <div className="w-14 h-[70px] rounded-lg overflow-hidden flex-shrink-0 bg-muted dark:bg-slate-700">
                    {history.story?.coverImageUrl ? (
                      <img
                        src={history.story.coverImageUrl}
                        alt={history.story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img src="/images/icon/main.png" alt="placeholder" className="w-6 h-6 object-contain opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground dark:text-white group-hover:text-indigo-400 dark:group-hover:text-indigo-400 transition line-clamp-2">
                      {history.story?.title ?? "Không có tiêu đề"}
                    </h4>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5">
                      {history.chapter
                        ? `Chương ${history.chapter.chapterNumber}${history.chapter.title ? `: ${history.chapter.title}` : ""}`
                        : "Đang đọc"}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">
                      {formatRelativeTime(history.lastReadAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border dark:border-white/10 bg-card dark:bg-slate-800/50 overflow-hidden">
        <div className="flex border-b border-border dark:border-white/10">
          <button
            onClick={() => setActiveTab("view")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "view"
                ? "bg-indigo-500/10 text-indigo-500 border-b-2 border-indigo-500"
                : "text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-muted/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Top View
          </button>
          <button
            onClick={() => setActiveTab("follow")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "follow"
                ? "bg-indigo-500/10 text-indigo-500 border-b-2 border-indigo-500"
                : "text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-muted/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Top Follow
          </button>
        </div>
        <div className="p-3">
          {loadingTop ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-6 bg-muted dark:bg-slate-700 rounded-full flex-shrink-0" />
                  <div className="w-10 h-14 bg-muted dark:bg-slate-700 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 bg-muted dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-muted dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : topStories.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground dark:text-slate-400">
              Không có dữ liệu
            </div>
          ) : (
            <div className="space-y-2">
              {topStories.slice(0, 10).map((story, index) => (
                <Link
                  key={story.id}
                  href={story.slug ? `/stories/${story.slug}` : "#"}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-slate-700/50 transition group"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      index === 0
                        ? "bg-amber-500 text-white"
                        : index === 1
                          ? "bg-slate-400 text-white"
                          : index === 2
                            ? "bg-amber-700 text-white"
                            : "bg-muted dark:bg-slate-700 text-muted-foreground dark:text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted dark:bg-slate-700">
                    {story.coverImageUrl ? (
                      <img src={story.coverImageUrl} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img src="/images/icon/main.png" alt="placeholder" className="w-5 h-5 object-contain opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground dark:text-white group-hover:text-indigo-400 dark:group-hover:text-indigo-400 transition line-clamp-1">
                      {story.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          statusConfig[story.status]?.className ??
                          "bg-muted dark:bg-slate-700 text-foreground dark:text-slate-300"
                        }`}
                      >
                        {statusConfig[story.status]?.text ?? story.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                      {activeTab === "view"
                        ? `${story.viewCount?.toLocaleString() ?? 0} lượt xem`
                        : `${story.followCount?.toLocaleString() ?? 0} theo dõi`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
