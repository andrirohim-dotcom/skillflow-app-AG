/**
 * MULTI-USER SAAS TYPES
 *
 * Defines User, Workspace, Membership, Role, and LearningPath entities.
 * Extends lib/types.ts with workspace + user scoping.
 *
 * Storage: Still localStorage, but keys now include workspaceId + userId
 * Auth: Not yet (Phase 4); using mock User for now
 * Persistence: Cloud migration in Phase 4
 *
 * Related:
 * - lib/types.ts (existing entities + refactored versions with workspace scoping)
 * - lib/types.refactored.ts (Sprint 2: skill-centric model)
 * - lib/constants.multiuser.ts (storage keys for multi-user)
 */

import type { Skill, Evidence } from "./types.refactored";

// ─── USER (WHO is learning?) ────────────────────────────────────────────────

export interface User {
  id: string; // UUID
  email: string; // Unique
  name: string;
  profile?: {
    avatar?: string; // URL or emoji
    bio?: string;
    timezone?: string; // IANA timezone, default: "Asia/Jakarta"
  };
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface UserPreferences {
  userId: string; // FK → User.id
  theme?: "light" | "dark" | "auto";
  language?: "id" | "en"; // Default: "id"
  timezone?: string;
  notificationEmail?: boolean;
  subscribedWorkspaces?: string[]; // Array of workspace IDs user has joined
}

// ─── WORKSPACE (WHERE does learning happen?) ────────────────────────────────

export interface Workspace {
  id: string; // UUID, "ws-personal-001" or "ws-acme-corp-2024"
  name: string; // "Acme Corp Learning", "Personal Lab"
  type: "personal" | "team" | "organization";
  ownerId: string; // FK → User.id
  description?: string;
  settings?: {
    timezone?: string; // Default to owner's timezone
    language?: string; // Default: "id"
    visibility?: "private" | "public"; // Can others discover this workspace?
    maxMembers?: number; // Optional limit
  };
  createdAt: string;
  updatedAt: string;
}

// ─── MEMBERSHIP (WHO belongs to this workspace?) ─────────────────────────────

export interface Membership {
  id: string; // UUID
  userId: string; // FK → User.id
  workspaceId: string; // FK → Workspace.id
  role: "owner" | "admin" | "mentor" | "member" | "learner";
  status: "active" | "invited" | "inactive";
  joinedAt?: string; // When user accepted invitation
  invitedAt?: string; // When invitation was sent
  invitedBy?: string; // FK → User.id (who invited?)
  lastAccessedAt?: string; // For sorting recent workspaces
}

// ─── ROLE (WHAT can they do?) ───────────────────────────────────────────────

export interface Role {
  id: string; // Unique per workspace: "owner", "admin", "mentor", "member", "learner"
  workspaceId?: string; // Can be null for system default roles
  name: string; // Human readable
  permissions: Permission[]; // e.g., ["workspace:manage", "learning_path:create"]
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Permission =
  | "workspace:manage"
  | "workspace:settings"
  | "member:invite"
  | "member:remove"
  | "member:change_role"
  | "learning_path:create"
  | "learning_path:delete"
  | "learning_path:publish"
  | "source:create"
  | "source:delete"
  | "source:publish"
  | "progress:view_team"
  | "progress:view_personal"
  | "progress:approve_level"
  | "insight:share"
  | "insight:view_team";

// ─── LEARNING PATH (WHICH skills to learn?) ────────────────────────────────

export interface LearningPath {
  id: string; // UUID
  workspaceId: string; // FK → Workspace.id
  createdBy: string; // FK → User.id
  name: string; // "Onboarding", "Leadership Fast Track", "Q1 Skills"
  description?: string;
  skills: SkillRef[]; // Which canonical skills are in this path?
  sources?: SourceRef[]; // Recommended sources (in order)
  estimatedHoursPerWeek?: number;
  durationWeeks?: number;
  visibility: "private" | "team" | "public"; // Who can see/use this?
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillRef {
  skillId: string; // FK → Skill.id
  reason?: string; // Why this skill is included
  order?: number; // Suggested learning order
}

export interface SourceRef {
  sourceId: string; // FK → LearningSource.id
  order?: number; // Suggested reading order
  isRequired?: boolean; // Mark as must-read for path completion
}

// ─── REFACTORED EXISTING ENTITIES (with workspace + user scoping) ────────────

/**
 * LearningSource: Updated with workspace ownership + visibility
 */
export interface LearningSourceMultiUser {
  id: string;
  workspaceId: string; // FK → Workspace.id (NEW)
  createdBy: string; // FK → User.id (NEW)
  title: string;
  creatorName: string;
  url?: string;
  topicTags: string[];
  skillTargets: string[]; // Canonical skill names or IDs
  progress: ProgressDataMultiUser;
  status: "in_progress" | "completed" | "paused";
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  visibility: "personal" | "workspace" | "public"; // (NEW)
  sharedWith?: string[]; // User IDs with explicit access (NEW)
  createdAt: string;
  updatedAt: string;
}

/**
 * SkillProgress: User + Workspace scoped
 */
export interface SkillProgressMultiUser {
  id: string;
  workspaceId: string; // FK → Workspace.id (NEW)
  userId: string; // FK → User.id (NEW)
  skillId: string; // FK → Skill.id
  level: "awareness" | "understanding" | "applied" | "mastered";
  levelAchievedAt?: string;
  evidence: Evidence[]; // From Sprint 3
  actionItems: ActionItemMultiUser[];
  sourceIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ActionItem: Updated with ownership + potential assignment
 */
export interface ActionItemMultiUser {
  id: string;
  skillId: string; // FK → Skill.id
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string; // FK → User.id (NEW: who did it?)
  assignedTo?: string[]; // FK → User.id[] (NEW: for team delegation)
  sourceIds: string[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * KeyInsight: With sharing + visibility
 */
export interface KeyInsightMultiUser {
  id: string;
  workspaceId: string; // FK → Workspace.id (NEW)
  userId: string; // FK → User.id (author) (NEW)
  skillId: string; // FK → Skill.id
  sourceId: string;
  type?: "quote" | "insight" | "concept" | "reflection";
  quote: string;
  reflection?: string;
  tags: string[];
  visibility: "private" | "workspace" | "public"; // (NEW)
  sharedWith?: string[]; // User IDs with explicit access (NEW)
  createdAt: string;
  updatedAt: string;
}

/**
 * LearningSession: With workspace + user scoping
 */
export interface LearningSessionMultiUser {
  id: string;
  workspaceId: string; // FK → Workspace.id (NEW)
  userId: string; // FK → User.id (NEW)
  sourceId: string;
  dateStarted: string; // ISO date
  durationMinutes: number;
  notes?: string;
  reflection?: string;
  skillTags?: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ProgressData: Discriminated union for source progress (unchanged)
 */
export interface ProgressDataMultiUser {
  type: "book" | "youtube" | "article" | "podcast" | "course";
}

export interface BookProgressMultiUser extends ProgressDataMultiUser {
  type: "book";
  totalPages: number;
  currentPage: number;
}

export interface YoutubeProgressMultiUser extends ProgressDataMultiUser {
  type: "youtube";
  totalMinutes: number;
  watchedMinutes: number;
}

export interface ArticleProgressMultiUser extends ProgressDataMultiUser {
  type: "article";
  readPercentage: number; // 0–100
}

export interface PodcastProgressMultiUser extends ProgressDataMultiUser {
  type: "podcast";
  totalMinutes: number;
  watchedMinutes: number;
}

export interface CourseProgressMultiUser extends ProgressDataMultiUser {
  type: "course";
  totalModules: number;
  completedModules: number;
}

// ─── PERMISSION CONTEXT ────────────────────────────────────────────────────

/**
 * Runtime context for permission checks.
 * Used in storage functions to determine if user can access data.
 */
export interface PermissionContext {
  userId: string;
  workspaceId: string;
  membership: Membership; // User's role + status in this workspace
}

// ─── VIEW LAYER: Aggregated for UI ──────────────────────────────────────────

/**
 * User's workspace dashboard summary.
 * Combines user profile + workspace info + member status.
 */
export interface WorkspaceDashboard {
  user: User;
  workspace: Workspace;
  membership: Membership;
  teamSize: number;
  skillProgress: SkillProgressMultiUser[];
  recentInsights: KeyInsightMultiUser[];
  learningPaths: LearningPath[];
  sharedSources: LearningSourceMultiUser[];
}

/**
 * Team member profile visible to other members.
 * What can teammates see about you?
 */
export interface TeamMemberProfile {
  userId: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  skillsTracking: number; // Count of skills being tracked
  recentActivity?: {
    lastActivityDate: string;
    actionsCompletedThisWeek: number;
    insightsSharedThisWeek: number;
  };
}

// ─── ERROR TYPES ────────────────────────────────────────────────────────────

export class PermissionDeniedException extends Error {
  constructor(
    public readonly userId: string,
    public readonly action: string,
    public readonly resource: string
  ) {
    super(`User ${userId} denied ${action} on ${resource}`);
  }
}

export class WorkspaceNotFoundException extends Error {
  constructor(public readonly workspaceId: string) {
    super(`Workspace ${workspaceId} not found`);
  }
}

export class MembershipNotFoundException extends Error {
  constructor(
    public readonly userId: string,
    public readonly workspaceId: string
  ) {
    super(`Membership not found for user ${userId} in workspace ${workspaceId}`);
  }
}
