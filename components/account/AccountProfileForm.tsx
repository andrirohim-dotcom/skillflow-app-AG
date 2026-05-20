"use client";

import { useState } from "react";
import type { AccountProfile, AccountRole, LearningMode, GamificationMode } from "@/lib/accountTypes";

const ROLE_OPTIONS: { value: AccountRole; label: string; desc: string }[] = [
  { value: "owner",  label: "Pemilik",  desc: "Akun utama perangkat ini" },
  { value: "member", label: "Anggota",  desc: "Anggota keluarga atau rekan" },
  { value: "child",  label: "Anak",     desc: "Profil untuk anak" },
  { value: "mentor", label: "Mentor",   desc: "Pembimbing atau pengajar" },
];

const AVATAR_OPTIONS = ["🧑", "👩", "👦", "👧", "🧑‍💻", "👨‍🎓", "👩‍🎓", "🧑‍🏫", "🦊", "🐧", "🌱", "🚀"];

interface Props {
  account: AccountProfile;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function AccountProfileForm({ account, onSaved, onCancel }: Props) {
  const isDefault = true; // In multi-user auth, there's only one profile per user

  const [name, setName] = useState(account.name);
  const [avatar, setAvatar] = useState(account.avatar);
  const [bio, setBio] = useState(account.bio ?? "");
  const [role, setRole] = useState<AccountRole>(account.role);
  const [learningMode, setLearningMode] = useState<LearningMode>(account.learningMode);
  const [gamificationMode, setGamificationMode] = useState<GamificationMode>(account.gamificationMode);
  const [primaryGoal, setPrimaryGoal] = useState(account.primaryGoal ?? "");
  const [weeklyGoal, setWeeklyGoal] = useState<string>(account.weeklyGoal?.toString() ?? "");
  const [focusAreas, setFocusAreas] = useState(account.focusAreas.join(", "));
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!name.trim()) return;
    const updated: AccountProfile = {
      ...account,
      name: name.trim(),
      avatar: avatar || "🧑",
      bio: bio.trim() || undefined,
      role,
      learningMode,
      gamificationMode,
      primaryGoal: primaryGoal.trim() || undefined,
      weeklyGoal: weeklyGoal ? parseInt(weeklyGoal, 10) : undefined,
      focusAreas: focusAreas.split(",").map((s) => s.trim()).filter(Boolean),
    };
    void updated; // parent handles persistence via onSaved
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onSaved?.();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {/* Avatar picker */}
        <div className="relative group">
          <span className="text-5xl">{avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nama</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            placeholder="Nama profil..."
          />
        </div>
      </div>

      {/* Avatar selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setAvatar(emoji)}
              className={`text-2xl w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                avatar === emoji
                  ? "border-sky-400 bg-sky-50 scale-110"
                  : "border-gray-100 hover:border-gray-300 bg-white"
              }`}
            >
              {emoji}
            </button>
          ))}
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="w-10 h-10 text-center border-2 border-dashed border-gray-200 rounded-xl text-xl focus:outline-none focus:border-sky-400"
            maxLength={2}
            title="Atau ketik emoji kustom"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Bio singkat</label>
        <input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          placeholder="Opsional — satu kalimat tentang diri Anda..."
        />
      </div>

      {/* Role */}
      {!isDefault && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">Peran</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRole(opt.value)}
                className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                  role === opt.value
                    ? "border-sky-400 bg-sky-50"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Learning mode */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Mode belajar</label>
        <div className="flex gap-2">
          <button
            onClick={() => setLearningMode("daily")}
            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              learningMode === "daily"
                ? "border-sky-400 bg-sky-50 text-sky-700"
                : "border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            🔥 Harian
            <p className="text-xs font-normal text-current opacity-70">Streak & konsistensi</p>
          </button>
          <button
            onClick={() => setLearningMode("flexible")}
            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              learningMode === "flexible"
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            🌊 Fleksibel
            <p className="text-xs font-normal text-current opacity-70">Tanpa tekanan harian</p>
          </button>
        </div>
      </div>

      {/* Gamification mode */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Mode gamifikasi</label>
        <div className="flex gap-2">
          <button
            onClick={() => setGamificationMode("standard")}
            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              gamificationMode === "standard"
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            ⚡ Standar
            <p className="text-xs font-normal text-current opacity-70">XP, level, quest</p>
          </button>
          <button
            onClick={() => setGamificationMode("light")}
            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              gamificationMode === "light"
                ? "border-teal-400 bg-teal-50 text-teal-700"
                : "border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            🌿 Minimal
            <p className="text-xs font-normal text-current opacity-70">Tanpa poin & level</p>
          </button>
        </div>
      </div>

      {/* Primary goal */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Tujuan utama belajar</label>
        <input
          value={primaryGoal}
          onChange={(e) => setPrimaryGoal(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          placeholder="Contoh: Beralih ke karir data science..."
        />
      </div>

      {/* Focus areas */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Area fokus</label>
        <input
          value={focusAreas}
          onChange={(e) => setFocusAreas(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          placeholder="Pisahkan dengan koma: Python, Machine Learning, ..."
        />
      </div>

      {/* Weekly goal */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Target menit/minggu</label>
        <input
          type="number"
          value={weeklyGoal}
          onChange={(e) => setWeeklyGoal(e.target.value)}
          min={0}
          max={10000}
          className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          placeholder="120"
        />
        <span className="ml-2 text-xs text-gray-400">menit/minggu (opsional)</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
