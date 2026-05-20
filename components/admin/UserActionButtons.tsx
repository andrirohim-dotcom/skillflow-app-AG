"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  suspendUser,
  unsuspendUser,
  promoteToAdmin,
  demoteFromAdmin,
  deleteUser,
} from "@/app/(admin)/admin/users/[id]/actions";

interface Props {
  userId: string;
  isSuspended: boolean;
  isAdmin: boolean;
}

export default function UserActionButtons({ userId, isSuspended, isAdmin }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function run(action: string, fn: () => Promise<void>) {
    setLoading(action);
    try {
      await fn();
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {isSuspended ? (
        <button
          onClick={() => run("unsuspend", () => unsuspendUser(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
        >
          {loading === "unsuspend" ? "Memproses..." : "✓ Aktifkan Akun"}
        </button>
      ) : (
        <button
          onClick={() => run("suspend", () => suspendUser(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-orange-200 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50 transition-colors"
        >
          {loading === "suspend" ? "Memproses..." : "⚠ Suspend Akun"}
        </button>
      )}

      {isAdmin ? (
        <button
          onClick={() => run("demote", () => demoteFromAdmin(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {loading === "demote" ? "Memproses..." : "Cabut Hak Admin"}
        </button>
      ) : (
        <button
          onClick={() => run("promote", () => promoteToAdmin(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-violet-200 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50 transition-colors"
        >
          {loading === "promote" ? "Memproses..." : "★ Jadikan Admin"}
        </button>
      )}

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-2 rounded-xl border border-red-100 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          Hapus Akun
        </button>
      ) : (
        <div className="border border-red-200 rounded-xl p-3 bg-red-50">
          <p className="text-xs text-red-700 font-semibold mb-2">Yakin hapus akun ini? Tindakan tidak bisa dibatalkan.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-white transition-colors"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                setLoading("delete");
                await deleteUser(userId);
                router.push("/admin/users");
              }}
              disabled={loading !== null}
              className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading === "delete" ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
