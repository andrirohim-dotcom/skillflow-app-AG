# SkillFlow Domain Model Refactoring Guide

**Status:** Design + Scaffolding Complete | Ready for Phase 1  
**Target:** Skill-centric, deduplicated architecture  
**Timeline:** Phased over 2-3 releases  

---

## 🎯 High-Level Goals

| Current State | → | Future State |
|---|---|---|
| Source-centric model | → | **Skill-centric model** |
| Skill = string property of Source | → | Skill = canonical entity |
| Duplication: "Leadership" × 6 sources = 6 records | → | Deduplication: 1 aggregated record |
| SkillProgress per (source, skill) combo | → | SkillProgress per skill (aggregated) |
| Action items per source-combo | → | Action items globally deduplicated |
| Evidence = single string | → | Evidence = rich array of proof points |

---

## 📁 New Files Created

### Core Type Definitions

1. **`lib/types.refactored.ts`** (NEW - WIP)
   - Skill, SkillProgress, Evidence, ActionItem redesigned
   - Not active yet; documents target structure
   - Imports from this file will fail until migration complete

2. **`lib/skillTaxonomy.ts`** (NEW - READY)
   - Canonical skill registry: 38 skills with aliases
   - Deduplication groups for seed data
   - Lookup functions for migration helpers
   - **Can be used immediately** to identify duplicates in existing data

3. **`lib/migrations/skillCentricMigration.ts`** (NEW - READY)
   - Phase-by-phase migration functions
   - Feature flags prevent re-running phases
   - Safe to run multiple times (idempotent)
   - Validation and audit reports

4. **`lib/seedRefactored.ts`** (NEW - EXAMPLE)
   - Demonstrates new model with 3 sources + 3 skills
   - Shows deduplicated action items (same action across 2 sources = 1 record)
   - Shows aggregated SkillProgress

### Documentation

5. **`DOMAIN_MODEL_AUDIT.md`** (NEW - COMPREHENSIVE)
   - Full analysis of current issues
   - Detailed proposed new model
   - Migration strategy with 5 phases
   - Duplication findings

6. **`MIGRATION_GUIDE.md`** (THIS FILE)
   - Step-by-step execution guide
   - How to use new files
   - Rollback procedures

---

## 🚀 Execution Plan

### Pre-Migration Checklist

- [ ] Review `DOMAIN_MODEL_AUDIT.md` (15 min read)
- [ ] Understand the new model diagram
- [ ] Identify any seed data beyond what's in `seedBooks.ts`
- [ ] Backup localStorage (export to JSON file)
- [ ] Run validation: `skillTaxonomy.validateDeduplicationGroups()`

### Phase 1: Create Canonical Skill Registry (Non-Breaking, 30 min)

**What:** Build foundational Skill entities + lookup tables.  
**When:** Safe to merge immediately; no impact on current UI.  
**How:**

```typescript
// In your migration/initialization code:
import { runPhase1_CreateSkillRegistry } from "@/lib/migrations/skillCentricMigration";

const accountId = useActiveAccountId();
runPhase1_CreateSkillRegistry(accountId);

// Verify:
const skills = JSON.parse(localStorage.getItem("skillflow:skills") || "[]");
console.log(`Created ${skills.length} canonical skills`);
```

**Rollback:** Delete `skillflow:skills` and `skillflow:migration:phase1` keys.

### Phase 2: Migrate SkillProgress (Breaking, 1-2 hours)

**What:** Aggregate old `SkillProgress` records (source-centric) → new aggregated model.  
**When:** After Phase 1 validation. All components must be updated to read new format.  
**How:**

```typescript
import { runPhase2_MigrateSkillProgress } from "@/lib/migrations/skillCentricMigration";

const oldSkillProgress = getSkillProgress(accountId); // from old storage
const oldSources = getSources(accountId);

const newSkillProgress = runPhase2_MigrateSkillProgress(
  accountId,
  oldSkillProgress,
  oldSources
);
```

**What Changes in Storage:**
```
Old: skillflow:<accountId>:skill_progress
  [{ sourceId: "src-1", skillName: "Leadership", ... },
   { sourceId: "src-2", skillName: "Leadership", ... }]
   → 2 separate records

New: skillflow:<accountId>:skill_progress_v2
  [{ skillId: "skill-001", sourceIds: ["src-1", "src-2"], ... }]
   → 1 aggregated record
```

**UI Updates Required:**
- `getSkillProgress()` must read from new structure
- `SkillCard` components adjust to aggregated data
- `ActionItemsPanel` deduplicates by text
- `GrowingSkillsCard` now shows skill aggregates

### Phase 3: Deduplicate Action Items (Auto-Handled in Phase 2)

**What:** Merge duplicate actions across sources.  
**When:** Automatic during Phase 2 (`dedupeActionItems()` function).  
**Example:**
```
Before: "Schedule a team meeting" in [Book A, Book B]
  → 2 ActionItem records

After: "Schedule a team meeting" with sourceIds: ["src-a", "src-b"]
  → 1 deduplicated record
```

### Phase 4: Migrate KeyInsights (1 hour)

**What:** Update `KeyInsight.skillTarget` (string) → `skillId` (FK).  
**When:** After Phase 2 SkillProgress is stable.  
**How:**

```typescript
import { runPhase4_MigrateKeyInsights } from "@/lib/migrations/skillCentricMigration";

const oldInsights = getInsights(accountId);
const newInsights = runPhase4_MigrateKeyInsights(accountId, oldInsights);

// Check for orphaned insights:
const orphaned = newInsights.filter(i => !i.skillId);
if (orphaned.length > 0) {
  console.warn(`⚠️  ${orphaned.length} insights are orphaned`);
  // Manual review required
}
```

### Phase 5: Validation & Cutover (1 hour)

**What:** Final validation before flipping read path.  
**How:**

```typescript
import { validateMigration } from "@/lib/migrations/skillCentricMigration";

const result = validateMigration(newSkillProgress, newInsights);
if (!result.success) {
  console.error("Migration failed validation:", result.errors);
  // Rollback and investigate
} else {
  console.log("✓ Migration validated");
  if (result.warnings.length > 0) {
    console.warn("Warnings:", result.warnings);
  }
}
```

---

## 🔄 How to Use Canonical Skills Going Forward

### When User Adds a New Source

Current (broken):
```typescript
// Source defines skillTargets as free-form strings
const source = {
  skillTargets: ["Kepemimpinan Strategis"] // Is this same as "Leadership"?
};
```

Future (fixed):
```typescript
// Lookup canonical skill by name/alias
import { SKILL_NAME_TO_ID } from "@/lib/skillTaxonomy";

const skillInput = "Kepemimpinan Strategis";
const skillId = SKILL_NAME_TO_ID[skillInput];
// → "skill-001" (Leadership canonical)

// Source references canonical skill
const source = {
  skillTargets: [skillId], // or ["Leadership"] by canonical name
};
```

### When Creating/Updating ActionItems

Current (broken):
```typescript
// Generated independently per source-skill combo
const actions = generateActionPlan(skillName);
// Result: "Schedule a meeting" appears in 3 separate SkillProgress records
```

Future (fixed):
```typescript
// Actions added directly to canonical SkillProgress.actionItems
const skill = getSkillProgress(accountId).find(sp => sp.skillId === skillId);

// If "Schedule a meeting" already exists, don't duplicate
const exists = skill.actionItems.some(ai => ai.text === "Schedule a meeting");
if (!exists) {
  skill.actionItems.push({
    id: generateId(),
    skillId,
    text: "Schedule a meeting",
    sourceIds: [sourceId],
    completed: false,
  });
}
```

### When Displaying Skills in UI

Current (broken):
```typescript
// Many duplicates for same skill
<SkillCard skill={skillProgress} />
// Could render "Leadership" 6 times if user has 6 sources
```

Future (fixed):
```typescript
// One aggregated card per skill
<SkillCard skill={skillProgress} sources={sourceIds} />
// Render once; sourceIds shows which books teach it
```

---

## ⚠️ Rollback Procedures

### If Phase 1 Fails

Delete keys:
- `skillflow:skills`
- `skillflow:migration:phase1`

### If Phase 2 Fails

1. Delete keys:
   - `skillflow:skill_progress_v2`
   - `skillflow:migration:phase2`

2. UI reads old format from `skillflow:skill_progress`

3. Investigate via `validateMigration()`

### If Phase 4 Fails

1. Delete keys:
   - `skillflow:insights_v2`
   - `skillflow:migration:phase4`

2. UI reads old format from `skillflow:insights`

3. Check orphaned insights with:
   ```typescript
   const insights = getInsights(accountId);
   const orphaned = insights.filter(i => !i.skillTarget);
   ```

---

## 📊 Validation Queries

### Check Deduplication Success

```typescript
import { CANONICAL_SKILLS } from "@/lib/skillTaxonomy";

const newSkillProgress = JSON.parse(
  localStorage.getItem("skillflow:skill_progress_v2") || "[]"
);

console.log("Canonical skills:", CANONICAL_SKILLS.length);
console.log("Migrated SkillProgress:", newSkillProgress.length);
console.log(
  "Deduplication ratio:",
  `${newSkillProgress.length} / ${oldSkillProgress.length}`
);
```

### Check Action Item Deduplication

```typescript
const byText = new Map();
for (const sp of newSkillProgress) {
  for (const ai of sp.actionItems) {
    if (byText.has(ai.text)) {
      const existing = byText.get(ai.text);
      existing.count++;
      existing.sources.push(...ai.sourceIds);
    } else {
      byText.set(ai.text, { count: 1, sources: ai.sourceIds });
    }
  }
}

// Should be 1 per unique text (within same skill)
for (const [text, data] of byText) {
  if (data.count > 1) {
    console.warn(`⚠️  Duplicate action: "${text}" (${data.count}x)`);
  }
}
```

### Check for Orphaned Insights

```typescript
const insights = JSON.parse(
  localStorage.getItem("skillflow:insights_v2") || "[]"
);

const orphaned = insights.filter(i => !i.skillId);
console.log(
  `${orphaned.length} orphaned insights (out of ${insights.length})`
);

orphaned.forEach(i => {
  console.warn(`  - "${i.quote.slice(0, 30)}..." [skillTarget: "${i.skillTarget}"]`);
});
```

---

## 📈 Expected Results (Benchmarks)

Using `seedBooks.ts` (50 books):

| Metric | Before | After | Ratio |
|---|---|---|---|
| SkillProgress records | ~150+ | ~38-40 | 4:1 dedup |
| Unique skills (by name) | ~80 variations | 38 canonical | 2.1x fewer |
| ActionItems total | ~750 | ~200 | 3.75:1 dedup |
| Avg sources per skill | 1 | 2.3 | (aggregation) |

---

## 🧪 Testing Checklist

- [ ] **Phase 1 Tests:**
  - [ ] `CANONICAL_SKILLS.length === 38`
  - [ ] No duplicates in skill names
  - [ ] All aliases resolve correctly via `SKILL_NAME_TO_ID`
  - [ ] Validation errors = 0

- [ ] **Phase 2 Tests:**
  - [ ] Old `skill_progress` count > new `skill_progress_v2` count
  - [ ] `sourceIds.length > 1` for multi-source skills
  - [ ] `level` is max level achieved
  - [ ] No `skillId` undefined

- [ ] **Phase 3 Tests (Auto):**
  - [ ] Action item count reduced by ~75%
  - [ ] `sourceIds` populated correctly
  - [ ] No duplicate action text within a skill

- [ ] **Phase 4 Tests:**
  - [ ] All `KeyInsight` records have `skillId`
  - [ ] Orphaned insights < 5%
  - [ ] No invalid `skillId` references

- [ ] **UI Tests:**
  - [ ] SkillCard renders once per skill (not per source)
  - [ ] Action items show once with source badges
  - [ ] Growing skills card aggregates correctly
  - [ ] Recent wins pulls from all sources

---

## 🚨 Known Issues & Mitigations

### Issue 1: Seed Data Has Inconsistent Skill Names

**Problem:** `seedBooks.ts` uses variations like "Kepemimpinan Strategis" not in taxonomy.  
**Mitigation:** Run deduplication audit; add to aliases or update seed.  
**Check:**
```typescript
import { SKILL_NAME_TO_ID } from "@/lib/skillTaxonomy";

const unmapped = [];
for (const source of seeds) {
  for (const skillName of source.skillTargets) {
    if (!SKILL_NAME_TO_ID[skillName]) {
      unmapped.push(skillName);
    }
  }
}
console.warn("Unmapped skills:", unmapped);
```

### Issue 2: Action Items Generated from Skill Name

**Problem:** `generateActionPlan(skillName)` uses old names, may not align with canonical skills.  
**Mitigation:** Don't use generator post-migration; manually curate actions per canonical skill.  
**Plan:** Create `hardcodedActionItems.ts` with hand-curated actions per skill.

### Issue 3: Evidence String → Array

**Problem:** Old `SkillProgress.evidence` is a single string (or empty).  
**Mitigation:** During migration, convert to `Evidence[]` with type="session_note".  
**Future:** Evidence created from insights, completed actions, session notes (rich).

---

## 📚 Code Examples

### Example 1: Read Aggregated Skill Progress

```typescript
// After migration
import { getSkillProgress } from "@/lib/accountStorage";

const skills = getSkillProgress(accountId); // Returns aggregated SkillProgress[]

for (const skill of skills) {
  console.log(`${skill.skillId}: ${skill.level}`);
  console.log(`  Taught in: ${skill.sourceIds.join(", ")}`);
  console.log(`  Actions: ${skill.actionItems.length}`);
  console.log(`  Completed: ${skill.actionItems.filter(a => a.completed).length}`);
}
```

### Example 2: Add Source & Update Skill Progress

```typescript
import { SKILL_NAME_TO_ID, CANONICAL_SKILLS } from "@/lib/skillTaxonomy";

// User adds new source "Emotional Intelligence" → skill
const newSource = {
  id: "src-new",
  title: "Emotional Intelligence 2.0",
  skillTargets: ["Leadership"], // or ["skill-001"] after migration
  // ...
};

// Find or create SkillProgress for Leadership
let skillProgress = skills.find(sp => sp.skillId === "skill-001");
if (!skillProgress) {
  skillProgress = {
    id: "sp-skill-001",
    skillId: "skill-001",
    level: "awareness",
    evidence: [],
    actionItems: [],
    sourceIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Add source to the set
if (!skillProgress.sourceIds.includes(newSource.id)) {
  skillProgress.sourceIds.push(newSource.id);
}

// Save updated (aggregated) skill progress
updateSkillProgress(accountId, skillProgress);
```

### Example 3: Deduplicate Action When Adding

```typescript
// User wants to add "Practice giving feedback" action
const newActionText = "Practice giving feedback to a team member";

// Check if it already exists (across all sources for this skill)
const exists = skillProgress.actionItems.some(ai => ai.text === newActionText);

if (!exists) {
  skillProgress.actionItems.push({
    id: generateId(),
    skillId: skillProgress.skillId,
    text: newActionText,
    completed: false,
    sourceIds: ["src-new"],
    createdAt: new Date().toISOString(),
  });
  updateSkillProgress(accountId, skillProgress);
}
```

---

## 🔗 Related Documentation

- [`DOMAIN_MODEL_AUDIT.md`](./DOMAIN_MODEL_AUDIT.md) — Full analysis & findings
- [`lib/types.refactored.ts`](./lib/types.refactored.ts) — New type definitions (WIP)
- [`lib/skillTaxonomy.ts`](./lib/skillTaxonomy.ts) — Canonical skill registry (ready to use)
- [`lib/migrations/skillCentricMigration.ts`](./lib/migrations/skillCentricMigration.ts) — Migration helpers

---

## ✅ Sign-Off Checklist

Before going live with Phase 1, confirm:

- [ ] All team members reviewed `DOMAIN_MODEL_AUDIT.md`
- [ ] Agreed on 38 canonical skills + aliases
- [ ] Backup of current localStorage created
- [ ] Test account prepared for Phase 1-5
- [ ] Rollback procedures documented and tested
- [ ] UI components identified that need updates (SkillCard, SkillOverview, etc.)
- [ ] Validated `skillTaxonomy.validateDeduplicationGroups()` returns no errors

---

**Next Steps:** Proceed to Phase 1 once checklist complete.
