"use client";

import { useState } from "react";
import TagPicker, { type TagGroup } from "@/components/ui/TagPicker";
import { CANONICAL_SKILLS } from "@/lib/skillTaxonomy";
import {
  PREDEFINED_GOALS,
  USER_ROLE_OPTIONS,
  ROLE_SKILL_SUGGESTIONS,
  buildOnboardedProfile,
} from "@/lib/utils/onboarding";
import type { AccountProfile, UserRole } from "@/lib/accountTypes";

// ─── Skill groups for step 3 ──────────────────────────────────────────────────

const SKILL_CATEGORY_EMOJI: Record<string, string> = {
  Business: "💼",
  Technical: "💻",
  Personal: "🧑",
  Finance: "💰",
};

const SKILL_GROUPS: TagGroup[] = Array.from(
  CANONICAL_SKILLS.reduce((map, skill) => {
    if (!map.has(skill.category)) map.set(skill.category, []);
    map.get(skill.category)!.push(skill.name);
    return map;
  }, new Map<string, string[]>())
).map(([category, names]) => ({
  groupKey: category,
  groupLabel: category,
  groupEmoji: SKILL_CATEGORY_EMOJI[category] ?? "📌",
  options: names,
}));

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  account: AccountProfile;
  onComplete: (updated: AccountProfile) => void;
  onSkip: () => void;
  editMode?: boolean;
}

// ─── Step titles ──────────────────────────────────────────────────────────────

const STEP_TITLES: Record<1 | 2 | 3, string> = {
  1: "Siapa kamu?",
  2: "Apa tujuanmu belajar?",
  3: "Skill apa yang ingin kamu kuasai?",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingFlow({ account, onComplete, onSkip, editMode }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userRole, setUserRole] = useState<UserRole | null>(account.userRole ?? null);
  const [selectedGoal, setSelectedGoal] = useState<string>(account.primaryGoal ?? "");
  const [customGoal, setCustomGoal] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>(account.focusAreas ?? []);

  const primaryGoal = customGoal.trim() || selectedGoal;

  function handleContinue() {
    if (step < 3) {
      setStep((s) => (s + 1) as 2 | 3);
    } else {
      onComplete(buildOnboardedProfile(account, userRole ?? "profesional", primaryGoal, focusAreas));
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2);
  }

  function handleSkip() {
    onComplete({ ...account, onboardingCompleted: true });
  }

  function addSuggestion(skill: string) {
    if (!focusAreas.includes(skill)) {
      setFocusAreas((prev) => [...prev, skill]);
    }
  }

  const canContinue = step === 1 ? userRole !== null : true;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-line rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md animate-scale-up">

        {/* ── Gradient Header ── */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 border-b border-line">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">
            {editMode ? "Edit Preferensi Belajar" : "Selamat Datang di SkillFlow"}
          </p>
          <h2 className="text-text text-xl font-bold mt-1">{STEP_TITLES[step]}</h2>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center justify-center gap-2 py-4 border-b border-line">
          {([1, 2, 3] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s === step
                  ? "bg-indigo-sleek text-white ring-2 ring-indigo-500/20"
                  : s < step
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "bg-white/5 text-text-mute border border-line"
              }`}>
                {s < step ? "✓" : s}
              </div>
              {i < 2 && (
                <div className={`w-8 h-0.5 rounded transition-all ${s < step ? "bg-indigo-500/50" : "bg-line"}`} />
              )}
            </div>
          ))}
          <p className="text-xs text-text-mute ml-2">Langkah {step} dari 3</p>
        </div>

        {/* ── Step Content ── */}
        <div className="p-6 min-h-[260px]">

          {/* Step 1 — Peran */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {USER_ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUserRole(opt.value)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    userRole === opt.value
                      ? "border-indigo-500 bg-indigo-500/10 text-text shadow-glow-indigo"
                      : "border-line bg-white/5 text-text hover:border-indigo-500/30 hover:bg-white/10"
                  }`}
                >
                  <span className="text-2xl block mb-2">{opt.emoji}</span>
                  <p className="text-sm font-bold text-text">{opt.label}</p>
                  <p className="text-xs text-text-mute mt-0.5 leading-tight">{opt.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Tujuan */}
          {step === 2 && (
            <div className="space-y-2">
              {PREDEFINED_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setCustomGoal("");
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    selectedGoal === goal && !customGoal
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-line bg-white/5 text-text-dim hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
                  }`}
                >
                  {goal}
                </button>
              ))}
              <div className="pt-1">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => {
                    setCustomGoal(e.target.value);
                    if (e.target.value) setSelectedGoal("");
                  }}
                  placeholder="Atau tuliskan tujuanmu sendiri..."
                  className="w-full border border-line bg-white/5 rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Step 3 — Skill Interests */}
          {step === 3 && (
            <div className="space-y-4">
              <TagPicker
                value={focusAreas}
                onChange={setFocusAreas}
                groups={SKILL_GROUPS}
                placeholder="Cari skill dari daftar atau tambah kustom..."
                accentColor="violet"
                maxTags={3}
              />
              <p className="text-xs text-text-mute">
                Pilih maksimal 3 skill target utama untuk mempersonalisasi cockpit belajarmu.
              </p>

              {/* Quick-add suggestions based on role */}
              {userRole && (
                <div>
                  <p className="text-xs font-semibold text-text-mute uppercase tracking-wide mb-2">
                    Rekomendasi untuk {USER_ROLE_OPTIONS.find((o) => o.value === userRole)?.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_SKILL_SUGGESTIONS[userRole].map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSuggestion(skill)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                          focusAreas.includes(skill)
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
                        }`}
                      >
                        {focusAreas.includes(skill) ? "✓ " : "+ "}{skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {/* Back button */}
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-text-mute hover:text-text transition-colors cursor-pointer"
            >
              ← Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-text-mute hover:text-text transition-colors cursor-pointer"
            >
              Lewati
            </button>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="bg-indigo-sleek text-white font-semibold text-sm px-6 py-2.5 rounded-xl border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 cursor-pointer"
          >
            {step === 3
              ? editMode
                ? "Simpan Perubahan →"
                : "Mulai Belajar →"
              : "Lanjut →"}
          </button>
        </div>
      </div>
    </div>
  );
}
