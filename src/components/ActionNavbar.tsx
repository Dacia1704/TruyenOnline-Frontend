"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getGenres } from "@/lib/api/stories";
import { Genre } from "@/lib/types/stories";

export function ActionNavbar() {
  const pathname = usePathname();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [showGenres, setShowGenres] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => setGenres([]))
      .finally(() => setGenresLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setShowGenres(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      href: "/",
      label: "Trang chủ",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      isActive: pathname === "/",
    },
    {
      href: "/bookmarks",
      label: "Theo dõi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      isActive: pathname === "/bookmarks",
    },
    {
      href: "/reading-history",
      label: "Lịch sử đọc",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      isActive: pathname === "/reading-history",
    },
    {
      label: "Thể loại",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      isActive: false,
      hasDropdown: true,
    },
    {
      href: "/stories",
      label: "Kho truyện",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      isActive: pathname === "/stories",
    },
  ];

  return (
    <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-1">
          {navItems.map((item, index) => (
            <div key={index} className="relative" ref={item.hasDropdown ? genreDropdownRef : undefined}>
              {item.hasDropdown ? (
                <button
                  type="button"
                  onMouseEnter={() => setShowGenres(true)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition rounded-lg hover:bg-muted dark:hover:bg-white/10 ${
                    item.isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showGenres ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition rounded-lg hover:bg-muted dark:hover:bg-white/10 ${
                    item.isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}

              {/* Genres Dropdown */}
              {item.hasDropdown && showGenres && (
                <div
                  className="absolute left-0 top-full mt-1 w-64 max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-xl dark:border-white/10 dark:bg-slate-900/95 backdrop-blur-xl"
                  onMouseLeave={() => setShowGenres(false)}
                >
                  <div className="p-2">
                    {genresLoading ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">Đang tải...</div>
                    ) : (
                      genres.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/stories?genre=${encodeURIComponent(genre.name)}`}
                          onClick={() => setShowGenres(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10"
                        >
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                          {genre.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
