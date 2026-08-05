"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  updateBannerStatus,
  deleteBanner,
  Banner,
} from "@/lib/api/banner";
import { toast } from "sonner";

type BannerPosition = "HOME_HERO" | "POPUP";

interface BannerFormData {
  title: string;
  linkUrl: string;
  bannerUrl: string;
  position: BannerPosition;
  sortOrder: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(true);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    linkUrl: "",
    bannerUrl: "",
    position: "HOME_HERO",
    sortOrder: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadBanners = useCallback(async (page: number, isActive: boolean | null) => {
    setLoading(true);
    try {
      const result = await getAllBanners({ page, size: 20, isActive: isActive ?? undefined });
      setBanners(result.data);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    } catch {
      toast.error("Không tải được danh sách banner");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners(1, filterActive);
  }, [filterActive, loadBanners]);

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        linkUrl: banner.linkUrl || "",
        bannerUrl: banner.bannerUrl,
        position: banner.position,
        sortOrder: banner.sortOrder,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        linkUrl: "",
        bannerUrl: "",
        position: "HOME_HERO",
        sortOrder: 1,
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề banner");
      return;
    }

    setSubmitting(true);
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, {
          title: formData.title,
          linkUrl: formData.linkUrl || undefined,
          bannerUrl: formData.bannerUrl || undefined,
          imageFile: imageFile || undefined,
          position: formData.position,
          sortOrder: formData.sortOrder,
        });
        toast.success("Cập nhật banner thành công");
      } else {
        await createBanner({
          title: formData.title,
          linkUrl: formData.linkUrl || undefined,
          bannerUrl: formData.bannerUrl || undefined,
          imageFile: imageFile || undefined,
          position: formData.position,
          sortOrder: formData.sortOrder,
        });
        toast.success("Tạo banner thành công");
      }
      setShowModal(false);
      loadBanners(currentPage, filterActive);
    } catch {
      toast.error(editingBanner ? "Không thể cập nhật banner" : "Không thể tạo banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      await updateBannerStatus(banner.id, !banner.isActive);
      toast.success(banner.isActive ? "Đã tắt banner" : "Đã bật banner");
      loadBanners(currentPage, filterActive);
    } catch {
      toast.error("Không thể cập nhật trạng thái banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa banner này?")) return;
    setDeleting(id);
    try {
      await deleteBanner(id);
      toast.success("Đã xóa banner");
      loadBanners(currentPage, filterActive);
    } catch {
      toast.error("Không thể xóa banner");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Banner</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý banner hiển thị trên trang chủ
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition"
          >
            Thêm Banner
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setFilterActive(null)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              filterActive === null
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterActive(true)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              filterActive === true
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Đang hoạt động
          </button>
          <button
            onClick={() => setFilterActive(false)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              filterActive === false
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã tắt
          </button>
        </div>

        {/* Banner list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">Chưa có banner nào.</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 rounded-lg border border-dashed border-indigo-500 px-4 py-2 text-sm text-indigo-500 hover:bg-indigo-500/5 transition"
            >
              Tạo banner đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                    banner.isActive
                      ? "border-border bg-card"
                      : "border-border/50 bg-muted/50"
                  }`}
                >
                  <div className="h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {banner.bannerUrl ? (
                      <img
                        src={banner.bannerUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{banner.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          banner.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400"
                        }`}
                      >
                        {banner.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                      <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                        {banner.position === "HOME_HERO" ? "Trang chủ" : "Popup"}
                      </span>
                    </div>
                    {banner.linkUrl && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        Link: {banner.linkUrl}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Thứ tự: {banner.sortOrder} • {formatDate(banner.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        banner.isActive
                          ? "border border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-500/10"
                          : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                      }`}
                    >
                      {banner.isActive ? "Tắt" : "Bật"}
                    </button>
                    <button
                      onClick={() => handleOpenModal(banner)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={deleting === banner.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-500/10 disabled:opacity-50 transition"
                    >
                      {deleting === banner.id ? "..." : "Xóa"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => loadBanners(currentPage - 1, filterActive)}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                >
                  Trước
                </button>
                <span className="px-3 text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => loadBanners(currentPage + 1, filterActive)}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {editingBanner ? "Sửa Banner" : "Thêm Banner"}
              </h3>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề banner"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Link khi click
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Vị trí
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as BannerPosition })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="HOME_HERO">Trang chủ</option>
                    <option value="POPUP">Popup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Banner
                </label>
                {formData.bannerUrl && (
                  <div className="mb-2">
                    <img
                      src={formData.bannerUrl}
                      alt="Banner preview"
                      className="h-32 w-full object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:text-sm file:font-medium hover:file:bg-indigo-600"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Hoặc nhập URL ảnh banner bên dưới
                </p>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition"
              >
                {submitting ? "Đang xử lý..." : editingBanner ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
