import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border dark:border-white/10 bg-background dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 py-10 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-foreground dark:text-white/80">
            © 2026{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
              TruyenOnline
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground dark:text-white/50">Đọc truyện mọi lúc, mọi nơi.</p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link
            href="/stories"
            className="text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white transition"
          >
            Kho truyện
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white transition"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </footer>
  );
}
