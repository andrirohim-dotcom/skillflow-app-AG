"use client";

import { useEffect, useState } from "react";
import type { LearningSession, SkillProgress } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  sessions: LearningSession[];
  skillProgress: SkillProgress[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailySummaryBanner({ sessions, skillProgress }: Props) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `daily_banner_dismissed_${today}`;
    setDismissed(sessionStorage.getItem(key) === "1");
    setMounted(true);
  }, []);

  if (!mounted || dismissed) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = (sessions || []).filter((s) => s.date && s.date.slice(0, 10) === today);
  const totalMins = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const uniqueSources = new Set(todaySessions.map((s) => s.sourceId)).size;
  const skillUpgrades = skillProgress.filter(
    (sp) => sp.levelAchievedAt?.slice(0, 10) === today
  ).length;
  const hasActivity = todaySessions.length > 0;

  function handleDismiss() {
    const today = new Date().toISOString().slice(0, 10);
    sessionStorage.setItem(`daily_banner_dismissed_${today}`, "1");
    setDismissed(true);
  }

  const message = hasActivity
    ? `Hari ini kamu belajar ${totalMins} menit dari ${uniqueSources} sumber${
        skillUpgrades > 0 ? ` dan meningkatkan ${skillUpgrades} skill` : ""
      }. Keren!`
    : "Belum ada sesi hari ini. Yuk mulai belajar!";

  const icon = hasActivity ? "📚" : "💡";

  return (
    <div
      className={`bg-gradient-to-r ${
        hasActivity ? "from-sky-50 to-emerald-50 border-sky-200" : "from-gray-50 to-sky-50 border-gray-200"
      } border rounded-2xl px-4 py-3 flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-wrap sm:flex-nowrap">
        <span className="text-xl shrink-0">{icon}</span>
        <p className={`text-sm font-medium leading-snug ${hasActivity ? "text-sky-800" : "text-gray-600"}`}>
          {message}
        </p>
        {!hasActivity && (
          <a
            href="/dashboard/sources"
            className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-100/50 hover:bg-sky-100 px-3 py-1.5 rounded-xl transition-all ml-1 whitespace-nowrap shadow-sm border border-sky-200/50 active:scale-95"
          >
            Mulai Belajar Sekarang →
          </a>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-gray-400 hover:text-gray-600 text-xs transition-colors"
        aria-label="Tutup"
      >
        ✕
      </button>
    </div>
  );
}
