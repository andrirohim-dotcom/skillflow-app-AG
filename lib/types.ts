// ─── Source Types ────────────────────────────────────────────────────────────

export type SourceType = "book" | "youtube" | "article" | "podcast" | "course";
export type SourceStatus = "not_started" | "in_progress" | "completed" | "on_hold";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface BookProgress {
  type: "book";
  totalPages: number;
  currentPage: number;
}
export interface YoutubeProgress {
  type: "youtube";
  totalMinutes: number;
  watchedMinutes: number;
}
export interface ArticleProgress {
  type: "article";
  estimatedReadMinutes: number;
  consumedMinutes: number;
}
export interface PodcastProgress {
  type: "podcast";
  totalMinutes: number;
  listenedMinutes: number;
}
export interface CourseProgress {
  type: "course";
  totalModules?: number;
  completedModules?: number;
  totalMinutes?: number;
  watchedMinutes?: number;
}

export type ProgressData =
  | BookProgress
  | YoutubeProgress
  | ArticleProgress
  | PodcastProgress
  | CourseProgress;

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface LearningSource {
  id: string;
  title: string;
  creatorName: string;
  url?: string;
  topicTags: string[];
  skillTargets: string[];
  status: SourceStatus;
  difficultyLevel: DifficultyLevel;
  progress: ProgressData;
  dailyPageTarget?: number;       // pages (books) or minutes (other types) per day
  targetCompletionDate?: string;  // ISO date string "YYYY-MM-DD"
  // ── Multi-user fields (Phase 2) ──
  workspaceId?: string;           // FK → Workspace.id
  createdBy?: string;             // FK → User.id
  visibility?: "personal" | "workspace" | "public"; // default: "personal"
  createdAt: string;
  updatedAt: string;
}

export type MoodLevel = "great" | "good" | "okay" | "tired" | "distracted";

export interface LearningSession {
  id: string;
  sourceId: string;
  date: string;           // YYYY-MM-DD
  durationMinutes: number;
  unitsConsumed: number;
  startProgress?: number; // unit value at session start
  endProgress?: number;   // unit value at session end
  notes?: string;
  mood?: MoodLevel;
  focusRating?: number;       // 1–5
  productivityRating?: number; // 1–5
  isStreakShield?: boolean;
  // ── Multi-user fields (Phase 2) ──
  workspaceId?: string;     // FK → Workspace.id
  userId?: string;          // FK → User.id
  createdAt: string;
}

export type InsightType = "insight" | "quote" | "concept" | "reflection" | "weekly_report";

export interface KeyInsight {
  id: string;
  sourceId?: string;       // Optional for global capture
  type?: InsightType;      // optional for backward compat with old data
  skillTarget?: string;
  quote: string;           // main content field regardless of type
  reflection?: string;
  pageOrTimestamp?: string; // "p.42", "12:34"
  tags: string[];
  // ── Spaced Repetition (Recommendation #3) ──
  lastReviewedAt?: string;    // ISO date
  reviewIntervalDays?: number; // default: 1
  // ── Multi-user fields (Phase 2) ──
  workspaceId?: string;    // FK → Workspace.id
  userId?: string;         // FK → User.id (author)
  visibility?: "private" | "workspace" | "public"; // default: "private"
  createdAt: string;
}

export interface ActionItem {
  id: string;
  skillProgressId: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export type SkillLevel = "awareness" | "understanding" | "applied" | "mastered";

export interface SkillProgress {
  id: string;
  sourceId: string;
  skillName: string;
  category: string;
  level?: SkillLevel;     // optional for backward compat; defaults to "awareness"
  evidence?: string;
  levelAchievedAt?: string;
  actionItems: ActionItem[];
  // ── Multi-user fields (Phase 2) ──
  workspaceId?: string;   // FK → Workspace.id
  userId?: string;        // FK → User.id
  createdAt: string;
}

// ─── Source Task (standalone action items per source) ─────────────────────────

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus   = "todo" | "in_progress" | "done" | "cancelled";

export interface SourceTask {
  id: string;
  sourceId?: string;         // Optional for global capture
  // ── Multi-user fields (Phase 2) ──
  workspaceId?: string;   // FK → Workspace.id
  userId?: string;        // FK → User.id
  description: string;
  context?: string;          // related insight or rationale
  sourceReference?: string;  // "p.42", "chapter 3", "12:34"
  deadline?: string;         // ISO date
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
}

// ─── Master Source (Admin Catalog) ───────────────────────────────────────────

export interface MasterSource {
  id: string;
  title: string;
  creatorName: string;
  url?: string;
  sourceType: SourceType;
  topicTags: string[];
  skillTargets: string[];
  difficultyLevel: DifficultyLevel;
  description?: string;
  language: "id" | "en";
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shape passed from CatalogPicker to AddSourceForm when user picks from catalog
export interface SourcePrefill {
  sourceType: SourceType;
  title: string;
  creatorName: string;
  url: string;
  topicTags: string[];
  skillTargets: string[];
  difficultyLevel: DifficultyLevel;
}

// ─── Derived / Computed ───────────────────────────────────────────────────────

export interface SourceProgressStats {
  pct: number;
  consumed: number;
  total: number;
  unitLabel: string;
}

// ─── Weekly Review (Recommendation #5) ───────────────────────────────────────

export interface WeeklyReport {
  id: string;
  workspaceId: string;
  userId: string;
  weekStarting: string; // ISO date (usually Sunday)
  stats: {
    minutesSpent: number;
    insightsCount: number;
    sessionsCount: number;
    tasksCompleted: number;
  };
  reflections: {
    wins: string;
    challenges: string;
  };
  nextWeekPlan: {
    focusArea: string;
    goal: string;
  };
  createdAt: string;
}
