import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-950 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          Đọc truyện chữ &amp; manga miễn phí
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Thế giới truyện
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            trong tầm tay bạn
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Khám phá hàng ngàn bộ truyện chữ, light novel và manga. Lưu lịch sử đọc, đánh dấu yêu thích và nâng cấp
          Premium để trải nghiệm không giới hạn.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 hover:shadow-indigo-500/40"
          >
            Đăng kí ngay
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-xl border border-border px-8 py-3.5 text-sm font-semibold transition hover:bg-muted"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </section>
  );
}
