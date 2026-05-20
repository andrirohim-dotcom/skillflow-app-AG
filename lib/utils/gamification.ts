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
  skillProgress: SkillProgress[]
): number {
  const actionsDone = skillProgress
    .flatMap((sp) => sp.actionItems)
    .filter((ai) => ai.completed).length;
  return (
    sessions.length * XP_SESSION +
    insights.length * XP_INSIGHT +
    actionsDone * XP_ACTION
  );
}

export function computeWeeklyXP(
  sessions: LearningSession[],
  insights: KeyInsight[],
  skillProgress: SkillProgress[]
): number {
  const since = weekStart();
  const s = sessions.filter((x) => new Date(x.date) >= since).length;
  const i = insights.filter((x) => new Date(x.createdAt) >= since).length;
  const a = skillProgress
    .flatMap((sp) => sp.actionItems)
    .filter(
      (ai) =>
        ai.completed && ai.completedAt && new Date(ai.completedAt) >= since
    ).length;
  return s * XP_SESSION + i * XP_INSIGHT + a * XP_ACTION;
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
  streak: number
): Milestone[] {
  const masteredCount = skillProgress.filter(
    (sp) =>
      sp.actionItems.length > 0 && sp.actionItems.every((ai) => ai.completed)
  ).length;

  return [
    {
      id: "s10",
      emoji: "🎯",
      label: "10 Sesi Belajar",
      earned: sessions.length >= 10,
      tier: "bronze",
      description: "Memulai ritual belajar yang konsisten.",
    },
    {
      id: "s50",
      emoji: "🚀",
      label: "50 Sesi Belajar",
      earned: sessions.length >= 50,
      tier: "silver",
      description: "Mendedikasikan waktu signifikan untuk bertumbuh.",
    },
    {
      id: "i25",
      emoji: "💡",
      label: "25 Insight Dicatat",
      earned: insights.length >= 25,
      tier: "gold",
      description: "Mengkristalisasi pengetahuan penting dari berbagai sumber.",
    },
    {
      id: "m5",
      emoji: "🏅",
      label: "5 Skill Dikuasai",
      earned: masteredCount >= 5,
      tier: "platinum",
      description: "Menyelesaikan seluruh action items pada 5 ranah keahlian.",
    },
    {
      id: "str7",
      emoji: "🔥",
      label: "7 Hari Streak",
      earned: streak >= 7,
      tier: "bronze",
      description: "Mempertahankan momentum harian selama seminggu penuh.",
    },
    {
      id: "str30",
      emoji: "⚡",
      label: "30 Hari Streak",
      earned: streak >= 30,
      tier: "gold",
      description: "Membangun identitas belajar yang kokoh sebulan tanpa henti.",
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
