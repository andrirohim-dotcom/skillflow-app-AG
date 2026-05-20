# SkillFlow Progress Engine Audit & Redesign

**Status:** Design Phase | Ready for Implementation  
**Target:** Evidence-based learning momentum + intelligent action ranking  
**Complexity Level:** High (new scoring algorithms, momentum tracking, stagnation detection)

---

## 🎯 Executive Summary

**Current State (Consumption-Based):**
- Progress = (completed actions / total actions) × 100
- Skill level = manual user input (awareness → understanding → applied → mastered)
- No connection between content consumed and skill mastery
- Action prioritization = arbitrary (not based on skill needs)
- No momentum or stagnation signals

**Target State (Evidence-Based):**
- Progress = aggregated proof points (insights, completions, milestones, reflections)
- Skill level = auto-calculated from evidence + user confirmation
- "Learning momentum" = session frequency trend, insight density, completion velocity
- "Stagnation" = days since last activity, zero new insights
- Next best action = ranked by: skill urgency, momentum state, quick-win potential

---

## 📊 Current Implementation Analysis

### Current Progress Calculation (`lib/utils/analytics.ts`)

```typescript
// CURRENT: Action-completion based
getSkillMastery(skillProgress: SkillProgress): number {
  const completed = skillProgress.actionItems.filter(a => a.completed).length;
  const total = skillProgress.actionItems.length;
  return total > 0 ? (completed / total) * 100 : 0;
}

// CURRENT: Session frequency based
getConsistencyScore(sessions: LearningSession[]): number {
  const activeDays = new Set(sessions.map(s => s.dateStarted?.split('T')[0])).size;
  const daysSinceFirstSession = daysDiff(sessions[0]?.dateStarted, today);
  return daysSinceFirstSession > 0 ? (activeDays / daysSinceFirstSession) * 100 : 0;
}
```

**Problems:**
1. Completing 5 trivial actions ≠ mastery of complex skill
2. No distinction between reading (consume) and learning (apply)
3. Level is manual, not tied to evidence
4. Consistency measured as % of days with any session, not quality or focus

### Current Source Progress Calculation (`lib/utils/sourceProgress.ts`)

```typescript
// CURRENT: Consumption-based (pages, minutes, modules)
calculateSourceProgress(source: LearningSource): SourceProgressStats {
  if (source.progress.type === 'book') {
    const pct = (source.progress.currentPage / source.progress.totalPages) * 100;
    return { pct, consumed: currentPage, total: totalPages, unitLabel: "halaman" };
  }
  // Similar for youtube (minutes), article (%), podcast (minutes), course (modules)
}
```

**Problems:**
1. Treats all content equally (100 pages on calculus = 100 pages on marketing)
2. No feedback loop from learning outcomes back to progress
3. Completion rate for source doesn't mean skill acquired
4. User reads 50% of a book but gains 80% of key insights — system shows 50%

---

## 🎓 New Evidence-Based Model

### Evidence Types

| Type | Source | Example | Weight |
|------|--------|---------|--------|
| **insight** | KeyInsight | "This quote changed how I think about X" | 1.0 |
| **session_note** | LearningSession | Reflection written after study | 0.8 |
| **action_completed** | ActionItem | "Practiced giving feedback" | 1.2 |
| **milestone** | Explicit user action | "I achieved understanding of Y" | 2.0 |

**Evidence Entry Example:**
```typescript
interface Evidence {
  id: string;
  skillId: string;
  type: "insight" | "session_note" | "action_completed" | "milestone";
  content: string;
  weight: number;  // Normalized: 0.8–2.0
  sourceId?: string;
  insightId?: string;
  sessionId?: string;
  actionItemId?: string;
  createdAt: string;
}
```

---

## 📈 New Progress Engine Functions

### 1. Evidence-Based Skill Level

```typescript
/**
 * Calculate skill level from evidence, not manual input.
 * 
 * Progression path:
 * - "awareness" (0–5 proof points)
 * - "understanding" (5–15 proof points OR ≥2 completed actions)
 * - "applied" (≥15 proof points AND ≥5 completed actions AND ≥2 sources)
 * - "mastered" (≥30 proof points AND ≥10 completed actions AND ≥3 sources AND user milestone)
 */
function calculateSkillLevelFromEvidence(
  skillProgress: SkillProgress,
  evidence: Evidence[]
): SkillLevel {
  // Count evidence by type, apply weights
  const evidenceScore = evidence
    .filter(e => e.skillId === skillProgress.skillId)
    .reduce((sum, e) => sum + e.weight, 0);
  
  // Count completed actions, data from sources
  const completedActions = skillProgress.actionItems.filter(a => a.completed).length;
  const sourceCount = skillProgress.sourceIds.length;
  
  // Determine level based on thresholds
  if (evidenceScore >= 30 && completedActions >= 10 && sourceCount >= 3) {
    return "mastered";
  } else if (evidenceScore >= 15 && completedActions >= 5 && sourceCount >= 2) {
    return "applied";
  } else if (evidenceScore >= 5 || completedActions >= 2) {
    return "understanding";
  } else {
    return "awareness";
  }
}
```

### 2. Learning Momentum Score

Detects if learning is accelerating or stalling.

```typescript
/**
 * Momentum = measure of learning velocity + consistency
 * 
 * Combines:
 * 1. Insight density (insights per 7 days)
 * 2. Completion velocity (actions completed per 7 days)
 * 3. Session streak (consecutive days with activity)
 * 4. Trend (last week vs previous week)
 */
function calculateLearningMomentum(
  skillProgress: SkillProgress,
  evidence: Evidence[],
  sessions: LearningSession[],
  now: Date = new Date()
): {
  momentum: "accelerating" | "steady" | "declining" | "stagnant";
  score: number; // 0–100
  daysSinceLastActivity: number;
} {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // Insight density: insights per 7 days
  const recentInsights = evidence
    .filter(e => e.skillId === skillProgress.skillId && e.type === 'insight')
    .filter(e => new Date(e.createdAt) >= sevenDaysAgo).length;
  const priorInsights = evidence
    .filter(e => e.skillId === skillProgress.skillId && e.type === 'insight')
    .filter(e => new Date(e.createdAt) >= fourteenDaysAgo && new Date(e.createdAt) < sevenDaysAgo).length;
  
  // Completion velocity: actions per 7 days
  const recentCompletions = skillProgress.actionItems
    .filter(a => a.completedAt && new Date(a.completedAt) >= sevenDaysAgo).length;
  const priorCompletions = skillProgress.actionItems
    .filter(a => a.completedAt && new Date(a.completedAt) >= fourteenDaysAgo && new Date(a.completedAt) < sevenDaysAgo).length;
  
  // Session streak
  const activeSkillSessions = sessions.filter(s =>
    s.skillTags?.includes(skillProgress.skillId)
  );
  const currentStreak = calculateStreak(activeSkillSessions);
  
  // Trend direction
  const insightTrend = recentInsights - priorInsights;
  const completionTrend = recentCompletions - priorCompletions;
  
  // Days since last activity
  const lastActivity = Math.max(
    evidence.filter(e => e.skillId === skillProgress.skillId).length > 0
      ? new Date(evidence.filter(e => e.skillId === skillProgress.skillId).pop()!.createdAt).getTime()
      : 0,
    activeSkillSessions.length > 0
      ? new Date(activeSkillSessions[activeSkillSessions.length - 1].dateStarted).getTime()
      : 0
  );
  const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity) / (24 * 60 * 60 * 1000));
  
  // Composite score
  let score = 0;
  score += recentInsights * 15; // Max 3 insights/week = 45 points
  score += recentCompletions * 10; // Max 5 completions/week = 50 points
  score += Math.min(currentStreak, 7) * 3; // Max 7-day streak = 21 points (max 116 before normalization)
  
  // Trend boost/penalty
  if (insightTrend > 0 || completionTrend > 0) {
    score += 10; // Accelerating
  } else if (insightTrend < 0 || completionTrend < 0) {
    score -= 10; // Declining
  }
  
  // Normalize to 0–100
  score = Math.min(100, Math.max(0, score));
  
  // Determine momentum state
  let momentum: "accelerating" | "steady" | "declining" | "stagnant";
  if (daysSinceLastActivity > 14) {
    momentum = "stagnant";
  } else if (insightTrend > 0 && completionTrend > 0) {
    momentum = "accelerating";
  } else if (insightTrend < 0 || completionTrend < 0) {
    momentum = "declining";
  } else {
    momentum = "steady";
  }
  
  return { momentum, score, daysSinceLastActivity };
}
```

### 3. Stagnation Detection

```typescript
/**
 * Detect skills that have gone idle.
 * Used to prioritize "restart" actions.
 */
function detectStagnation(
  skillProgress: SkillProgress,
  evidence: Evidence[],
  thresholdDays: number = 14
): {
  isStagnant: boolean;
  daysSinceActivity: number;
  lastActivityDate: Date | null;
} {
  const skillEvidence = evidence.filter(e => e.skillId === skillProgress.skillId);
  if (skillEvidence.length === 0) {
    return {
      isStagnant: true,
      daysSinceActivity: Infinity,
      lastActivityDate: null,
    };
  }
  
  const lastActivityDate = new Date(
    Math.max(...skillEvidence.map(e => new Date(e.createdAt).getTime()))
  );
  const daysSinceActivity = Math.floor(
    (new Date().getTime() - lastActivityDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  
  return {
    isStagnant: daysSinceActivity > thresholdDays,
    daysSinceActivity,
    lastActivityDate,
  };
}
```

---

## 🎯 Next Best Action Ranking Algorithm

The "next best action" is NOT simply the first uncompleted action. It's a scored, multi-factor ranking that considers:

1. **Skill Urgency** (40%): Stagnant skills need attention; mastered skills don't
2. **Action Momentum** (30%): Capitalize on active learning streaks
3. **Quick-Win Potential** (20%): Actions from sources user is actively consuming
4. **Evidence Gaps** (10%): Missing proof points to advance level

```typescript
/**
 * Score and rank all incomplete actions across all skills.
 * Returns the single highest-value action to do next.
 */
function getNextBestAction(
  allSkillProgress: SkillProgress[],
  allEvidence: Evidence[],
  allSessions: LearningSession[],
  allSources: LearningSource[]
): {
  action: ActionItem;
  skillId: string;
  skillName: string;
  reasoning: string;
  score: number;
} | null {
  const scoredActions: Array<{
    action: ActionItem;
    skillId: string;
    skillName: string;
    score: number;
    components: {
      skillUrgency: number;
      actionMomentum: number;
      quickWin: number;
      evidenceGap: number;
    };
  }> = [];
  
  // For each skill, score its incomplete actions
  for (const skill of allSkillProgress) {
    const momentum = calculateLearningMomentum(skill, allEvidence, allSessions);
    const stagnation = detectStagnation(skill, allEvidence);
    
    // Skill urgency: stagnant skills are most urgent
    let skillUrgency = 0;
    if (stagnation.isStagnant) {
      skillUrgency = 40; // Full weight
    } else if (momentum.momentum === "declining") {
      skillUrgency = 25;
    } else if (momentum.momentum === "steady") {
      skillUrgency = 15;
    } else if (momentum.momentum === "accelerating") {
      skillUrgency = 5; // Lower priority if already rolling
    }
    
    // Evidence gap: missing proof points to next level?
    let evidenceGap = 0;
    const skillLevel = skill.level || "awareness";
    const levelIndex = ["awareness", "understanding", "applied", "mastered"].indexOf(skillLevel);
    const nextLevelThresholds = [5, 15, 30]; // Evidence point thresholds
    const currentEvidenceScore = allEvidence
      .filter(e => e.skillId === skill.skillId)
      .reduce((sum, e) => sum + e.weight, 0);
    if (levelIndex < 3 && currentEvidenceScore < nextLevelThresholds[levelIndex]) {
      evidenceGap = 10; // Need more evidence to advance
    }
    
    // For each incomplete action in this skill
    for (const action of skill.actionItems.filter(a => !a.completed)) {
      // Action momentum: is user actively consuming sources this action comes from?
      let actionMomentum = 0;
      const activeSources = action.sourceIds
        .map(sid => allSources.find(s => s.id === sid))
        .filter(s => s && s.progress && (
          (s.progress.type === 'book' && s.progress.currentPage > 0) ||
          (s.progress.type === 'youtube' && s.progress.watchedMinutes > 0) ||
          (s.progress.type === 'course' && s.progress.completedModules > 0)
        ));
      if (activeSources.length > 0) {
        actionMomentum = Math.min(30, activeSources.length * 10); // Up to 30 points
      }
      
      // Quick-win potential: actions from recently-used sources score higher
      let quickWin = 0;
      const recentSessions = allSessions.filter(s =>
        new Date(s.dateStarted).getTime() > new Date().getTime() - (7 * 24 * 60 * 60 * 1000)
      );
      for (const source of action.sourceIds) {
        if (recentSessions.some(s => s.sourceId === source)) {
          quickWin += 10; // Source used in last 7 days
        }
      }
      quickWin = Math.min(20, quickWin);
      
      // Composite score
      const score = (skillUrgency * 0.4) + (actionMomentum * 0.3) + (quickWin * 0.2) + (evidenceGap * 0.1);
      
      scoredActions.push({
        action,
        skillId: skill.skillId,
        skillName: skill.id, // Will be replaced with actual skill name from taxonomy
        score,
        components: {
          skillUrgency,
          actionMomentum,
          quickWin,
          evidenceGap,
        },
      });
    }
  }
  
  if (scoredActions.length === 0) {
    return null;
  }
  
  // Return highest-scored action
  const best = scoredActions.sort((a, b) => b.score - a.score)[0];
  
  let reasoning = "";
  if (best.components.skillUrgency > 20) {
    reasoning = "Skill sedang tidak aktif — waktu untuk kembali.";
  } else if (best.components.actionMomentum > 20) {
    reasoning = "Kamu sedang aktif belajar — lanjutkan momentum.";
  } else if (best.components.quickWin > 10) {
    reasoning = "Sumber terkait sedang dipelajari — aksi cepat.";
  } else if (best.components.evidenceGap > 5) {
    reasoning = "Bukti lebih diperlukan untuk naik level.";
  } else {
    reasoning = "Aksi penting untuk skill ini.";
  }
  
  return {
    ...best,
    reasoning,
  };
}
```

---

## 🔄 Data Flow: Adding Evidence

When user completes action or writes insight:

```
User marks action "Practice feedback" complete
  ↓
ActionItem.completed = true, completedAt = now
  ↓
New Evidence record created:
  {
    id: "ev-skill-001-...",
    skillId: "skill-001",
    type: "action_completed",
    content: "Completed: Practice giving feedback to team member",
    weight: 1.2,
    actionItemId: "ai-skill-001-...",
    createdAt: now
  }
  ↓
calculateSkillLevelFromEvidence() re-evaluated
  ├─ If evidence crosses threshold → level auto-advances (with confirmation)
  └─ If level advanced → milestone created
  ↓
calculateLearningMomentum() updated
  └─ Completion velocity increases, trend changes from "declining" to "steady"
  ↓
getNextBestAction() re-ranked
  └─ Other skills with stagnation now rank higher
```

---

## 📊 Storage Impact

| Metric | Current | Future | Ratio |
|---|---|---|---|
| SkillProgress entities | ~40 | 40 | 1:1 (same) |
| Evidence records (NEW) | N/A | ~500 | +10 KB |
| Milestones (NEW) | 0 | ~80 | +5 KB |
| **Total additional storage** | — | — | **~15 KB** |

Negligible impact; evidence is lightweight references to existing entities.

---

## 🎓 Implementation Checklist

- [ ] **Phase 1:** Create Evidence entity + storage layer
- [ ] **Phase 2:** Implement calculateSkillLevelFromEvidence() function
- [ ] **Phase 3:** Implement calculateLearningMomentum() + stagnation detection
- [ ] **Phase 4:** Implement getNextBestAction() ranking algorithm
- [ ] **Phase 5:** Wire evidence creation on action completion + insight creation
- [ ] **Phase 6:** Add milestone system (auto-created on level advancement)
- [ ] **Phase 7:** Update dashboard to show momentum state + stagnation warnings
- [ ] **Phase 8:** Update SkillPage to show evidence timeline + level path
- [ ] **Testing:** Validate scoring against seed data (verify stagnant skills ranked first, accelerating skills deprioritized)

---

## 🚀 Next Steps

1. Review this audit with team
2. Validate thresholds (5/15/30 evidence points for level progression)
3. Approve ranking weights (40/30/20/10 for skill urgency/momentum/quick-win/evidence gap)
4. Implement Phase 1–3 in lib/utils/progressEngine.ts
5. Test with refactored seed data (from lib/seedRefactored.ts)
6. Wire into dashboard components (NextBestActionCard, SkillProgressCard)

---

**For questions:** See `DOMAIN_MODEL_ARCHITECTURE.md` for skill model or `MIGRATION_GUIDE.md` for Phase 1 execution.
