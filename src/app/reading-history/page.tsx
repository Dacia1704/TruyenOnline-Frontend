"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/PageLayout";
import { getMyReadingHistories } from "@/lib/api/stories";
import type { ReadingHistory } from "@/lib/types/stories";
import { formatViews, formatTimeAgo } from "@/lib/utils";

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadHistory(0);
  }, []);

  const loadHistory = async (pageNum: number) => {
    try {
      const response = await getMyReadingHistories({ page: pageNum, size: 10, type: "STORY" });
      const items = response.data ?? [];
      if (pageNum === 0) {
        setHistory(items);
      } else {
        setHistory((prev) => [...prev, ...items]);
      }
      setHasMore(response.currentPage < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load reading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadHistory(page + 1).finally(() => setLoadingMore(false));
    }
  };

  if (loading) {
    return (
      <PageLayout noActionNavbar>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Lịch sử đọc</h1>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout noActionNavbar>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Lịch sử đọc</h1>
        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có lịch sử đọc</p>
            <Link href="/stories" className="text-blue-500 hover:underline mt-2 inline-block">
              Khám phá truyện
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {history.map((item) => (
                <Link
                  key={item.id}
                  href={`/stories/${item.story?.slug ?? item.story?.id}`}
                  className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500/40 transition group"
                >
                  <div className="relative w-20 h-28 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                    {item.story?.coverImageUrl ? (
                      <Image
                        src={item.story.coverImageUrl}
                        alt={item.story.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-gray-400 text-xs">No Cover</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-clamp-2 group-hover:text-blue-500 transition">
                      {item.story?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatViews(item.story?.viewCount ?? 0)} lượt đọc • {item.story?.followCount ?? 0} theo dõi
                    </p>
                    {item.lastChapter && (
                      <p className="text-sm text-blue-500 mt-2">
                        Đang đọc: {item.lastChapter.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Đã đọc: {formatTimeAgo(item.lastReadAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
