"use client";

import { PageLayout } from "@/components/PageLayout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubscriptionPlans, SubscriptionPlan } from "@/lib/api/subscription";
import { getUserInfo } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const planBenefits: Record<string, string[]> = {
  "1": ["Truy cập tất cả nội dung premium", "Đọc không quảng cáo", "Tốc độ tải nhanh"],
  "3": ["Tất cả lợi ích gói 1 tháng", "Tiết kiệm 10%", "Ưu tiên hỗ trợ"],
  "6": ["Tất cả lợi ích gói 3 tháng", "Tiết kiệm 15%", "Early access nội dung mới"],
  "12": ["Tất cả lợi ích gói 6 tháng", "Tiết kiệm 20%", "VIP support 24/7"],
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

function getBenefits(durationDays: number): string[] {
  const months = Math.round(durationDays / 30);
  return planBenefits[String(months)] ?? planBenefits["1"];
}

export default function PremiumPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const user = getUserInfo();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubscriptionPlans();
        setPlans((data ?? []).filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
      } catch {
        setError("Không tải được danh sách gói Premium.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      const confirmed = window.confirm("Bạn cần đăng nhập để mua Premium. Đăng nhập ngay?");
      if (confirmed) {
        router.push(`/login?redirect=${encodeURIComponent("/premium")}`);
      }
      return;
    }
    router.push(`/premium/${plan.code}`);
  };

  const getBestValue = () => {
    if (plans.length === 0) return null;
    return plans.reduce((best, plan) => {
      const bestPricePerDay = best.price / best.durationDays;
      const planPricePerDay = plan.price / plan.durationDays;
      return planPricePerDay < bestPricePerDay ? plan : best;
    });
  };

  const bestValuePlan = getBestValue();

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Premium
          </div>
          <h1 className="text-4xl font-bold text-foreground dark:text-white">
            Nâng cấp{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Premium
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Truy cập không giới hạn tất cả nội dung premium, đọc không quảng cáo và nhiều ưu đãi hấp dẫn khác.
          </p>
        </div>

        {loading && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-10 bg-muted rounded w-2/3 mb-6" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-12 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isBestValue = bestValuePlan?.code === plan.code;
              const benefits = getBenefits(plan.durationDays);
              const months = Math.round(plan.durationDays / 30);

              return (
                <div
                  key={plan.code}
                  className={`relative rounded-2xl border p-6 transition-all ${
                    isBestValue
                      ? "border-amber-500 bg-gradient-to-b from-amber-500/10 to-orange-500/5 shadow-xl shadow-amber-500/10"
                      : "border-border bg-card hover:border-indigo-500/50 hover:shadow-lg"
                  }`}
                >
                  {isBestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                        Giá trị tốt nhất
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground dark:text-white">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground dark:text-white">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-muted-foreground">/{months} tháng</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      ~{formatPrice(Math.round((plan.price / plan.durationDays) * 30))}/tháng
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <svg
                          className="w-5 h-5 text-emerald-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={processingPlan === plan.code}
                    className={`mt-8 w-full rounded-xl py-3 font-semibold transition-all ${
                      isBestValue
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    } disabled:opacity-50`}
                  >
                    {processingPlan === plan.code ? "Đang xử lý..." : "Chọn gói này"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold text-foreground dark:text-white text-center mb-8">Câu hỏi thường gặp</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-foreground dark:text-white mb-2">Premium là gì?</h3>
              <p className="text-sm text-muted-foreground">
                Premium là gói đăng ký cho phép bạn đọc tất cả các chương premium của bất kỳ truyện nào trên nền tảng.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground dark:text-white mb-2">Tôi có thể hủy không?</h3>
              <p className="text-sm text-muted-foreground">
                Bạn có thể hủy bất kỳ lúc nào. Gói Premium sẽ vẫn có hiệu lực đến hết ngày hết hạn.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground dark:text-white mb-2">Thanh toán an toàn không?</h3>
              <p className="text-sm text-muted-foreground">
                Chúng tôi sử dụng VNPay để xử lý thanh toán. Thông tin thẻ của bạn được bảo mật hoàn toàn.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground dark:text-white mb-2">Có hoàn tiền không?</h3>
              <p className="text-sm text-muted-foreground">
                Hiện tại chúng tôi không hỗ trợ hoàn tiền cho các gói đã mua. Hãy cân nhắc kỹ trước khi mua.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
