import { apiClient } from "./client";

export interface PageResponse<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  data: T[];
}

export interface SubscriptionPlan {
  code: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
}

export interface SubscriptionResponse {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startedAt: string;
  expiresAt: string;
  plan: SubscriptionPlan;
}

export interface CreatePaymentResponse {
  txnRef: string;
  paymentUrl: string;
  amount: number;
  plan: SubscriptionPlan;
}

export interface PaymentCallbackResult {
  txnRef: string;
  success: boolean;
  responseCode: string;
  validSignature: boolean;
  message: string;
}

export interface TransactionUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
}

export interface Transaction {
  id: string;
  vnpTxnRef: string;
  subscriptionPlan: SubscriptionPlan;
  user: TransactionUser;
  amountVnd: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  vnpBankCode: string;
  vnpTransactionNo: string;
  createdAt: string;
  completedAt: string | null;
}

export async function getSubscriptionPlans() {
  const { data } = await apiClient.get<{ code: number; data: SubscriptionPlan[] }>("/subscription-plan");
  return data.data;
}

export async function getSubscriptionPlan(code: string) {
  const { data } = await apiClient.get<{ code: number; data: SubscriptionPlan }>(`/subscription-plan/${code}`);
  return data.data;
}

export async function createPayment(planId: string, orderInfo?: string) {
  const { data } = await apiClient.post<{ code: number; data: CreatePaymentResponse }>("/payment/create", {
    planId,
    orderInfo: orderInfo ?? `Mua goi ${planId}`,
  });
  return data.data;
}

export async function getMyTransactions(): Promise<Transaction[]> {
  const { data } = await apiClient.get<{ code: number; data: Transaction[] }>("/payment/transactions/me");
  return data.data ?? [];
}

export async function getTransactions(
  page: number = 1,
  size: number = 10,
  userId?: string,
): Promise<PageResponse<Transaction>> {
  const params: Record<string, string | number> = { page, size };
  if (userId) params.userId = userId;

  const { data } = await apiClient.get<{ code: number; data: PageResponse<Transaction> }>("/payment/transactions", {
    params,
  });
  return data.data;
}

export async function getMySubscription() {
  const { data } = await apiClient.get<{ code: number; data: SubscriptionResponse | null }>("/subscription/me");
  return data.data;
}

// Admin functions
export async function createSubscriptionPlan(payload: {
  code: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  sortOrder?: number;
}) {
  const { data } = await apiClient.post<{ code: number; data: SubscriptionPlan }>("/subscription-plan", payload);
  return data.data;
}

export async function updateSubscriptionPlan(
  code: string,
  payload: {
    name?: string;
    description?: string;
    price?: number;
    durationDays?: number;
    isActive?: boolean;
    sortOrder?: number;
  },
) {
  const { data } = await apiClient.patch<{ code: number; data: SubscriptionPlan }>(
    `/subscription-plan/${code}`,
    payload,
  );
  return data.data;
}

export async function deleteSubscriptionPlan(code: string) {
  const { data } = await apiClient.delete<{ code: number; message: string }>(`/subscription-plan/${code}`);
  return data;
}
