"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { MyStoryList } from "./components/MyStoryList";
import { Navbar } from "./components/Navbar";
import { FeaturedCarousel } from "./components/MostViewedCarousel";
import { NewestStories } from "./components/NewestStories";

export function LandingPage() {
  const pathname = usePathname();
  // eslint-disable-next-line
  const [view, setView] = useState<"reader" | "uploader">(pathname === "/uploader" ? "uploader" : "reader");
  const router = useRouter();

  const handleToggleUploader = () => {
    if (view === "reader") {
      router.push("/uploader");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar uploaderView={view} onToggleUploader={handleToggleUploader} />
      {view === "reader" ? (
        <main className="flex-1 pt-16">
          <Hero />
          <FeaturedCarousel />
          <NewestStories />
        </main>
      ) : (
        <main className="flex-1 pt-20 py-10 px-6">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-2xl border border-border bg-card p-6 dark:border-white/10">
              <h1 className="text-2xl font-bold text-foreground">Trung tâm Uploader</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Tạo truyện mới, thêm chương và quản lý nội dung của bạn. Giao diện này chỉ dành cho tài khoản có quyền
                upload.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <Link
                  href="/uploader/stories/new"
                  className="rounded-2xl border border-border bg-background p-5 transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-white/10"
                >
                  <p className="text-sm font-semibold text-foreground">Tạo truyện mới</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Điền tiêu đề, mô tả và loại truyện trước khi thêm chương.
                  </p>
                </Link>
                <Link
                  href="/uploader/stories"
                  className="rounded-2xl border border-border bg-background p-5 transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-white/10"
                >
                  <p className="text-sm font-semibold text-foreground">Truyện của tôi</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Xem danh sách, chỉnh sửa truyện và mở trang quản lý chương.
                  </p>
                </Link>
              </div>

              <div className="mt-3 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground dark:border-white/10">
                Mẹo nhanh: sau khi tạo truyện, nhấn vào truyện trong danh sách để quản lý chương.
              </div>

              <MyStoryList />
            </div>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
}
