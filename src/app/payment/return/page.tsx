"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { toast } from "sonner";

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");

    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      setStatus("success");
      toast.success("Thanh toán thành công! Bạn đã là Premium member.");
    } else {
      setStatus("failed");
      if (vnp_ResponseCode) {
        toast.error("Thanh toán thất bại. Vui lòng thử lại.");
      }
    }
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      {status === "loading" && (
        <div className="animate-pulse">
          <div className="h-16 w-16 mx-auto bg-muted rounded-full" />
          <div className="mt-4 h-6 bg-muted rounded w-1/2 mx-auto" />
          <div className="mt-2 h-4 bg-muted rounded w-3/4 mx-auto" />
        </div>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground dark:text-white">
            Thanh toán thành công!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Cảm ơn bạn đã nâng cấp Premium. Bây giờ bạn có thể tận hưởng tất cả nội dung premium.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => router.push("/stories")}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Khám phá truyện ngay
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="w-full rounded-xl border border-border py-3 font-medium text-foreground transition hover:bg-muted"
            >
              Xem thông tin tài khoản
            </button>
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground dark:text-white">
            Thanh toán thất bại
          </h1>
          <p className="mt-2 text-muted-foreground">
            Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => router.push("/premium")}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Thử lại
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-xl border border-border py-3 font-medium text-foreground transition hover:bg-muted"
            >
              Về trang chủ
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="animate-pulse">
        <div className="h-16 w-16 mx-auto bg-muted rounded-full" />
        <div className="mt-4 h-6 bg-muted rounded w-1/2 mx-auto" />
        <div className="mt-2 h-4 bg-muted rounded w-3/4 mx-auto" />
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <PageLayout>
      <Suspense fallback={<LoadingFallback />}>
        <PaymentReturnContent />
      </Suspense>
    </PageLayout>
  );
}
