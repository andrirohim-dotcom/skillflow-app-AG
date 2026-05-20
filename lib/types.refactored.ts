/**
 * REFACTORED TYPE DEFINITIONS
 *
 * Domain Model: Skill-Centric Architecture
 * Status: WIP - Do NOT use yet. Use lib/types.ts for current app.
 *
 * Key Changes:
 * 1. Skill is now canonical entity (not derived from Source)
 * 2. SkillProgress is aggregated (one per skill, not per source-skill combo)
 * 3. Evidence is first-class entity (not string on SkillProgress)
 * 4. ActionItem is deduplicated (not per source-combo)
 * 5. KeyInsight.skillTarget → skillId (FK instead of string)
 */

// ─── Skill: CANONICAL ENTITY ──────────────────────────────────────────────────

/**
 * Skill is the primary concept in SkillFlow.
 * One skill = many sources (e.g., "Leadership" taught in 8 books).
 * Deduplication via aliases: "Kepemimpinan" → "Leadership" (canonical).
 */
export interface Skill {
  id: string;                          // UUID
  name: string;                        // Canonical name (English preferred)
  aliases: string[];                   // Alternate names, localized variations
  category: string;                    // "Business" | "Technical" | "Personal" | ...
  domain?: string;                     // Subcategory: "Management", "Software Eng", ...
  description?: string;                // Brief explanation of the skill
  createdAt: string;
}

// ─── SkillProgress: AGGREGATED, ONE PER SKILL ─────────────────────────────────

export type SkillLevel = "awareness" | "understanding" | "applied" | "mastered";

/**
 * SkillProgress now represents cumulative mastery of a skill across ALL sources.
 * One record per skill (NOT per source-skill combo like before).
 * Aggregates level, evidence, actions from multiple sources.
 */
export interface SkillProgress {
  id: string;
  skillId: string;                     // FK → Skill (immutable)

  // Aggregated progress toward mastery
  level: SkillLevel;                   // Best level achieved across all sources
  levelAchievedAt?: string;            // When this level was first reached

  // Evidence: array of proof points (insight quotes, session notes, completed actions)
  // Built from KeyInsight refs, LearningSession notes, and ActionItem completions.
  evidence: Evidence[];                // Was: single evidence string

  // Shared action items across all sources for this skill
  actionItems: ActionItem[];           // Deduplicated (was: per source-skill combo)

  // Back-references: which sources teach this skill
  sourceIds: string[];                 // Union of all sources with skillTargets including this skill

  createdAt: string;
  updatedAt: string;
}

// ─── Evidence: NEW ENTITY ─────────────────────────────────────────────────────

/**
 * Evidence represents a proof point that supports a skill's mastery level.
 * Could be: insight quote, session reflection, completed action, milestone, etc.
 * Enables traceability: "I achieved 'applied' because of X insight and Y completed action".
 */
export type EvidenceType = "insight" | "session_note" | "action_completed" | "milestone";

export interface Evidence {
  id: string;
  skillId: string;                     // FK → Skill
  type: EvidenceType;
  content: string;                     // Quote, reflection, or description
  weight?: number;                     // Optional multiplier for evidence scoring (default 1)

  // Linkage for traceability (optional):
  sourceId?: string;                   // Which source (book, course, etc.)
  insightId?: string;                  // If type="insight", FK → KeyInsight
  sessionId?: string;                  // If type="session_note", FK → LearningSession
  actionItemId?: string;               // If type="action_completed"

  createdAt: string;
}

// ─── ActionItem: DEDUPLICATED ─────────────────────────────────────────────────

/**
 * ActionItem is now a deduplicated, skill-scoped task.
 * One record per unique action (not per source-skill combo).
 * sourceIds tracks which sources have/mention this action.
 *
 * Example:
 *   Old: "Read chapter on meetings" appears in 3 books = 3 ActionItems
 *   New: "Schedule and run a team meeting" appears once, sourceIds: [book1, book2, book3]
 */
export interface ActionItem {
  id: string;
  skillId: string;                     // FK → Skill (was: skillProgressId)
  text: string;                        // Action description (semantic, not source-specific)
  completed: boolean;
  completedAt?: string;

  // Which sources this action is relevant to
  sourceIds: string[];                 // e.g., ["seed-book-5", "seed-book-12"]

  createdAt: string;
}

// ─── KeyInsight: UPDATED LINKAGE ──────────────────────────────────────────────

export type InsightType = "insight" | "quote" | "concept" | "reflection";

/**
 * KeyInsight is tied to a specific source but now references a canonical skill.
 * skillId replaces skillTarget string (was optional, now required after migration).
 */
export interface KeyInsight {
  id: string;
  skillId: string;                     // FK → Skill (was: skillTarget?: string)
  sourceId: string;                    // Still source-scoped
  type?: InsightType;                  // optional for backward compat
  quote: string;                       // main content field
  reflection?: string;
  pageOrTimestamp?: string;            // "p.42", "12:34"
  tags: string[];
  createdAt: string;
}

// ─── Source Types: UNCHANGED ──────────────────────────────────────────────────

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

/**
 * LearningSource unchanged: still represents a book, course, article, etc.
 *
 * Note: After refactor, skillTargets can be cleaned up or kept for reference,
 * but primary skill-source mapping is now via SkillProgress.sourceIds.
 */
export interface LearningSource {
  id: string;
  title: string;
  creatorName: string;
  url?: string;
  topicTags: string[];
  skillTargets: string[];              // Now: canonical skill names (or IDs after migration)
  status: SourceStatus;
  difficultyLevel: DifficultyLevel;
  progress: ProgressData;
  dailyPageTarget?: number;
  targetCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Session & Task: UNCHANGED ────────────────────────────────────────────────

export type MoodLevel = "great" | "good" | "okay" | "tired" | "distracted";

export interface LearningSession {
  id: string;
  sourceId: string;
  date: string;
  durationMinutes: number;
  unitsConsumed: number;
  startProgress?: number;
  endProgress?: number;
  notes?: string;
  mood?: MoodLevel;
  focusRating?: number;
  productivityRating?: number;
  createdAt: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface SourceTask {
  id: string;
  sourceId: string;
  description: string;
  context?: string;
  sourceReference?: string;
  deadline?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
}

// ─── Derived / Computed ───────────────────────────────────────────────────────

export interface SourceProgressStats {
  pct: number;
  consumed: number;
  total: number;
  unitLabel: string;
}

// ─── MIGRATION: Mapping & Helpers ─────────────────────────────────────────────

/**
 * Temporary helper during migration.
 * Maps old skill name (string) → new Skill.id.
 * Used to migrate KeyInsight.skillTarget string → skillId FK.
 */
export interface SkillNameToIdMap {
  [skillName: string]: string; // "Leadership" → "skill-1"
}

/**
 * Deduplication candidate: Group skill variations by canonical name.
 * Built during Phase 1, used to create Skill records.
 */
export interface SkillDeduplicationGroup {
  canonical: string;        // "Leadership"
  variations: string[];     // ["Kepemimpinan", "Kepemimpinan Strategis"]
  category: string;
  domain?: string;
  sourceCount: number;      // How many sources use this skill group
}
