"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearTokens, getUserInfo } from "@/lib/api/client";
import { LoginResponse } from "@/lib/types/auth";
import { getMySubscription, SubscriptionResponse } from "@/lib/api/subscription";
import { logout } from "@/lib/api/auth";

interface NavbarProps {
  uploaderView: "reader" | "uploader";
  onToggleUploader: () => void;
}

export function Navbar({ uploaderView, onToggleUploader }: NavbarProps) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const info = getUserInfo();
    if (info) {
      setUser(info as LoginResponse);
      getMySubscription()
        .then(setSubscription)
        .catch(() => setSubscription(null));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = useMemo(() => {
    if (!user?.username) return "?";
    const parts = user.username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  }, [user?.username]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch {
      // Ignore API errors
    } finally {
      clearTokens();
      setUser(null);
      setOpen(false);
      window.location.href = "/login";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/80 backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link href={uploaderView === "uploader" ? "/uploader" : "/"} className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
            Truyen
          </span>
          <span className="text-foreground dark:text-white">Online</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Admin/Uploader View Toggle */}
          {(user?.roles?.includes("ADMIN") || user?.roles?.includes("UPLOADER")) && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-muted dark:bg-white/10 px-1.5 py-1.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  if (uploaderView !== "reader") onToggleUploader();
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  uploaderView === "reader"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white"
                }`}
              >
                Đọc truyện
              </button>
              {user?.roles?.includes("UPLOADER") && (
                <button
                  type="button"
                  onClick={() => {
                    if (uploaderView !== "uploader") onToggleUploader();
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    uploaderView === "uploader"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white"
                  }`}
                >
                  Uploader
                </button>
              )}
              {user?.roles?.includes("ADMIN") && (
                <button
                  type="button"
                  onClick={() => router.push("/admin")}
                  className="rounded-full px-4 py-1.5 text-xs font-medium transition text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white"
                >
                  Admin
                </button>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white transition backdrop-blur-sm"
            aria-label="Toggle theme"
          >
            {mounted &&
              (theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ))}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full bg-muted dark:bg-white/10 px-1.5 py-1.5 pl-1.5 transition hover:bg-muted/80 dark:hover:bg-white/20 backdrop-blur-sm"
              >
                <div className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={initials}
                      className="h-9 w-9 rounded-full object-cover shadow-lg shadow-indigo-500/30"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
                      {initials}
                    </div>
                  )}
                  {subscription?.status === "ACTIVE" && (
                    <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[8px] shadow-md shadow-amber-500/40">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                      </svg>
                    </span>
                  )}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate text-sm font-medium text-foreground dark:text-white">
                  {user.username}
                </span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card dark:border-white/10 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl dark:shadow-black/30">
                  <div className="border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/50 dark:to-purple-900/50 px-5 py-5 dark:border-white/10">
                    <p className="text-sm font-semibold text-foreground dark:text-white">{user.username}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="py-2 px-1">
                    {user.roles?.includes("ADMIN") && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Trang quản trị
                      </Link>
                    )}
                    {subscription?.status === "ACTIVE" ? (
                      <Link
                        href="/premium"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-500/20 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Gia hạn Premium
                      </Link>
                    ) : (
                      <Link
                        href="/premium"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-500/20 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        Nâng cấp Premium
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Thông tin chung
                    </Link>
                    {user?.roles?.includes("UPLOADER") && (
                      <>
                        <Link
                          href="/uploader/stories/publish-requests"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Các yêu cầu xuất bản
                        </Link>
                        <Link
                          href="/uploader/stories/ban-appeals"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                            />
                          </svg>
                          Các khiếu nại
                        </Link>
                      </>
                    )}
                    <div className="my-2 mx-2 border-t border-border dark:border-white/10" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 hover:scale-105"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
