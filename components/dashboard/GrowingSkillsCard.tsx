"use client";

import { useMemo } from "react";
import {
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_COLORS,
} from "@/lib/constants";
import { getSkillMastery } from "@/lib/utils/analytics";
import type { SkillProgress, LearningSession } from "@/lib/types";

interface Props {
  skillProgress: SkillProgress[];
  sessions: LearningSession[];
}

export default function GrowingSkillsCard({ skillProgress, sessions }: Props) {
  // Find skills with activity this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const skillsWithWeeklyActivity = useMemo(() => {
    const skillsWithSessions = new Map<string, number>();

    // Count sessions per skill from the last 7 days
    sessions.forEach((session) => {
      if (new Date(session.date) >= weekAgo) {
        const skill = skillProgress.find((sp) => sp.sourceId === session.sourceId);
        if (skill) {
          skillsWithSessions.set(skill.skillName, (skillsWithSessions.get(skill.skillName) ?? 0) + 1);
        }
      }
    });

    // Get unique skills and sort by activity
    return Array.from(skillsWithSessions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([skillName]) => skillProgress.find((sp) => sp.skillName === skillName))
      .filter(Boolean) as SkillProgress[];
  }, [skillProgress, sessions]);

  if (skillsWithWeeklyActivity.length === 0) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-violet-600 mb-2">🌱 SKILL YANG TUMBUH</p>
        <p className="text-sm text-gray-600">Mulai belajar minggu ini untuk melihat skill berkembang!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-violet-600 mb-3">🌱 SKILL YANG TUMBUH</p>

      <div className="space-y-3">
        {skillsWithWeeklyActivity.map((skill) => {
          const mastery = getSkillMastery(skill);
          const level = skill.level ?? "awareness";
          const completedItems = skill.actionItems.filter((ai) => ai.completed).length;
          const totalItems = skill.actionItems.length;

          return (
            <div key={skill.id} className="bg-white/60 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{skill.skillName}</p>
                  <p className={`text-xs font-medium ${SKILL_LEVEL_COLORS[level]}`}>
                    {SKILL_LEVEL_LABELS[level]}
                  </p>
                </div>
                <span className="text-2xl font-black text-violet-600">{mastery}%</span>
              </div>

              {totalItems > 0 && (
                <div className="text-xs text-gray-500">
                  {completedItems}/{totalItems} action items selesai
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
