"use client";

import { useState } from "react";
import { Stat } from "./SleekPrimitives";

interface Props {
  activeSources: number;
  weeklyMinutes: number;
  totalSkills: number;
  currentStreak: number;
  longestStreak: number;
  completedActionsThisWeek: number;
  insightsThisWeek: number;
  weeklyXP?: number;
}

const PRIMARY_LABELS = ["Streak Sekarang", "Volume Minggu Ini", "Action Selesai", "XP Minggu Ini"];

export default function KpiBar({
  activeSources,
  weeklyMinutes,
  totalSkills,
  currentStreak,
  longestStreak,
  completedActionsThisWeek,
  insightsThisWeek,
  weeklyXP = 0,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Map the parameters to the sleek mockup cards
  const kpis = [
    {
      icon: "flame",
      value: currentStreak,
      label: "Streak Sekarang",
      unit: "hari",
      accent: "amber" as const,
      trend: 12, // Visual decoration from mockup
    },
    {
      icon: "clock",
      value: weeklyMinutes > 0 ? weeklyMinutes : 0,
      label: "Volume Minggu Ini",
      unit: "mnt",
      accent: "indigo" as const,
      trend: 8,
    },
    {
      icon: "check",
      value: completedActionsThisWeek,
      label: "Action Selesai",
      unit: "done",
      accent: "cyan" as const,
      trend: 5,
    },
    {
      icon: "bolt",
      value: weeklyXP > 0 ? weeklyXP.toLocaleString() : "0",
      label: "XP Minggu Ini",
      unit: "XP",
      accent: "indigo" as const,
      trend: 22,
    },
    {
      icon: "book",
      value: activeSources,
      label: "Sumber Aktif",
      unit: "src",
      accent: "cyan" as const,
    },
    {
      icon: "target",
      value: totalSkills,
      label: "Skill Dilacak",
      unit: "skill",
      accent: "indigo" as const,
    },
    {
      icon: "trophy",
      value: longestStreak,
      label: "Streak Terbaik",
      unit: "hari",
      accent: "amber" as const,
    },
    {
      icon: "lightbulb",
      value: insightsThisWeek,
      label: "Insight Dicatat",
      unit: "ins",
      accent: "cyan" as const,
    },
  ];

  const visible = isCollapsed
    ? kpis.filter((k) => PRIMARY_LABELS.includes(k.label))
    : kpis;

  return (
    <div className="space-y-3.5 mb-6">
      <div
        className={`grid gap-4 ${
          isCollapsed
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
        }`}
      >
        {visible.map((kpi) => (
          <Stat
            key={kpi.label}
            icon={kpi.icon}
            value={kpi.value}
            label={kpi.label}
            unit={kpi.unit}
            accent={kpi.accent}
            trend={kpi.trend}
          />
        ))}
      </div>
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="mono text-[10px] text-text-mute hover:text-text-dim transition-colors uppercase tracking-wider"
      >
        {isCollapsed ? "Tampilkan Semua Metrik →" : "Sembunyikan ↑"}
      </button>
    </div>
  );
}
