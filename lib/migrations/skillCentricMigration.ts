/**
 * SKILL-CENTRIC MIGRATION SCRIPT
 *
 * Handles safe migration from source-centric to skill-centric model.
 * Implemented in phases with validation checkpoints.
 *
 * SAFE TO RUN MULTIPLE TIMES: Uses feature flags to ensure idempotency.
 *
 * Usage:
 *   Phase 1: runPhase1_CreateSkillRegistry()
 *   Phase 2: runPhase2_MigrateSkillProgress()
 *   Phase 3: runPhase3_DedupeActionItems()
 *   Phase 4: runPhase4_MigrateKeyInsights()
 *   Phase 5: validateMigration()
 */

import type {
  Skill,
  SkillProgress,
  ActionItem,
  Evidence,
  KeyInsight,
} from "../types.refactored";
import { CANONICAL_SKILLS, SKILL_NAME_TO_ID } from "../skillTaxonomy";

// ─── FEATURE FLAGS ────────────────────────────────────────────────────────────

const PHASE_FLAGS = {
  phase1_skills_created: "skillflow:migration:phase1",
  phase2_skill_progress_migrated: "skillflow:migration:phase2",
  phase3_action_items_deduped: "skillflow:migration:phase3",
  phase4_insights_migrated: "skillflow:migration:phase4",
} as const;

function isMigrationPhaseComplete(phase: keyof typeof PHASE_FLAGS): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PHASE_FLAGS[phase]) === "true";
}

function markMigrationPhaseComplete(phase: keyof typeof PHASE_FLAGS): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PHASE_FLAGS[phase], "true");
}

// ─── PHASE 1: CREATE SKILL REGISTRY ───────────────────────────────────────────

/**
 * Phase 1: Create canonical Skill entities.
 * One-time: Creates the foundation for all other migrations.
 *
 * Writes to: skillflow:<accountId>:skills
 */
export function runPhase1_CreateSkillRegistry(accountId: string): void {
  if (isMigrationPhaseComplete("phase1_skills_created")) {
    console.log("[Migration] Phase 1 already complete");
    return;
  }

  console.log("[Migration] Running Phase 1: Create Skill Registry");

  const skillsKey = accountId === "default" ? "skillflow:skills" : `skillflow:${accountId}:skills`;

  // Save canonical skills
  if (typeof window !== "undefined") {
    localStorage.setItem(skillsKey, JSON.stringify(CANONICAL_SKILLS));
  }

  markMigrationPhaseComplete("phase1_skills_created");
  console.log(`[Migration] ✓ Phase 1 complete: ${CANONICAL_SKILLS.length} canonical skills created`);
}

// ─── PHASE 2: MIGRATE SKILLPROGRESS ───────────────────────────────────────────

/**
 * Phase 2: Aggregate old SkillProgress records into new skill-centric model.
 *
 * Old: Multiple SkillProgress(sourceId, skillName) per skill
 * New: One SkillProgress(skillId) per skill, sourceIds = union of sources
 */
export function runPhase2_MigrateSkillProgress(
  accountId: string,
  oldSkillProgress: any[], // old SkillProgress format (has skillName, sourceId)
  oldSources: any[] // LearningSource[]
): SkillProgress[] {
  if (isMigrationPhaseComplete("phase2_skill_progress_migrated")) {
    console.log("[Migration] Phase 2 already complete");
    return [];
  }

  console.log("[Migration] Running Phase 2: Migrate SkillProgress");

  // Group old SkillProgress by skill name
  const bySkillName = new Map<string, typeof oldSkillProgress>();
  for (const sp of oldSkillProgress) {
    if (!bySkillName.has(sp.skillName)) {
      bySkillName.set(sp.skillName, []);
    }
    bySkillName.get(sp.skillName)!.push(sp);
  }

  // For each unique skill, create aggregated SkillProgress
  const newSkillProgress: SkillProgress[] = [];

  for (const [skillName, records] of bySkillName.entries()) {
    // Map to canonical skill ID
    const skillId = SKILL_NAME_TO_ID[skillName];
    if (!skillId) {
      console.warn(`[Migration] No canonical skill found for: "${skillName}". Skipping.`);
      continue;
    }

    // Aggregate: collect all sourceIds, levels, evidence, actions
    const aggregated: SkillProgress = {
      id: `sp-${skillId}`,
      skillId,
      level: determineHighestLevel(records),
      levelAchievedAt: findEarliestLevelDate(records),
      evidence: convertToEvidence(records, skillId),
      actionItems: dedupeActionItems(records.flatMap((r) => r.actionItems), skillId),
      sourceIds: [...new Set(records.map((r) => r.sourceId))],
      createdAt: findEarliestCreatedAt(records),
      updatedAt: new Date().toISOString(),
    };

    newSkillProgress.push(aggregated);
  }

  // Save to new structure
  if (typeof window !== "undefined") {
    const key = accountId === "default" ? "skillflow:skill_progress_v2" : `skillflow:${accountId}:skill_progress_v2`;
    localStorage.setItem(key, JSON.stringify(newSkillProgress));
  }

  markMigrationPhaseComplete("phase2_skill_progress_migrated");
  console.log(`[Migration] ✓ Phase 2 complete: ${newSkillProgress.length} aggregated skills created`);

  return newSkillProgress;
}

// ─── PHASE 3: DEDUPE ACTION ITEMS ─────────────────────────────────────────────

/**
 * Phase 3: Deduplicte action items across sources.
 * One action per unique (skillId, text) pair.
 */
function dedupeActionItems(oldActions: ActionItem[], skillId: string): ActionItem[] {
  const byText = new Map<string, ActionItem>();

  for (const action of oldActions) {
    if (byText.has(action.text)) {
      // Merge sourceIds
      const existing = byText.get(action.text)!;
      existing.sourceIds = [...new Set([...existing.sourceIds, ...action.sourceIds])];
    } else {
      byText.set(action.text, {
        id: `ai-${skillId}-${Math.random().toString(36).slice(2, 9)}`,
        skillId,
        text: action.text,
        completed: action.completed,
        completedAt: action.completedAt,
        sourceIds: action.sourceIds || [],
        createdAt: action.createdAt || new Date().toISOString(),
      });
    }
  }

  return Array.from(byText.values());
}

// ─── PHASE 4: MIGRATE KEYINSIGHTS ─────────────────────────────────────────────

/**
 * Phase 4: Update KeyInsight skillTarget string → skillId FK.
 */
export function runPhase4_MigrateKeyInsights(
  accountId: string,
  oldInsights: any[] // old KeyInsight format (has skillTarget string)
): KeyInsight[] {
  if (isMigrationPhaseComplete("phase4_insights_migrated")) {
    console.log("[Migration] Phase 4 already complete");
    return [];
  }

  console.log("[Migration] Running Phase 4: Migrate KeyInsights");

  const migratedInsights: KeyInsight[] = [];
  const orphanedCount = { count: 0 };

  for (const insight of oldInsights) {
    // Try to find skillId from skillTarget
    if (insight.skillTarget) {
      const skillId = SKILL_NAME_TO_ID[insight.skillTarget];
      if (skillId) {
        migratedInsights.push({
          ...insight,
          skillId,
        });
      } else {
        console.warn(`[Migration] Orphaned insight: skillTarget "${insight.skillTarget}" has no canonical skill`);
        orphanedCount.count++;
      }
    } else {
      // No skill target — orphaned
      console.warn(`[Migration] Insight ${insight.id} has no skillTarget`);
      orphanedCount.count++;
    }
  }

  if (typeof window !== "undefined") {
    const key = accountId === "default" ? "skillflow:insights_v2" : `skillflow:${accountId}:insights_v2`;
    localStorage.setItem(key, JSON.stringify(migratedInsights));
  }

  markMigrationPhaseComplete("phase4_insights_migrated");
  console.log(
    `[Migration] ✓ Phase 4 complete: ${migratedInsights.length} migrated, ${orphanedCount.count} orphaned`
  );

  return migratedInsights;
}

// ─── VALIDATION ────────────────────────────────────────────────────────────────

/**
 * Validate migration success.
 * Check: no orphaned skills, no missing skillIds, data consistency.
 */
export interface MigrationValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMigration(
  newSkillProgress: SkillProgress[],
  newInsights: any[] // KeyInsight[]
): MigrationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check all SkillProgress have skillId
  for (const sp of newSkillProgress) {
    if (!sp.skillId) {
      errors.push(`SkillProgress ${sp.id} missing skillId`);
    }
  }

  // Check all actionItems have skillId
  for (const sp of newSkillProgress) {
    for (const ai of sp.actionItems) {
      if (!ai.skillId) {
        errors.push(`ActionItem ${ai.id} missing skillId`);
      }
    }
  }

  // Check all insights have skillId
  for (const insight of newInsights) {
    if (!insight.skillId) {
      warnings.push(`Insight ${insight.id} missing skillId (may be orphaned)`);
    }
  }

  // Check actionItems not duplicated by text within a skill
  for (const sp of newSkillProgress) {
    const texts = new Set<string>();
    for (const ai of sp.actionItems) {
      if (texts.has(ai.text)) {
        errors.push(`Duplicate action text in skill ${sp.skillId}: "${ai.text}"`);
      }
      texts.add(ai.text);
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function determineHighestLevel(records: SkillProgress[]): SkillProgress["level"] {
  const levels: SkillProgress["level"][] = ["awareness", "understanding", "applied", "mastered"];
  let maxIdx = 0;

  for (const record of records) {
    const idx = levels.indexOf(record.level || "awareness");
    if (idx > maxIdx) maxIdx = idx;
  }

  return levels[maxIdx];
}

function findEarliestLevelDate(records: SkillProgress[]): string | undefined {
  return records
    .filter((r) => r.levelAchievedAt)
    .map((r) => r.levelAchievedAt!)
    .sort()[0];
}

function findEarliestCreatedAt(records: SkillProgress[]): string {
  return records.map((r) => r.createdAt).sort()[0] || new Date().toISOString();
}

function convertToEvidence(records: any[], skillId: string): Evidence[] {
  const evidenceList: Evidence[] = [];

  for (const record of records) {
    if (record.evidence) {
      evidenceList.push({
        id: `ev-${skillId}-${Math.random().toString(36).slice(2, 9)}`,
        skillId,
        type: "session_note",
        content: record.evidence,
        sourceId: record.sourceId,
        createdAt: record.createdAt,
      });
    }
  }

  return evidenceList;
}

// ─── AUDIT REPORT ─────────────────────────────────────────────────────────────

export function printMigrationSummary(
  accountId: string,
  oldSkillProgress: any[], // old SkillProgress format (has skillName)
  newSkillProgress: SkillProgress[]
): void {
  console.log("\n=== Migration Summary ===");
  console.log(`Account: ${accountId}`);
  console.log(`\nBefore:`);
  console.log(`  SkillProgress records: ${oldSkillProgress.length}`);
  console.log(`  Unique skills (by name): ${new Set(oldSkillProgress.map((s) => s.skillName)).size}`);

  console.log(`\nAfter:`);
  console.log(`  SkillProgress records: ${newSkillProgress.length}`);
  const totalActionItems = newSkillProgress.reduce((sum, sp) => sum + sp.actionItems.length, 0);
  console.log(`  Total action items (deduplicated): ${totalActionItems}`);

  const totalSourceRefs = newSkillProgress.reduce((sum, sp) => sum + sp.sourceIds.length, 0);
  console.log(`  Total source references: ${totalSourceRefs}`);

  const avgSourcesPerSkill = (totalSourceRefs / newSkillProgress.length).toFixed(2);
  console.log(`  Avg sources per skill: ${avgSourcesPerSkill}`);
}
