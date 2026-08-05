"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/features/auth";
import { forgotPassword } from "@/lib/api/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await forgotPassword({ email });
      if (result.code === 200) {
        setSent(true);
        toast.success("Đã gửi email đặt lại mật khẩu");
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận liên kết đặt lại mật khẩu"
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg
              className="h-8 w-8 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Đã gửi email!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vui lòng kiểm tra hộp thư (bao gồm thư rác) và nhấp vào liên kết
              trong email.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Nhớ mật khẩu?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
