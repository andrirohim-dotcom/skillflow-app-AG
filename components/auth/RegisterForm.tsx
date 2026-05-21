"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/verify-email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface/40 border border-line rounded-3xl shadow-xl p-8 backdrop-blur-md">
      <h1 className="text-xl font-bold text-text mb-6">Buat Akun Baru</h1>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-mute mb-1.5 uppercase tracking-wider">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-line bg-white/5 rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
            placeholder="Nama lengkap kamu"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-mute mb-1.5 uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-line bg-white/5 rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
            placeholder="kamu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-mute mb-1.5 uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full border border-line bg-white/5 rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-mute mb-1.5 uppercase tracking-wider">Konfirmasi Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full border border-line bg-white/5 rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
            placeholder="Ulangi password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-sleek text-white font-bold py-2.5 rounded-xl text-sm border border-indigo-500/30 disabled:opacity-50 transition-all hover:shadow-lg active:scale-95 cursor-pointer mt-2"
        >
          {loading ? "Membuat akun..." : "Daftar →"}
        </button>
      </form>

      <p className="text-center text-xs text-text-mute mt-6">
        Sudah punya akun?{" "}
        <a href="/login" className="text-indigo-400 font-bold hover:underline">
          Masuk di sini
        </a>
      </p>
    </div>
  );
}
