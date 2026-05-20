import type { LearningSession, SkillProgress, KeyInsight, LearningSource, SourceTask } from "../types";
import { getSourceProgress } from "./sourceProgress";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// ─── KPI Computations ─────────────────────────────────────────────────────────

export function getActiveSources(sources: LearningSource[]): number {
  return sources.filter((s) => s.status === "in_progress").length;
}

export function getWeeklyMinutes(sessions: LearningSession[]): number {
  const start = nDaysAgo(6);
  return sessions
    .filter((s) => new Date(s.date) >= start)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function getTotalSkillsTracked(skillProgress: SkillProgress[]): number {
  return skillProgress.length;
}

export function getCurrentStreak(sessions: LearningSession[]): number {
  if (sessions.length === 0) return 0;
  const unique = uniqueSortedDates(sessions, "desc");
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86_400_000));
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  return countConsecutive(unique, "desc");
}

export function getLongestStreak(sessions: LearningSession[]): number {
  if (sessions.length === 0) return 0;
  const unique = uniqueSortedDates(sessions, "asc");
  let longest = 1, current = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff = (new Date(unique[i]).getTime() - new Date(unique[i - 1]).getTime()) / 86_400_000;
    current = Math.round(diff) === 1 ? current + 1 : 1;
    if (current > longest) longest = current;
  }
  return longest;
}

export function getCompletedActionItemsThisWeek(skillProgress: SkillProgress[]): number {
  const start = nDaysAgo(6);
  return skillProgress.flatMap((sp) => sp.actionItems)
    .filter((ai) => ai.completed && ai.completedAt && new Date(ai.completedAt) >= start).length;
}

export function getInsightsThisWeek(insights: KeyInsight[]): number {
  const start = nDaysAgo(6);
  return insights.filter((i) => new Date(i.createdAt) >= start).length;
}

// ─── Aggregate totals (all-time) ──────────────────────────────────────────────

export interface TotalStats {
  totalMinutes: number;
  totalSessions: number;
  totalInsights: number;
  completedActionItems: number;
  completedTasks: number;
  activeDays: number;
}

export function getTotalStats(
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[],
  tasks: SourceTask[]
): TotalStats {
  return {
    totalMinutes: sessions.reduce((s, ses) => s + ses.durationMinutes, 0),
    totalSessions: sessions.length,
    totalInsights: insights.length,
    completedActionItems: skillProgress.flatMap((sp) => sp.actionItems).filter((ai) => ai.completed).length,
    completedTasks: tasks.filter((t) => t.status === "done").length,
    activeDays: new Set(sessions.map((s) => s.date.slice(0, 10))).size,
  };
}

// ─── Activity grids ───────────────────────────────────────────────────────────

export interface DayActivity {
  date: string;
  label: string;
  shortLabel: string; // single letter e.g. "S"
  minutes: number;
  sessionCount: number;
  isToday: boolean;
}

function buildActivity(sessions: LearningSession[], days: number): DayActivity[] {
  const today = toDateStr(new Date());
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = toDateStr(d);
    const day = sessions.filter((s) => s.date.slice(0, 10) === dateStr);
    return {
      date: dateStr,
      label: DAY_LABELS[d.getDay()],
      shortLabel: DAY_LABELS[d.getDay()][0],
      minutes: day.reduce((sum, s) => sum + s.durationMinutes, 0),
      sessionCount: day.length,
      isToday: dateStr === today,
    };
  });
}

export function getWeeklyActivity(sessions: LearningSession[]): DayActivity[] {
  return buildActivity(sessions, 7);
}

export function getMonthlyActivity(sessions: LearningSession[]): DayActivity[] {
  return buildActivity(sessions, 30);
}

// ─── Consistency score ────────────────────────────────────────────────────────

export function getConsistencyScore(activity: DayActivity[]): number {
  if (activity.length === 0) return 0;
  const active = activity.filter((d) => d.minutes > 0).length;
  return Math.round((active / activity.length) * 100);
}

// ─── Weekly buckets for bar chart ────────────────────────────────────────────

export interface WeekBucket {
  label: string; // "Mg ke-1", or date range
  minutes: number;
  sessions: number;
}

export function getWeeklyBuckets(sessions: LearningSession[], weeks = 8): WeekBucket[] {
  return Array.from({ length: weeks }, (_, wi) => {
    const endDay = new Date();
    endDay.setDate(endDay.getDate() - wi * 7);
    endDay.setHours(23, 59, 59, 999);
    const startDay = new Date(endDay);
    startDay.setDate(startDay.getDate() - 6);
    startDay.setHours(0, 0, 0, 0);

    const bucket = sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= startDay && d <= endDay;
    });

    const label =
      wi === 0
        ? "Minggu ini"
        : wi === 1
        ? "Minggu lalu"
        : `${Math.round(wi + 1)} mg lalu`;

    return { label, minutes: bucket.reduce((s, ses) => s + ses.durationMinutes, 0), sessions: bucket.length };
  }).reverse();
}

// ─── Skill mastery ────────────────────────────────────────────────────────────

export function getSkillMastery(sp: SkillProgress): number {
  if (sp.actionItems.length === 0) return 0;
  return Math.round((sp.actionItems.filter((ai) => ai.completed).length / sp.actionItems.length) * 100);
}

// ─── Sort sources ─────────────────────────────────────────────────────────────

export type SortKey = "newest" | "least_progress" | "most_progress" | "most_active";

export function sortSources(sources: LearningSource[], key: SortKey, sessions: LearningSession[]): LearningSource[] {
  const copy = [...sources];
  switch (key) {
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "least_progress":
      return copy.sort((a, b) => getSourceProgress(a).pct - getSourceProgress(b).pct);
    case "most_progress":
      return copy.sort((a, b) => getSourceProgress(b).pct - getSourceProgress(a).pct);
    case "most_active":
      return copy.sort((a, b) => {
        const lastA = sessions.filter((s) => s.sourceId === a.id).sort((x, y) => y.date.localeCompare(x.date))[0]?.date ?? a.createdAt;
        const lastB = sessions.filter((s) => s.sourceId === b.id).sort((x, y) => y.date.localeCompare(x.date))[0]?.date ?? b.createdAt;
        return lastB.localeCompare(lastA);
      });
    default:
      return copy;
  }
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function nDaysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function uniqueSortedDates(sessions: LearningSession[], dir: "asc" | "desc"): string[] {
  return [...new Set(sessions.map((s) => s.date.slice(0, 10)))].sort((a, b) =>
    dir === "desc" ? b.localeCompare(a) : a.localeCompare(b)
  );
}

function countConsecutive(sorted: string[], dir: "desc"): number {
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const [prev, curr] = dir === "desc" ? [sorted[i - 1], sorted[i]] : [sorted[i], sorted[i - 1]];
    const diff = (new Date(prev).getTime() - new Date(curr).getTime()) / 86_400_000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}
