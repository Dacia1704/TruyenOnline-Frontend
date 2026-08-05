"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUserInfo, clearTokens } from "@/lib/api/client";
import { LoginResponse } from "@/lib/types/auth";
import { getMySubscription, SubscriptionResponse } from "@/lib/api/subscription";
import { logout } from "@/lib/api/auth";

const navItems = [
  { href: "/admin/users", label: "Quản lý user" },
  { href: "/admin/authors", label: "Quản lý tác giả" },
  { href: "/admin/genres", label: "Quản lý thể loại" },
  { href: "/admin/stories", label: "Quản lý story", exact: true },
  { href: "/admin/stories/pending", label: "Quản lý yêu cầu duyệt" },
  { href: "/admin/banners", label: "Quản lý banner" },
  { href: "/admin/moderation", label: "Quản lý kiểm duyệt" },
  { href: "/admin/subscription-plans", label: "Quản lý gói Premium" },
  { href: "/admin/transactions", label: "Quản lý giao dịch" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      router.push("/login");
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href + "/") || pathname === href;
  };

  const Sidebar = () => (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setDrawerOpen(false)}
          className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            isActive(item.href, item.exact)
              ? "bg-indigo-500/20 text-indigo-400 dark:text-indigo-400"
              : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header - same style as Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/80 backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Truyen
              </span>
              <span className="text-foreground dark:text-white">Online</span>
            </Link>

            {/* Admin view toggle */}
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-muted dark:bg-white/10 px-1.5 py-1.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-full px-4 py-1.5 text-xs font-medium transition text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white"
              >
                Đọc truyện
              </button>
              {user?.roles?.includes("UPLOADER") && (
                <button
                  type="button"
                  onClick={() => router.push("/uploader/stories")}
                  className="rounded-full px-4 py-1.5 text-xs font-medium transition text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white"
                >
                  Uploader
                </button>
              )}
              <button
                type="button"
                onClick={() => {}}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 text-xs font-medium text-white shadow-md"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            {/* User Dropdown */}
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
                      <Link
                        href="/"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Trang chủ
                      </Link>
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
                        Hồ sơ cá nhân
                      </Link>
                      {user?.roles?.includes("UPLOADER") && (
                        <Link
                          href="/uploader/stories"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Quản lý truyện
                        </Link>
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
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 hover:scale-105"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Menu</span>
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 hover:bg-muted">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main content area with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] pt-16">
        <aside className="hidden lg:block border-r border-border dark:border-white/10 px-4 py-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar />
        </aside>
        <main className="overflow-x-auto px-4 lg:px-6 py-8 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
