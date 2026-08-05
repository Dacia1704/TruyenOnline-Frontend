"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getErrorMessage, useLogin } from "../hooks/useAuth";
import { loginWithGoogle } from "@/lib/api/auth";
import { setAccessToken, setRefreshToken, setUserInfo } from "@/lib/api/client";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const loginMutation = useLogin();
  const router = useRouter();

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const existingScript = document.getElementById("google-identity-services");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const result = await loginWithGoogle({ idToken: response.credential });
      if (result.code === 200) {
        const { accessToken, refreshToken, ...userData } = result.data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserInfo(result.data);
        router.push("/");
        router.refresh();
      }
    } catch {
      setGoogleError("Đăng nhập Google thất bại. Vui lòng thử lại.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const timeoutId = setTimeout(() => {
      const button = document.getElementById("google-signin-button");
      if (button && !button.innerHTML) {
        // @ts-expect-error google is loaded from script
        if (window.google?.accounts?.id) {
          // @ts-expect-error google is loaded from script
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
          });
          // @ts-expect-error google is loaded from script
          window.google.accounts.id.renderButton(button, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: 400,
          });
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const errorMessage =
    loginMutation.isError || googleError
      ? googleError || getErrorMessage(loginMutation.error)
      : null;

  return (
    <div className="space-y-6">
      {GOOGLE_CLIENT_ID && (
        <div className="space-y-3">
          <div
            id="google-signin-button"
            className="flex justify-center"
            style={{ minHeight: "44px" }}
          />
          {googleLoading && (
            <p className="text-center text-sm text-muted-foreground">
              Đang đăng nhập Google...
            </p>
          )}
        </div>
      )}

      {GOOGLE_CLIENT_ID && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Hoặc
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending || googleLoading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
}
