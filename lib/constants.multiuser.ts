/**
 * MULTI-USER STORAGE KEYS
 *
 * Standardized localStorage key patterns for multi-user architecture.
 * Keys encode: user | workspace | workspace+user ownership.
 *
 * Naming convention:
 *   skillflow:{scope}:{entity}
 *   where scope = "user:{userId}" | "workspace:{workspaceId}" | "workspace:{workspaceId}:user:{userId}"
 *
 * Usage:
 *   const key = getStorageKey("user", userId, "profile");
 *   const key = getStorageKey("workspace", workspaceId, "sources");
 *   const key = getStorageKey("workspace-user", { workspaceId, userId }, "skill_progress");
 */

// ─── USER-SCOPED KEYS ──────────────────────────────────────────────────────

export const USER_STORAGE_KEYS = {
  profile: (userId: string) => `skillflow:user:${userId}:profile`,
  preferences: (userId: string) => `skillflow:user:${userId}:preferences`,
  workspaces: (userId: string) => `skillflow:user:${userId}:workspaces`, // Array of workspace IDs
} as const;

// ─── WORKSPACE-SCOPED KEYS ────────────────────────────────────────────────

export const WORKSPACE_STORAGE_KEYS = {
  metadata: (workspaceId: string) => `skillflow:workspace:${workspaceId}:metadata`,
  members: (workspaceId: string) => `skillflow:workspace:${workspaceId}:members`, // Membership[]
  roles: (workspaceId: string) => `skillflow:workspace:${workspaceId}:roles`, // Role[]
  taxonomy: (workspaceId: string) => `skillflow:workspace:${workspaceId}:taxonomy`, // Skill[]
  learningPaths: (workspaceId: string) =>
    `skillflow:workspace:${workspaceId}:learning_paths`, // LearningPath[]
  sources: (workspaceId: string) => `skillflow:workspace:${workspaceId}:sources`, // LearningSourceMultiUser[]
  teamInsights: (workspaceId: string) => `skillflow:workspace:${workspaceId}:team_insights`, // Shared insights
  teamSources: (workspaceId: string) => `skillflow:workspace:${workspaceId}:team_sources`, // Workspace-visible sources
} as const;

// ─── WORKSPACE + USER-SCOPED KEYS ─────────────────────────────────────────

export const WORKSPACE_USER_STORAGE_KEYS = {
  skillProgress: (workspaceId: string, userId: string) =>
    `skillflow:workspace:${workspaceId}:user:${userId}:skill_progress`,
  sessions: (workspaceId: string, userId: string) =>
    `skillflow:workspace:${workspaceId}:user:${userId}:sessions`,
  insights: (workspaceId: string, userId: string) =>
    `skillflow:workspace:${workspaceId}:user:${userId}:insights`,
  evidence: (workspaceId: string, userId: string) =>
    `skillflow:workspace:${workspaceId}:user:${userId}:evidence`,
  tasks: (workspaceId: string, userId: string) =>
    `skillflow:workspace:${workspaceId}:user:${userId}:tasks`,
} as const;

// ─── LEGACY/MIGRATION KEYS (for backward compat) ──────────────────────────

/**
 * Old single-user keys (accountId pattern).
 * Used during migration from single-user to multi-user.
 *
 * Pattern: skillflow:{accountId}:{entity}
 * Where accountId = user's first/personal workspace ID
 */
export const LEGACY_STORAGE_KEYS = {
  sources: (accountId: string) => `skillflow:${accountId}:sources`,
  skillProgress: (accountId: string) => `skillflow:${accountId}:skill_progress`,
  insights: (accountId: string) => `skillflow:${accountId}:insights`,
  sessions: (accountId: string) => `skillflow:${accountId}:sessions`,
  skills: (accountId: string) => `skillflow:${accountId}:skills`,
  evidence: (accountId: string) => `skillflow:${accountId}:evidence`,
  tasks: (accountId: string) => `skillflow:${accountId}:tasks`,
} as const;

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────

/**
 * Get storage key for user-scoped data.
 */
export function getUserStorageKey(
  userId: string,
  entity: keyof typeof USER_STORAGE_KEYS
): string {
  return USER_STORAGE_KEYS[entity](userId);
}

/**
 * Get storage key for workspace-scoped data.
 */
export function getWorkspaceStorageKey(
  workspaceId: string,
  entity: keyof typeof WORKSPACE_STORAGE_KEYS
): string {
  return WORKSPACE_STORAGE_KEYS[entity](workspaceId);
}

/**
 * Get storage key for workspace + user-scoped data.
 */
export function getWorkspaceUserStorageKey(
  workspaceId: string,
  userId: string,
  entity: keyof typeof WORKSPACE_USER_STORAGE_KEYS
): string {
  return WORKSPACE_USER_STORAGE_KEYS[entity](workspaceId, userId);
}

// ─── MIGRATION UTILITIES ───────────────────────────────────────────────────

/**
 * Migrate data from legacy (single-user) to new (multi-user) key structure.
 *
 * Usage:
 *   const oldKey = LEGACY_STORAGE_KEYS.sources(accountId);
 *   const newKey = WORKSPACE_STORAGE_KEYS.sources(workspaceId);
 *   migrateStorageKey(oldKey, newKey);
 */
export function migrateStorageKey(oldKey: string, newKey: string): void {
  if (typeof window === "undefined") return;

  const data = localStorage.getItem(oldKey);
  if (data) {
    localStorage.setItem(newKey, data);
    // Don't delete old key yet (backward compat)
  }
}

/**
 * Get all storage keys for a workspace user.
 * Useful for cleanup/deletion operations.
 */
export function getWorkspaceUserStorageKeys(workspaceId: string, userId: string): string[] {
  return [
    WORKSPACE_USER_STORAGE_KEYS.skillProgress(workspaceId, userId),
    WORKSPACE_USER_STORAGE_KEYS.sessions(workspaceId, userId),
    WORKSPACE_USER_STORAGE_KEYS.insights(workspaceId, userId),
    WORKSPACE_USER_STORAGE_KEYS.evidence(workspaceId, userId),
  ];
}

/**
 * Get all storage keys for a workspace.
 * Useful for workspace deletion.
 */
export function getWorkspaceStorageKeys(workspaceId: string): string[] {
  return [
    WORKSPACE_STORAGE_KEYS.metadata(workspaceId),
    WORKSPACE_STORAGE_KEYS.members(workspaceId),
    WORKSPACE_STORAGE_KEYS.roles(workspaceId),
    WORKSPACE_STORAGE_KEYS.taxonomy(workspaceId),
    WORKSPACE_STORAGE_KEYS.learningPaths(workspaceId),
    WORKSPACE_STORAGE_KEYS.sources(workspaceId),
    WORKSPACE_STORAGE_KEYS.teamInsights(workspaceId),
    WORKSPACE_STORAGE_KEYS.teamSources(workspaceId),
  ];
}

// ─── SEEDED/DEFAULT DATA KEYS ─────────────────────────────────────────────

/**
 * System-wide defaults (not tied to user/workspace).
 * Used for canonical taxonomy, default roles, etc.
 */
export const SYSTEM_STORAGE_KEYS = {
  defaultRoles: "skillflow:system:default_roles",
  canonicalTaxonomy: "skillflow:system:canonical_taxonomy", // From Sprint 2
  seedDataInitialized: "skillflow:migration:seed_initialized",
  multiUserMigrationComplete: "skillflow:migration:multiuser_complete",
} as const;

// ─── FEATURE FLAGS (for rollout) ──────────────────────────────────────────

export const FEATURE_FLAGS = {
  multiUserEnabled: "skillflow:feature:multi_user_enabled",
  workspaceUIEnabled: "skillflow:feature:workspace_ui_enabled",
  permissionsEnforced: "skillflow:feature:permissions_enforced",
} as const;
