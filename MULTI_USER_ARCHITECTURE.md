# SkillFlow Multi-User SaaS Architecture

**Status:** Design Phase | Ready for Implementation  
**Scope:** Foundation entities only; no cloud migration yet  
**Complexity:** Medium (clean, but requires careful scoping)

---

## 📐 Entity Relationship Diagram

### Core Multi-User Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         User (WHO)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • id (UUID): "user-001"                                   │ │
│  │ • email: "andri@example.com"                              │ │
│  │ • name: "Andri Rohim"                                     │ │
│  │ • profile: { avatar, bio, timezone }                      │ │
│  │ • createdAt                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ↓ ↑ (1:N)                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Membership (role assignment)                 │   │
│  │  • id (UUID)                                            │   │
│  │  • userId (FK → User)                                  │   │
│  │  • workspaceId (FK → Workspace)                        │   │
│  │  • role: "owner"|"admin"|"mentor"|"member"|"learner" │   │
│  │  • status: "active"|"invited"|"inactive"             │   │
│  │  • joinedAt, invitedAt                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↑ ↓ (1:N)                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓ ↑ (N:1)
┌─────────────────────────────────────────────────────────────────┐
│                  Workspace (WHERE learning happens)              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • id (UUID): "ws-001"                                     │ │
│  │ • name: "Acme Corp" / "Personal Lab"                      │ │
│  │ • type: "personal" | "team" | "organization"             │ │
│  │ • ownerId (FK → User)                                     │ │
│  │ • settings: { timezone, language, visibility }           │ │
│  │ • createdAt                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                      ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ (1:N)                      │
│  ┌─────────────────┬────────────────┬──────────────────────┐     │
│  │                 │                │                      │     │
│  ▼                 ▼                ▼                      ▼     │
│ Skill         LearningPath     LearningSource         Member    │
│ Taxonomy      (templates)      (personal or shared)  (cached)   │
│ {             {                {                    {           │
│   • name,       • name,          • id,                • id,     │
│   • aliases,    • skills[],      • title,             • userId, │
│   • category    • sources[],     • visibility,        • role    │
│ }              • visibility   }                    }            │
│                }                                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         SkillProgress (USER + WORKSPACE scoped)         │   │
│  │  • id, skillId (FK → Skill)                            │   │
│  │  • userId (FK → User)                                 │   │
│  │  • level, evidence[], actionItems[]                   │   │
│  │  • sourceIds (which sources teach this)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                      ↑ ↓ (1:N)                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  KeyInsight (USER + WORKSPACE scoped)                  │   │
│  │  • id, skillId, userId, sourceId                      │   │
│  │  • quote, reflection                                  │   │
│  │  • sharedWith: UserId[]  ← NEW (team visibility)      │   │
│  │  • visibility: "private"|"workspace"|"public"         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LearningSession (USER + WORKSPACE scoped)             │   │
│  │  • id, userId, sourceId, workspaceId                  │   │
│  │  • duration, reflection                               │   │
│  │  • skillTags                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Evidence (USER + WORKSPACE scoped)                    │   │
│  │  • id, skillId, userId, type                         │   │
│  │  • content, weight                                    │   │
│  │  • references (insightId, sessionId, actionId)       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Data Ownership & Visibility

### User-Level Data (Never shared)
```typescript
User {
  id, email, name, profile,     // Only user can read/write
  preferences,                   // Only user can read/write
  createdAt
}

UserPreferences {
  userId,
  theme, language, timezone,
  notificationSettings,
  subscribedWorkspaces: WorkspaceId[]
}
```

### Workspace-Level Data (Members can access based on role)
```typescript
Workspace {
  id, name, type, ownerId,
  settings,                      // Owner/admin can edit
  members: Membership[],         // All members can read (names, roles)
  skillTaxonomy: Skill[],       // All members can read
  learningPaths: LearningPath[], // All members can read (if visible)
  createdAt
}

Role {
  name, permissions[], description
}
```

### Personal Learning Data (User-scoped within workspace)
```typescript
SkillProgress {
  id, skillId, userId, workspaceId,
  level, evidence[], actionItems[],
  sourceIds,
  createdAt, updatedAt
  // Owner (user) can read/write
  // Mentors can read (with explicit permission)
  // Others: no access
}

LearningSession {
  id, userId, workspaceId, sourceId,
  duration, reflection, skillTags,
  createdAt
  // Owner can read/write
  // Mentors may see aggregated stats
  // Others: no access
}

Evidence {
  id, skillId, userId, workspaceId,
  type, content, weight,
  references (insightId, sessionId, actionId),
  createdAt
  // Owner can read/write
  // Mentors can read (with permission)
}
```

### Shared Learning Data (Workspace-level, with visibility controls)
```typescript
LearningSource {
  id, userId, workspaceId,
  title, creatorName,
  visibility: "personal" | "workspace" | "public",
  skillTargets, progress, status,
  createdAt, updatedAt
  // Visibility controls who can see it:
  //   personal: only owner
  //   workspace: all members
  //   public: all users (future)
}

KeyInsight {
  id, skillId, userId, workspaceId, sourceId,
  quote, reflection,
  visibility: "private" | "workspace" | "public",
  sharedWith: UserId[],        // Explicit sharing to specific users
  createdAt, updatedAt
  // Visibility + sharedWith controls access
  //   private: only owner
  //   workspace: all members
  //   sharedWith: specific users + owner
  //   public: all users (future)
}

LearningPath {
  id, workspaceId, createdBy,
  name, description,
  skills: SkillRef[],           // Which skills this path covers
  sources: SourceRef[],         // Recommended sources
  visibility: "private" | "team" | "public",
  createdAt, updatedAt
  // Visibility controls who can use/see it
  //   private: only creator + admin
  //   team: all workspace members
  //   public: all users (future)
}
```

---

## 💾 Storage Keys

### User Data
```
skillflow:user:{userId}:profile
skillflow:user:{userId}:preferences
skillflow:user:{userId}:workspaces          // Array of workspace IDs user joined
```

### Workspace Data
```
skillflow:workspace:{workspaceId}:metadata
skillflow:workspace:{workspaceId}:members   // Membership[]
skillflow:workspace:{workspaceId}:roles     // Role[] (default roles)
skillflow:workspace:{workspaceId}:taxonomy  // Skill[] (canonical for this workspace)
skillflow:workspace:{workspaceId}:learning_paths
skillflow:workspace:{workspaceId}:sources
```

### User + Workspace Data
```
skillflow:workspace:{workspaceId}:user:{userId}:skill_progress
skillflow:workspace:{workspaceId}:user:{userId}:sessions
skillflow:workspace:{workspaceId}:user:{userId}:insights
skillflow:workspace:{workspaceId}:user:{userId}:evidence
```

### Workspace Team Data
```
skillflow:workspace:{workspaceId}:team_insights   // Insights shared with team
skillflow:workspace:{workspaceId}:team_sources    // Sources marked workspace-visible
```

---

## 🏛️ Entity Type Definitions

### User & Workspace Foundation

```typescript
// User: WHO is learning?
interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  name: string;
  profile: {
    avatar?: string;
    bio?: string;
    timezone?: string;           // Default: user's timezone
  };
  createdAt: string;             // ISO timestamp
  updatedAt: string;
}

// Workspace: WHERE does learning happen?
interface Workspace {
  id: string;                    // UUID
  name: string;
  type: "personal" | "team" | "organization";
  ownerId: string;               // FK → User.id
  settings: {
    timezone?: string;
    language?: string;           // Default: "id"
    visibility?: "private" | "public";
  };
  createdAt: string;
  updatedAt: string;
}

// Membership: WHO belongs to this workspace?
interface Membership {
  id: string;                    // UUID
  userId: string;                // FK → User.id
  workspaceId: string;           // FK → Workspace.id
  role: "owner" | "admin" | "mentor" | "member" | "learner";
  status: "active" | "invited" | "inactive";
  joinedAt?: string;
  invitedAt?: string;
  invitedBy?: string;            // User ID who invited
}

// Role: WHAT can they do?
interface Role {
  id: string;                    // Unique per workspace
  name: string;                  // "owner", "admin", "mentor", "member", "learner"
  permissions: string[];         // ["workspace:manage", "learning_path:create", ...]
  description: string;
}

// LearningPath: WHICH skills to learn? (workspace templates)
interface LearningPath {
  id: string;                    // UUID
  workspaceId: string;           // FK → Workspace.id
  createdBy: string;             // FK → User.id
  name: string;                  // "Onboarding", "Leadership Track"
  description?: string;
  skills: SkillRef[];            // Reference to canonical skills
  sources?: SourceRef[];         // Recommended sources
  visibility: "private" | "team" | "public";
  createdAt: string;
  updatedAt: string;
}

interface SkillRef {
  skillId: string;               // FK → Skill.id
  reason?: string;               // Why this skill is in the path
}

interface SourceRef {
  sourceId: string;              // FK → LearningSource.id
  order?: number;                // Suggested reading order
}
```

### Refactored Existing Entities

```typescript
// LearningSource: UPDATED to support workspace + visibility
interface LearningSource {
  id: string;
  workspaceId: string;           // NEW: FK → Workspace.id
  createdBy: string;             // NEW: FK → User.id
  title: string;
  creatorName: string;
  url?: string;
  topicTags: string[];
  skillTargets: string[];        // Now: canonical skill names or IDs
  progress: ProgressData;
  status: "in_progress" | "completed" | "paused";
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  visibility: "personal" | "workspace" | "public";  // NEW
  createdAt: string;
  updatedAt: string;
}

// SkillProgress: UPDATED with workspace + user scoping
interface SkillProgress {
  id: string;
  workspaceId: string;           // NEW: FK → Workspace.id
  userId: string;                // NEW: FK → User.id
  skillId: string;               // FK → Skill.id (canonical)
  level: SkillLevel;             // "awareness" | "understanding" | "applied" | "mastered"
  levelAchievedAt?: string;
  evidence: Evidence[];
  actionItems: ActionItem[];
  sourceIds: string[];           // Sources teaching this skill
  createdAt: string;
  updatedAt: string;
}

// KeyInsight: UPDATED with workspace + user + sharing
interface KeyInsight {
  id: string;
  workspaceId: string;           // NEW: FK → Workspace.id
  userId: string;                // NEW: FK → User.id (author)
  skillId: string;               // FK → Skill.id
  sourceId: string;
  type?: "quote" | "insight" | "concept" | "reflection";
  quote: string;
  reflection?: string;
  tags: string[];
  visibility: "private" | "workspace" | "public";  // NEW
  sharedWith?: string[];         // NEW: User IDs (explicit sharing)
  createdAt: string;
  updatedAt: string;
}

// LearningSession: UPDATED with workspace + user scoping
interface LearningSession {
  id: string;
  workspaceId: string;           // NEW: FK → Workspace.id
  userId: string;                // NEW: FK → User.id
  sourceId: string;
  dateStarted: string;           // ISO date
  durationMinutes: number;
  notes?: string;
  reflection?: string;
  skillTags?: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ActionItem: UPDATED with ownership + assignment
interface ActionItem {
  id: string;
  skillId: string;               // FK → Skill.id
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;          // NEW: FK → User.id (who completed?)
  assignedTo?: string[];         // NEW: User IDs (if team-based)
  sourceIds: string[];           // Sources mentioning this action
  createdAt: string;
  updatedAt: string;
}

// Evidence: UPDATED with workspace + user scoping
interface Evidence {
  id: string;
  workspaceId: string;           // NEW: FK → Workspace.id
  userId: string;                // NEW: FK → User.id (who made progress?)
  skillId: string;               // FK → Skill.id
  type: "insight" | "session_note" | "action_completed" | "milestone";
  content: string;
  weight: number;                // 0.8–2.0
  sourceId?: string;
  insightId?: string;
  sessionId?: string;
  actionItemId?: string;
  createdAt: string;
}
```

---

## 🔐 Permission Helper Functions

These functions implement the role/permission matrix:

```typescript
// Check if user can perform action
function hasPermission(
  membership: Membership,
  action: string  // "workspace:manage", "learning_path:create", etc.
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[membership.role];
  return rolePermissions.includes(action);
}

// Check if user can view another user's progress
function canViewProgress(
  viewer: Membership,
  targetUser: string,
  target: SkillProgress
): boolean {
  // Own progress: always
  if (viewer.userId === targetUser) return true;
  
  // Mentor/admin: yes
  if (["owner", "admin", "mentor"].includes(viewer.role)) return true;
  
  // Team member: only if explicitly shared
  if (viewer.role === "member" && target.sharedWith?.includes(viewer.userId)) {
    return true;
  }
  
  return false;
}

// Check if user can edit insight
function canEditInsight(
  editor: Membership,
  insight: KeyInsight
): boolean {
  // Owner: always
  if (editor.userId === insight.userId) return true;
  
  // Admin: always
  if (editor.role === "admin") return true;
  
  return false;
}

// Check if user can see learning source
function canViewSource(
  viewer: Membership,
  source: LearningSource
): boolean {
  // Own source: always
  if (viewer.userId === source.createdBy) return true;
  
  // Based on visibility:
  switch (source.visibility) {
    case "personal":
      return viewer.userId === source.createdBy;
    case "workspace":
      return viewer.workspaceId === source.workspaceId;
    case "public":
      return true;
  }
}

// Get filtered list of sources user can see
function getVisibleSources(
  viewer: Membership,
  allSources: LearningSource[]
): LearningSource[] {
  return allSources.filter(src => 
    src.workspaceId === viewer.workspaceId &&
    canViewSource(viewer, src)
  );
}
```

---

## 📦 Default Roles

```typescript
const DEFAULT_ROLES: Record<string, Role> = {
  owner: {
    id: "owner",
    name: "Owner",
    permissions: [
      "workspace:manage",
      "workspace:settings",
      "member:invite",
      "member:remove",
      "member:change_role",
      "learning_path:create",
      "learning_path:delete",
      "source:create",
      "source:delete",
      "source:publish",
      "progress:view_team",
      "progress:view_personal",
      "progress:approve_level",
    ],
    description: "Full control of workspace",
  },
  admin: {
    id: "admin",
    name: "Admin",
    permissions: [
      "workspace:settings",
      "member:invite",
      "member:remove",
      "member:change_role",
      "learning_path:create",
      "learning_path:delete",
      "source:create",
      "source:delete",
      "source:publish",
      "progress:view_team",
      "progress:view_personal",
      "progress:approve_level",
    ],
    description: "Manage members and learning paths",
  },
  mentor: {
    id: "mentor",
    name: "Mentor",
    permissions: [
      "learning_path:create",
      "source:create",
      "source:publish",
      "progress:view_team",
      "progress:view_personal",
      "progress:approve_level",
    ],
    description: "Create paths and guide team",
  },
  member: {
    id: "member",
    name: "Member",
    permissions: [
      "source:create",
      "progress:view_personal",
    ],
    description: "Learn and contribute sources",
  },
  learner: {
    id: "learner",
    name: "Learner",
    permissions: [
      "progress:view_personal",
    ],
    description: "View own progress only",
  },
};
```

---

## 🔄 Data Migration Example

### Current (Single-User) → New (Multi-User)

**Scenario:** User "andri@example.com" with 3 sources, 50 skill progress records

**Migration Steps:**

1. Create User:
   ```
   user-001 { email: "andri@example.com", name: "Andri" }
   ```

2. Create Personal Workspace:
   ```
   ws-personal-001 { name: "Andri's Lab", type: "personal", ownerId: "user-001" }
   ```

3. Create Membership:
   ```
   membership-001 { userId: "user-001", workspaceId: "ws-personal-001", role: "owner" }
   ```

4. Migrate Sources:
   ```
   Old: skillflow:accountId:sources
   New: skillflow:workspace:ws-personal-001:sources
        + add workspaceId, createdBy, visibility="personal"
   ```

5. Migrate SkillProgress:
   ```
   Old: skillflow:accountId:skill_progress
   New: skillflow:workspace:ws-personal-001:user:user-001:skill_progress
        + add workspaceId, userId
   ```

6. Migrate all other entities similarly

---

## 🎯 What's NOT in This Sprint

✗ Cloud persistence (still localStorage)  
✗ Auth system (still no login)  
✗ Team collaboration UI  
✗ Permission enforcement (trust scoping)  
✗ Workspace settings page  
✗ Invitation flow  

---

## ✅ Sign-Off Checklist (End of Sprint 4)

- [ ] User + Workspace + Membership + Role entities defined
- [ ] LearningPath entity designed
- [ ] All existing entities updated with workspaceId + userId
- [ ] Storage key patterns updated
- [ ] Visibility/sharing logic documented
- [ ] Permission matrix defined (role + action)
- [ ] Refactoring roadmap created (which components need updates)
- [ ] Sample migration plan written
- [ ] Mock User + Workspace created for seed data (optional)

---

**Next Phase:** Implement Phase 1 (create entities in storage + update type definitions)
