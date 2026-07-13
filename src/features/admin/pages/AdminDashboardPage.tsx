"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { getAdminDashboard } from "@/lib/api/admin";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{ totalUsers?: number; totalStories?: number; totalPendingRequests?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminDashboard();
        setStats(data);
      } catch {
        setError("Không tải được dữ liệu dashboard.");
      }
    };
    load();
  }, []);

  const cards = [
    { title: "Người dùng", value: stats?.totalUsers ?? 0 },
    { title: "Truyện", value: stats?.totalStories ?? 0 },
    { title: "Yêu cầu xuất bản", value: stats?.totalPendingRequests ?? 0 },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng quan hoạt động của hệ thống.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {cards.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{item.title}</p>
            <p className="mt-2 text-3xl font-bold">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
