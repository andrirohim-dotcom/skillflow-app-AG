// ─── Onboarding Utilities ─────────────────────────────────────────────────────

import type { AccountProfile, UserRole } from "@/lib/accountTypes";

// ─── Predefined Goals ────────────────────────────────────────────────────────

export const PREDEFINED_GOALS = [
  "Naik jabatan atau ganti karir",
  "Membangun bisnis sendiri",
  "Meningkatkan skill teknis",
  "Menjadi lebih produktif",
  "Mencapai kebebasan finansial",
  "Mengembangkan kemampuan memimpin",
] as const;

export type PredefinedGoal = (typeof PREDEFINED_GOALS)[number];

// ─── Role Metadata ───────────────────────────────────────────────────────────

export interface UserRoleOption {
  value: UserRole;
  label: string;
  emoji: string;
  description: string;
}

export const USER_ROLE_OPTIONS: UserRoleOption[] = [
  {
    value: "pelajar",
    label: "Pelajar",
    emoji: "🎓",
    description: "Mahasiswa atau pelajar aktif",
  },
  {
    value: "profesional",
    label: "Profesional",
    emoji: "💼",
    description: "Bekerja di perusahaan atau organisasi",
  },
  {
    value: "entrepreneur",
    label: "Entrepreneur",
    emoji: "🚀",
    description: "Membangun atau menjalankan bisnis",
  },
  {
    value: "developer",
    label: "Developer",
    emoji: "⌨️",
    description: "Bergelut dengan kode dan teknologi",
  },
];

// ─── Role-Based Skill Suggestions ────────────────────────────────────────────

export const ROLE_SKILL_SUGGESTIONS: Record<UserRole, string[]> = {
  pelajar: ["Time Management", "Deep Focus", "Problem Solving", "Growth Mindset"],
  profesional: ["Leadership", "Effective Communication", "Strategic Planning", "Team Management"],
  entrepreneur: ["Entrepreneurship", "Business Model Design", "Decision Making", "Persuasive Communication"],
  developer: ["Software Engineering", "System Architecture", "Clean Code", "Problem Solving"],
};

// ─── State Helpers ───────────────────────────────────────────────────────────

/**
 * Cek apakah onboarding sudah selesai.
 * Akun dengan focusAreas yang sudah terisi dianggap sudah onboarding
 * (backward compat untuk akun lama dan seed data).
 */
export function isOnboardingComplete(account: AccountProfile): boolean {
  return account.onboardingCompleted === true || account.focusAreas.length > 0;
}

/**
 * Buat profil akun yang sudah di-onboard dengan data dari 3 langkah onboarding.
 */
export function buildOnboardedProfile(
  base: AccountProfile,
  userRole: UserRole,
  primaryGoal: string,
  focusAreas: string[]
): AccountProfile {
  return {
    ...base,
    userRole,
    primaryGoal: primaryGoal || base.primaryGoal,
    focusAreas,
    onboardingCompleted: true,
  };
}
