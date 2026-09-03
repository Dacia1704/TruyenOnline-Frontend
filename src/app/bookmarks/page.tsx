"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/PageLayout";
import { getMyBookmarks } from "@/lib/api/stories";
import type { Bookmark } from "@/lib/types/stories";
import { formatViews } from "@/lib/utils";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadBookmarks(0);
  }, []);

  const loadBookmarks = async (pageNum: number) => {
    try {
      const response = await getMyBookmarks({ page: pageNum, size: 10 });
      const items = response.data ?? [];
      if (pageNum === 0) {
        setBookmarks(items);
      } else {
        setBookmarks((prev) => [...prev, ...items]);
      }
      setHasMore(response.currentPage < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadBookmarks(page + 1).finally(() => setLoadingMore(false));
    }
  };

  if (loading) {
    return (
      <PageLayout noActionNavbar>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Theo dõi</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
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
        <h1 className="text-2xl font-bold mb-6">Theo dõi</h1>
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Bạn chưa theo dõi truyện nào</p>
            <Link href="/stories" className="text-blue-500 hover:underline mt-2 inline-block">
              Khám phá truyện
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {bookmarks.map((bookmark) => (
                <Link
                  key={bookmark.story?.id ?? bookmark.id}
                  href={`/stories/${bookmark.story?.slug ?? bookmark.story?.id}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {bookmark.story?.coverImageUrl ? (
                      <Image
                        src={bookmark.story.coverImageUrl}
                        alt={bookmark.story.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-gray-400">No Cover</span>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-blue-500">
                    {bookmark.story?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatViews(bookmark.story?.viewCount ?? 0)} lượt đọc
                  </p>
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
