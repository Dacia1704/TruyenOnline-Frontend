"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { createGenre, deleteGenre, getGenres, updateGenre } from "@/lib/api/admin";
import type { Genre } from "@/lib/types/stories";

export default function AdminGenreManagementPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);

  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGenres();
      setGenres(data);
    } catch {
      setError("Không tải được danh sách thể loại.");
    } finally {
      setLoading(false);
    }
  };

  const clearFlash = () => {
    setError(null);
    setSuccess(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setActionLoading("create");
    clearFlash();
    try {
      const created = await createGenre({ name: form.name.trim() });
      setGenres((prev) => [...prev, created]);
      setForm({ name: "" });
      setSuccess("Thêm thể loại thành công.");
    } catch {
      setError("Không thể thêm thể loại. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (genre: Genre) => {
    setEditingId(genre.id);
    setEditForm({ name: genre.name });
    clearFlash();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "" });
  };

  const submitEdit = async (genre: Genre) => {
    if (!editForm.name.trim()) return;
    setActionLoading(genre.id);
    clearFlash();
    try {
      const updated = await updateGenre(genre.id, {
        name: editForm.name.trim(),
      });
      setGenres((prev) => prev.map((g) => (g.id === genre.id ? updated : g)));
      cancelEdit();
      setSuccess("Cập nhật thể loại thành công.");
    } catch {
      setError("Không thể cập nhật thể loại. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (genre: Genre) => {
    const confirmed = window.confirm(`Xóa thể loại "${genre.name}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;
    setActionLoading(genre.id);
    clearFlash();
    try {
      await deleteGenre(genre.id);
      setGenres((prev) => prev.filter((g) => g.id !== genre.id));
      setSuccess("Xóa thể loại thành công.");
    } catch {
      setError("Không thể xóa thể loại. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="-mx-4 lg:mx-0 px-4 lg:px-0">
        <h1 className="text-2xl font-bold">Quản lý thể loại</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Thêm, chỉnh sửa và xóa thể loại truyện. Thể loại sẽ được sử dụng khi tạo truyện.
        </p>
      </div>

      {error && (
        <div className="mt-4 lg:mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mt-4 lg:mt-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <section className="mt-4 lg:mt-8 rounded-2xl border border-border bg-card p-4 lg:p-6">
        <h2 className="text-lg font-semibold">Thêm thể loại mới</h2>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleCreate}>
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tên thể loại</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ví dụ: Hành động, Lãng mạn,..."
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading === "create"}
            className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {actionLoading === "create" ? "Đang thêm..." : "Thêm thể loại"}
          </button>
        </form>
      </section>

      <div className="mt-4 lg:mt-8 rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Tên thể loại</th>
                <th className="px-4 py-3 text-center font-medium">Số truyện</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && genres.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Chưa có thể loại nào. Thêm thể loại đầu tiên bên trên.
                  </td>
                </tr>
              )}
              {!loading &&
                genres.map((genre) => {
                  const isEditing = editingId === genre.id;
                  return (
                    <tr key={genre.id} className="border-t border-border">
                      <td className="px-4 py-3 text-muted-foreground">{genre.id}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                          />
                        ) : (
                          <span className="font-medium">{genre.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {genre.storyQuantity ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => submitEdit(genre)}
                                disabled={actionLoading === genre.id}
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                              >
                                Lưu
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(genre)}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(genre)}
                                disabled={actionLoading === genre.id}
                                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                              >
                                {actionLoading === genre.id ? "Đang xóa..." : "Xóa"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
