"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/users", label: "Quản lý user" },
  { href: "/admin/genres", label: "Quản lý thể loại" },
  { href: "/admin/stories", label: "Quản lý story", exact: true },
  { href: "/admin/stories/pending", label: "Quản lý yêu cầu duyệt" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href + "/") || pathname === href;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Truyện<span className="text-indigo-600">Online</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 transition ${
                    isActive(item.href, item.exact)
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
                pathname !== "/admin" && !pathname.startsWith("/admin/")
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đọc truyện
            </Link>
            <Link
              href="/admin/users"
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                pathname === "/admin" || pathname.startsWith("/admin/")
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl grid grid-cols-[220px_1fr]">
        <aside className="hidden md:block border-r border-border px-4 py-6">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive(item.href, item.exact)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
