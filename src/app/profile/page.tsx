"use client";

import { PageLayout } from "@/components/PageLayout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserInfo } from "@/lib/api/client";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    username: string;
    email: string;
    avatarUrl: string | null;
    roles: string[];
    permissions: string[];
  } | null>(null);

  useEffect(() => {
    const info = getUserInfo();
    if (info) {
      setUser({
        username: info.username,
        email: info.email,
        avatarUrl: info.avatarUrl,
        roles: info.roles,
        permissions: info.permissions,
      });
    }
  }, []);

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-foreground">Thông tin chung</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thông tin tài khoản được lấy từ thông tin đăng nhập hiện tại.
          </p>

          {!user ? (
            <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-semibold text-white">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    user.username.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4 bg-background">
                  <p className="text-xs font-medium text-muted-foreground">Vai trò</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {user.roles.length ? user.roles.join(", ") : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <p className="text-xs font-medium text-muted-foreground">Quyền</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {user.permissions.length ? user.permissions.join(", ") : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
