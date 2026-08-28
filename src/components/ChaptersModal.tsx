"use client";

import { useEffect, useRef, useState } from "react";
import { getChaptersBySlug } from "@/lib/api/stories";
import type { Chapter, PageResponse } from "@/lib/types/stories";

interface ChaptersModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  currentChapterId: string;
}

export function ChaptersModal({ isOpen, onClose, slug, currentChapterId }: ChaptersModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const size = 50;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setChapters([]);
      setPage(1);
      loadChapters(1);
    }
  }, [isOpen, slug]);

  const loadChapters = async (pageNum: number) => {
    setLoading(true);
    try {
      const result: PageResponse<Chapter> = await getChaptersBySlug(slug, { page: pageNum, size });
      setChapters((result.data ?? []).sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber)));
      setTotalPages(result.totalPages ?? 1);
      setPage(pageNum);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold dark:text-white">Danh sách chương</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chapter List */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
              </div>
            ) : (
              chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`/stories/${slug}/chapters/${chapter.id}`}
                  onClick={onClose}
                  className={`block px-4 py-2 rounded transition ${
                    chapter.id === currentChapterId
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900"
                  }`}
                >
                  <span className={`font-medium ${chapter.id === currentChapterId ? "" : "text-gray-900 dark:text-gray-100"}`}>
                    Chương {chapter.chapterNumber}
                  </span>
                  {chapter.title && (
                    <span className={`ml-2 text-sm ${chapter.id === currentChapterId ? "text-red-100" : "text-gray-500 dark:text-gray-400"}`}>
                      - {chapter.title}
                    </span>
                  )}
                </a>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 p-4 border-t dark:border-gray-700">
            <button
              onClick={() => loadChapters(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            >
              ‹
            </button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 dark:text-white">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => loadChapters(p as number)}
                  className={`px-3 py-1 rounded ${
                    p === page
                      ? "bg-red-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => loadChapters(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
