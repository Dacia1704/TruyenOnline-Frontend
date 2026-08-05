"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { createAuthor, deleteAuthor, getAuthors, updateAuthor, type Author } from "@/lib/api/admin";

export default function AdminAuthorManagementPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", country: "", avatarFile: null as File | null });
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", bio: "", country: "", avatarFile: null as File | null });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadAuthors = useCallback(async (searchTerm = "", pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAuthors({ search: searchTerm, page: pageNum, size: 20 });
      setAuthors(result.data);
      setTotalPages(result.totalPages);
      setPage(result.currentPage);
    } catch {
      setError("Không tải được danh sách tác giả.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthors(search, page);
  }, [loadAuthors, search, page]);

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
      const created = await createAuthor({
        name: form.name.trim(),
        bio: form.bio.trim() || undefined,
        country: form.country.trim() || undefined,
        avatarFile: form.avatarFile || undefined,
      });
      setAuthors((prev) => [created, ...prev]);
      setForm({ name: "", bio: "", country: "", avatarFile: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowForm(false);
      setSuccess("Thêm tác giả thành công.");
    } catch {
      setError("Không thể thêm tác giả. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (author: Author) => {
    setEditingId(author.id);
    setEditForm({ name: author.name, bio: author.bio || "", country: author.country || "", avatarFile: null });
    setEditAvatarPreview(null);
    clearFlash();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", bio: "", country: "", avatarFile: null });
    setEditAvatarPreview(null);
  };

  const submitEdit = async (author: Author) => {
    if (!editForm.name.trim()) return;
    setActionLoading(author.id);
    clearFlash();
    try {
      const updated = await updateAuthor(author.id, {
        name: editForm.name.trim(),
        bio: editForm.bio.trim() || undefined,
        country: editForm.country.trim() || undefined,
        avatarFile: editForm.avatarFile || undefined,
      });
      setAuthors((prev) => prev.map((a) => (a.id === author.id ? updated : a)));
      cancelEdit();
      if (editFileInputRef.current) editFileInputRef.current.value = "";
      setSuccess("Cập nhật tác giả thành công.");
    } catch {
      setError("Không thể cập nhật tác giả. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (author: Author) => {
    const confirmed = window.confirm(`Xóa tác giả "${author.name}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;
    setActionLoading(author.id);
    clearFlash();
    try {
      await deleteAuthor(author.id);
      setAuthors((prev) => prev.filter((a) => a.id !== author.id));
      setSuccess("Xóa tác giả thành công.");
    } catch {
      setError("Không thể xóa tác giả. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) {
      setEditForm((prev) => ({ ...prev, avatarFile: file }));
      const reader = new FileReader();
      reader.onload = () => setEditAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, avatarFile: file }));
    }
  };

  return (
    <AdminLayout>
      <div className="-mx-4 lg:mx-0 px-4 lg:px-0">
        <h1 className="text-2xl font-bold">Quản lý tác giả</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Thêm, chỉnh sửa và xóa tác giả. Tác giả sẽ được liên kết với truyện.
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

      {/* Search & Add */}
      <div className="mt-4 lg:mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm tác giả..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {showForm ? "Đóng" : "+ Thêm tác giả"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <section className="mt-4 lg:mt-6 rounded-2xl border border-border bg-card p-4 lg:p-6">
          <h2 className="text-lg font-semibold">Thêm tác giả mới</h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tên tác giả *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Tên tác giả"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quốc gia</label>
              <input
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Ví dụ: Việt Nam, Nhật Bản..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tiểu sử</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Giới thiệu ngắn về tác giả"
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ảnh đại diện</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading === "create"}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {actionLoading === "create" ? "Đang thêm..." : "Thêm tác giả"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Authors Table */}
      <div className="mt-4 lg:mt-8 rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Avatar</th>
                <th className="px-4 py-3 text-left font-medium">Tên tác giả</th>
                <th className="px-4 py-3 text-left font-medium">Quốc gia</th>
                <th className="px-4 py-3 text-left font-medium">Tiểu sử</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && authors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Không tìm thấy tác giả nào.
                  </td>
                </tr>
              )}
              {!loading &&
                authors.map((author) => {
                  const isEditing = editingId === author.id;
                  return (
                    <tr key={author.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        {isEditing && editAvatarPreview ? (
                          <div className="relative h-10 w-10">
                            <Image src={editAvatarPreview} alt="preview" fill className="rounded-full object-cover" />
                          </div>
                        ) : author.avatarUrl ? (
                          <div className="relative h-10 w-10">
                            <Image src={author.avatarUrl} alt={author.name} fill className="rounded-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                            {author.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                          />
                        ) : (
                          <span className="font-medium">{author.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editForm.country}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, country: e.target.value }))}
                            placeholder="Quốc gia"
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                          />
                        ) : (
                          <span className="text-muted-foreground">{author.country || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {isEditing ? (
                          <textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tiểu sử"
                            rows={2}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                          />
                        ) : (
                          <span className="text-muted-foreground truncate block">{author.bio || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-2">
                          {isEditing ? (
                            <>
                              <input
                                ref={editFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, true)}
                                className="text-xs file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => submitEdit(author)}
                                  disabled={actionLoading === author.id}
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
                              </div>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(author)}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(author)}
                                disabled={actionLoading === author.id}
                                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                              >
                                {actionLoading === author.id ? "Đang xóa..." : "Xóa"}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-40"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
