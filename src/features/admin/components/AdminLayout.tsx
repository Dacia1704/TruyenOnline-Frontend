"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Quản lý user" },
  { href: "/admin/genres", label: "Quản lý thể loại" },
  { href: "/admin/stories/pending", label: "Duyệt truyện" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Truyện<span className="text-indigo-600">Online</span>
            </Link>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Về trang chính
          </Link>
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
