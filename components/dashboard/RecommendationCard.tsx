"use client";

import { useMemo } from "react";
import { SOURCE_TYPE_ICONS } from "@/lib/constants";
import { getCockpitRecommendations } from "@/lib/utils/recommendations";
import type { LearningSource, LearningSession, KeyInsight, SkillProgress } from "@/lib/types";
import type { Profile } from "@/lib/types/profile";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  sources: LearningSource[];
  sessions: LearningSession[];
  insights: KeyInsight[];
  skillProgress: SkillProgress[];
  profile: Profile | null;
  onStartOnboarding?: () => void;
}

const TYPE_EMOJI: Record<string, string> = {
  source: "📚",
  action: "✅",
  skill: "🎯",
  recovery: "🌱",
  insight: "💡",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecommendationCard({
  sources,
  sessions,
  insights,
  skillProgress,
  profile,
  onStartOnboarding,
}: Props) {
  const recommendations = useMemo(() => {
    if (!profile) return [];
    return getCockpitRecommendations(sources, sessions, insights, skillProgress, profile);
  }, [sources, sessions, insights, skillProgress, profile]);

  // ── Not onboarded: CTA to set up preferences ──────────────────────────────

  if (profile && !profile.onboardingCompleted) {
    return (
      <div className="bg-gradient-to-r from-violet-50 to-sky-50 border border-violet-100 rounded-2xl p-5 shadow-sm animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🎯</span>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Rekomendasi Personal Belum Aktif</h3>
            <p className="text-xs text-gray-500 mt-1 mb-3 leading-relaxed">
              Selesaikan pengaturan awal untuk mendapatkan rekomendasi belajar yang sesuai dengan cockpit personalmu.
            </p>
            <button
              onClick={onStartOnboarding}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 px-3 py-1.5 rounded-lg border border-violet-200 hover:border-violet-300 transition-colors"
            >
              Atur Preferensi →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── No matches ────────────────────────────────────────────────────────────

  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">✨</span>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Cockpit Belajar</h3>
            <p className="text-xs text-gray-500 mt-1">
              Tambahkan sumber belajar baru untuk mendapatkan rekomendasi langkah selanjutnya.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Recommendation list ───────────────────────────────────────────────────

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">✨ Rekomendasi Cockpit</h3>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">berdasarkan target skill</span>
      </div>

      <div className="divide-y divide-gray-50">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="px-4 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors group"
          >
            <span className="text-2xl shrink-0 mt-0.5 grayscale group-hover:grayscale-0 transition-all">
              {TYPE_EMOJI[rec.type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-tighter text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                  {rec.type}
                </span>
                <p className="text-xs text-gray-400 font-medium truncate">{rec.reason}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-snug break-words">{rec.title}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{rec.description}</p>
              
              <div className="mt-3">
                <a
                  href={rec.cta.href}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-violet-600 hover:text-violet-800 transition-colors"
                >
                  {rec.cta.label} <span className="text-lg leading-none">→</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-50">
        <p className="text-[10px] text-gray-400 font-medium italic">
          Rekomendasi diperbarui secara otomatis berdasarkan aktivitas belajarmu.
        </p>
      </div>
    </div>
  );
}
