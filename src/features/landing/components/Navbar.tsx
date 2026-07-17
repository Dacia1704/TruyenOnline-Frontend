"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clearTokens, getUserInfo } from "@/lib/api/client";
import { LoginResponse } from "@/lib/types/auth";

interface NavbarProps {
  uploaderView: "reader" | "uploader";
  onToggleUploader: () => void;
}

export function Navbar({ uploaderView, onToggleUploader }: NavbarProps) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const info = getUserInfo();
    if (info) {
      setUser(info as LoginResponse);
    }
  }, []);

  const initials = useMemo(() => {
    if (!user?.username) return "?";
    const parts = user.username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  }, [user?.username]);

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setOpen(false);
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Truyện<span className="text-indigo-600">Online</span>
        </Link>
        <div className="flex items-center gap-3">
          {user?.roles?.includes("UPLOADER") && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border px-1 py-1">
              <button
                type="button"
                onClick={() => {
                  if (uploaderView !== "reader") onToggleUploader();
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  uploaderView === "reader"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Đọc truyện
              </button>
              <button
                type="button"
                onClick={() => {
                  if (uploaderView !== "uploader") onToggleUploader();
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  uploaderView === "uploader"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Uploader
              </button>
            </div>
          )}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border px-1 py-1 pl-1 transition hover:border-indigo-500/70"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden sm:block max-w-[140px] truncate text-sm font-medium">{user.username}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                  <div className="border-b border-border px-8 py-3">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {user.roles?.includes("ADMIN") && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-muted"
                      >
                        Trang quản trị
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-muted"
                    >
                      Thông tin chung
                    </Link>
                    {user?.roles?.includes("UPLOADER") && (
                      <Link
                        href="/uploader/stories/publish-requests"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-muted"
                      >
                        Các yêu cầu xuất bản truyện
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
