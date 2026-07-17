import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "@/providers/AppProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Truyện Online",
  description: "Web đọc truyện online đỉnh cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
