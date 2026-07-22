"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/uploader/stories", label: "Truyện của tôi" },
  { href: "/uploader/stories/new", label: "Tạo truyện mới" },
];

export function UploaderLayout({ children, maxWidth = "default" }: { children: React.ReactNode; maxWidth?: "default" | "wide" }) {
  const pathname = usePathname();
  const isUploaderHome = pathname === "/uploader/stories" || pathname.startsWith("/uploader/stories/");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Truyen
              </span>
              <span className="text-white">Online</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 transition ${
                    pathname.startsWith(item.href)
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              {mounted && (
                theme === "dark" ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )
              )}
            </button>
            <Link
              href="/"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              Đọc truyện
            </Link>
          </div>
        </div>
      </header>
      <main className={`mx-auto ${maxWidth === "wide" ? "max-w-screen-2xl" : "max-w-6xl"} px-6 py-8`}>{children}</main>
    </div>
  );
}
