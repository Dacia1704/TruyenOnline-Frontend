"use client";

import { PageLayout } from "@/components/PageLayout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSubscriptionPlan, createPayment, SubscriptionPlan } from "@/lib/api/subscription";
import { getUserInfo } from "@/lib/api/client";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const user = getUserInfo();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubscriptionPlan(code);
        setPlan(data);
      } catch {
        setError("Không tải được thông tin gói Premium.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  const handlePayment = async () => {
    if (!user) {
      const confirmed = window.confirm("Bạn cần đăng nhập để mua Premium. Đăng nhập ngay?");
      if (confirmed) {
        router.push(`/login?redirect=${encodeURIComponent(`/premium/${code}`)}`);
      }
      return;
    }

    setProcessing(true);
    try {
      const result = await createPayment(code, `Mua ${plan?.name}`);
      window.location.href = result.paymentUrl;
    } catch {
      toast.error("Không thể tạo thanh toán. Vui lòng thử lại.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-12 bg-muted rounded-xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !plan) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-2xl px-6 py-12 text-center">
          <p className="text-muted-foreground">{error ?? "Gói không tồn tại."}</p>
          <button
            onClick={() => router.push("/premium")}
            className="mt-4 text-indigo-400 hover:underline"
          >
            Quay lại danh sách gói
          </button>
        </div>
      </PageLayout>
    );
  }

  const months = Math.round(plan.durationDays / 30);
  const pricePerMonth = Math.round(plan.price / plan.durationDays * 30);

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <button
          onClick={() => router.push("/premium")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách gói
        </button>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-8 text-center border-b border-border">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-semibold text-white mb-4 shadow-lg shadow-amber-500/25">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Premium
            </div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">{plan.name}</h1>
            <p className="mt-2 text-muted-foreground">{plan.description}</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-foreground dark:text-white">
                {formatPrice(plan.price)}
              </div>
              <p className="mt-2 text-muted-foreground">
                {months} tháng · ~{formatPrice(pricePerMonth)}/tháng
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-foreground dark:text-white">Bao gồm:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-muted-foreground">Truy cập tất cả chương premium</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-muted-foreground">Đọc không quảng cáo</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-muted-foreground">Tốc độ tải nhanh</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-muted-foreground">Hỗ trợ ưu tiên</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-lg font-semibold text-white transition hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 disabled:opacity-50"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang chuyển sang VNPay...
                </span>
              ) : (
                `Thanh toán ${formatPrice(plan.price)}`
              )}
            </button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Thanh toán được xử lý bảo mật qua VNPay
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
