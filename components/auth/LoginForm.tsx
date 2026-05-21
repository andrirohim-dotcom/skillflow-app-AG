"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const suspended = params.get("suspended") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email atau password salah."
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-surface/40 border border-line rounded-3xl shadow-xl p-8 backdrop-blur-md">
      <h1 className="text-xl font-bold text-text mb-6">Masuk ke Akun</h1>

      {suspended && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
          Akun kamu telah disuspend. Hubungi administrator.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="current-password"
            className="w-full border border-line bg-white/5 rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-sleek text-white font-bold py-2.5 rounded-xl text-sm border border-indigo-500/30 disabled:opacity-50 transition-all hover:shadow-lg active:scale-95 cursor-pointer mt-2"
        >
          {loading ? "Memproses..." : "Masuk →"}
        </button>
      </form>

      <p className="text-center text-xs text-text-mute mt-6">
        Belum punya akun?{" "}
        <a href="/register" className="text-indigo-400 font-bold hover:underline">
          Daftar sekarang
        </a>
      </p>
    </div>
  );
}
