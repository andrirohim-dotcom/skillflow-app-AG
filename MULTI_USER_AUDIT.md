# SkillFlow Multi-User SaaS Audit

**Status:** Discovery Phase | Ready for Design  
**Goal:** Define multi-user foundation (workspace, team, roles, permissions)  
**Constraint:** Don't overengineer; foundation must be clean & scalable

---

## 🎯 Executive Summary

**Current:** Single-user app stored in localStorage with account ID scoping  
**Target:** Multi-user SaaS with:
- Workspaces (teams, organizations)
- Role-based access (owner, admin, mentor, member, learner)
- Shared resources (taxonomy, learning paths, sources)
- Personal data isolation (progress, insights, sessions)

**Minimal viable multi-user:** User login → Create/Join workspace → Inherit shared taxonomy → Track personal progress → Optionally share insights with team.

---

## 📊 Current Architecture Analysis

### Current Data Structure

All data stored in localStorage with pattern: `skillflow:<accountId>:<entity>`

```typescript
// Storage keys (from lib/constants.ts)
- skillflow:{accountId}:sources
- skillflow:{accountId}:sessions
- skillflow:{accountId}:skill_progress
- skillflow:{accountId}:insights
- skillflow:{accountId}:tasks
- skillflow:{accountId}:skills          // NEW (from Sprint 2)
- skillflow:{accountId}:evidence        // NEW (from Sprint 3)
```

### Single-User Assumptions

| Assumption | Impact | Multi-User Fix |
|---|---|---|
| "accountId" = user | Auth-less, no user concept | Add User entity + login |
| One set of sources per account | Can't share books/courses | Add Source.visibility + workspace |
| Skills are global constants | Not customizable per team | Keep canonical, add workspace overrides |
| All insights are personal | Can't learn from peers | Add Insight.sharedWith[] |
| All sessions/progress personal | Can't see team momentum | Add role-based visibility rules |
| No roles/permissions | No access control | Add membership + role entity |

### Component-Level Assumptions

**Pages that assume single user:**
- `/dashboard` — Shows "your" progress (no filtering by user)
- `/dashboard/skills` — "Your" skill progress (no comparison)
- `/dashboard/sources` — "Your" sources (no shared sources)
- `/dashboard/actions` — "Your" actions (no delegation)

**Components that assume single data:**
- `NextBestActionCard` — Returns single best action (for whom?)
- `GrowingSkillsCard` — "Your" growing skills
- `RecentWinsCard` — "Your" recent completions

### Storage Layer Implications

**Current (`lib/storage.ts`):**
```typescript
export function getSources(accountId: string): LearningSource[] {
  const key = `skillflow:${accountId}:sources`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}
```

**Multi-user concern:** accountId still used for localStorage key, but now accountId = workspace, not user.

---

## 🏗️ Multi-User Data Model

### Core Entities (NEW)

```
User (WHO is learning?)
  ├─ id (UUID)
  ├─ email
  ├─ name
  ├─ profile (avatar, preferences)
  └─ createdAt

Workspace (WHERE does learning happen?)
  ├─ id (UUID)
  ├─ name ("Acme Corp Learning" / "My Personal Lab")
  ├─ type: "personal" | "team" | "organization"
  ├─ ownerId (FK → User)
  ├─ settings (timezone, language, visibility)
  ├─ skillTaxonomy: Skill[] (canonical for workspace)
  ├─ learningPaths: LearningPath[] (workspace templates)
  └─ createdAt

Membership (WHO belongs to this workspace?)
  ├─ id (UUID)
  ├─ userId (FK → User)
  ├─ workspaceId (FK → Workspace)
  ├─ role: "owner" | "admin" | "mentor" | "member" | "learner"
  ├─ joinedAt
  └─ status: "active" | "invited" | "inactive"

Role (WHAT can they do?)
  ├─ id (owned by workspace)
  ├─ name ("owner", "admin", "mentor", "member", "learner")
  ├─ permissions: string[] (e.g., "workspace:manage", "learning_path:create")
  └─ description

LearningPath (WHICH skills to learn?)
  ├─ id (UUID)
  ├─ workspaceId (FK → Workspace)
  ├─ name ("Onboarding Path", "Leadership Track")
  ├─ skills: SkillRef[] (which canonical skills)
  ├─ sources: SourceRef[] (recommended sources)
  ├─ createdBy (FK → User, who designed it)
  ├─ visibility: "private" | "team" | "public"
  └─ createdAt
```

### Existing Entities (REFACTORED)

```
LearningSource (UNCHANGED except visibility)
  ├─ id, title, creatorName
  ├─ workspaceId (FK → Workspace) ← NEW
  ├─ createdBy (FK → User) ← NEW
  ├─ visibility: "personal" | "workspace" | "public" ← NEW
  ├─ skillTargets: SkillRef[]
  └─ ... (rest unchanged)

SkillProgress (UNCHANGED except scoping)
  ├─ id
  ├─ workspaceId (FK → Workspace) ← NEW
  ├─ userId (FK → User) ← NEW
  ├─ skillId (FK → Skill)
  ├─ level, evidence[], actionItems[]
  └─ ... (rest unchanged)

KeyInsight (REFACTORED)
  ├─ id
  ├─ workspaceId (FK → Workspace) ← NEW
  ├─ userId (FK → User, who wrote it) ← NEW
  ├─ skillId (FK → Skill)
  ├─ sourceId
  ├─ sharedWith: UserId[] ← NEW (mentors, team)
  ├─ quote, reflection
  └─ ... (rest unchanged)

LearningSession (UNCHANGED except scoping)
  ├─ id
  ├─ workspaceId (FK → Workspace) ← NEW
  ├─ userId (FK → User) ← NEW
  ├─ sourceId
  ├─ skillTags
  └─ ... (rest unchanged)

ActionItem (UNCHANGED except ownership)
  ├─ id
  ├─ skillId
  ├─ text
  ├─ assignedTo: UserId[] ← NEW (if team-based)
  ├─ completed, completedBy ← CHANGED (who completed?)
  └─ ... (rest unchanged)
```

### Data Isolation Patterns

**Personal Data** (only user + workspace can see):
- SkillProgress (my mastery level)
- LearningSession (my study sessions)
- User's KeyInsights (unless shared)
- ActionItems (my tasks)
- Evidence (my proof points)

**Workspace Data** (all members can see, depending on role):
- LearningSource (if visibility = "workspace")
- LearningPath (templates)
- Workspace skill taxonomy
- Team member list (names, roles)

**Public Data** (all users):
- Canonical skill taxonomy (if shared from SkillFlow)
- Public learning paths (if published)

---

## 🔐 Role Permissions Matrix

| Permission | Owner | Admin | Mentor | Member | Learner |
|---|---|---|---|---|---|
| Manage workspace | ✓ | ✓ | - | - | - |
| Invite/remove members | ✓ | ✓ | - | - | - |
| Change member roles | ✓ | ✓ | - | - | - |
| Create learning paths | ✓ | ✓ | ✓ | - | - |
| Create sources | ✓ | ✓ | ✓ | ✓ | - |
| View team progress | ✓ | ✓ | ✓ | - | - |
| View personal progress | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mentor team member | ✓ | ✓ | ✓ | - | - |
| Share insights | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create/edit insights | ✓ | ✓ | ✓ | ✓ | ✓ |
| Complete actions | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve levels | ✓ | ✓ | ✓ | - | - |

---

## 📈 Storage Key Refactoring

### Current Pattern
```
skillflow:{accountId}:sources
skillflow:{accountId}:skill_progress
skillflow:{accountId}:insights
```

### Multi-User Pattern

**User-scoped data:**
```
skillflow:user:{userId}:profile
skillflow:user:{userId}:preferences
```

**Workspace-scoped data:**
```
skillflow:workspace:{workspaceId}:metadata
skillflow:workspace:{workspaceId}:members
skillflow:workspace:{workspaceId}:roles
skillflow:workspace:{workspaceId}:learning_paths
skillflow:workspace:{workspaceId}:taxonomy          (skill list)
skillflow:workspace:{workspaceId}:sources
```

**Workspace + User-scoped data:**
```
skillflow:workspace:{workspaceId}:user:{userId}:skill_progress
skillflow:workspace:{workspaceId}:user:{userId}:sessions
skillflow:workspace:{workspaceId}:user:{userId}:insights
skillflow:workspace:{workspaceId}:user:{userId}:evidence
```

**Team-scoped data:**
```
skillflow:workspace:{workspaceId}:team_insights       (shared insights)
skillflow:workspace:{workspaceId}:shared_sources      (team sources)
```

---

## 🗂️ Component Refactoring Scope

### Must Change (access control)
- `NextBestActionCard` — Filter actions by: my workspace + my role + my assigned actions
- `SkillsPage` — Compare myself to team (if mentor/admin)
- `SourcesPage` — Show personal + workspace sources, filter by visibility
- `DashboardLayout` — Add workspace selector + user menu

### Should Change (context awareness)
- `GrowingSkillsCard` — Clarify "my growing skills" vs "team momentum"
- `RecentWinsCard` — Show my wins (or team wins if admin viewing team)
- `SkillCard` — Add attribution (who achieved this level?)

### Can Stay Same (if scoped correctly)
- `ActionItemPanel` — Still shows my actions (just filter by workspace + user)
- `InsightsPanel` — Still shows my insights (add team/shared insights if role allows)
- `AnalyticsCards` — Still my analytics (add team view if mentor/admin)

---

## 🚀 Migration Path: Single-User → Multi-User

### Phase 1: Foundation (1-2 hours)
- [ ] Define User + Workspace entities
- [ ] Add User + Workspace to localStorage
- [ ] Create Membership + Role entities
- [ ] Update storage keys to include workspaceId + userId

### Phase 2: Data Refactoring (2-3 hours)
- [ ] Add workspaceId + userId to all existing entities
- [ ] Migrate storage data (accountId → workspaceId + userId)
- [ ] Implement permission checks (canViewSkillProgress, canEditSource, etc.)
- [ ] Add visibility field to shareable entities (Source, Insight)

### Phase 3: Component Updates (2-3 hours)
- [ ] Update storage reads to filter by workspace + user
- [ ] Add workspace selector to DashboardLayout
- [ ] Update dashboard cards with role-aware views
- [ ] Add "shared with team" option to insights/sources

### Phase 4: Auth + Persistence (4-6 hours, NOT this sprint)
- [ ] Add login/signup (Firebase Auth or Auth0 for now)
- [ ] Migrate localStorage → cloud persistence (Supabase/Firebase Firestore)
- [ ] Implement row-level security (RLS) for team data
- [ ] Add session management

---

## 📋 Minimal Viable Features

**DO THIS SPRINT:**
- ✓ Define entities (User, Workspace, Membership, Role, LearningPath)
- ✓ Plan storage keys
- ✓ Add workspaceId + userId to existing entities
- ✓ Document permission matrix
- ✓ Create refactoring roadmap

**DON'T DO YET:**
- ✗ Implement auth (Phase 4)
- ✗ Move to cloud DB (Phase 4)
- ✗ Build team collaboration UI (Phase 3+)
- ✗ Implement audit logs
- ✗ Build workspace settings page

**OPTIONAL (if time):**
- [ ] Create mock User + Workspace in seed data
- [ ] Add workspace selector to DashboardLayout (UI only, single workspace for now)
- [ ] Write permission helper functions

---

## ⚙️ Implementation Checklist

**Definitions:**
- [ ] User entity spec (id, email, name, profile)
- [ ] Workspace entity spec (id, name, type, ownerId)
- [ ] Membership entity spec (userId, workspaceId, role, status)
- [ ] Role entity spec (name, permissions[])
- [ ] LearningPath entity spec (name, skills[], sources[], visibility)
- [ ] Updated storage constants (new key patterns)

**Refactoring Plan:**
- [ ] Document which entities get workspaceId
- [ ] Document which entities get userId
- [ ] Document which entities get createdBy/createdAt/visibility
- [ ] Plan data migration (accountId → workspaceId + userId)
- [ ] List components that need access control updates

**Not This Sprint:**
- [ ] Auth implementation
- [ ] Cloud persistence
- [ ] Actual permission enforcement (still in localStorage)
- [ ] UI for workspace/team management

---

## 🎓 Design Principles

1. **Workspace First** — All data belongs to a workspace (even "personal" workspaces)
2. **Role-Based Access** — Not feature flags; permissions matrix is source of truth
3. **Explicit Sharing** — Data is personal by default; sharing is explicit action
4. **Scalable Keys** — Storage keys encode ownership (workspace + user)
5. **Backward Compat** — Old accountId keys can be migrated to first workspace

---

## 📚 Related Documents

- `DOMAIN_MODEL_ARCHITECTURE.md` — Skill taxonomy (workspace-scoped in multi-user)
- `PROGRESS_ENGINE_AUDIT.md` — Progress = per-user, workspace-scoped
- `SPRINT_1_STATUS.md` — Dashboard (needs workspace awareness)
- `SPRINT_3_STATUS.md` — Progress engine (per-user, per-workspace)

---

**Next Step:** Design detailed ER diagram + create type definitions for multi-user system.
