"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/uploader/stories", label: "Truyện của tôi" },
  { href: "/uploader/stories/new", label: "Tạo truyện mới" },
];

export function UploaderLayout({ children, maxWidth = "default" }: { children: React.ReactNode; maxWidth?: "default" | "wide" }) {
  const pathname = usePathname();
  const isUploaderHome = pathname === "/uploader/stories" || pathname.startsWith("/uploader/stories/");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/uploader/stories" className="text-xl font-bold">
              Truyện<span className="text-indigo-600">Online</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 transition ${
                    pathname.startsWith(item.href)
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border px-1 py-1">
            <Link
              href="/"
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                !isUploaderHome
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đọc truyện
            </Link>
            <Link
              href="/uploader/stories"
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isUploaderHome
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Uploader
            </Link>
          </div>
        </div>
      </header>
      <main className={`mx-auto ${maxWidth === "wide" ? "max-w-screen-2xl" : "max-w-6xl"} px-6 py-8`}>{children}</main>
    </div>
  );
}
