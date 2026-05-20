"use client";

import { useEffect, useState } from "react";

// ─── Tip Selection ────────────────────────────────────────────────────────────

function getCoachingTip({
  insightsThisWeek,
  pendingActionItems,
  totalSessions,
  weeklyMinutes,
  weeklyGoal,
}: {
  insightsThisWeek: number;
  pendingActionItems: number;
  totalSessions: number;
  weeklyMinutes: number;
  weeklyGoal?: number;
}): string | null {
  if (insightsThisWeek === 0) {
    return "Belum ada insight minggu ini. Coba catat 1 hal menarik dari sesi terakhirmu.";
  }
  if (pendingActionItems > 3) {
    return `Ada ${pendingActionItems} action items yang menunggu. Pilih 1 untuk dikerjakan hari ini.`;
  }
  for (const m of [10, 50]) {
    const remaining = m - totalSessions;
    if (remaining > 0 && remaining <= 3) {
      return `Tinggal ${remaining} sesi lagi untuk milestone ${m} sesi! 🎯`;
    }
  }
  if (weeklyGoal && weeklyGoal > 0 && weeklyMinutes / weeklyGoal < 0.5) {
    return `Minggu ini: ${weeklyMinutes}/${weeklyGoal} mnt. Yuk kejar targetmu!`;
  }
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  insightsThisWeek: number;
  pendingActionItems: number;
  totalSessions: number;
  weeklyMinutes: number;
  weeklyGoal?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoachingCard(props: Props) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `coaching_dismissed_${today}`;
    const isDismissed = sessionStorage.getItem(key) === "1";
    setDismissed(isDismissed);
    setMounted(true);
  }, []);

  const tip = getCoachingTip(props);

  if (!mounted || dismissed || !tip) return null;

  const handleDismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    sessionStorage.setItem(`coaching_dismissed_${today}`, "1");
    setDismissed(true);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="text-lg shrink-0 mt-0.5">🧭</span>
        <p className="text-sm text-amber-800 leading-snug">{tip}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-amber-400 hover:text-amber-600 text-xs mt-0.5 transition-colors"
        aria-label="Tutup"
      >
        ✕
      </button>
    </div>
  );
}
