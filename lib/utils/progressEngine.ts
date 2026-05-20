/**
 * PROGRESS ENGINE - Evidence-Based Learning Momentum
 *
 * Replaces consumption-based progress tracking with evidence aggregation:
 * - Insight density + completion velocity = learning momentum
 * - Skill level = calculated from evidence, not manual
 * - Next best action = intelligent ranking by urgency + momentum + quick-win potential
 * - Stagnation detection = identifies skills that need attention
 *
 * SAFE TO RUN: All functions are pure (no side effects). Use in selectors, memoized.
 *
 * Usage:
 *   const momentum = calculateLearningMomentum(skillProgress, evidence, sessions);
 *   const level = calculateSkillLevelFromEvidence(skillProgress, evidence);
 *   const nextAction = getNextBestAction(allSkills, evidence, sessions, sources);
 */

import type { SkillProgress, ActionItem, Evidence } from "../types.refactored";
import type { LearningSession, LearningSource } from "../types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface MomentumState {
  momentum: "accelerating" | "steady" | "declining" | "stagnant";
  score: number; // 0–100
  daysSinceLastActivity: number;
  recentInsights: number;
  recentCompletions: number;
  streak: number; // Consecutive days with activity
  trendDirection: number; // -1 (declining), 0 (neutral), +1 (accelerating)
}

export interface StagnationState {
  isStagnant: boolean;
  daysSinceActivity: number;
  lastActivityDate: Date | null;
}

export interface NextBestActionResult {
  action: ActionItem;
  skillId: string;
  skillName: string;
  reasoning: string;
  score: number;
  components: {
    skillUrgency: number;
    actionMomentum: number;
    quickWin: number;
    evidenceGap: number;
  };
}

export type SkillLevel = "awareness" | "understanding" | "applied" | "mastered";

// ─── EVIDENCE-BASED SKILL LEVEL ────────────────────────────────────────────

/**
 * Calculate skill level from evidence, not manual input.
 *
 * Progression path:
 * - "awareness" (0–4 evidence points) — just started learning
 * - "understanding" (5–14 points OR ≥2 completed actions) — understand concepts
 * - "applied" (15–29 points AND ≥5 completed actions AND ≥2 sources) — can apply in context
 * - "mastered" (≥30 points AND ≥10 completed actions AND ≥3 sources AND milestone) — expert level
 */
export function calculateSkillLevelFromEvidence(
  skillProgress: SkillProgress,
  evidence: Evidence[]
): SkillLevel {
  if (!skillProgress) return "awareness";

  // Count evidence weighted by type
  const skillEvidence = evidence.filter((e) => e.skillId === skillProgress.skillId);
  const evidenceScore = skillEvidence.reduce((sum, e) => sum + (e.weight || 1), 0);

  // Count completed actions
  const completedActions = skillProgress.actionItems?.filter((a) => a.completed).length || 0;

  // Count sources teaching this skill
  const sourceCount = skillProgress.sourceIds?.length || 0;

  // Has user explicitly marked a milestone for this skill?
  const hasMilestone = skillEvidence.some((e) => e.type === "milestone");

  // Determine level based on thresholds
  if (evidenceScore >= 30 && completedActions >= 10 && sourceCount >= 3 && hasMilestone) {
    return "mastered";
  } else if (evidenceScore >= 15 && completedActions >= 5 && sourceCount >= 2) {
    return "applied";
  } else if (evidenceScore >= 5 || completedActions >= 2) {
    return "understanding";
  } else {
    return "awareness";
  }
}

// ─── LEARNING MOMENTUM ─────────────────────────────────────────────────────

/**
 * Calculate momentum = learning velocity + consistency.
 *
 * Combines:
 * 1. Insight density (insights per 7 days)
 * 2. Completion velocity (actions completed per 7 days)
 * 3. Session streak (consecutive days with skill activity)
 * 4. Trend (accelerating vs declining)
 */
export function calculateLearningMomentum(
  skillProgress: SkillProgress,
  evidence: Evidence[],
  sessions: LearningSession[] = [],
  now: Date = new Date()
): MomentumState {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Insight density: insights per 7 days
  const recentInsights = evidence
    .filter((e) => e.skillId === skillProgress.skillId && e.type === "insight")
    .filter((e) => new Date(e.createdAt) >= sevenDaysAgo).length;

  const priorInsights = evidence
    .filter((e) => e.skillId === skillProgress.skillId && e.type === "insight")
    .filter(
      (e) =>
        new Date(e.createdAt) >= fourteenDaysAgo && new Date(e.createdAt) < sevenDaysAgo
    ).length;

  // Completion velocity: actions per 7 days
  const recentCompletions = skillProgress.actionItems
    ?.filter((a) => a.completedAt && new Date(a.completedAt) >= sevenDaysAgo).length || 0;

  const priorCompletions = skillProgress.actionItems
    ?.filter(
      (a) =>
        a.completedAt &&
        new Date(a.completedAt) >= fourteenDaysAgo &&
        new Date(a.completedAt) < sevenDaysAgo
    ).length || 0;

  // Session streak: consecutive days with this skill activity
  const streak = calculateActivityStreak(
    skillProgress.skillId,
    evidence,
    sessions,
    now
  );

  // Days since last activity
  const { daysSinceActivity: daysSinceLastActivity } = detectStagnation(
    skillProgress,
    evidence,
    now
  );

  // Trend direction
  const insightTrend = recentInsights - priorInsights;
  const completionTrend = recentCompletions - priorCompletions;
  const trendDirection =
    insightTrend > 0 || completionTrend > 0
      ? 1
      : insightTrend < 0 || completionTrend < 0
        ? -1
        : 0;

  // Composite score (normalized 0–100)
  let score = 0;
  score += Math.min(recentInsights * 15, 45); // Max 3 insights/week = 45 points
  score += Math.min(recentCompletions * 10, 50); // Max 5 completions/week = 50 points
  score += Math.min(streak, 7) * 3; // Max 7-day streak = 21 points

  // Trend boost/penalty
  if (trendDirection > 0) {
    score += 10; // Accelerating
  } else if (trendDirection < 0) {
    score -= 10; // Declining
  }

  score = Math.min(100, Math.max(0, score));

  // Determine momentum state
  let momentum: "accelerating" | "steady" | "declining" | "stagnant";
  if (daysSinceLastActivity > 14) {
    momentum = "stagnant";
  } else if (trendDirection > 0) {
    momentum = "accelerating";
  } else if (trendDirection < 0) {
    momentum = "declining";
  } else {
    momentum = "steady";
  }

  return {
    momentum,
    score,
    daysSinceLastActivity,
    recentInsights,
    recentCompletions,
    streak,
    trendDirection,
  };
}

// ─── STAGNATION DETECTION ─────────────────────────────────────────────────

/**
 * Detect skills that have gone idle.
 * Used to prioritize "restart" actions.
 *
 * Stagnant = no activity for >14 days
 */
export function detectStagnation(
  skillProgress: SkillProgress,
  evidence: Evidence[],
  now: Date = new Date(),
  thresholdDays: number = 14
): StagnationState {
  const skillEvidence = evidence.filter((e) => e.skillId === skillProgress.skillId);

  if (skillEvidence.length === 0) {
    return {
      isStagnant: true,
      daysSinceActivity: Infinity,
      lastActivityDate: null,
    };
  }

  const lastActivityDate = new Date(
    Math.max(...skillEvidence.map((e) => new Date(e.createdAt).getTime()))
  );
  const daysSinceActivity = Math.floor(
    (now.getTime() - lastActivityDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  return {
    isStagnant: daysSinceActivity > thresholdDays,
    daysSinceActivity,
    lastActivityDate,
  };
}

// ─── NEXT BEST ACTION RANKING ─────────────────────────────────────────────

/**
 * Score and rank all incomplete actions across all skills.
 * Returns the single highest-value action to do next.
 *
 * Ranking factors:
 * 1. Skill Urgency (40%) — stagnant skills need attention
 * 2. Action Momentum (30%) — capitalize on active sources
 * 3. Quick-Win Potential (20%) — actions from recently-used sources
 * 4. Evidence Gaps (10%) — missing proof points for level advancement
 */
export function getNextBestAction(
  allSkillProgress: SkillProgress[],
  allEvidence: Evidence[],
  allSessions: LearningSession[] = [],
  allSources: LearningSource[] = [],
  now: Date = new Date()
): NextBestActionResult | null {
  const scoredActions: NextBestActionResult[] = [];

  // For each skill, score its incomplete actions
  for (const skill of allSkillProgress) {
    if (!skill.actionItems || skill.actionItems.length === 0) {
      continue;
    }

    const momentum = calculateLearningMomentum(skill, allEvidence, allSessions, now);
    const stagnation = detectStagnation(skill, allEvidence, now);
    const currentLevel = skill.level || "awareness";
    const nextLevel = getNextSkillLevel(currentLevel);

    // ─── Factor 1: Skill Urgency (40%) ────────────────────────────
    // Stagnant skills are most urgent; accelerating skills are lowest priority
    let skillUrgency = 0;
    if (stagnation.isStagnant) {
      skillUrgency = 40; // Full weight — needs restart
    } else if (momentum.momentum === "declining") {
      skillUrgency = 25; // Losing momentum
    } else if (momentum.momentum === "steady") {
      skillUrgency = 15; // Maintaining
    } else if (momentum.momentum === "accelerating") {
      skillUrgency = 5; // Already rolling — lower priority
    }

    // ─── Factor 4: Evidence Gap (10%) ─────────────────────────────
    // Missing proof points to advance to next level?
    let evidenceGap = 0;
    const levelIndex = ["awareness", "understanding", "applied", "mastered"].indexOf(currentLevel);
    const nextLevelThresholds = [5, 15, 30]; // Evidence point thresholds
    if (levelIndex < 3) {
      const currentEvidenceScore = allEvidence
        .filter((e) => e.skillId === skill.skillId)
        .reduce((sum, e) => sum + (e.weight || 1), 0);
      if (currentEvidenceScore < nextLevelThresholds[levelIndex]) {
        evidenceGap = 10; // Need more evidence
      }
    }

    // For each incomplete action in this skill
    for (const action of skill.actionItems.filter((a) => !a.completed)) {
      // ─── Factor 2: Action Momentum (30%) ──────────────────────────
      // Is user actively consuming sources this action comes from?
      let actionMomentum = 0;
      const activeSources = (action.sourceIds || [])
        .map((sid) => allSources.find((s) => s.id === sid))
        .filter(
          (s) =>
            s &&
            s.progress &&
            ((s.progress.type === "book" && (s.progress as any).currentPage > 0) ||
              (s.progress.type === "youtube" && (s.progress as any).watchedMinutes > 0) ||
              (s.progress.type === "podcast" && (s.progress as any).watchedMinutes > 0) ||
              (s.progress.type === "article" && (s.progress as any).readPercentage > 0) ||
              (s.progress.type === "course" && (s.progress as any).completedModules > 0))
        );
      if (activeSources.length > 0) {
        actionMomentum = Math.min(30, activeSources.length * 15); // Up to 30 points
      }

      // ─── Factor 3: Quick-Win Potential (20%) ──────────────────────
      // Actions from recently-used sources score higher
      let quickWin = 0;
      const recentThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentSessions = allSessions.filter(
        (s) => new Date(s.date || "") >= recentThreshold
      );
      for (const sourceId of action.sourceIds || []) {
        if (recentSessions.some((s) => s.sourceId === sourceId)) {
          quickWin += 10; // Source used in last 7 days
        }
      }
      quickWin = Math.min(20, quickWin);

      // ─── Composite Score ──────────────────────────────────────────
      const score = skillUrgency * 0.4 + actionMomentum * 0.3 + quickWin * 0.2 + evidenceGap * 0.1;

      // ─── Reasoning ────────────────────────────────────────────────
      let reasoning = "Aksi penting untuk skill ini.";
      if (skillUrgency > 30) {
        reasoning = "Skill sedang tidak aktif — waktu untuk kembali.";
      } else if (actionMomentum > 20) {
        reasoning = "Kamu sedang aktif belajar skill ini — lanjutkan momentum.";
      } else if (quickWin > 10) {
        reasoning = "Sumber terkait sedang dipelajari — lakukan sekarang.";
      } else if (evidenceGap > 5) {
        reasoning = `Bukti lebih diperlukan untuk mencapai level "${nextLevel}".`;
      }

      scoredActions.push({
        action,
        skillId: skill.skillId,
        skillName: skill.id, // TODO: resolve from skill taxonomy
        reasoning,
        score,
        components: {
          skillUrgency,
          actionMomentum,
          quickWin,
          evidenceGap,
        },
      });
    }
  }

  if (scoredActions.length === 0) {
    return null;
  }

  // Return highest-scored action
  return scoredActions.sort((a, b) => b.score - a.score)[0];
}

// ─── HELPERS ───────────────────────────────────────────────────────────────

/**
 * Calculate consecutive days with activity for a skill.
 */
function calculateActivityStreak(
  skillId: string,
  evidence: Evidence[],
  sessions: LearningSession[],
  now: Date
): number {
  const skillEvidence = evidence.filter((e) => e.skillId === skillId);
  const skillSessions = sessions.filter((s) =>
    (s as any).skillTags?.includes(skillId)
  );

  const activeDates = new Set<string>();

  // Collect dates from evidence
  for (const e of skillEvidence) {
    const date = new Date(e.createdAt);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    activeDates.add(dateStr);
  }

  // Collect dates from sessions
  for (const s of skillSessions) {
    const date = new Date(s.date || "");
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    activeDates.add(dateStr);
  }

  if (activeDates.size === 0) {
    return 0;
  }

  // Sort dates and count consecutive days from most recent
  const sortedDates = Array.from(activeDates).sort().reverse();
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysDiff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

/**
 * Get the next skill level in progression.
 */
function getNextSkillLevel(currentLevel: SkillLevel): SkillLevel {
  const progression: Record<SkillLevel, SkillLevel> = {
    awareness: "understanding",
    understanding: "applied",
    applied: "mastered",
    mastered: "mastered", // Cannot go beyond
  };
  return progression[currentLevel];
}

// ─── SUMMARY REPORT ────────────────────────────────────────────────────────

/**
 * Generate a learning progress report for a skill.
 * Used for dashboard summaries and skill detail pages.
 */
export function generateSkillSummary(
  skillProgress: SkillProgress,
  evidence: Evidence[],
  sessions: LearningSession[] = [],
  now: Date = new Date()
) {
  const calculatedLevel = calculateSkillLevelFromEvidence(skillProgress, evidence);
  const momentum = calculateLearningMomentum(skillProgress, evidence, sessions, now);
  const stagnation = detectStagnation(skillProgress, evidence, now);

  const skillEvidence = evidence.filter((e) => e.skillId === skillProgress.skillId);
  const completedActions = (skillProgress.actionItems || []).filter((a) => a.completed).length;
  const totalActions = (skillProgress.actionItems || []).length;

  return {
    skillId: skillProgress.skillId,
    level: calculatedLevel,
    momentum: momentum.momentum,
    momentumScore: momentum.score,
    isStagnant: stagnation.isStagnant,
    daysSinceActivity: stagnation.daysSinceActivity,
    evidenceCount: skillEvidence.length,
    actionsCompleted: completedActions,
    actionTotal: totalActions,
    sourceCount: (skillProgress.sourceIds || []).length,
    progressPercent: totalActions > 0 ? (completedActions / totalActions) * 100 : 0,
  };
}
