"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { getUsers, updateUserRoles, banUser, getRoles } from "@/lib/api/admin";
import type { User, Role } from "@/lib/types/stories";
import { getMyInfo } from "@/lib/api/stories";

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersResult, rolesResult, me] = await Promise.all([getUsers({ size: 20 }), getRoles(), getMyInfo()]);
        setUsers(usersResult.data ?? []);
        setRoles(rolesResult);
        const meUser = usersResult.data.find((u) => u.id === me.id);
        if (meUser?.roles) {
          setSelectedRoles({ [me.id]: meUser.roles.map((r) => r.id) });
        }
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

  const handleRoleChange = async (userId: string, roleIds: number[]) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: roleIds }));
    await updateUserRoles(userId, roleIds);
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cập nhật role và khóa/mở tài khoản người dùng.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-8 rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Người dùng</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Roles</th>
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
                      <select
                        value={(selectedRoles[user.id] ?? user.roles?.map((r) => r.id) ?? []).join(",")}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value
                              .split(",")
                              .filter(Boolean)
                              .map((id) => Number(id)),
                          )
                        }
                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                      >
                        <option value="">Không chọn</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleBan(user.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Khóa tài khoản
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
