"use client";

export const dynamic = "force-dynamic";

import { PageLayout } from "@/components/PageLayout";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { getUserInfo, setUserInfo, clearTokens, setAccessToken, setRefreshToken, apiClient } from "@/lib/api/client";
import { upgradeToUploader } from "@/lib/api/user";
import { logoutAllDevices } from "@/lib/api/auth";
import { getMyReadingHistories } from "@/lib/api/stories";
import { ReadingHistory } from "@/lib/types/stories";
import { getMySubscription, getMyTransactions, SubscriptionResponse, Transaction } from "@/lib/api/subscription";
import { getMySocialAccounts, linkGoogleAccount, unlinkGoogleAccount, SocialAccount } from "@/lib/api/auth";
import { toast } from "sonner";

type ActiveTab = "info" | "premium" | "uploader" | "history" | "transactions" | "linked-accounts";

interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getUserInfo>>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [loading, setLoading] = useState(true);

  // Info tab state
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // History tab state
  const [histories, setHistories] = useState<ReadingHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // Transactions tab state
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Uploader upgrade state
  const [upgrading, setUpgrading] = useState(false);

  // Logout all state
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  // Linked accounts state
  const [linkedAccounts, setLinkedAccounts] = useState<SocialAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [unlinkingGoogle, setUnlinkingGoogle] = useState(false);

  useEffect(() => {
    const info = getUserInfo();
    setCurrentUser(info);
    if (info) {
      setUser({
        username: info.username,
        email: info.email,
        avatarUrl: info.avatarUrl,
      });
      setEditUsername(info.username);
      setEditEmail(info.email);
      if (info.avatarUrl) {
        setAvatarPreview(info.avatarUrl);
      }
    }

    getMySubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  const loadHistories = useCallback(async (page: number) => {
    setHistoryLoading(true);
    try {
      const data = await getMyReadingHistories({ page, size: 20 });
      setHistories(data.data);
      setHistoryTotalPages(data.totalPages);
      setHistoryPage(data.currentPage);
    } catch {
      toast.error("Không tải được lịch sử đọc truyện.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistories(1);
    }
  }, [activeTab, loadHistories]);

  useEffect(() => {
    if (activeTab === "transactions") {
      setTransactionsLoading(true);
      getMyTransactions()
        .then(setMyTransactions)
        .catch(() => toast.error("Không tải được lịch sử giao dịch."))
        .finally(() => setTransactionsLoading(false));
    }
  }, [activeTab]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editUsername.trim()) {
      toast.error("Username không được để trống");
      return;
    }
    if (editUsername.length < 4 || editUsername.length > 50) {
      toast.error("Username phải từ 4-50 ký tự");
      return;
    }

    setUpdating(true);
    try {
      const hasChanges = editUsername !== user?.username || editEmail !== user?.email || avatarFile !== null;

      if (!hasChanges) {
        setIsEditing(false);
        return;
      }

      const formData = new FormData();
      formData.append("username", editUsername);
      if (editEmail !== user?.email) {
        formData.append("email", editEmail);
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const { data } = await apiClient.patch("/api/users/me", formData, {
        headers: { "Content-Type": undefined },
      });

      if (data.code === 200) {
        setUser({
          username: data.data.username,
          email: data.data.email,
          avatarUrl: data.data.avatarUrl,
        });
        setAvatarFile(null);
        setAvatarPreview(data.data.avatarUrl);
        setIsEditing(false);
        // Update stored user info
        const stored = getUserInfo();
        if (stored) {
          setUserInfo({
            ...stored,
            username: data.data.username,
            email: data.data.email,
            avatarUrl: data.data.avatarUrl,
          });
        }
        toast.success("Cập nhật thông tin thành công");
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setUpdating(false);
    }
  };

  const handleUpgradeToUploader = async () => {
    setUpgrading(true);
    try {
      const result = await upgradeToUploader();
      if (result.code === 200) {
        setAccessToken(result.data.accessToken);
        setRefreshToken(result.data.refreshToken);
        setUserInfo(result.data);
        toast.success("Nâng cấp thành Uploader thành công!");
        window.location.reload();
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setUpgrading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm("Bạn có chắc muốn đăng xuất khỏi tất cả thiết bị?")) return;
    setLoggingOutAll(true);
    try {
      await logoutAllDevices();
      clearTokens();
      toast.success("Đã đăng xuất khỏi tất cả thiết bị");
      window.location.href = "/login";
    } catch {
      // Error handled by interceptor
    } finally {
      setLoggingOutAll(false);
    }
  };

  const loadLinkedAccounts = async () => {
    setAccountsLoading(true);
    try {
      const accounts = await getMySocialAccounts();
      setLinkedAccounts(accounts);
    } catch {
      toast.error("Không tải được danh sách tài khoản liên kết");
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      const { triggerGoogleLogin } = await import("@/lib/google-login");
      const googleToken = await triggerGoogleLogin();
      if (googleToken) {
        setLinkingGoogle(true);
        try {
          await linkGoogleAccount(googleToken);
          toast.success("Liên kết Google thành công");
          loadLinkedAccounts();
        } catch {
          toast.error("Không thể liên kết Google");
        } finally {
          setLinkingGoogle(false);
        }
      }
    } catch {
      toast.error("Không thể đăng nhập Google");
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm("Bạn có chắc muốn hủy liên kết Google?")) return;
    setUnlinkingGoogle(true);
    try {
      await unlinkGoogleAccount();
      toast.success("Đã hủy liên kết Google");
      loadLinkedAccounts();
    } catch {
      toast.error("Không thể hủy liên kết Google");
    } finally {
      setUnlinkingGoogle(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const isUploader = currentUser?.roles?.includes("UPLOADER");

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Hồ sơ cá nhân</h1>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-56 shrink-0">
            <div className="rounded-2xl border border-border bg-card p-2 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === "info"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Thông tin
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("premium")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === "premium"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Premium
                {subscription?.status === "ACTIVE" && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />}
              </button>
              {!isUploader && (
                <button
                  type="button"
                  onClick={() => setActiveTab("uploader")}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeTab === "uploader"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Nâng cấp Uploader
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === "history"
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Lịch sử đọc
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === "transactions"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Lịch sử giao dịch
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("linked-accounts");
                  loadLinkedAccounts();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === "linked-accounts"
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Tài khoản liên kết
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="rounded-2xl border border-border bg-card p-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-48 animate-pulse rounded-xl bg-muted" />
                </div>
              ) : activeTab === "info" ? (
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Thông tin tài khoản</h2>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                      >
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setAvatarFile(null);
                            if (user) {
                              setEditUsername(user.username);
                              setEditEmail(user.email);
                              setAvatarPreview(user.avatarUrl);
                            }
                          }}
                          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateProfile}
                          disabled={updating}
                          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
                        >
                          {updating ? "Đang lưu..." : "Lưu"}
                        </button>
                      </div>
                    )}
                  </div>

                  {!user ? (
                    <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              editUsername.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          {isEditing && (
                            <>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(currentUser?.roles ?? []).map((role) => (
                              <span
                                key={role}
                                className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                          {isEditing && (
                            <p className="mt-1 text-xs text-muted-foreground">Nhấn vào icon máy ảnh để đổi avatar</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground">Username</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              minLength={4}
                              maxLength={50}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-indigo-500 focus:outline-none"
                            />
                          ) : (
                            <p className="mt-1 text-foreground">{user.username}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground">Email</label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-indigo-500 focus:outline-none"
                            />
                          ) : (
                            <p className="mt-1 text-foreground">{user.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Danger zone */}
                      <div className="mt-6 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 p-5">
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Vùng nguy hiểm</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Thao tác dưới đây có thể ảnh hưởng đến tài khoản của bạn.
                        </p>
                        <button
                          type="button"
                          onClick={handleLogoutAll}
                          disabled={loggingOutAll}
                          className="mt-3 rounded-lg border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                          {loggingOutAll ? "Đang xử lý..." : "Đăng xuất tất cả thiết bị"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === "premium" ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Thông tin Premium</h2>

                  {!subscription ? (
                    <div className="mt-6 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-8 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                        <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      <p className="mt-4 font-semibold text-foreground">Bạn chưa có gói Premium</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Nâng cấp ngay để trải nghiệm những truyện độc quyền
                      </p>
                      <Link
                        href="/premium"
                        className="mt-6 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/40"
                      >
                        Nâng cấp Premium
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                            <svg className="h-7 w-7 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-foreground">
                              {subscription.plan?.name || "Premium"}
                            </p>
                            <p
                              className={`text-sm font-medium ${
                                subscription.status === "ACTIVE" ? "text-emerald-500" : "text-red-500"
                              }`}
                            >
                              {subscription.status === "ACTIVE"
                                ? "Đang hoạt động"
                                : subscription.status === "EXPIRED"
                                  ? "Đã hết hạn"
                                  : "Đã hủy"}
                            </p>
                          </div>
                        </div>

                        {subscription.plan?.description && (
                          <p className="mt-4 text-sm text-muted-foreground">{subscription.plan.description}</p>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-background p-4">
                          <p className="text-xs font-medium text-muted-foreground">Ngày bắt đầu</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {formatDate(subscription.startedAt)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-background p-4">
                          <p className="text-xs font-medium text-muted-foreground">Ngày hết hạn</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {formatDate(subscription.expiresAt)}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/premium"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Gia hạn Premium
                      </Link>
                    </div>
                  )}
                </div>
              ) : activeTab === "uploader" ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Nâng cấp Uploader</h2>

                  <div className="mt-6 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20">
                      <svg className="h-8 w-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-center text-lg font-semibold text-foreground">Trở thành Uploader</h3>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      Nâng cấp tài khoản để đăng tải và quản lý truyện của riêng bạn
                    </p>

                    <div className="mt-6 space-y-3">
                      {[
                        "Đăng tải truyện mới lên hệ thống",
                        "Quản lý chương truyện của bạn",
                        "Yêu cầu xuất bản truyện",
                        "Theo dõi lượt xem và tương tác",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleUpgradeToUploader}
                      disabled={upgrading}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40 disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      {upgrading ? "Đang xử lý..." : "Nâng cấp ngay"}
                    </button>
                  </div>
                </div>
              ) : activeTab === "history" ? (
                /* History tab */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Lịch sử đọc truyện</h2>
                    <button
                      type="button"
                      onClick={() => loadHistories(historyPage)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
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

                  {historyLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                      ))}
                    </div>
                  ) : histories.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-muted-foreground/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-3 text-sm text-muted-foreground">Chưa có lịch sử đọc truyện.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {histories.map((item) => (
                        <Link
                          key={item.id}
                          href={
                            item.story?.slug && item.chapter?.id
                              ? `/stories/${item.story.slug}/chapters/${item.chapter.id}`
                              : item.story?.slug
                                ? `/stories/${item.story.slug}`
                                : "#"
                          }
                          className="group flex items-center gap-4 rounded-xl border border-border p-4 transition hover:border-indigo-500/30 hover:bg-indigo-500/5"
                        >
                          <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {item.story?.coverImageUrl ? (
                              <img
                                src={item.story.coverImageUrl}
                                alt={item.story.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                {item.story?.title?.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {item.story?.title || "Không rõ"}
                            </p>
                            {item.chapter && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                Chương {item.chapter.chapterNumber}: {item.chapter.title || "Không tiêu đề"}
                              </p>
                            )}
                            {item.lastReadAt && (
                              <p className="mt-1 text-xs text-muted-foreground/70">
                                Đọc lúc: {formatDate(item.lastReadAt)}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition">
                            Đọc tiếp
                          </div>
                        </Link>
                      ))}

                      {/* Pagination */}
                      {historyTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => loadHistories(historyPage - 1)}
                            disabled={historyPage <= 1}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                          >
                            Trước
                          </button>
                          <span className="px-3 text-sm text-muted-foreground">
                            Trang {historyPage} / {historyTotalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => loadHistories(historyPage + 1)}
                            disabled={historyPage >= historyTotalPages}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                          >
                            Sau
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeTab === "transactions" ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Lịch sử giao dịch</h2>

                  {transactionsLoading ? (
                    <div className="mt-4 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                      ))}
                    </div>
                  ) : myTransactions.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-muted-foreground/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <p className="mt-3 text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {myTransactions.map((tx) => (
                        <div key={tx.id} className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{tx.subscriptionPlan?.name}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">{formatPrice(tx.amountVnd / 100)}</p>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  tx.status === "SUCCESS"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                    : tx.status === "PENDING"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                      : tx.status === "FAILED"
                                        ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                }`}
                              >
                                {tx.status === "SUCCESS"
                                  ? "Thành công"
                                  : tx.status === "PENDING"
                                    ? "Đang chờ"
                                    : tx.status === "FAILED"
                                      ? "Thất bại"
                                      : "Đã hoàn tiền"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Mã giao dịch: <span className="font-mono">{tx.vnpTxnRef}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === "linked-accounts" ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Tài khoản liên kết</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quản lý các tài khoản liên kết với hệ thống của bạn.
                  </p>

                  {accountsLoading ? (
                    <div className="mt-4 space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {/* Google */}
                      {(() => {
                        const googleAccount = linkedAccounts.find(a => a.provider === "GOOGLE");
                        const isGoogleLinked = googleAccount?.linked ?? false;
                        return (
                          <div key="google" className="flex items-center justify-between rounded-xl border border-border p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                                <svg viewBox="0 0 24 24" className="h-7 w-7">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Google</p>
                                <p className="text-sm text-muted-foreground">
                                  {isGoogleLinked ? "Đã liên kết" : "Chưa liên kết"}
                                </p>
                              </div>
                            </div>
                            {isGoogleLinked ? (
                              <button
                                onClick={handleUnlinkGoogle}
                                disabled={unlinkingGoogle}
                                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition"
                              >
                                {unlinkingGoogle ? "Đang xử lý..." : "Hủy liên kết"}
                              </button>
                            ) : (
                              <button
                                onClick={handleLinkGoogle}
                                disabled={linkingGoogle}
                                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition"
                              >
                                {linkingGoogle ? "Đang xử lý..." : "Liên kết"}
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* Local Account */}
                      {linkedAccounts.filter(a => a.provider === "LOCAL").map((account) => (
                        <div key={account.provider} className="flex items-center justify-between rounded-xl border border-border p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-500">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Tài khoản local</p>
                              <p className="text-sm text-muted-foreground">Đăng ký bằng email/mật khẩu</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Lưu ý</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Liên kết tài khoản giúp bạn đăng nhập nhanh hơn bằng các dịch vụ bên thứ ba.
                          Tài khoản local (đăng ký bằng email/mật khẩu) không thể bị hủy liên kết.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
