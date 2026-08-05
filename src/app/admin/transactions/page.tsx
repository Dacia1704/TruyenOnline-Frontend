"use client";

import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { useEffect, useState, useCallback } from "react";
import { getTransactions, Transaction } from "@/lib/api/subscription";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    SUCCESS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    REFUNDED: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  };
  const labels = {
    PENDING: "Đang chờ",
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const loadData = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.data ?? []);
    } catch {
      toast.error("Không tải được danh sách giao dịch.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransactions = transactions.filter((t) => statusFilter === "ALL" || t.status === statusFilter);

  return (
    <AdminLayout>
      <div className="dark:bg-gray-950 dark:min-h-screen p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý giao dịch</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/60">Xem danh sách giao dịch thanh toán</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Đang chờ</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white/80 transition hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Tải lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center text-gray-500 dark:text-white/60">
            Đang tải...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center text-gray-500 dark:text-white/60">
            Không có giao dịch nào.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Mã giao dịch
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Người dùng
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Gói Premium
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Số tiền
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Ngân hàng
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Tạo lúc
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">
                      Hoàn tất lúc
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-xs text-gray-900 dark:text-white/80">{tx.vnpTxnRef}</div>
                        <div className="mt-0.5 text-xs text-gray-400 dark:text-white/40">{tx.id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900 dark:text-white">{tx.user?.username}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900 dark:text-white">{tx.subscriptionPlan?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-white/60">{tx.subscriptionPlan?.code}</div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-900 dark:text-white font-medium">
                        {formatPrice(tx.amountVnd / 100)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 dark:text-white/80 text-sm">{tx.vnpBankCode || "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-white/70 text-sm whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-white/70 text-sm whitespace-nowrap">
                        {formatDate(tx.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-gray-500 dark:text-white/60">
              Hiển thị {filteredTransactions.length} / {transactions.length} giao dịch
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
