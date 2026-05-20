# Sprint 4 Status: Multi-User SaaS Foundation

**Sprint Goal:** Design clean multi-user foundation without overengineering  
**Status:** Phase 1 Complete ✅ | Phase 2 Ready  
**Timeline:** Foundation = 2-3 sprints; Cloud migration = later

---

## 📋 What's Complete

### 1. Multi-User Architecture Audit
**File:** `MULTI_USER_AUDIT.md`

Comprehensive analysis of current single-user app and gaps:
- ✓ Current data structure analysis (accountId = user assumption)
- ✓ Single-user assumptions and multi-user fixes
- ✓ Core entity definitions (User, Workspace, Membership, Role, LearningPath)
- ✓ Data isolation patterns (personal vs workspace vs public)
- ✓ Storage key refactoring (accountId → workspaceId + userId)
- ✓ Component refactoring scope (what changes, what stays)
- ✓ 4-phase migration roadmap
- ✓ Permission matrix (role vs action)

### 2. Multi-User Architecture Design
**File:** `MULTI_USER_ARCHITECTURE.md`

Detailed architecture with ER diagrams and specifications:
- ✓ Entity relationship diagram (User, Workspace, Membership, Skill Taxonomy, Learning Paths)
- ✓ Data ownership & visibility rules (personal, workspace-shared, public)
- ✓ Full type definitions for all new entities
- ✓ Refactored existing entities with workspace + user scoping
- ✓ Storage key patterns (user, workspace, workspace+user)
- ✓ Permission helper functions (hasPermission, canViewProgress, etc.)
- ✓ Default role definitions (owner, admin, mentor, member, learner)
- ✓ Data migration example (single-user → multi-user)

### 3. Type Definitions
**File:** `lib/types.multiuser.ts`

Production-ready TypeScript types:
- ✓ User, UserPreferences
- ✓ Workspace, Membership, Role, LearningPath
- ✓ Refactored LearningSourceMultiUser, SkillProgressMultiUser, etc.
- ✓ PermissionContext, TeamMemberProfile view types
- ✓ Custom error types (PermissionDeniedException, etc.)
- ✓ All types fully typed and documented

### 4. Storage Key Constants
**File:** `lib/constants.multiuser.ts`

Standardized storage key patterns:
- ✓ User-scoped keys (profile, preferences, workspaces)
- ✓ Workspace-scoped keys (metadata, members, roles, taxonomy, sources, learning paths)
- ✓ Workspace+user-scoped keys (skill_progress, sessions, insights, evidence)
- ✓ Legacy key patterns (for backward compat during migration)
- ✓ Helper functions (getStorageKey, getWorkspaceUserStorageKeys, etc.)
- ✓ System-wide keys (default roles, canonical taxonomy)
- ✓ Feature flags (for rollout control)

### 5. Storage Layer (Phase 1 Implementation)
**File:** `lib/workspaceStorage.ts`

CRUD helpers untuk entitas multi-user:
- ✓ `getUser` / `saveUser`
- ✓ `getWorkspace` / `saveWorkspace`
- ✓ `getMemberships` / `saveMembership` / `getUserMembership`
- ✓ Session management (`getCurrentUserId`, `setCurrentWorkspaceId`, dll)
- ✓ Bootstrap flag (`isMultiUserInitialized`, `markMultiUserInitialized`)

### 6. Seed Data (Phase 1 Implementation)
**File:** `lib/seedMultiUser.ts`

Mock foundation data:
- ✓ `DEFAULT_USER` — user-andri-001, andri@skillflow.app
- ✓ `DEFAULT_WORKSPACE` — ws-personal-001, "Personal Lab" (personal)
- ✓ `DEFAULT_MEMBERSHIP` — role: owner, status: active
- ✓ `initializeMultiUserFoundation()` — idempotent, runs once

### 7. WorkspaceContext (Phase 1 Implementation)
**File:** `lib/contexts/WorkspaceContext.tsx`

React context untuk multi-user state:
- ✓ `currentUser`, `currentWorkspace`, `membership`, `userWorkspaces`
- ✓ `switchWorkspace(workspaceId)` — ganti workspace aktif
- ✓ Hooks: `useWorkspace()`, `useCurrentUser()`, `useCurrentWorkspace()`
- ✓ Di-mount di `app/layout.tsx` dalam `<WorkspaceProvider>`

### 8. Sidebar Update (Phase 1 Implementation)
**File:** `components/layout/Sidebar.tsx`

UI workspace awareness:
- ✓ Workspace badge (nama + type icon + role pill) di bawah logo
- ✓ User footer dari WorkspaceContext (fallback ke AuthContext)
- ✓ Version string: v0.5.0 — Phase 1 Multi-User

---

## 🏗️ Architecture Summary

### Core Concept

```
User (WHO) → Workspace (WHERE) → Membership (ROLE) → Data Access
```

**Example Flow:**
1. User "andri@example.com" creates personal workspace "Personal Lab"
2. User invites "elena@acme.com" → Membership with role "mentor"
3. Elena joins → can view team's shared sources, guide skill progression
4. Each user's skill progress tracked separately but visible to mentors
5. Insights can be marked "private" (only mine), "workspace" (share with team), "public"

### 5 Key Principles

1. **Workspace First** — All data belongs to workspace (even personal workspaces)
2. **Explicit Sharing** — Data is personal by default; sharing is explicit action
3. **Role-Based Access** — Permissions matrix is source of truth, not feature flags
4. **Clean Scoping** — Storage keys encode ownership (workspace + user)
5. **Minimal Scope** — No auth/cloud yet; localStorage + mock User for foundation

---

## 🔐 Role System

| Role | Manage Workspace | Create Learning Paths | View Team Progress | Approve Levels |
|------|---|---|---|---|
| **Owner** | ✓ | ✓ | ✓ | ✓ |
| **Admin** | ✓ | ✓ | ✓ | ✓ |
| **Mentor** | - | ✓ | ✓ | ✓ |
| **Member** | - | - | - | - |
| **Learner** | - | - | - | - |

---

## 📊 What Changed & What Stayed

### New Entities
```typescript
User, Workspace, Membership, Role, LearningPath
```

### Entities with Major Refactoring
```
LearningSource    → + workspaceId, createdBy, visibility
SkillProgress     → + workspaceId, userId
KeyInsight        → + workspaceId, userId, visibility, sharedWith[]
LearningSession   → + workspaceId, userId
ActionItem        → + completedBy, assignedTo[]
Evidence          → + workspaceId, userId
```

### Entities That Stay Mostly Same
```
Skill (canonical, workspace-scoped)
SourceTask (minor scoping)
ProgressData (discriminated union, unchanged)
```

---

## 🚀 Phased Implementation Plan

### Phase 1: Local Context Setup (Selesai ✅)
- Buat `lib/contexts/WorkspaceContext.tsx`.
- Mock 1 user & 1 workspace hardcoded.
- Wrap `<DashboardShell>` dengan context.
- Update UI Sidebar untuk menampilkan context.

### Phase 2: Offline Data Migration (Selesai ✅)
- Buat `lib/storageV2.ts` (storage offline baru).
- Ubah kunci localStorage menjadi `workspaceId + userId`.
- Migrasikan data lama ke format baru saat bootstrap.
- Update SEMUA Pages (`ActionsPage`, `StatsPage`, `DashboardShell`, dll) untuk pakai `storageV2.ts` dan `WorkspaceContext`.

### Phase 3: Permission Layer (Selesai ✅)
- Implementasi role-based UI (Owner vs Member vs Learner).
- Sembunyikan tombol "Delete" untuk non-owner.
- Filter data sesuai dengan role dan visibility (contoh: tab "Team").

### Phase 4: Cloud + Auth (NOT this sprint, 4-6 hours)
- [ ] Migrate localStorage → Supabase/Firebase Firestore
- [ ] Implement Auth (Auth0, Firebase Auth, or custom)
- [ ] Add row-level security (RLS) for team data
- [ ] Implement invite flow

### Phase 5: Team Features (NOT this sprint, 3-4 hours)
- [ ] Workspace settings page
- [ ] Team member directory
- [ ] Shared insight feed
- [ ] Team progress dashboard

---

## 💾 Storage Key Migration

**Current (single-user):**
```
skillflow:accountId:sources
skillflow:accountId:skill_progress
skillflow:accountId:insights
```

**New (multi-user):**
```
skillflow:workspace:ws-001:sources
skillflow:workspace:ws-001:user:user-001:skill_progress
skillflow:workspace:ws-001:user:user-001:insights
```

**Helper:**
```typescript
const key = getWorkspaceStorageKey(workspaceId, "sources");
const key = getWorkspaceUserStorageKey(workspaceId, userId, "skill_progress");
```

---

## 📱 Component Impact

### Must Update
- `DashboardLayout` — Add workspace selector, user menu
- Storage layer functions — Filter by workspace + user
- All page components — Pass workspace + user context

### Should Update
- `SkillsPage` — Show my skills + option to view team (if mentor)
- `SourcesPage` — Filter sources by visibility
- `InsightsPage` — Show personal + shared insights based on role

### Can Update Later
- Workspace settings page
- Team member directory
- Shared insight feed
- Team dashboard

---

## 🧪 Validation Strategy

**Test Case 1: Personal Workspace**
```
User creates workspace "My Lab" (type: personal)
- User is owner
- No other members
- All data isolated to this workspace
- Expected: Same behavior as current single-user
```

**Test Case 2: Team Workspace**
```
User creates workspace "Acme Corp" (type: team)
- Invites mentor + 2 learners
- Mentor can see team progress
- Learners see only their own progress
- Expected: Permission checks work correctly
```

**Test Case 3: Role-Based Access**
```
Member tries to create learning path
- Has role "member" (permission: "learning_path:create" = false)
- Expected: Cannot create, UI disabled
```

---

## ✅ Sign-Off Checklist (End of Sprint 4)

### Design Documents
- [x] Multi-user audit completed
- [x] Architecture designed with ER diagrams
- [x] Type definitions created
- [x] Storage key patterns defined
- [x] Permission matrix documented
- [x] Role system designed

### Implementation Checklist (for next sprints)
- [x] Phase 1: Create User + Workspace entities ✅
- [ ] Phase 2: Add workspaceId + userId to existing entities
- [ ] Phase 3: Implement permission checks
- [ ] Phase 4: Cloud + auth (later)
- [ ] Phase 5: Team features (later)

### Code Ready
- [x] lib/types.multiuser.ts
- [x] lib/constants.multiuser.ts
- [x] lib/workspaceStorage.ts ✅ NEW
- [x] lib/seedMultiUser.ts ✅ NEW
- [x] lib/contexts/WorkspaceContext.tsx ✅ NEW
- [x] Architecture documentation complete
- [ ] Permission helper functions (pending Phase 3)
- [ ] Storage refactoring functions (pending Phase 2)

---

## 🎯 What This Enables

**Immediate (Phase 1):**
- Foundation for workspace concept
- Seed data with users + workspaces
- DashboardLayout shows context

**Short-term (Phase 2-3):**
- Data scoped to workspace + user
- Permission checks on all actions
- SkillsPage/SourcesPage workspace-aware

**Future (Phase 4):**
- Real auth system
- Cloud persistence
- Team collaboration features
- Multi-workspace navigation

---

## 🚫 What's NOT in This Sprint

✗ Implement auth (Phase 4)  
✗ Migrate to cloud (Phase 4)  
✗ Build workspace settings UI (Phase 5)  
✗ Build team member directory (Phase 5)  
✗ Build shared insight feed (Phase 5)  
✗ Enforce permissions strictly (Phase 3+)  
✗ Implement invite flow (Phase 4)  

**Instead: Clean, minimal foundation that all other sprints build on.**

---

## 🔗 Dependencies

This sprint BUILDS ON:
- **Sprint 1:** Dashboard (needs workspace awareness)
- **Sprint 2:** Domain Model (skill taxonomy now workspace-scoped)
- **Sprint 3:** Progress Engine (works per-user, per-workspace)

This sprint UNBLOCKS:
- Phase 4 Auth implementation
- Phase 5 Team collaboration features
- Integration of progress engine with shared learning paths
- Team mentoring workflows

---

## 📚 Files to Review

1. **MULTI_USER_AUDIT.md** — Why multi-user, what changes
2. **MULTI_USER_ARCHITECTURE.md** — Detailed design with ER diagrams
3. **lib/types.multiuser.ts** — Type definitions
4. **lib/constants.multiuser.ts** — Storage key patterns

---

## 🎓 Design Principles Applied

✓ **Clean Scoping** — Storage keys encode ownership  
✓ **Explicit Sharing** — Data is personal by default  
✓ **Role-Based Access** — Permissions matrix as source of truth  
✓ **No Overengineering** — Foundation only, features later  
✓ **Backward Compatible** — Legacy keys still work during migration  

---

**Current Status:** Phase 1 Complete ✅ — Next Step: Phase 2 (add workspaceId + userId to existing entities: sources, insights, sessions)
