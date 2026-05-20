export type UserRole = "pelajar" | "profesional" | "entrepreneur" | "developer";
export type GamificationMode = "light" | "standard";

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio?: string;
  userRole?: UserRole;
  focusAreas: string[]; // repurposed as targetSkills in UI
  primaryGoal?: string;
  weeklyGoal?: number;
  gamificationMode: GamificationMode;
  onboardingCompleted: boolean;
  isAdmin: boolean;
  suspendedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Mapper: Supabase snake_case row → Profile camelCase
export function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    avatar: (row.avatar as string) ?? "🧑",
    bio: row.bio as string | undefined,
    userRole: row.user_role as UserRole | undefined,
    focusAreas: (row.focus_areas as string[]) ?? [],
    primaryGoal: row.primary_goal as string | undefined,
    weeklyGoal: row.weekly_goal as number | undefined,
    gamificationMode: ((row.gamification_mode as string) ?? "standard") as GamificationMode,
    onboardingCompleted: (row.onboarding_completed as boolean) ?? false,
    isAdmin: (row.is_admin as boolean) ?? false,
    suspendedAt: row.suspended_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Mapper: Profile camelCase → Supabase snake_case for update
export function profileToRow(profile: Partial<Profile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (profile.name !== undefined) row.name = profile.name;
  if (profile.avatar !== undefined) row.avatar = profile.avatar;
  if (profile.bio !== undefined) row.bio = profile.bio;
  if (profile.userRole !== undefined) row.user_role = profile.userRole;
  if (profile.focusAreas !== undefined) row.focus_areas = profile.focusAreas;
  if (profile.primaryGoal !== undefined) row.primary_goal = profile.primaryGoal;
  if (profile.weeklyGoal !== undefined) row.weekly_goal = profile.weeklyGoal;
  if (profile.gamificationMode !== undefined) row.gamification_mode = profile.gamificationMode;
  if (profile.onboardingCompleted !== undefined) row.onboarding_completed = profile.onboardingCompleted;
  row.updated_at = new Date().toISOString();
  return row;
}
