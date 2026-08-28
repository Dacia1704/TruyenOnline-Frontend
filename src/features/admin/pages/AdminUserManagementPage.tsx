"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { getUsers, updateUserRoles, banUser, getRoles } from "@/lib/api/admin";
import type { User, Role } from "@/lib/types/stories";
import Modal from "@/components/Modal";

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersResult, rolesResult] = await Promise.all([getUsers({ size: 20 }), getRoles()]);
        setUsers(usersResult.data ?? []);
        setAllRoles(rolesResult);
      } catch {
        setError("Không tải được danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBan = async (userId: string) => {
    await banUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const openRoleModal = (user: User) => {
    setEditingUser(user);
    setSelectedRoleIds(user.roles?.map((r) => r.id) ?? []);
  };

  const closeRoleModal = () => {
    setEditingUser(null);
    setSelectedRoleIds([]);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const updatedUser = await updateUserRoles(editingUser.id, selectedRoleIds);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, roles: updatedUser.roles } : u)));
      closeRoleModal();
    } catch {
      setError("Cập nhật vai trò thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="-mx-4 lg:mx-0 px-4 lg:px-0">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cập nhật role và khóa/mở tài khoản người dùng.</p>
      </div>

      {error && (
        <div className="mt-4 lg:mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-4 lg:mt-8 rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Người dùng</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium">Thao tác</th>
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
              {!loading &&
                users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{user.username}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span
                              key={role.id}
                              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Không có vai trò</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openRoleModal(user)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          Cập nhật role
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBan(user.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Khóa tài khoản
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Modal */}
      <Modal isOpen={!!editingUser} onClose={closeRoleModal} title={`Cập nhật vai trò - ${editingUser?.username}`} size="sm">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">Chọn vai trò cho người dùng:</p>
          {allRoles.map((role) => (
            <label
              key={role.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted transition"
            >
              <input
                type="checkbox"
                checked={selectedRoleIds.includes(role.id)}
                onChange={() => toggleRole(role.id)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium">{role.name}</span>
                {role.description && (
                  <span className="ml-2 text-xs text-muted-foreground">{role.description}</span>
                )}
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={closeRoleModal}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSaveRoles}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
