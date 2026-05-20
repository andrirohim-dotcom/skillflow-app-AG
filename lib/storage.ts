import { STORAGE_KEYS } from "./constants";
import type {
  LearningSource,
  LearningSession,
  KeyInsight,
  SkillProgress,
  SourceTask,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

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

// ─── LearningSource ───────────────────────────────────────────────────────────

export function getAllSources(): LearningSource[] {
  return readStore<LearningSource>(STORAGE_KEYS.SOURCES);
}

export function getSourceById(id: string): LearningSource | undefined {
  return getAllSources().find((s) => s.id === id);
}

export function saveSource(source: LearningSource): void {
  writeStore(STORAGE_KEYS.SOURCES, [...getAllSources(), source]);
}

export function updateSource(updated: LearningSource): void {
  writeStore(
    STORAGE_KEYS.SOURCES,
    getAllSources().map((s) => (s.id === updated.id ? updated : s))
  );
}

export function deleteSource(id: string): void {
  writeStore(
    STORAGE_KEYS.SOURCES,
    getAllSources().filter((s) => s.id !== id)
  );
}

// ─── LearningSession ──────────────────────────────────────────────────────────

export function getAllSessions(): LearningSession[] {
  return readStore<LearningSession>(STORAGE_KEYS.SESSIONS);
}

export function getSessionsBySource(sourceId: string): LearningSession[] {
  return getAllSessions()
    .filter((s) => s.sourceId === sourceId)
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first
}

export function saveSession(session: LearningSession): void {
  writeStore(STORAGE_KEYS.SESSIONS, [...getAllSessions(), session]);
}

export function deleteSession(id: string): void {
  writeStore(
    STORAGE_KEYS.SESSIONS,
    getAllSessions().filter((s) => s.id !== id)
  );
}

// ─── KeyInsight ───────────────────────────────────────────────────────────────

export function getAllInsights(): KeyInsight[] {
  return readStore<KeyInsight>(STORAGE_KEYS.INSIGHTS);
}

export function getInsightsBySource(sourceId: string): KeyInsight[] {
  return getAllInsights()
    .filter((i) => i.sourceId === sourceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveInsight(insight: KeyInsight): void {
  writeStore(STORAGE_KEYS.INSIGHTS, [...getAllInsights(), insight]);
}

export function deleteInsight(id: string): void {
  writeStore(
    STORAGE_KEYS.INSIGHTS,
    getAllInsights().filter((i) => i.id !== id)
  );
}

// ─── SkillProgress (with backward-compat migration) ──────────────────────────

export function getAllSkillProgress(): SkillProgress[] {
  const raw = readStore<SkillProgress>(STORAGE_KEYS.SKILL_PROGRESS);
  // Migrate old records that lack `level`
  return raw.map((sp) => ({ level: "awareness" as const, ...sp }));
}

export function getSkillProgressBySource(sourceId: string): SkillProgress[] {
  return getAllSkillProgress().filter((sp) => sp.sourceId === sourceId);
}

export function saveSkillProgress(sp: SkillProgress): void {
  writeStore(STORAGE_KEYS.SKILL_PROGRESS, [...getAllSkillProgress(), sp]);
}

export function updateSkillProgress(updated: SkillProgress): void {
  writeStore(
    STORAGE_KEYS.SKILL_PROGRESS,
    getAllSkillProgress().map((sp) => (sp.id === updated.id ? updated : sp))
  );
}

export function deleteSkillProgress(id: string): void {
  writeStore(
    STORAGE_KEYS.SKILL_PROGRESS,
    getAllSkillProgress().filter((sp) => sp.id !== id)
  );
}

// ─── SourceTask ───────────────────────────────────────────────────────────────

export function getAllTasks(): SourceTask[] {
  return readStore<SourceTask>(STORAGE_KEYS.TASKS);
}

export function getTasksBySource(sourceId: string): SourceTask[] {
  return getAllTasks()
    .filter((t) => t.sourceId === sourceId)
    .sort((a, b) => {
      // Active tasks first, then by creation date desc
      const priority = ["urgent", "high", "medium", "low"];
      const pa = priority.indexOf(a.priority);
      const pb = priority.indexOf(b.priority);
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      if (pa !== pb) return pa - pb;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function saveTask(task: SourceTask): void {
  writeStore(STORAGE_KEYS.TASKS, [...getAllTasks(), task]);
}

export function updateTask(updated: SourceTask): void {
  writeStore(
    STORAGE_KEYS.TASKS,
    getAllTasks().map((t) => (t.id === updated.id ? updated : t))
  );
}

export function deleteTask(id: string): void {
  writeStore(
    STORAGE_KEYS.TASKS,
    getAllTasks().filter((t) => t.id !== id)
  );
}

// ─── Seed Gate ────────────────────────────────────────────────────────────────

export function isSeeded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.SEEDED) === "true";
}

export function markSeeded(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
}
