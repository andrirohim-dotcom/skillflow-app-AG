"use client";

import { useMemo } from "react";
import type { SkillProgress } from "@/lib/types";
import { Card, Icon } from "./SleekPrimitives";

interface Props {
  skillProgress: SkillProgress[];
}

export default function RecentWinsCard({ skillProgress }: Props) {
  const recentCompletions = useMemo(() => {
    const allCompleted = skillProgress.flatMap((sp) =>
      sp.actionItems
        .filter((ai) => ai.completed && ai.completedAt)
        .map((ai) => ({
          text: ai.text,
          skillName: sp.skillName,
          completedAt: ai.completedAt || "",
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
      <Card className="p-[22px]" accent="cyan">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mono text-[10px] text-cyan-2 uppercase tracking-[0.12em] mb-1">
              Recent Wins
            </div>
            <div className="text-sm font-semibold text-text">Pencapaian Baru</div>
          </div>
        </div>
        <div className="text-xs text-text-mute text-center py-6">
          Selesaikan action items untuk melihat pencapaian Anda di sini!
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-[22px]" accent="cyan">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[10px] text-cyan-2 uppercase tracking-[0.12em] mb-1">
            Recent Wins
          </div>
          <div className="text-sm font-semibold text-text">Pencapaian Baru</div>
        </div>
        <span className="chip text-cyan-2 border-cyan-2/20">
          {thisWeekCount} minggu ini
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {recentCompletions.slice(0, 3).map((win, idx) => {
          return (
            <div key={idx} className="flex items-start gap-3 bg-white/[0.01] border border-white/5 p-2.5 rounded-xl">
              <div className="w-5 h-5 rounded bg-green-sleek/10 text-green-sleek flex items-center justify-center border border-green-sleek/20 mt-0.5">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-dim line-through truncate leading-normal">
                  {win.text}
                </p>
                <p className="mono text-[9px] text-indigo-2 mt-1 font-bold">
                  {win.skillName}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {recentCompletions.length > 3 && (
        <p className="mono text-[9px] text-text-mute mt-3 pt-2.5 border-t border-white/5 uppercase tracking-wide">
          +{recentCompletions.length - 3} pencapaian selesai lainnya
        </p>
      )}
    </Card>
  );
}
