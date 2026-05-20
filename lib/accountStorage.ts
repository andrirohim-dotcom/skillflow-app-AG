/**
 * Account-scoped storage layer.
 *
 * Key strategy:
 *   acc_default  →  "skillflow:sources"          (original keys, zero-migration)
 *   other IDs    →  "skillflow:<accountId>:sources"
 */
import { DEFAULT_ACCOUNT_ID } from "./accountTypes";
import { generateId } from "./storage";
import type {
  LearningSource,
  LearningSession,
  KeyInsight,
  SkillProgress,
  SourceTask,
} from "./types";

// ─── Key Helpers ──────────────────────────────────────────────────────────────

const SUFFIXES = {
  sources: "sources",
  sessions: "sessions",
  insights: "insights",
  skill_progress: "skill_progress",
  tasks: "tasks",
} as const;

type StoreSuffix = (typeof SUFFIXES)[keyof typeof SUFFIXES];

function accountKey(accountId: string, suffix: StoreSuffix): string {
  if (accountId === DEFAULT_ACCOUNT_ID) {
    return `skillflow:${suffix}`;
  }
  return `skillflow:${accountId}:${suffix}`;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function readStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn(`[SkillFlow] Failed to write to storage key: ${key}`);
  }
}

export { generateId };

// ─── LearningSource ───────────────────────────────────────────────────────────

export function getSources(accountId: string): LearningSource[] {
  return readStore<LearningSource>(accountKey(accountId, SUFFIXES.sources));
}

export function getSourceById(accountId: string, id: string): LearningSource | undefined {
  return getSources(accountId).find((s) => s.id === id);
}

export function saveSource(accountId: string, source: LearningSource): void {
  writeStore(accountKey(accountId, SUFFIXES.sources), [...getSources(accountId), source]);
}

export function updateSource(accountId: string, updated: LearningSource): void {
  writeStore(
    accountKey(accountId, SUFFIXES.sources),
    getSources(accountId).map((s) => (s.id === updated.id ? updated : s))
  );
}

export function deleteSource(accountId: string, id: string): void {
  writeStore(
    accountKey(accountId, SUFFIXES.sources),
    getSources(accountId).filter((s) => s.id !== id)
  );
}

// ─── LearningSession ──────────────────────────────────────────────────────────

export function getSessions(accountId: string): LearningSession[] {
  return readStore<LearningSession>(accountKey(accountId, SUFFIXES.sessions));
}

export function getSessionsBySource(accountId: string, sourceId: string): LearningSession[] {
  return getSessions(accountId)
    .filter((s) => s.sourceId === sourceId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveSession(accountId: string, session: LearningSession): void {
  writeStore(accountKey(accountId, SUFFIXES.sessions), [...getSessions(accountId), session]);
}

export function deleteSession(accountId: string, id: string): void {
  writeStore(
    accountKey(accountId, SUFFIXES.sessions),
    getSessions(accountId).filter((s) => s.id !== id)
  );
}

// ─── KeyInsight ───────────────────────────────────────────────────────────────

export function getInsights(accountId: string): KeyInsight[] {
  return readStore<KeyInsight>(accountKey(accountId, SUFFIXES.insights));
}

export function getInsightsBySource(accountId: string, sourceId: string): KeyInsight[] {
  return getInsights(accountId)
    .filter((i) => i.sourceId === sourceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveInsight(accountId: string, insight: KeyInsight): void {
  writeStore(accountKey(accountId, SUFFIXES.insights), [...getInsights(accountId), insight]);
}

export function deleteInsight(accountId: string, id: string): void {
  writeStore(
    accountKey(accountId, SUFFIXES.insights),
    getInsights(accountId).filter((i) => i.id !== id)
  );
}

// ─── SkillProgress ────────────────────────────────────────────────────────────

export function getSkillProgress(accountId: string): SkillProgress[] {
  const raw = readStore<SkillProgress>(accountKey(accountId, SUFFIXES.skill_progress));
  // Migrate old records without `level`
  return raw.map((sp) => ({ level: "awareness" as const, ...sp }));
}

export function getSkillProgressBySource(accountId: string, sourceId: string): SkillProgress[] {
  return getSkillProgress(accountId).filter((sp) => sp.sourceId === sourceId);
}

export function saveSkillProgress(accountId: string, sp: SkillProgress): void {
  writeStore(accountKey(accountId, SUFFIXES.skill_progress), [...getSkillProgress(accountId), sp]);
}

export function updateSkillProgress(accountId: string, updated: SkillProgress): void {
  writeStore(
    accountKey(accountId, SUFFIXES.skill_progress),
    getSkillProgress(accountId).map((sp) => (sp.id === updated.id ? updated : sp))
  );
}

export function deleteSkillProgress(accountId: string, id: string): void {
  writeStore(
    accountKey(accountId, SUFFIXES.skill_progress),
    getSkillProgress(accountId).filter((sp) => sp.id !== id)
  );
}

// ─── SourceTask ───────────────────────────────────────────────────────────────

export function getTasks(accountId: string): SourceTask[] {
  return readStore<SourceTask>(accountKey(accountId, SUFFIXES.tasks));
}

export function getTasksBySource(accountId: string, sourceId: string): SourceTask[] {
  return getTasks(accountId)
    .filter((t) => t.sourceId === sourceId)
    .sort((a, b) => {
      const priority = ["urgent", "high", "medium", "low"];
      const pa = priority.indexOf(a.priority);
      const pb = priority.indexOf(b.priority);
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      if (pa !== pb) return pa - pb;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function saveTask(accountId: string, task: SourceTask): void {
  writeStore(accountKey(accountId, SUFFIXES.tasks), [...getTasks(accountId), task]);
}

export function updateTask(accountId: string, updated: SourceTask): void {
  writeStore(
    accountKey(accountId, SUFFIXES.tasks),
    getTasks(accountId).map((t) => (t.id === updated.id ? updated : t))
  );
}

export function deleteTask(accountId: string, id: string): void {
  writeStore(
    accountKey(accountId, SUFFIXES.tasks),
    getTasks(accountId).filter((t) => t.id !== id)
  );
}

// ─── Delete all data for an account ──────────────────────────────────────────

export function deleteAccountData(accountId: string): void {
  if (typeof window === "undefined") return;
  Object.values(SUFFIXES).forEach((suffix) => {
    localStorage.removeItem(accountKey(accountId, suffix as StoreSuffix));
  });
}
