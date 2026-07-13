import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">© 2026 TruyệnOnline. Đọc truyện mọi lúc, mọi nơi.</p>
        <div className="flex gap-6 text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition">
            Đăng nhập
          </Link>
          <Link href="/register" className="text-muted-foreground hover:text-foreground transition">
            Đăng ký
          </Link>
        </div>
      </div>
    </footer>
  );
}
