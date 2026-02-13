"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, Users, Shield, Ban, Key, Edit2, Loader2, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserItem {
    id: string;
    name: string;
    email: string;
    role: string;
    plan: string;
    monthlyQuota: number;
    customQuota: number | null;
    isBanned: boolean;
    banReason: string | null;
    fraudAttempts: number;
    createdAt: string;
    _count: { generations: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editUser, setEditUser] = useState<UserItem | null>(null);
    const [editQuota, setEditQuota] = useState("");
    const [editBanReason, setEditBanReason] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();
            setUsers(data.users || []);
        } catch {
            toast.error("Gagal memuat users");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleUpdateUser = async (userId: string, updates: Record<string, unknown>) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("User berhasil diupdate");
            fetchUsers();
            setEditUser(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal update");
        } finally {
            setSaving(false);
        }
    };

    const handleBan = (user: UserItem) => {
        const reason = prompt("Alasan ban (akan ditampilkan ke user):", user.banReason || "");
        if (reason === null) return;
        handleUpdateUser(user.id, {
            isBanned: true,
            banReason: reason || "Akun diblokir oleh admin",
            customQuota: 0,
        });
    };

    const handleUnban = (user: UserItem) => {
        if (!confirm(`Unban user ${user.name}?`)) return;
        handleUpdateUser(user.id, {
            isBanned: false,
            banReason: null,
            customQuota: null,
        });
    };

    const handleResetPassword = async (userId: string) => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password minimal 6 karakter");
            return;
        }
        await handleUpdateUser(userId, { password: newPassword });
        setNewPassword("");
    };

    return (
        <>
            <div className="admin-search">
                <div style={{ position: "relative", flex: 1 }}>
                    <Search
                        size={18}
                        style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--dark-400)",
                        }}
                    />
                    <input
                        className="input"
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: "40px" }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <Loader2 size={40} className="animate-pulse" style={{ margin: "0 auto" }} />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Plan</th>
                                <th>Quota</th>
                                <th>Generasi</th>
                                <th>Fraud</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div className="avatar avatar-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: "13px" }}>
                                                    {user.name}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "var(--surface-300)" }}>
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.role === "ADMIN" ? "badge-accent" : "badge-info"}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-primary">{user.plan}</span>
                                    </td>
                                    <td>{user.customQuota ?? user.monthlyQuota}/bln</td>
                                    <td>{user._count.generations}</td>
                                    <td>
                                        {user.fraudAttempts > 0 ? (
                                            <span className="badge badge-error" title={`${user.fraudAttempts} percobaan fraud`}>
                                                ⚠️ {user.fraudAttempts}
                                            </span>
                                        ) : (
                                            <span style={{ color: "var(--surface-400)", fontSize: "12px" }}>0</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.isBanned ? (
                                            <span className="badge badge-error">Banned</span>
                                        ) : (
                                            <span className="badge badge-success">Aktif</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => {
                                                    setEditUser(user);
                                                    setEditQuota(String(user.customQuota ?? user.monthlyQuota));
                                                    setEditBanReason(user.banReason || "");
                                                    setNewPassword("");
                                                }}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            {user.isBanned ? (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleUnban(user)}
                                                    title="Unban"
                                                    style={{ color: "var(--success)" }}
                                                >
                                                    <Shield size={14} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleBan(user)}
                                                    title="Ban"
                                                    style={{ color: "var(--error)" }}
                                                >
                                                    <Ban size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Edit User: {editUser.name}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setEditUser(null)}>
                                ✕
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Quota */}
                            <div className="input-group">
                                <label className="input-label">Kuota Bulanan (Custom)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={editQuota}
                                    onChange={(e) => setEditQuota(e.target.value)}
                                    min={0}
                                />
                                <p style={{ fontSize: "12px", color: "var(--surface-300)", marginTop: "4px" }}>
                                    Set ke 0 untuk memblokir. Kosongkan untuk menggunakan default plan.
                                </p>
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ marginTop: "8px" }}
                                    onClick={() =>
                                        handleUpdateUser(editUser.id, {
                                            customQuota: editQuota ? parseInt(editQuota) : null,
                                        })
                                    }
                                    disabled={saving}
                                >
                                    Update Kuota
                                </button>
                            </div>

                            {/* Reset Password */}
                            <div className="input-group">
                                <label className="input-label">Reset Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Password baru (min 6 karakter)"
                                />
                                <button
                                    className="btn btn-accent btn-sm"
                                    style={{ marginTop: "8px" }}
                                    onClick={() => handleResetPassword(editUser.id)}
                                    disabled={saving}
                                >
                                    <Key size={14} />
                                    Reset Password
                                </button>
                            </div>

                            {/* Ban / Unban */}
                            <div style={{ borderTop: "1px solid var(--dark-500)", paddingTop: "16px" }}>
                                {editUser.isBanned ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleUnban(editUser)}
                                        disabled={saving}
                                        style={{ width: "100%" }}
                                    >
                                        <Shield size={16} />
                                        Unban User
                                    </button>
                                ) : (
                                    <>
                                        <div className="input-group" style={{ marginBottom: "8px" }}>
                                            <label className="input-label">Alasan Ban</label>
                                            <input
                                                className="input"
                                                value={editBanReason}
                                                onChange={(e) => setEditBanReason(e.target.value)}
                                                placeholder="Alasan memblokir user..."
                                            />
                                        </div>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                handleUpdateUser(editUser.id, {
                                                    isBanned: true,
                                                    banReason: editBanReason || "Diblokir oleh admin",
                                                    customQuota: 0,
                                                })
                                            }
                                            disabled={saving}
                                            style={{ width: "100%" }}
                                        >
                                            <Ban size={16} />
                                            Ban User
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
