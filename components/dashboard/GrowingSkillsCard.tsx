"use client";

import { useMemo } from "react";
import { getSkillMastery } from "@/lib/utils/analytics";
import type { SkillProgress, LearningSession } from "@/lib/types";
import { Card, ProgressBar, Sparkline } from "./SleekPrimitives";

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

  // Compute 7-day sparkline trend data for each skill
  const getSkillTrend = (sourceId: string) => {
    const trend = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      
      const dayMins = sessions
        .filter((s) => s.sourceId === sourceId && s.date && s.date.slice(0, 10) === dStr)
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      trend.push(dayMins);
    }
    // Fallback if all 0 to make a slight slope
    if (trend.every((v) => v === 0)) {
      return [1, 2, 1, 3, 2, 4, 3];
    }
    return trend;
  };

  const getSubLabel = (level: string) => {
    switch (level) {
      case "awareness":
        return "Awareness";
      case "understanding":
        return "Understanding";
      case "applied":
        return "Applied";
      case "mastery":
        return "Mastery";
      default:
        return "Learning";
    }
  };

  if (skillsWithWeeklyActivity.length === 0) {
    return (
      <Card className="p-[22px]" id="tour-skills">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mono text-[10px] text-indigo-2 uppercase tracking-[0.12em] mb-1">
              Growing Skills
            </div>
            <div className="text-sm font-semibold text-text">Top 4 Minggu Ini</div>
          </div>
        </div>
        <div className="text-center py-6 text-xs text-text-mute">
          Mulai belajar minggu ini untuk melihat skill berkembang di dashboard!
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-[22px]" id="tour-skills">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[10px] text-indigo-2 uppercase tracking-[0.12em] mb-1">
            Growing Skills
          </div>
          <div className="text-sm font-semibold text-text">Top 4 Minggu Ini</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {skillsWithWeeklyActivity.map((skill, idx) => {
          const mastery = getSkillMastery(skill);
          const level = skill.level ?? "awareness";
          const sub = getSubLabel(level);
          const trend = getSkillTrend(skill.sourceId);
          
          // Rotate colors for visual variety
          const accents: ("indigo" | "cyan" | "amber")[] = ["indigo", "cyan", "indigo", "amber"];
          const accent = accents[idx % accents.length];

          return (
            <div key={skill.id} className="grid grid-cols-[1fr_100px] gap-4 items-center">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-text truncate">
                      {skill.skillName}
                    </span>
                    <span className={`chip py-0.5 px-1.5 text-[9px] ${
                      accent === "cyan" ? "text-cyan-2 border-cyan-2/20" : accent === "amber" ? "text-amber-2 border-amber-2/20" : "text-indigo-2 border-indigo-2/20"
                    }`}>
                      {sub}
                    </span>
                  </div>
                  <div className="mono text-[10px] text-text-mute shrink-0">
                    <span className="text-text font-bold">{mastery}</span>%
                  </div>
                </div>
                <ProgressBar value={mastery} max={100} accent={accent} height={4} />
              </div>
              <div className="flex justify-end select-none">
                <Sparkline data={trend} accent={accent} height={28} width={100} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
