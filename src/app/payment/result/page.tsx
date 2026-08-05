"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { toast } from "sonner";

interface PaymentResult {
  amount: number;
  bankCode: string;
  orderInfo: string;
  payDate: string;
  responseCode: string;
  transactionNo: string;
  txnRef: string;
  isSuccess: boolean;
}

function decodeVietnamese(str: string) {
  try {
    return decodeURIComponent(str);
  } catch {
    try {
      return decodeURI(str);
    } catch {
      return str.replace(/\+/g, " ");
    }
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount / 100) + "đ";
}

function formatDate(dateStr: string) {
  if (!dateStr || dateStr.length !== 14) return dateStr;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10);
  const minute = dateStr.slice(10, 12);
  const second = dateStr.slice(12, 14);
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

function getResponseMessage(code: string) {
  const messages: Record<string, string> = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan đến lừa đảo, gian lận)",
    "09": "Thẻ không tồn tại",
    "10": "Thẻ chưa đăng ký dịch vụ Internet Banking",
    "11": "Đã hết hạn chọn thanh toán",
    "12": "Thẻ bị khóa",
    "13": "Nhập sai mật khẩu OTP quá 3 lần",
    "24": "Khách hàng hủy giao dịch",
    "51": "Tài khoản không đủ số dư",
    "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
    "81": "Nhập sai mật khẩu OTP quá 3 lần",
    "99": "Các lỗi khác",
  };
  return messages[code] || `Lỗi không xác định (mã: ${code})`;
}

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const amount = searchParams.get("vnp_Amount");
    const responseCode = searchParams.get("vnp_ResponseCode");
    const transactionStatus = searchParams.get("vnp_TransactionStatus");

    if (responseCode === "00" && transactionStatus === "00") {
      toast.success("Thanh toán thành công!");
    } else if (responseCode) {
      toast.error(getResponseMessage(responseCode));
    }

    setResult({
      amount: amount ? parseInt(amount) : 0,
      bankCode: searchParams.get("vnp_BankCode") || "",
      orderInfo: searchParams.get("vnp_OrderInfo") || "",
      payDate: searchParams.get("vnp_PayDate") || "",
      responseCode: responseCode || "",
      transactionNo: searchParams.get("vnp_TransactionNo") || "",
      txnRef: searchParams.get("vnp_TxnRef") || "",
      isSuccess: responseCode === "00" && transactionStatus === "00",
    });
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-muted" />
            <div className="h-8 bg-muted rounded w-2/3 mx-auto" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-lg px-6 py-12">
        {result?.isSuccess ? (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 shadow-lg shadow-emerald-500/20">
              <svg className="h-10 w-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="mt-6 text-3xl font-bold text-emerald-500">Thanh toán thành công!</h1>

            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-lg text-foreground dark:text-white font-medium">Cảm ơn bạn đã nâng cấp Premium</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bạn đã trở thành Premium member. Hãy tận hưởng những truyện độc quyền!
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6 text-left">
              <h3 className="font-semibold text-foreground dark:text-white mb-4">Chi tiết giao dịch</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-muted-foreground">Mã giao dịch</span>
                <span className="font-mono text-foreground dark:text-white">{result.txnRef}</span>

                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-semibold text-emerald-500">{formatAmount(result.amount)}</span>

                <span className="text-muted-foreground">Ngân hàng</span>
                <span className="text-foreground dark:text-white">{result.bankCode}</span>

                <span className="text-muted-foreground">Mã GD NH</span>
                <span className="font-mono text-foreground dark:text-white">{result.transactionNo}</span>

                <span className="text-muted-foreground">Ngày thanh toán</span>
                <span className="text-foreground dark:text-white">{formatDate(result.payDate)}</span>

                <span className="text-muted-foreground">Nội dung</span>
                <span className="text-foreground dark:text-white">{decodeVietnamese(result.orderInfo)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/stories"
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-center font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-teal-600"
              >
                Khám phá truyện ngay
              </Link>
              <Link
                href="/profile"
                className="w-full rounded-xl border border-border bg-card py-3.5 text-center font-medium text-foreground dark:text-white transition hover:bg-muted"
              >
                Xem thông tin tài khoản
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 shadow-lg shadow-red-500/20">
              <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="mt-6 text-3xl font-bold text-red-500">Thanh toán thất bại</h1>

            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <p className="text-lg text-foreground dark:text-white font-medium">
                {getResponseMessage(result?.responseCode || "")}
              </p>
              {result?.responseCode && (
                <p className="mt-2 text-sm text-muted-foreground">Mã lỗi: {result.responseCode}</p>
              )}
            </div>

            {result && (
              <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6 text-left">
                <h3 className="font-semibold text-foreground dark:text-white mb-4">Thông tin giao dịch</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <span className="text-muted-foreground">Mã giao dịch</span>
                  <span className="font-mono text-foreground dark:text-white">{result.txnRef}</span>

                  <span className="text-muted-foreground">Số tiền</span>
                  <span className="font-semibold text-foreground dark:text-white">{formatAmount(result.amount)}</span>

                  <span className="text-muted-foreground">Ngân hàng</span>
                  <span className="text-foreground dark:text-white">{result.bankCode}</span>

                  <span className="text-muted-foreground">Nội dung</span>
                  <span className="text-foreground dark:text-white">{decodeVietnamese(result.orderInfo)}</span>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/premium"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3.5 text-center font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-600"
              >
                Thử lại
              </Link>
              <Link
                href="/"
                className="w-full rounded-xl border border-border bg-card py-3.5 text-center font-medium text-foreground dark:text-white transition hover:bg-muted"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
