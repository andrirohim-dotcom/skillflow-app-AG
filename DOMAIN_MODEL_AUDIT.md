# SkillFlow Domain Model Audit

**Date:** 2026-04-20  
**Status:** Pre-Refactor Analysis  
**Objective:** Make Skill the canonical entity, eliminate duplication, clarify relationships

---

## 1. CURRENT STATE ANALYSIS

### 1.1 Entity Relationships (Current - Broken)

```
Source (canonical)
  ├─ skillTargets: string[] (weak reference)
  │   └─ triggers creation of SkillProgress(sourceId, skillName)
  ├─ Sessions
  ├─ Insights
  └─ SourceTasks

SkillProgress (derived from Source.skillTargets)
  ├─ sourceId (1:1 with Source)
  ├─ skillName (string, not ID)
  ├─ actionItems[]
  └─ evidence (single string)

ActionItem
  └─ skillProgressId (tied to source-skill combo)

KeyInsight
  ├─ skillTarget: string (loose, can be orphaned)
  └─ sourceId

SourceTask
  └─ sourceId only (no skill linkage)
```

### 1.2 Critical Issues Identified

#### Issue #1: Skill Not Canonical
- **Problem:** Skills exist as `SkillProgress` records, one per `(source, skillName)` pair
- **Impact:** Same skill across 2+ sources = 2+ separate records with separate action items
- **Example:** "Manajemen Tim" appears in 8 books = 8 `SkillProgress` records
- **Consequence:** Can't aggregate progress, evidence, or actions across sources

#### Issue #2: Massive Skill Duplication
Frequency analysis of `skillTargets` from seed data:
- "Manajemen Tim" (8), "Strategi Bisnis" (7), "Leadership" (6)
- **Likely Duplicates:**
  - "Leadership" (6) vs "Kepemimpinan Strategis" (6) — probably same concept
  - "Investasi" (4) vs "Investasi & Portofolio" (3) — should consolidate
  - "Fokus Mendalam" vs "Fokus" — inconsistent naming
  - "Pengambilan Keputusan" (2) vs "Keputusan Strategis" — variations

#### Issue #3: Weak Skill References
- `LearningSource.skillTargets: string[]` — names only, no IDs
- `KeyInsight.skillTarget?: string` — optional, loose reference
- `ActionItem.text` — no skill context in the action itself
- No way to enforce canonical skill names

#### Issue #4: Evidence Fragmentation
- `SkillProgress.evidence: string?` — single narrative string per source-skill combo
- Real evidence should come from:
  - KeyInsights (quotes, reflections)
  - LearningSession notes
  - Completed ActionItems
- Currently scattered, hard to aggregate

#### Issue #5: Action Items Not Centralized
- Generated per source-skill combo via `generateActionPlan(skillName)`
- **Problem:** If 3 books teach "Manajemen Tim", user sees 3×5=15 action items
- **Duplication:** Same action ("Schedule a team meeting") appears 3 times
- **No Deduplication:** User can't mark one action across all sources

#### Issue #6: No Skill Taxonomy
- Skill names are free-form strings
- No canonical naming → "Fokus" vs "Fokus Mendalam" vs "Fokus Strategis"
- No category/domain structure
- No aliases for UI normalization

#### Issue #7: Cascading Consistency Problems
- When user updates `SkillProgress.level`, it affects only that source-skill combo
- When user completes an `ActionItem`, it's marked done only for that combo
- Impossible to see global skill mastery

---

## 2. PROPOSED NEW MODEL

### 2.1 Core Canonical Entities

#### Skill (NEW - CANONICAL)
```typescript
interface Skill {
  id: string;                    // UUID
  name: string;                  // "Leadership" (canonical, normalized)
  aliases: string[];             // ["Kepemimpinan", "Kepemimpinan Strategis"]
  category: string;              // "Business", "Technical", "Personal"
  domain?: string;               // "Management", "Software Engineering"
  description?: string;
  createdAt: string;
}
```

**Ownership:** One record per distinct skill concept  
**Immutable:** Do not rename; use aliases for variations  
**Source:** Migrated from deduplicated `skillTargets` across all sources  

---

#### SkillProgress (REFACTORED - AGGREGATED)
```typescript
interface SkillProgress {
  id: string;                    // UUID
  skillId: string;               // FK → Skill (was: skillName string)
  
  // Aggregated progress
  level: SkillLevel;             // "awareness" | "understanding" | "applied" | "mastered"
  levelAchievedAt?: string;
  
  // Evidence: array of insight/session references (was: single evidence string)
  evidence: Evidence[];          // See Evidence entity below
  
  // Action items: shared across all sources for this skill
  actionItems: ActionItem[];     // NOT per-source-combo anymore
  
  // Which sources contributed to this skill
  sourceIds: string[];           // Back-reference to Sources teaching this skill
  
  createdAt: string;
  updatedAt: string;
}
```

**Ownership:** One record per skill (globally aggregated)  
**Lifecycle:** Created when user adds first source teaching skill; persists even if source deleted  

---

#### Evidence (NEW ENTITY)
```typescript
interface Evidence {
  id: string;
  skillId: string;               // FK → Skill
  type: "insight" | "session" | "action_completed" | "milestone";
  content: string;               // Narrative text / quote
  
  // Source linkage (optional, for traceability)
  sourceId?: string;
  insightId?: string;            // If type="insight", link to KeyInsight
  sessionId?: string;            // If type="session", link to LearningSession
  actionItemId?: string;         // If type="action_completed"
  
  createdAt: string;
}
```

**Purpose:** Audit trail of how skill was learned/evidenced  
**Cross-Source:** Can pull evidence from any source  

---

#### ActionItem (REFACTORED - DEDUPLICATED)
```typescript
interface ActionItem {
  id: string;
  skillId: string;               // FK → Skill (was: skillProgressId)
  text: string;
  completed: boolean;
  completedAt?: string;
  
  // Deduplication: which sources have this action
  sourceIds: string[];           // If from ["src-1", "src-2"], mark "Learning" together
}
```

**Ownership:** One per unique action (deduplicated)  
**Semantics:** "Implement async/await in a project" (not "Implement async/await in Book X")  

---

#### KeyInsight (UPDATED)
```typescript
interface KeyInsight {
  id: string;
  skillId: string;               // FK → Skill (was: skillTarget?: string)
  sourceId: string;              // Still source-scoped
  type: InsightType;
  quote: string;
  reflection?: string;
  tags: string[];
  createdAt: string;
}
```

**Changes:** `skillTarget` string → `skillId` FK  

---

### 2.2 Unchanged Entities

**LearningSource:**
- Remove or clean up `skillTargets: string[]` usage
- Still valid for tracking what was read/watched
- No longer responsible for creating SkillProgress

**LearningSession:**
- No changes to structure
- Can still reference `skillId` if needed (optional enhancement)

**SourceTask:**
- Can optionally add `skillId` FK for better context
- Still source-scoped

---

## 3. MIGRATION STRATEGY

### Phase 1: Create Canonical Skill Registry (Non-Breaking)

1. **Audit & Deduplication**
   - Extract all unique `skillTargets` from all sources
   - Group by semantic similarity (manual curation or fuzzy match)
   - Create canonical names + aliases

2. **Create Skill entities**
   - One `localStorage:skillflow:skills` key (new)
   - Write `Skill[]` with deduped names + aliases
   - Example:
     ```
     { id: "skill-1", name: "Leadership", aliases: ["Kepemimpinan", "Kepemimpinan Strategis"], category: "Business" }
     { id: "skill-2", name: "Investment", aliases: ["Investasi", "Investasi & Portofolio"], category: "Finance" }
     ```

3. **Create Skill → SkillName Mapping (UI Helper)**
   - Build lookup: "Kepemimpinan Strategis" → "skill-1" (Leadership)
   - Use in UI when displaying/creating skills

### Phase 2: Migrate SkillProgress (Atomic)

1. **Aggregate & Dedupe**
   - For each unique (skillId, NOT sourceId), collect all old `SkillProgress` records
   - Merge: `level` ← max level achieved, `sourceIds` ← union of old `sourceId`
   - Preserve `actionItems` (deduped by action text)

2. **Generate Evidence**
   - For each old `SkillProgress.evidence` string, create `Evidence` record
   - Link old insights via `KeyInsight.skillTarget` → new `KeyInsight.skillId`

3. **Rewrite SkillProgress**
   - Old: `skillflow:skill_progress` → many records per skill
   - New: `skillflow:skill_progress` → one record per skill
   - Keep `id` stable if possible, or remap

### Phase 3: Dedupe ActionItems (Complex)

1. **Identify Duplicates**
   - Group `ActionItem.text` by skill
   - If exact text appears 3+ times (same skill), it's likely duplicate

2. **Deduped Merge**
   - Create one `ActionItem` per unique (skill, action text)
   - Set `sourceIds` ← union of old source IDs

3. **Rewrite Storage**
   - Old structure stays for now (backward compat)
   - New reads use deduped list

### Phase 4: Update KeyInsight FK

1. **Migrate `skillTarget` string → `skillId`**
   - For each `KeyInsight`, look up skill name in mapping
   - If found, set `skillId`; else mark as orphaned
   - Handle orphans (log + manual review)

2. **Create Evidence Records**
   - For each `KeyInsight`, optionally create back-reference `Evidence` record
   - Establishes audit trail

### Phase 5: Soft Cutover & Validation

1. **Dual Writes** (1-2 releases)
   - Keep old SkillProgress writes
   - Also write new aggregated SkillProgress
   - Validate consistency

2. **Flip Read Path**
   - Component reads from new aggregated structure
   - Fallback to old if missing (graceful degrade)

3. **UI Verification**
   - Check: deduped actions show once, not 3× per source
   - Check: skill level aggregates correctly
   - Check: evidence from any source is visible

4. **Drop Old Format** (next major version)
   - Remove `skillflow:skill_progress` old format
   - Cleanup code

---

## 4. DUPLICATION & INCONSISTENCY FINDINGS

### 4.1 Skill Name Duplications (from seed data)

| Likely Canonical | Variations | Count |
|---|---|---|
| **Leadership** | "Leadership", "Kepemimpinan Strategis", "Kepemimpinan" | 6 + 6 + ? |
| **Investment** | "Investasi", "Investasi & Portofolio" | 4 + 3 |
| **Team Management** | "Manajemen Tim", "Manajemen Kelompok" | 8 + ? |
| **Focus** | "Fokus Mendalam", "Fokus", "Fokus Strategis" | varies |
| **Growth Mindset** | "Mindset Pertumbuhan", "Mindset Berkembang" | 5 + ? |
| **Decision Making** | "Pengambilan Keputusan", "Keputusan Strategis" | 2 + ? |

**Recommendation:** Audit seed data, consolidate to ~30-40 canonical skills with aliases.

### 4.2 ActionItem Duplication

- **Getting Things Done** (book 1) → 5 action items for "Manajemen Tugas"
- **Essentialism** (book 2) → 5 action items for "Manajemen Prioritas" (related to Tugas)
- **The One Thing** (book 3) → 5 action items for "Manajemen Waktu" (related to Prioritas)
- **Result:** User sees 15 action items for closely-related concepts

**Impact:** Cognitive overload, duplicate effort  
**Solution:** Deduped action pool per skill, with `sourceIds` indicating which books mention it

### 4.3 Evidence Fragmentation

Currently:
- `SkillProgress.evidence` is 1 per (source, skill) combo
- Same skill across 8 sources = up to 8 separate evidence strings
- No linkage to actual `KeyInsight` records (which have rich quotes)

After refactor:
- `Evidence[]` array on canonical `SkillProgress`
- Each `Evidence` can reference an `Insight`, `Session`, or completed `ActionItem`
- User sees holistic evidence for why they've achieved that level

---

## 5. IMPLEMENTATION CHECKLIST

- [ ] **Create `Skill` entity + storage**
- [ ] **Build skill deduplication script** (manually curate aliases)
- [ ] **Migrate `SkillProgress` to aggregated model**
- [ ] **Migrate `KeyInsight` skillTarget → skillId**
- [ ] **Create `Evidence` entity + linkage**
- [ ] **Dedupe `ActionItem` by text + skill**
- [ ] **Update components:** SkillCard, SkillProgress display, action item UI
- [ ] **Validation script:** Check no orphaned skills/actions
- [ ] **Update seed data:** Use new canonical skills only
- [ ] **Documentation:** Internal domain model diagram
- [ ] **Test:** MultiAccount, MultiSource per skill scenarios

---

## 6. PROPOSED DOMAIN MODEL DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                        Canonical Skill                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ id, name, aliases, category, domain, description           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                         (1) ↓ ↑ (many)                           │
│  ┌──────────────┬────────────────────┬──────────────┐            │
│  │              │                    │              │            │
│  ▼              ▼                    ▼              ▼            │
│ Evidence   SkillProgress        ActionItem     KeyInsight       │
│ (new)      (refactored)         (deduplicated) (updated FK)     │
│            {                    {              {                │
│   Type:      skillId,             skillId,       skillId,       │
│   • insight  level,               text,          quote,         │
│   • session  evidence: [],        completed,     reflection,    │
│   • action   sourceIds: []        sourceIds:[]   tags[]         │
│   • mile-    actionItems[]                                      │
│     stone  }                    }                }               │
│            ↓ ↑ (1:1)            ↓ ↑ (1:N)                      │
│  ┌──────────────────────────────────────────────────────────────┐
│  │                    LearningSource                            │
│  │  id, title, creatorName, progress, sessions[], insights[]   │
│  └──────────────────────────────────────────────────────────────┘
│            ↓ ↑ (1:1)
│  ┌──────────────────────────────────────────────────────────────┐
│  │               LearningSession, SourceTask                    │
│  └──────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

---

**Next Steps:** Review this audit, approve deduplication candidates, proceed with Phase 1.
