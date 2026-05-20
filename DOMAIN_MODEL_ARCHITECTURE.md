# SkillFlow Domain Model Architecture

**Current Status:** Design Phase | Ready for Implementation  
**Target Architecture:** Skill-Centric, Deduplicated  
**Complexity Level:** Medium (3 phases, 1-2 weeks implementation)

---

## 🎯 Core Principle

**Skill is the first-class entity.** Everything else (sources, insights, actions, evidence) exists to support skill mastery.

---

## 📐 Entity Relationship Diagram

### Current Model (Source-Centric)
```
LearningSource (📚)
    ├─ id, title, creatorName
    ├─ skillTargets: string[] (weak refs)
    │   └─ generates → SkillProgress (one per combo)
    ├─ Sessions[]
    ├─ Insights[] (skillTarget?: string)
    └─ Tasks[]

SkillProgress (1:1 with source-skill combo)
    ├─ sourceId (FK)
    ├─ skillName (string, not ID)
    ├─ level, evidence (single string)
    └─ ActionItems[]
        └─ text, completed
```

**Problems:**
- Same skill in 2+ sources = 2+ SkillProgress records
- ActionItems duplicate across sources
- Evidence scattered, hard to aggregate
- No skill taxonomy or canonical names

---

### Proposed Model (Skill-Centric)
```
┌─────────────────────────────────────────────────────────────┐
│                   Skill (CANONICAL)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ • id (UUID): "skill-001"                             │  │
│  │ • name: "Leadership"                                  │  │
│  │ • aliases: ["Kepemimpinan", "Kepemimpinan Strategis"]│  │
│  │ • category: "Business"                                │  │
│  │ • domain: "Management"                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                        ↑ ↓ ↑ ↓ (1:N)                        │
│  ┌────────────┬────────────────────┬──────────────────────┐ │
│  │            │                    │                      │ │
│  ▼            ▼                    ▼                      ▼ │
│ Evidence  SkillProgress        ActionItem           KeyInsight
│ (NEW)     (AGGREGATED)         (DEDUPLICATED)       (UPDATED)
│           {                    {                     {
│ • Type:     • skillId (FK),      • skillId (FK),      • skillId (FK),
│   - insight • level,             • text,              • quote,
│   - session • evidence: [],      • completed,         • reflection,
│   - action  • sourceIds: [],     • sourceIds:[]       • tags[]
│   - mile-   • actionItems[]                           • sourceId
│     stone }                    }                      }
│ • Content   ↑ ↓ (1:N)          ↑ ↓ (1:N)             ↑ ↓ (1:1)
│ • Source ID
│ • Insight ID
│ • Session ID
│ • Action Item ID
│
│            ┌────────────────────────────────────────────────┐
│            │        LearningSource (📚, 📹, 📄)            │
│            │  • id, title, creatorName, progress            │
│            │  • skillTargets: string[] or skillId[]         │
│            │  • status, difficulty, createdAt              │
│            └────────────────────────────────────────────────┘
│                    ↓ ↑ (1:1)
│            ┌────────────────────────────────────────────────┐
│            │   LearningSession, SourceTask                  │
│            │  (unchanged structure)                         │
│            └────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- One SkillProgress per skill (globally aggregated)
- Actions deduplicated across sources
- Rich evidence from insights, sessions, milestones
- Canonical skill names + aliases for consistency
- sourceIds on SkillProgress shows which sources teach it

---

## 🗂️ Entity Specifications

### Skill (NEW)
**Canonical, immutable registry of skill concepts.**

```typescript
interface Skill {
  id: string;              // "skill-001"
  name: string;            // "Leadership" (canonical)
  aliases: string[];       // ["Kepemimpinan", "Manajemen Kepemimpinan"]
  category: string;        // "Business" | "Technical" | "Personal"
  domain?: string;         // "Management", "Software Engineering", etc.
  description?: string;    // "Ability to inspire and guide teams"
  createdAt: string;       // ISO timestamp
}
```

**Storage:** `skillflow:<accountId>:skills`  
**Count:** ~38-50 canonical skills  
**Ownership:** Shared across all users (not account-specific)  

---

### SkillProgress (REFACTORED)
**Aggregated mastery tracking for one skill.**

```typescript
interface SkillProgress {
  id: string;                    // "sp-skill-001"
  skillId: string;               // FK → Skill
  
  // Mastery level (highest achieved across all sources)
  level: SkillLevel;             // "awareness"|"understanding"|"applied"|"mastered"
  levelAchievedAt?: string;      // When first reached this level
  
  // Rich evidence pool (not just a string)
  evidence: Evidence[];          // Insight quotes, session notes, milestones
  
  // Shared action items (deduplicated)
  actionItems: ActionItem[];     // Same action across 2+ sources = 1 record
  
  // Which sources teach this skill
  sourceIds: string[];           // ["src-1", "src-2", "src-3"]
  
  createdAt: string;
  updatedAt: string;
}
```

**Storage:** `skillflow:<accountId>:skill_progress` (migrated from `skill_progress_v2`)  
**Lifecycle:** Created when first source added; persists even if source deleted  
**Aggregation:** level = max(all source-skill levels), sourceIds = union(sources)  

---

### Evidence (NEW)
**Proof points supporting skill mastery.**

```typescript
interface Evidence {
  id: string;                    // "ev-skill-001-001"
  skillId: string;               // FK → Skill
  
  type: "insight"                // What kind of evidence?
       | "session_note"
       | "action_completed"
       | "milestone";
  
  content: string;               // Quote, reflection, or description
  
  // Linkage (traceability)
  sourceId?: string;             // Which source (book, course)
  insightId?: string;            // If type="insight"
  sessionId?: string;            // If type="session_note"
  actionItemId?: string;         // If type="action_completed"
  
  createdAt: string;
}
```

**Storage:** `skillflow:<accountId>:evidence`  
**Purpose:** Audit trail of skill development  
**Aggregation:** Visible on SkillProgress; shows rich, cross-source evidence  

---

### ActionItem (DEDUPLICATED)
**One action per unique (skill, text) pair.**

```typescript
interface ActionItem {
  id: string;                    // "ai-skill-001-001"
  skillId: string;               // FK → Skill (changed from skillProgressId)
  
  text: string;                  // "Lead a team meeting"
                                 // (semantic, not source-specific)
  
  completed: boolean;
  completedAt?: string;          // When user marked it done
  
  // Which sources mention this action
  sourceIds: string[];           // e.g. ["book-1", "book-2", "course-3"]
  
  createdAt: string;
}
```

**Storage:** Part of `SkillProgress.actionItems`  
**Deduplication:** Merged if same `text` within same `skillId`  
**Semantics:** "Design team feedback system" not "Design team feedback system from Book A"  

---

### KeyInsight (UPDATED)
**Quote/reflection from a source, linked to skill.**

```typescript
interface KeyInsight {
  id: string;
  skillId: string;               // FK → Skill (was: skillTarget?: string)
  sourceId: string;              // Still source-scoped
  
  type?: InsightType;            // "quote" | "insight" | "concept" | "reflection"
  quote: string;                 // The actual quote/content
  reflection?: string;           // User's reflection
  tags: string[];
  
  createdAt: string;
}
```

**Storage:** `skillflow:<accountId>:insights`  
**Linkage:** Now references canonical skill (not loose string)  
**Impact:** Can be aggregated as evidence for skill  

---

### LearningSource (UNCHANGED STRUCTURE)
**Still represents books, courses, articles, etc.**

```typescript
interface LearningSource {
  id: string;
  title: string;
  creatorName: string;
  skillTargets: string[];        // Now: canonical names (or IDs after migration)
  progress: ProgressData;
  status: SourceStatus;
  // ... rest unchanged
}
```

**Note:** `skillTargets` cleaned up to use canonical names  
**No longer:** Responsible for creating SkillProgress  
**Relationship:** Linked via `SkillProgress.sourceIds` (reverse index)  

---

## 🔄 Data Flow: Creating a Skill

### Current (Broken)
```
User adds "Deep Work" (Cal Newport)
  ↓
Source created with skillTargets: ["Fokus Mendalam", "Manajemen Waktu"]
  ↓
2 separate SkillProgress records created
  ├─ SkillProgress { sourceId: "src-2", skillName: "Fokus Mendalam" }
  ├─ SkillProgress { sourceId: "src-2", skillName: "Manajemen Waktu" }
  └─ (if user also has "Atomic Habits" with same skills = 2 MORE records)
  ↓
Result: 4 SkillProgress records for 2 conceptual skills
```

### Future (Fixed)
```
User adds "Deep Work" (Cal Newport)
  ↓
Source created with skillTargets: ["Deep Focus", "Time Management"]
  ↓
Lookup: "Deep Focus" → skillId "skill-003", "Time Management" → skillId "skill-002"
  ↓
Update existing SkillProgress records:
  ├─ SkillProgress { skillId: "skill-003", sourceIds: [..., "src-2"] }
  ├─ SkillProgress { skillId: "skill-002", sourceIds: [..., "src-2"] }
  └─ (deduplicated automatically)
  ↓
Result: 2 aggregated SkillProgress records (same as before)
```

---

## 📊 Aggregation Examples

### Example 1: Leadership Across 6 Books

**Before Migration:**
```json
[
  { id: "sp-1", sourceId: "book-1", skillName: "Leadership", level: "awareness" },
  { id: "sp-2", sourceId: "book-2", skillName: "Kepemimpinan Strategis", level: "understanding" },
  { id: "sp-3", sourceId: "book-3", skillName: "Leadership", level: "awareness" },
  // ... 3 more ...
  // Total: 6 records, "leadership" not recognized as same skill
]
```

**After Migration:**
```json
{
  id: "sp-skill-001",
  skillId: "skill-001",
  name: "Leadership",
  level: "understanding",  // max level achieved
  sourceIds: ["book-1", "book-2", "book-3", ...],
  actionItems: [
    { id: "ai-1", text: "Identify a leadership mentor", sourceIds: ["book-1", "book-3", "book-5"] },
    { id: "ai-2", text: "Lead a team meeting", sourceIds: ["book-2", "book-6"] },
    // 3 unique actions (vs 6+ duplicates before)
  ],
  evidence: [
    { type: "insight", content: "\"Great leaders...\"", sourceId: "book-1" },
    { type: "insight", content: "\"Influence comes from...\"", sourceId: "book-2" },
    // All insights aggregated here
  ]
}
```

---

## 🧠 Logic: Updating Skill Level

**Question:** User completes all actions for "Leadership". Should level auto-advance?

**Answer:** No. Manual.

**Why:**
- Level represents competence, not task completion
- Completing all books' actions ≠ applied proficiency
- User should consciously decide when they've achieved next level

**How:**
- UI shows path: "awareness" → "understanding" (read 2+ sources)
- User presses "I've achieved this level"
- Triggers evidence review, confirmation
- Records `levelAchievedAt` timestamp

---

## 🚫 Anti-Patterns to Avoid

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| Duplicate action items | Same action in 2 sources = 2 records | Deduplicate on migrate, check before adding |
| Free-form skill names | "Leadership" vs "Kepemimpinan Strategis" lookup fails | Use canonical skill IDs from taxonomy |
| Evidence as single string | Can't aggregate insights, only storage | Use Evidence[] entity with references |
| SkillProgress per source-skill combo | Blocks aggregation, inflates record count | One SkillProgress per skill globally |
| No category/domain | Can't group skills by domain | Require category on Skill entity |

---

## 🔐 Immutability & Consistency Rules

### Immutable
- **Skill.id** — Never changes after creation
- **Skill.name** — Canonical name (use aliases for variations)
- **ActionItem.id** — Once created, ID stable

### Mutable
- **SkillProgress.level** — User advances mastery
- **SkillProgress.sourceIds** — Appended when new source added
- **ActionItem.sourceIds** — Union updated when related to more sources
- **ActionItem.completed** — Toggled by user

### Consistency Rules
1. **All skillIds must exist** → No orphaned references
2. **Action text unique per skill** → No duplicate text within same skillId
3. **sourceIds non-empty** → Every skill linked to ≥1 source
4. **Evidence references valid** → insightId, sessionId, etc. must exist if set

---

## 📈 Storage Size Impact

**Estimated with 50-book seed data:**

| Metric | Before | After | Ratio |
|---|---|---|---|
| SkillProgress records | ~150 | ~40 | 3.75× reduction |
| ActionItem records | ~750 | ~200 | 3.75× reduction |
| Evidence records | 0 (embedded) | ~100 | +0.1 KB per insight |
| Unique skill concepts | ~80 variations | ~38 canonical | 2.1× fewer |
| **Total storage impact** | ~45 KB | ~35 KB | **22% smaller** |

---

## 🎓 Key Concepts Summary

| Concept | Meaning | Example |
|---|---|---|
| **Skill** | First-class canonical entity | "Leadership" (skill-001) |
| **Alias** | Variation of skill name | "Kepemimpinan" → Leadership |
| **SkillProgress** | Aggregated mastery for one skill | One record covering 6 sources |
| **Evidence** | Proof of skill development | Insight quote, completed action |
| **ActionItem** | Task to practice skill | "Lead a team meeting" |
| **sourceIds** | Which sources teach skill | ["book-1", "book-2", "course-3"] |
| **Deduplication** | Same action across sources = 1 record | "Schedule meeting" deduplicated |

---

## 🚀 Next Steps

1. **Review** this architecture with team
2. **Validate** skill taxonomy (38 canonical skills OK?)
3. **Approve** migration plan (5 phases OK?)
4. **Execute** Phase 1: Create Skill Registry
5. **Test** Phase 2-5 in development account
6. **Rollback** procedures tested & documented
7. **Deploy** to production with feature flag

---

**For questions:** See `DOMAIN_MODEL_AUDIT.md` (detailed analysis) or `MIGRATION_GUIDE.md` (execution steps).
