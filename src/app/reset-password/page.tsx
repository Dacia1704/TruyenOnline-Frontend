"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/features/auth";
import { resetPassword } from "@/lib/api/auth";
import { clearTokens } from "@/lib/api/client";
import { toast } from "sonner";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({ token, newPassword });
      if (result.code === 200) {
        setDone(true);
        clearTokens();
        toast.success("Đổi mật khẩu thành công");
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Liên kết không hợp lệ
        </h3>
        <p className="text-sm text-muted-foreground">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  if (done) {
    return (
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
            Đổi mật khẩu thành công!
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Mật khẩu của bạn đã được đặt lại. Bây giờ bạn có thể đăng nhập
            với mật khẩu mới.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium mb-1.5"
        >
          Mật khẩu mới
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={8}
          maxLength={100}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Ít nhất 8 ký tự"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium mb-1.5"
        >
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới cho tài khoản của bạn"
    >
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-10 rounded-lg bg-muted"/><div className="h-10 rounded-lg bg-muted"/><div className="h-10 rounded-lg bg-muted"/></div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
