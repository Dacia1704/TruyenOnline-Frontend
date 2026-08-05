"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/features/landing/components/Navbar";

export function UploaderLayout({
  children,
  maxWidth = "default",
}: {
  children: React.ReactNode;
  maxWidth?: "default" | "wide";
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar uploaderView="uploader" onToggleUploader={() => router.push("/")} />

      <main className={`flex-1 pt-20 py-10 px-6`}>{children}</main>
    </div>
  );
}
