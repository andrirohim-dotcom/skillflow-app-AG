"use client";

import { useMemo } from "react";
import { getCockpitRecommendations } from "@/lib/utils/recommendations";
import type { LearningSource, LearningSession, KeyInsight, SkillProgress } from "@/lib/types";
import type { Profile } from "@/lib/types/profile";

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

  if (profile && !profile.onboardingCompleted) {
    return (
      <div className="bg-surface/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-5 shadow-lg animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🎯</span>
          <div>
            <h3 className="font-bold text-text text-sm">Rekomendasi Personal Belum Aktif</h3>
            <p className="text-xs text-text-dim mt-1 mb-3 leading-relaxed">
              Selesaikan pengaturan awal untuk mendapatkan rekomendasi belajar yang sesuai dengan cockpit personalmu.
            </p>
            <button
              onClick={onStartOnboarding}
              className="text-xs font-semibold text-indigo-2 hover:text-indigo-sleek px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
            >
              Atur Preferensi →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-surface/40 backdrop-blur-md border border-line rounded-2xl p-5 shadow-lg animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">✨</span>
          <div>
            <h3 className="font-bold text-text text-sm">Cockpit Belajar</h3>
            <p className="text-xs text-text-dim mt-1">
              Tambahkan sumber belajar baru untuk mendapatkan rekomendasi langkah selanjutnya.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface/40 backdrop-blur-md border border-line rounded-2xl shadow-lg overflow-hidden animate-fade-in">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-text">✨ Rekomendasi Cockpit</h3>
        <span className="text-[10px] font-black text-text-mute uppercase tracking-widest">berdasarkan target skill</span>
      </div>

      <div className="divide-y divide-line">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="px-4 py-4 flex items-start gap-4 hover:bg-white/5 transition-colors group"
          >
            <span className="text-2xl shrink-0 mt-0.5 grayscale group-hover:grayscale-0 transition-all">
              {TYPE_EMOJI[rec.type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-tighter text-indigo-2 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  {rec.type}
                </span>
                <p className="text-xs text-text-mute font-medium truncate">{rec.reason}</p>
              </div>
              <p className="text-sm font-bold text-text leading-snug break-words">{rec.title}</p>
              <p className="text-xs text-text-dim mt-1 line-clamp-2 leading-relaxed">{rec.description}</p>
              
              <div className="mt-3">
                <a
                  href={rec.cta.href}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-2 hover:text-indigo-sleek transition-colors"
                >
                  {rec.cta.label} <span className="text-lg leading-none">→</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-white/5 border-t border-line">
        <p className="text-[10px] text-text-mute font-medium italic">
          Rekomendasi diperbarui secara otomatis berdasarkan aktivitas belajarmu.
        </p>
      </div>
    </div>
  );
}
