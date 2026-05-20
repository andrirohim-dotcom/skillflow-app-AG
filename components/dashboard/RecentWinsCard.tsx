"use client";

import { useMemo } from "react";
import { colorConfig } from "@/lib/utils/colorConfig";
import { SKILL_COLORS } from "@/lib/constants";
import type { SkillProgress } from "@/lib/types";

interface Props {
  skillProgress: SkillProgress[];
}

export default function RecentWinsCard({ skillProgress }: Props) {
  const recentCompletions = useMemo(() => {
    const allCompleted = skillProgress.flatMap((sp, si) =>
      sp.actionItems
        .filter((ai) => ai.completed && ai.completedAt)
        .map((ai) => ({
          text: ai.text,
          skillName: sp.skillName,
          completedAt: ai.completedAt || "",
          colorKey: SKILL_COLORS[si % SKILL_COLORS.length],
        }))
    );

    // Sort by completion date, most recent first, limit to 5
    return allCompleted
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5);
  }, [skillProgress]);

  const thisWeekCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    return skillProgress.flatMap((sp) =>
      sp.actionItems.filter(
        (ai) => ai.completed && ai.completedAt && new Date(ai.completedAt) >= weekAgo
      )
    ).length;
  }, [skillProgress]);

  if (recentCompletions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-emerald-600 mb-2">🏆 RECENT WINS</p>
        <p className="text-sm text-gray-600">Mulai selesaikan action items untuk lihat wins Anda di sini!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-semibold text-emerald-600">🏆 RECENT WINS</p>
        <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full">
          {thisWeekCount} minggu ini
        </span>
      </div>

      <div className="space-y-2">
        {recentCompletions.slice(0, 3).map((win, idx) => {
          const c = colorConfig[win.colorKey];
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-600 text-lg leading-none mt-0.5">✓</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 line-through">{win.text}</p>
                <p className={`text-xs font-semibold ${c.text}`}>{win.skillName}</p>
              </div>
            </div>
          );
        })}
      </div>

      {recentCompletions.length > 3 && (
        <p className="text-xs text-emerald-600 mt-3 pt-2 border-t border-emerald-200">
          +{recentCompletions.length - 3} lagi yang selesai
        </p>
      )}
    </div>
  );
}
