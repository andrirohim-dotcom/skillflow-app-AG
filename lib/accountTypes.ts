// ─── Account Types ────────────────────────────────────────────────────────────

export type AccountRole = "owner" | "member" | "child" | "mentor";
export type LearningMode = "daily" | "flexible";
export type GamificationMode = "light" | "standard";

/** Peran / identitas profesional pengguna — diset saat onboarding */
export type UserRole = "pelajar" | "profesional" | "entrepreneur" | "developer";

export interface AccountProfile {
  id: string;
  name: string;
  /** Emoji or initials used as avatar */
  avatar: string;
  bio?: string;
  role: AccountRole;
  learningMode: LearningMode;
  focusAreas: string[];
  primaryGoal?: string;
  weeklyGoal?: number; // minutes per week
  reminderPreference?: "daily" | "weekdays" | "none";
  gamificationMode: GamificationMode;
  createdAt: string;
  archivedAt?: string;
  /** Peran profesional pengguna — diset saat onboarding langkah 1 */
  userRole?: UserRole;
  /** true setelah pengguna menyelesaikan atau melewati onboarding */
  onboardingCompleted?: boolean;
}

// ─── Account Progress (computed + persisted) ──────────────────────────────────

export type AccountLevel =
  | "Pemula"
  | "Penjelajah"
  | "Praktisi"
  | "Mahir"
  | "Ahli";

export interface BadgeId {
  id:
    | "first_insight"
    | "deep_reader"
    | "action_closer"
    | "comeback_learner"
    | "week_warrior"
    | "skill_master";
  unlockedAt: string;
}

export interface AccountProgress {
  xp: number;
  level: AccountLevel;
  streak: number;
  weeklyQuestProgress: number; // 0–100 pct
  milestonesUnlocked: string[];
  badges: BadgeId[];
  comebackEligible: boolean;
}

// ─── Default Account ──────────────────────────────────────────────────────────

/** The default account ID maps to the original (unnamespaced) storage keys.
 *  This guarantees zero-migration backward compatibility. */
export const DEFAULT_ACCOUNT_ID = "acc_default";

export function createDefaultAccount(): AccountProfile {
  return {
    id: DEFAULT_ACCOUNT_ID,
    name: "Saya",
    avatar: "🧑",
    role: "owner",
    learningMode: "daily",
    focusAreas: [],
    gamificationMode: "standard",
    createdAt: new Date().toISOString(),
  };
}
