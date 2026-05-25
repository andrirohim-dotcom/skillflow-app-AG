"use client";

/**
 * SkillLevelProgress — Shows criteria-based progress toward next skill level.
 * Displays animated progress bar + "X lagi untuk naik level" breakdown.
 */

import React, { useMemo } from "react";
import type { SkillProgress, KeyInsight, LearningSession, LearningSource } from "@/lib/types";

// ─── Skill Level Criteria ─────────────────────────────────────────────────────

export const SKILL_LEVEL_CRITERIA = {
  awareness_to_understanding: {
    insights: 3,
    actions: 2,
    sessions: 1,
  },
  understanding_to_applied: {
    insights: 7,
    actions: 5,
    reflections: 1,
    sessions: 3,
  },
  applied_to_mastered: {
    insights: 15,
    actions: 10,
    reflections: 3,
    sessions: 8,
    sourceComplete: 1,
  },
} as const;

type SkillLevel = "awareness" | "understanding" | "applied" | "mastered";

const LEVEL_ORDER: SkillLevel[] = ["awareness", "understanding", "applied", "mastered"];
const LEVEL_LABELS: Record<SkillLevel, string> = {
  awareness: "Awareness",
  understanding: "Pemahaman",
  applied: "Diterapkan",
  mastered: "Dikuasai",
};
const LEVEL_COLORS: Record<SkillLevel, string> = {
  awareness: "text-slate-400",
  understanding: "text-sky-400",
  applied: "text-emerald-400",
  mastered: "text-violet-400",
};
const LEVEL_PROGRESS_COLORS: Record<SkillLevel, string> = {
  awareness: "from-slate-500 to-sky-500",
  understanding: "from-sky-500 to-emerald-500",
  applied: "from-emerald-500 to-violet-500",
  mastered: "from-violet-500 to-amber-500",
};

interface CriteriaProgress {
  label: string;
  current: number;
  required: number;
  met: boolean;
}

interface Props {
  skill: SkillProgress;
  insights: KeyInsight[];
  sessions: LearningSession[];
  sources: LearningSource[];
  compact?: boolean;
}

export default function SkillLevelProgress({
  skill,
  insights,
  sessions,
  sources,
  compact = false,
}: Props) {
  const currentLevel = (skill.level ?? "awareness") as SkillLevel;
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);
  const isMastered = currentLevel === "mastered";

  // Filter data for this skill
  const skillInsights = useMemo(
    () => insights.filter((i) => i.skillTarget === skill.skillName || i.sourceId === skill.sourceId),
    [insights, skill]
  );

  const skillSessions = useMemo(
    () => sessions.filter((s) => s.sourceId === skill.sourceId && !s.isStreakShield),
    [sessions, skill]
  );

  const completedActions = skill.actionItems.filter((a) => a.completed).length;

  const reflections = useMemo(
    () =>
      skillInsights.filter(
        (i) => i.reflection && i.reflection.trim().split(/\s+/).length >= 10
      ).length,
    [skillInsights]
  );

  const sourceCompleted = useMemo(
    () =>
      sources.filter(
        (s) => s.id === skill.sourceId && s.status === "completed"
      ).length,
    [sources, skill]
  );

  // Determine criteria for next level
  const criteriaProgress = useMemo((): CriteriaProgress[] => {
    if (isMastered) return [];

    const transitionKey =
      currentLevel === "awareness"
        ? "awareness_to_understanding"
        : currentLevel === "understanding"
        ? "understanding_to_applied"
        : "applied_to_mastered";

    const criteria = SKILL_LEVEL_CRITERIA[transitionKey];
    const result: CriteriaProgress[] = [];

    result.push({
      label: "Insight",
      current: skillInsights.length,
      required: criteria.insights,
      met: skillInsights.length >= criteria.insights,
    });

    result.push({
      label: "Aksi selesai",
      current: completedActions,
      required: criteria.actions,
      met: completedActions >= criteria.actions,
    });

    result.push({
      label: "Sesi belajar",
      current: skillSessions.length,
      required: criteria.sessions,
      met: skillSessions.length >= criteria.sessions,
    });

    if ("reflections" in criteria && criteria.reflections > 0) {
      result.push({
        label: "Refleksi",
        current: reflections,
        required: criteria.reflections,
        met: reflections >= (criteria.reflections as number),
      });
    }

    if ("sourceComplete" in criteria && criteria.sourceComplete > 0) {
      result.push({
        label: "Sumber selesai",
        current: sourceCompleted,
        required: criteria.sourceComplete,
        met: sourceCompleted >= (criteria.sourceComplete as number),
      });
    }

    return result;
  }, [currentLevel, isMastered, skillInsights, completedActions, skillSessions, reflections, sourceCompleted]);

  // Overall progress toward next level
  const overallPct = useMemo(() => {
    if (isMastered || criteriaProgress.length === 0) return 100;
    const totalWeight = criteriaProgress.length;
    const metCount = criteriaProgress.filter((c) => c.met).length;
    // Also consider partial completion
    const partialSum = criteriaProgress.reduce((sum, c) => {
      return sum + Math.min(1, c.current / c.required);
    }, 0);
    return Math.round((partialSum / totalWeight) * 100);
  }, [criteriaProgress, isMastered]);

  const metCount = criteriaProgress.filter((c) => c.met).length;
  const nextLevel = !isMastered ? LEVEL_ORDER[currentIdx + 1] : null;

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${LEVEL_COLORS[currentLevel]}`}>
            {LEVEL_LABELS[currentLevel]}
          </span>
          {nextLevel && (
            <span className="text-text-mute">
              → {LEVEL_LABELS[nextLevel]} ({overallPct}%)
            </span>
          )}
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${LEVEL_PROGRESS_COLORS[currentLevel]} transition-all duration-700`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface/30 border border-white/8 backdrop-blur-md p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-white truncate">{skill.skillName}</h4>
          <p className="text-[11px] text-text-mute">{skill.category}</p>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 ${LEVEL_COLORS[currentLevel]}`}>
          {LEVEL_LABELS[currentLevel]}
        </div>
      </div>

      {isMastered ? (
        <div className="text-center py-2">
          <span className="text-2xl">💎</span>
          <p className="text-xs text-violet-300 font-semibold mt-1">Skill Dikuasai!</p>
        </div>
      ) : (
        <>
          {/* Overall Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-mute font-medium">
                Menuju {nextLevel ? LEVEL_LABELS[nextLevel] : ""}
              </span>
              <span className={`font-bold ${LEVEL_COLORS[currentLevel]}`}>{overallPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${LEVEL_PROGRESS_COLORS[currentLevel]} transition-all duration-700`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {/* Criteria Checklist */}
          <div className="space-y-1.5">
            {criteriaProgress.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      c.met
                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        : "bg-white/5 border-white/15"
                    }`}
                  >
                    {c.met && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium truncate ${c.met ? "text-text-mute line-through" : "text-text-dim"}`}>
                    {c.label}
                  </span>
                </div>
                <span className={`text-[11px] font-bold shrink-0 ${c.met ? "text-emerald-400" : "text-text-mute"}`}>
                  {Math.min(c.current, c.required)}/{c.required}
                </span>
              </div>
            ))}
          </div>

          {/* Summary pill */}
          <div className={`text-center text-[11px] font-semibold py-1.5 px-3 rounded-xl ${
            metCount === criteriaProgress.length
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
              : "bg-white/5 text-text-mute border border-white/5"
          }`}>
            {metCount === criteriaProgress.length
              ? "✅ Siap naik level!"
              : `${criteriaProgress.length - metCount} kriteria lagi`}
          </div>
        </>
      )}
    </div>
  );
}
