/**
 * REFACTORED SEED DATA
 *
 * Demonstrates the new skill-centric model with canonical taxonomy.
 * WIP: Not active yet (uses types.refactored.ts).
 *
 * Key differences from lib/seed.ts:
 * 1. Uses canonical Skill entities
 * 2. SkillProgress is aggregated (not per source-combo)
 * 3. ActionItems are deduplicated
 * 4. Evidence references actual insights
 *
 * Usage: During migration Phase 1, will replace lib/seed.ts
 */

import type { Skill, SkillProgress, ActionItem, LearningSource, KeyInsight } from "./types.refactored";

// ─── CANONICAL SKILLS (from skillTaxonomy.ts) ──────────────────────────────────

/**
 * Sample: 3 canonical skills + aliases.
 * Full list in lib/skillTaxonomy.ts
 */
const SEED_SKILLS: Skill[] = [
  {
    id: "skill-001",
    name: "Leadership",
    aliases: ["Kepemimpinan", "Kepemimpinan Strategis", "Kepemimpinan Berbasis Nilai"],
    category: "Business",
    domain: "Management",
    description: "Ability to inspire and guide teams toward shared goals.",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "skill-002",
    name: "Time Management",
    aliases: ["Manajemen Waktu", "Time Blocking", "Scheduling"],
    category: "Personal",
    domain: "Productivity",
    description: "Effective allocation and prioritization of time across tasks.",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "skill-003",
    name: "Deep Focus",
    aliases: ["Fokus Mendalam", "Fokus", "Deep Work"],
    category: "Personal",
    domain: "Productivity",
    description: "Ability to concentrate intensely on high-impact work without distraction.",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

// ─── SEED SOURCES (simplified, using canonical skill IDs) ────────────────────

const SEED_SOURCES: LearningSource[] = [
  {
    id: "seed-src-1",
    title: "Atomic Habits",
    creatorName: "James Clear",
    url: "",
    topicTags: ["habits", "productivity"],
    skillTargets: ["Time Management", "Deep Focus"], // Now: canonical names (or IDs)
    status: "in_progress",
    difficultyLevel: "beginner",
    progress: { type: "book", totalPages: 320, currentPage: 128 },
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-03-20T10:30:00.000Z",
  },
  {
    id: "seed-src-2",
    title: "Deep Work",
    creatorName: "Cal Newport",
    url: "",
    topicTags: ["focus", "productivity"],
    skillTargets: ["Deep Focus", "Time Management"], // Same skills, different book
    status: "in_progress",
    difficultyLevel: "intermediate",
    progress: { type: "book", totalPages: 296, currentPage: 74 },
    createdAt: "2025-02-05T09:00:00.000Z",
    updatedAt: "2025-03-15T14:00:00.000Z",
  },
  {
    id: "seed-src-3",
    title: "The 15 Invaluable Laws of Growth",
    creatorName: "John C. Maxwell",
    url: "",
    topicTags: ["leadership", "growth"],
    skillTargets: ["Leadership"], // Leadership taught in this book
    status: "not_started",
    difficultyLevel: "intermediate",
    progress: { type: "book", totalPages: 320, currentPage: 0 },
    createdAt: "2025-03-01T10:00:00.000Z",
    updatedAt: "2025-03-01T10:00:00.000Z",
  },
];

// ─── AGGREGATED SKILLPROGRESS (Canonical Model) ───────────────────────────────

/**
 * One SkillProgress per skill (not per source-skill combo).
 * sourceIds = union of sources teaching this skill.
 * actionItems = deduplicated across all sources.
 */
const SEED_SKILL_PROGRESS: SkillProgress[] = [
  {
    id: "sp-skill-001",
    skillId: "skill-001",
    level: "awareness",
    levelAchievedAt: "2025-03-01T10:00:00.000Z",
    evidence: [],
    actionItems: [
      {
        id: "ai-skill-001-001",
        skillId: "skill-001",
        text: "Identify one person you admire as a leader and study their approach",
        completed: false,
        sourceIds: ["seed-src-3"],
        createdAt: "2025-03-01T10:00:00.000Z",
      },
      {
        id: "ai-skill-001-002",
        skillId: "skill-001",
        text: "Practice giving constructive feedback to a team member",
        completed: false,
        sourceIds: ["seed-src-3"],
        createdAt: "2025-03-01T10:00:00.000Z",
      },
      {
        id: "ai-skill-001-003",
        skillId: "skill-001",
        text: "Lead a team meeting or project retrospective",
        completed: false,
        sourceIds: ["seed-src-3"],
        createdAt: "2025-03-01T10:00:00.000Z",
      },
    ],
    sourceIds: ["seed-src-3"],
    createdAt: "2025-03-01T10:00:00.000Z",
    updatedAt: "2025-03-01T10:00:00.000Z",
  },

  {
    id: "sp-skill-002",
    skillId: "skill-002",
    level: "understanding",
    levelAchievedAt: "2025-02-05T09:00:00.000Z",
    evidence: [],
    actionItems: [
      {
        id: "ai-skill-002-001",
        skillId: "skill-002",
        text: "Block 2-3 hours daily for focused work on most important task",
        completed: false,
        sourceIds: ["seed-src-1", "seed-src-2"], // Both books mention this
        createdAt: "2025-01-10T08:00:00.000Z",
      },
      {
        id: "ai-skill-002-002",
        skillId: "skill-002",
        text: "Identify your peak productivity hours and protect them",
        completed: false,
        sourceIds: ["seed-src-1", "seed-src-2"],
        createdAt: "2025-01-10T08:00:00.000Z",
      },
      {
        id: "ai-skill-002-003",
        skillId: "skill-002",
        text: "Review and audit time spent last week by category",
        completed: true,
        completedAt: "2025-03-18T15:00:00.000Z",
        sourceIds: ["seed-src-1"],
        createdAt: "2025-01-10T08:00:00.000Z",
      },
    ],
    sourceIds: ["seed-src-1", "seed-src-2"],
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-03-18T15:00:00.000Z",
  },

  {
    id: "sp-skill-003",
    skillId: "skill-003",
    level: "understanding",
    levelAchievedAt: "2025-02-05T09:00:00.000Z",
    evidence: [],
    actionItems: [
      {
        id: "ai-skill-003-001",
        skillId: "skill-003",
        text: "Turn off notifications and minimize context switching for one work session",
        completed: false,
        sourceIds: ["seed-src-1", "seed-src-2"],
        createdAt: "2025-01-10T08:00:00.000Z",
      },
      {
        id: "ai-skill-003-002",
        skillId: "skill-003",
        text: "Create a shutdown ritual to mark end of deep work session",
        completed: false,
        sourceIds: ["seed-src-2"],
        createdAt: "2025-02-05T09:00:00.000Z",
      },
      {
        id: "ai-skill-003-003",
        skillId: "skill-003",
        text: "Design your physical environment to minimize distractions",
        completed: false,
        sourceIds: ["seed-src-1", "seed-src-2"],
        createdAt: "2025-01-10T08:00:00.000Z",
      },
    ],
    sourceIds: ["seed-src-1", "seed-src-2"],
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-03-15T14:00:00.000Z",
  },
];

// ─── SAMPLE INSIGHTS (Updated to use skillId) ──────────────────────────────────

const SEED_INSIGHTS: KeyInsight[] = [
  {
    id: "insight-001",
    skillId: "skill-003", // FK to canonical Skill
    sourceId: "seed-src-2",
    type: "quote",
    quote:
      "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that has become increasingly valuable as attention is a scarce commodity.",
    reflection: "This resonates with my struggle to stay focused during sprint planning.",
    tags: ["focus", "concentration", "attention"],
    createdAt: "2025-03-10T10:00:00.000Z",
  },
  {
    id: "insight-002",
    skillId: "skill-002", // Time Management
    sourceId: "seed-src-1",
    type: "insight",
    quote:
      "The most effective way to change behavior is to focus on who you wish to become, not on who you wish to stop being.",
    reflection:
      "Instead of 'stop wasting time,' I should frame it as 'become someone who protects their time fiercely.'",
    tags: ["identity", "habits", "mindset"],
    createdAt: "2025-03-12T14:30:00.000Z",
  },
];

// ─── EXPORT ────────────────────────────────────────────────────────────────────

export function initializeRefactoredSeedData(accountId: string): void {
  if (typeof window === "undefined") return;

  const key = (suffix: string) =>
    accountId === "default" ? `skillflow:${suffix}` : `skillflow:${accountId}:${suffix}`;

  // Write new v2 data structures
  localStorage.setItem(key("skills"), JSON.stringify(SEED_SKILLS));
  localStorage.setItem(key("sources"), JSON.stringify(SEED_SOURCES));
  localStorage.setItem(key("skill_progress_v2"), JSON.stringify(SEED_SKILL_PROGRESS));
  localStorage.setItem(key("insights_v2"), JSON.stringify(SEED_INSIGHTS));

  // Mark migration complete
  localStorage.setItem("skillflow:migration:phase1", "true");
  localStorage.setItem("skillflow:migration:phase2", "true");
  localStorage.setItem("skillflow:migration:phase4", "true");

  console.log("[Seed] Initialized refactored data structures");
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export function printRefactoredSeedStats(): void {
  console.log("\n=== Refactored Seed Data Stats ===");
  console.log(`Skills: ${SEED_SKILLS.length}`);
  console.log(`Sources: ${SEED_SOURCES.length}`);
  console.log(`Aggregated SkillProgress: ${SEED_SKILL_PROGRESS.length}`);

  const totalActionItems = SEED_SKILL_PROGRESS.reduce((sum, sp) => sum + sp.actionItems.length, 0);
  console.log(`Total ActionItems (deduplicated): ${totalActionItems}`);

  const completedActions = SEED_SKILL_PROGRESS.flatMap((sp) => sp.actionItems).filter((ai) =>
    ai.completed
  ).length;
  console.log(`Completed: ${completedActions}`);

  const totalSourceRefs = SEED_SKILL_PROGRESS.reduce((sum, sp) => sum + sp.sourceIds.length, 0);
  console.log(`Total source references: ${totalSourceRefs}`);

  const avgSourcesPerSkill = (totalSourceRefs / SEED_SKILL_PROGRESS.length).toFixed(2);
  console.log(`Avg sources per skill: ${avgSourcesPerSkill}`);

  console.log(`\nInsights: ${SEED_INSIGHTS.length}`);
}
