"use client";

import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { useEffect, useState, useCallback } from "react";
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  SubscriptionPlan,
} from "@/lib/api/subscription";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

interface PlanFormData {
  code: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  sortOrder: number;
}

const emptyForm: PlanFormData = {
  code: "",
  name: "",
  description: "",
  price: 0,
  durationDays: 30,
  sortOrder: 0,
};

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      const data = await getSubscriptionPlans();
      setPlans(data ?? []);
    } catch {
      toast.error("Không tải được danh sách gói Premium.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationDays: plan.durationDays,
      sortOrder: plan.sortOrder,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || formData.price <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setSaving(true);
    try {
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.code, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          durationDays: formData.durationDays,
          sortOrder: formData.sortOrder,
        });
        toast.success("Cập nhật gói thành công!");
      } else {
        await createSubscriptionPlan(formData);
        toast.success("Tạo gói mới thành công!");
      }
      setShowModal(false);
      loadPlans();
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      await updateSubscriptionPlan(plan.code, { isActive: !plan.isActive });
      toast.success(plan.isActive ? "Đã vô hiệu hóa gói." : "Đã kích hoạt gói.");
      loadPlans();
    } catch {
      toast.error("Có lỗi xảy ra.");
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Bạn có chắc muốn xóa gói này?")) return;

    setDeletingCode(code);
    try {
      await deleteSubscriptionPlan(code);
      toast.success("Đã xóa gói.");
      loadPlans();
    } catch {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setDeletingCode(null);
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Quản lý gói Premium</h1>
            <p className="mt-1 text-sm text-white/60">Tạo, chỉnh sửa và quản lý các gói subscription</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo gói mới
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-8 text-center text-white/60">Đang tải...</div>
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            Chưa có gói Premium nào.
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/60">
                    Mã gói
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/60">
                    Tên gói
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/60">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/60">
                    Thời hạn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/60">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-white/60">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {plans.map((plan) => (
                  <tr key={plan.code} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <code className="rounded bg-white/10 px-2 py-1 text-sm text-white/80">{plan.code}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{plan.name}</div>
                      <div className="text-sm text-white/60 truncate max-w-[200px]">{plan.description}</div>
                    </td>
                    <td className="px-6 py-4 text-white">{formatPrice(plan.price)}</td>
                    <td className="px-6 py-4 text-white">{Math.round(plan.durationDays / 30)} tháng</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          plan.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {plan.isActive ? "Đang bán" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(plan)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                          title={plan.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {plan.isActive ? (
                            <span className="text-amber-400">Tắt</span>
                          ) : (
                            <span className="text-emerald-400">Bật</span>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(plan)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(plan.code)}
                          disabled={deletingCode === plan.code}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingCode === plan.code ? "..." : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingPlan ? "Sửa gói Premium" : "Tạo gói Premium mới"}
              </h2>

              <div className="space-y-4">
                {!editingPlan && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Mã gói</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="VD: PREMIUM_1M"
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Tên gói</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Premium 1 Tháng"
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Mô tả chi tiết về gói..."
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Giá (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Số ngày</label>
                    <input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-white/20 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : editingPlan ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
