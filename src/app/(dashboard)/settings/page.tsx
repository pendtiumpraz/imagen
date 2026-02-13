"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [name, setName] = useState(session?.user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/user/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name || undefined,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Pengaturan disimpan!");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="card" style={{ maxWidth: "600px" }}>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Settings size={20} />
                    Pengaturan Akun
                </h3>
                <form onSubmit={handleSave} className="auth-form">
                    <div className="input-group">
                        <label className="input-label" htmlFor="settings-name">Nama</label>
                        <input
                            id="settings-name"
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="settings-email">Email</label>
                        <input
                            id="settings-email"
                            type="email"
                            className="input"
                            value={session?.user?.email || ""}
                            disabled
                            style={{ opacity: 0.6 }}
                        />
                    </div>
                    <hr style={{ border: "none", borderTop: "1px solid var(--dark-500)", margin: "8px 0" }} />
                    <div className="input-group">
                        <label className="input-label" htmlFor="settings-current-pw">
                            Password Saat Ini (opsional)
                        </label>
                        <input
                            id="settings-current-pw"
                            type="password"
                            className="input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Isi jika ingin ganti password"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="settings-new-pw">
                            Password Baru
                        </label>
                        <input
                            id="settings-new-pw"
                            type="password"
                            className="input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-pulse" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}
