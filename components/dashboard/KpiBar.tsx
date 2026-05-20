"use client";

import { useState } from "react";

interface KpiCardProps {
  icon: string;
  value: string | number;
  label: string;
  sub?: string;
  accent: string; // Tailwind bg class for left border color
  isEmpty?: boolean;
}

function KpiCard({ icon, value, label, sub, accent, isEmpty }: KpiCardProps) {
  const accentMap: Record<string, { bg: string; border: string; glow: string }> = {
    "bg-sky-500": { bg: "from-neon-cyan/20", border: "border-neon-cyan/40", glow: "shadow-glow-cyan" },
    "bg-violet-500": { bg: "from-neon-purple/20", border: "border-neon-purple/40", glow: "shadow-glow-purple" },
    "bg-emerald-500": { bg: "from-neon-lime/20", border: "border-neon-lime/40", glow: "" },
    "bg-orange-500": { bg: "from-neon-orange/20", border: "border-neon-orange/40", glow: "" },
    "bg-amber-500": { bg: "from-neon-gold/20", border: "border-neon-gold/40", glow: "" },
    "bg-teal-500": { bg: "from-neon-cyan/20", border: "border-neon-cyan/40", glow: "" },
    "bg-indigo-500": { bg: "from-neon-purple/20", border: "border-neon-purple/40", glow: "" },
  };

  const colors = accentMap[accent] || accentMap["bg-sky-500"];

  return (
    <div className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} shadow-card-sm hover:shadow-card-depth transition-shadow px-4 py-4 overflow-hidden flex flex-col gap-2 min-w-0`}>
      {/* Color accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accent}`} />

      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="min-w-0">
          <div
            className={`text-2xl font-display font-black leading-none tracking-tight ${
              isEmpty ? "text-text-secondary/50" : "text-text-primary"
            }`}
          >
            {value}
          </div>
          <div className="text-xs font-display font-bold text-text-secondary mt-2 leading-tight">{label}</div>
          {sub && (
            <div className="text-xs text-text-secondary/70 mt-1 leading-tight">{sub}</div>
          )}
        </div>
        <span className={`text-xl ${isEmpty ? "opacity-30" : "opacity-80"} shrink-0 transition-opacity`}>{icon}</span>
      </div>
    </div>
  );
}

interface Props {
  activeSources: number;
  weeklyMinutes: number;
  totalSkills: number;
  currentStreak: number;
  longestStreak: number;
  completedActionsThisWeek: number;
  insightsThisWeek: number;
}

const PRIMARY_LABELS = ["Sumber Aktif", "Volume Minggu Ini", "Streak Sekarang", "Action Selesai"];

export default function KpiBar({
  activeSources,
  weeklyMinutes,
  totalSkills,
  currentStreak,
  longestStreak,
  completedActionsThisWeek,
  insightsThisWeek,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const kpis: KpiCardProps[] = [
    {
      icon: "📚",
      value: activeSources,
      label: "Sumber Aktif",
      sub: activeSources === 0 ? "Belum ada" : `${activeSources} sedang berjalan`,
      accent: "bg-sky-500",
      isEmpty: activeSources === 0,
    },
    {
      icon: "⏱️",
      value: weeklyMinutes > 0 ? `${weeklyMinutes}m` : "0m",
      label: "Volume Minggu Ini",
      sub: weeklyMinutes === 0 ? "Belum ada sesi" : `${Math.round(weeklyMinutes / 60 * 10) / 10}j total`,
      accent: "bg-violet-500",
      isEmpty: weeklyMinutes === 0,
    },
    {
      icon: "🎯",
      value: totalSkills,
      label: "Skill Dilacak",
      sub: totalSkills === 0 ? "Belum ada skill" : `dari semua sumber`,
      accent: "bg-emerald-500",
      isEmpty: totalSkills === 0,
    },
    {
      icon: "🔥",
      value: currentStreak,
      label: "Streak Sekarang",
      sub: currentStreak === 0 ? "Mulai hari ini" : `${currentStreak} hari berturut`,
      accent: "bg-orange-500",
      isEmpty: currentStreak === 0,
    },
    {
      icon: "🏆",
      value: longestStreak,
      label: "Streak Terpanjang",
      sub: longestStreak === 0 ? "Belum ada" : `${longestStreak} hari`,
      accent: "bg-amber-500",
      isEmpty: longestStreak === 0,
    },
    {
      icon: "✅",
      value: completedActionsThisWeek,
      label: "Action Selesai",
      sub: "minggu ini",
      accent: "bg-teal-500",
      isEmpty: completedActionsThisWeek === 0,
    },
    {
      icon: "💡",
      value: insightsThisWeek,
      label: "Insight Dicatat",
      sub: "minggu ini",
      accent: "bg-indigo-500",
      isEmpty: insightsThisWeek === 0,
    },
  ];

  const visible = isCollapsed
    ? kpis.filter((k) => PRIMARY_LABELS.includes(k.label))
    : kpis;

  return (
    <div className="space-y-2">
      <div className={`grid gap-3 ${
        isCollapsed
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
      }`}>
        {visible.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {isCollapsed ? "Tampilkan semua metrik →" : "Sembunyikan ↑"}
      </button>
    </div>
  );
}
