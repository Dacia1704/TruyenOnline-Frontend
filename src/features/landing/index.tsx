"use client";

import { useState } from "react";
import Link from "next/link";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { MyStoryList } from "./components/MyStoryList";
import { Navbar } from "./components/Navbar";
import { StoryList } from "./components/StoryList";

export function LandingPage() {
  const [view, setView] = useState<"reader" | "uploader">("reader");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar uploaderView={view} onToggleUploader={() => setView((v) => (v === "reader" ? "uploader" : "reader"))} />
      {view === "reader" ? (
        <main className="flex-1">
          <Hero />
          <div className="pt-0">
            <StoryList />
          </div>
        </main>
      ) : (
        <main className="flex-1 pt-20 py-10 px-6">
          <div className="mx-auto max-w-5xl">
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

              <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground dark:border-white/10">
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
