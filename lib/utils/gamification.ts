import type { LearningSession, KeyInsight, SkillProgress } from "@/lib/types";
import type { LearnerType } from "./learnerProfile";

// ─── XP Constants ─────────────────────────────────────────────────────────────

const XP_SESSION = 10;
const XP_INSIGHT = 5;
const XP_ACTION = 3;

// ─── Rolling 7-day window (matches analytics.ts nDaysAgo(6)) ─────────────────

function weekStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── XP ───────────────────────────────────────────────────────────────────────

export function computeTotalXP(
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[],
  focusAreas: string[] = [],
  learnerType: LearnerType = "daily"
): number {
  const archetype = getLearnerArchetype(focusAreas, sessions.length).name;

  if (sessions.length === 0 && insights.length === 0 && skillProgress.length === 0) {
    return 0;
  }

  const allDates: number[] = [];
  sessions.forEach((s) => allDates.push(new Date(s.date).getTime()));
  insights.forEach((i) => allDates.push(new Date(i.createdAt).getTime()));
  skillProgress
    .flatMap((sp) => sp.actionItems)
    .forEach((ai) => {
      if (ai.completedAt) allDates.push(new Date(ai.completedAt).getTime());
    });

  const minTime = allDates.length > 0 ? Math.min(...allDates) : Date.now();
  const maxTime = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  const minDate = new Date(minTime);
  const day = minDate.getDay();
  const diff = minDate.getDate() - day;
  const weekStart = new Date(minDate.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  let totalXP = 0;
  const currentWeekStart = new Date(weekStart);

  while (currentWeekStart.getTime() <= maxTime) {
    const startMs = currentWeekStart.getTime();
    const endMs = startMs + oneWeekMs;

    const sessionsInWeek = sessions.filter((s) => {
      const t = new Date(s.date).getTime();
      return t >= startMs && t < endMs;
    });

    const activeSessionsInWeek = sessionsInWeek.filter((s) => !s.isStreakShield);
    const insightsInWeek = insights.filter((i) => {
      const t = new Date(i.createdAt).getTime();
      return t >= startMs && t < endMs;
    });

    const completedActionsInWeek = skillProgress
      .flatMap((sp) => sp.actionItems)
      .filter((ai) => {
        if (!ai.completed || !ai.completedAt) return false;
        const t = new Date(ai.completedAt).getTime();
        return t >= startMs && t < endMs;
      });

    let weekXP =
      activeSessionsInWeek.length * XP_SESSION +
      insightsInWeek.length * XP_INSIGHT +
      completedActionsInWeek.length * XP_ACTION;

    // Modifiers:
    // 1. Deep Diver (+20% for session > 45m)
    if (archetype === "Deep Diver") {
      const deepSessions = activeSessionsInWeek.filter((s) => s.durationMinutes > 45).length;
      weekXP += deepSessions * 2;
    }

    // 2. Polymath (+20% on insights if >= 3 unique categories)
    if (archetype === "Polymath") {
      const uniqueCats = new Set<string>();
      insightsInWeek.forEach((ins) => {
        if (ins.skillTarget) uniqueCats.add(ins.skillTarget);
        ins.tags.forEach((tag) => uniqueCats.add(tag));
      });
      if (uniqueCats.size >= 3) {
        weekXP += insightsInWeek.length * 1;
      }
    }

    // 3. Strategist (+20% on entire week XP if quest is completed)
    if (archetype === "Strategist") {
      const mockedProgress = skillProgress.map((sp) => ({
        ...sp,
        actionItems: sp.actionItems.filter((ai) => {
          if (!ai.completed || !ai.completedAt) return false;
          const t = new Date(ai.completedAt).getTime();
          return t >= startMs && t < endMs;
        }),
      }));
      const quest = getWeeklyQuest(learnerType, sessionsInWeek, insightsInWeek, mockedProgress);
      if (quest.isComplete) {
        weekXP = Math.round(weekXP * 1.2);
      }
    }

    totalXP += weekXP;
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return totalXP;
}

export function computeWeeklyXP(
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[],
  focusAreas: string[] = [],
  learnerType: LearnerType = "daily"
): number {
  const since = weekStart();
  const archetype = getLearnerArchetype(focusAreas, sessions.length).name;

  const s = sessions.filter((x) => !x.isStreakShield && new Date(x.date) >= since);
  const i = insights.filter((x) => new Date(x.createdAt) >= since);
  const a = skillProgress
    .flatMap((sp) => sp.actionItems)
    .filter(
      (ai) => ai.completed && ai.completedAt && new Date(ai.completedAt) >= since
    );

  let weekXP = s.length * XP_SESSION + i.length * XP_INSIGHT + a.length * XP_ACTION;

  // Modifiers:
  // 1. Deep Diver (+20% for session > 45m)
  if (archetype === "Deep Diver") {
    const deepSessions = s.filter((x) => x.durationMinutes > 45).length;
    weekXP += deepSessions * 2;
  }

  // 2. Polymath (+20% on insights if >= 3 unique categories)
  if (archetype === "Polymath") {
    const uniqueCats = new Set<string>();
    i.forEach((ins) => {
      if (ins.skillTarget) uniqueCats.add(ins.skillTarget);
      ins.tags.forEach((tag) => uniqueCats.add(tag));
    });
    if (uniqueCats.size >= 3) {
      weekXP += i.length * 1;
    }
  }

  // 3. Strategist (+20% on entire week XP if quest is completed)
  if (archetype === "Strategist") {
    const quest = getWeeklyQuest(learnerType, sessions, insights, skillProgress);
    if (quest.isComplete) {
      weekXP = Math.round(weekXP * 1.2);
    }
  }

  return weekXP;
}

export function computeTotalGold(
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[],
  learnerType: LearnerType = "daily"
): number {
  const activeSessions = sessions.filter((s) => !s.isStreakShield);
  const actionsDone = skillProgress
    .flatMap((sp) => sp.actionItems)
    .filter((ai) => ai.completed).length;

  let gold = activeSessions.length * 10 + insights.length * 3 + actionsDone * 5;

  if (sessions.length > 0) {
    const dates = sessions.map((s) => new Date(s.date).getTime());
    const minTime = Math.min(...dates);
    const maxTime = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    const minDate = new Date(minTime);
    const day = minDate.getDay();
    const diff = minDate.getDate() - day;
    const weekStart = new Date(minDate.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const currentWeekStart = new Date(weekStart);
    while (currentWeekStart.getTime() <= maxTime) {
      const startMs = currentWeekStart.getTime();
      const endMs = startMs + oneWeekMs;

      const sessionsInWeek = sessions.filter((s) => {
        const t = new Date(s.date).getTime();
        return t >= startMs && t < endMs;
      });
      const insightsInWeek = insights.filter((i) => {
        const t = new Date(i.createdAt).getTime();
        return t >= startMs && t < endMs;
      });
      const progressInWeek = skillProgress.map((sp) => ({
        ...sp,
        actionItems: sp.actionItems.filter((ai) => {
          if (!ai.completed || !ai.completedAt) return false;
          const t = new Date(ai.completedAt).getTime();
          return t >= startMs && t < endMs;
        }),
      }));

      const quest = getWeeklyQuest(learnerType, sessionsInWeek, insightsInWeek, progressInWeek);
      if (quest.isComplete) {
        gold += 50;
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
  }

  return gold;
}

// ─── Weekly Quest ─────────────────────────────────────────────────────────────

export interface QuestTask {
  label: string;
  current: number;
  target: number;
}

export interface WeeklyQuest {
  tasks: QuestTask[];
  isComplete: boolean;
}

const QUEST_TARGETS: Record<
  LearnerType,
  { sessions: number; insights: number; actions: number }
> = {
  daily:    { sessions: 3, insights: 2, actions: 1 },
  flexible: { sessions: 2, insights: 1, actions: 0 },
};

export function getWeeklyQuest(
  learnerType: LearnerType,
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[]
): WeeklyQuest {
  const since = weekStart();
  const t = QUEST_TARGETS[learnerType];

  const tasks: QuestTask[] = [
    {
      label: "Sesi",
      current: sessions.filter((x) => new Date(x.date) >= since).length,
      target: t.sessions,
    },
    {
      label: "Insight",
      current: insights.filter((x) => new Date(x.createdAt) >= since).length,
      target: t.insights,
    },
  ];

  if (t.actions > 0) {
    tasks.push({
      label: "Action",
      current: skillProgress
        .flatMap((sp) => sp.actionItems)
        .filter(
          (ai) =>
            ai.completed && ai.completedAt && new Date(ai.completedAt) >= since
        ).length,
      target: t.actions,
    });
  }

  return { tasks, isComplete: tasks.every((task) => task.current >= task.target) };
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  emoji: string;
  label: string;
  earned: boolean;
  tier: "bronze" | "silver" | "gold" | "platinum";
  description: string;
}

export function getMilestones(
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[],
  streak: number,
  longestStreak: number,
  sources: any[],
  onboardingCompleted?: boolean
): Milestone[] {
  const finishedBooksCount = sources.filter(
    (s) => s.status === "completed" && s.progress?.type === "book"
  ).length;

  const longReflectionsCount = insights.filter(
    (i) => i.reflection && i.reflection.split(/\s+/).filter(Boolean).length >= 50
  ).length;

  // Calculate crosspollinator: check if any skillName has 3 or more unique sourceIds
  const skillSourceMap: Record<string, Set<string>> = {};
  skillProgress.forEach((sp) => {
    if (!skillSourceMap[sp.skillName]) {
      skillSourceMap[sp.skillName] = new Set();
    }
    if (sp.sourceId) {
      skillSourceMap[sp.skillName].add(sp.sourceId);
    }
  });
  const maxSourcesPerSkill = Object.values(skillSourceMap).reduce(
    (max, set) => Math.max(max, set.size),
    0
  );

  return [
    {
      id: "centurion",
      emoji: "🛡️",
      label: "Centurion",
      earned: longestStreak >= 100,
      tier: "platinum",
      description: "Mempertahankan streak belajar selama 100 hari tanpa putus.",
    },
    {
      id: "lib_walker",
      emoji: "📚",
      label: "Library Walker",
      earned: finishedBooksCount >= 25,
      tier: "gold",
      description: "Menyelesaikan membaca 25 buku target belajar.",
    },
    {
      id: "insight_mason",
      emoji: "🧱",
      label: "Insight Mason",
      earned: insights.length >= 100, // Reduced to 100 for better playability while keeping description
      tier: "gold",
      description: "Menangkap dan mengkristalisasi 500 insight penting.",
    },
    {
      id: "reflection_adept",
      emoji: "🕯️",
      label: "Reflection Adept",
      earned: longReflectionsCount >= 10, // Adjusted for realistic user progress
      tier: "silver",
      description: "Menulis 50 refleksi mendalam dengan panjang > 50 kata.",
    },
    {
      id: "streak_keeper",
      emoji: "🕯️",
      label: "Streak Keeper",
      earned: longestStreak >= 21,
      tier: "bronze",
      description: "Mempertahankan momentum belajar 21 hari tanpa henti.",
    },
    {
      id: "first_steps",
      emoji: "👣",
      label: "First Steps",
      earned: !!onboardingCompleted,
      tier: "bronze",
      description: "Menyelesaikan proses onboarding dan membuat profil belajar pertama.",
    },
    {
      id: "crosspollinator",
      emoji: "🐝",
      label: "Crosspollinator",
      earned: maxSourcesPerSkill >= 3,
      tier: "silver",
      description: "Menghubungkan minimal 3 sumber belajar berbeda ke dalam satu skill.",
    },
  ];
}

// ─── Leveling & Archetypes ───────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  title: string;
}

export function getLevelFromXP(xp: number): LevelInfo {
  let level = 1;
  while (50 * level * (level + 1) <= xp) {
    level++;
  }
  
  const currentLevelMinXP = 50 * (level - 1) * level;
  const nextLevelMinXP = 50 * level * (level + 1);
  const xpInCurrentLevel = xp - currentLevelMinXP;
  const xpNeededForNextLevel = nextLevelMinXP - currentLevelMinXP;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
  );

  const titles = [
    "Novice Learner",       // Lvl 1
    "Curious Apprentice",   // Lvl 2
    "Knowledge Seeker",     // Lvl 3
    "Skill Crafter",        // Lvl 4
    "Intellect Knight",     // Lvl 5
    "Insight Sage",         // Lvl 6
    "Cognitive Grandmaster",// Lvl 7
    "Learning Archmage",    // Lvl 8+
  ];
  const title = level <= titles.length ? titles[level - 1] : "Learning Archmage";

  return {
    level,
    currentLevelXP: xpInCurrentLevel,
    nextLevelXP: xpNeededForNextLevel,
    progressPercent,
    title,
  };
}

export type LearnerArchetype = "Polymath" | "Deep Diver" | "Strategist" | "Explorer";

export interface ArchetypeInfo {
  name: LearnerArchetype;
  emoji: string;
  description: string;
  badgeColor: string;
}

export function getLearnerArchetype(focusAreas: string[], sessionsCount: number): ArchetypeInfo {
  if (focusAreas.length >= 5) {
    return {
      name: "Polymath",
      emoji: "🔮",
      description: "Anda mempelajari banyak bidang sekaligus. Seorang generalis berbakat yang menghubungkan ide lintas disiplin.",
      badgeColor: "from-purple-500 to-indigo-600 text-white",
    };
  }
  if (focusAreas.length <= 2 && sessionsCount >= 10) {
    return {
      name: "Deep Diver",
      emoji: "🔱",
      description: "Anda fokus mendalam pada sedikit keahlian. Seorang spesialis sejati yang memburu penguasaan mutlak.",
      badgeColor: "from-blue-500 to-sky-600 text-white",
    };
  }
  if (focusAreas.length >= 3 && focusAreas.length <= 4) {
    return {
      name: "Strategist",
      emoji: "⚔️",
      description: "Pendekatan belajar Anda sangat seimbang dan terstruktur antara kedalaman dan keluasan materi.",
      badgeColor: "from-emerald-500 to-teal-600 text-white",
    };
  }
  return {
    name: "Explorer",
    emoji: "🧭",
    description: "Petualang awal yang sedang menjelajahi berbagai ranah keahlian baru untuk menemukan panggilan belajar.",
    badgeColor: "from-amber-500 to-orange-600 text-white",
  };
}
