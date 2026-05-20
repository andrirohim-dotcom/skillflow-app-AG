# SkillFlow Multi-User Auth & Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace localStorage single-user system with Supabase Auth + PostgreSQL, add `/admin` super-admin panel for managing all users.

**Architecture:** Next.js 15 App Router with Supabase SSR (JWT in HttpOnly cookies). A new `lib/db/*` async data layer wraps Supabase queries with the same function signatures as the old `lib/accountStorage.ts`, keeping component changes minimal. Admin routes at `/admin/*` use a service-role Supabase client that bypasses RLS. Middleware enforces authentication and admin access on every request.

**Tech Stack:** `@supabase/supabase-js`, `@supabase/ssr`, Next.js middleware, Tailwind CSS 3, TypeScript strict, Bahasa Indonesia UI

---

## File Map

### New files
| Path | Purpose |
|---|---|
| `.env.local` | Supabase env vars |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client (reads cookies) |
| `lib/supabase/admin.ts` | Service-role client (admin only, server-side) |
| `middleware.ts` | Auth + admin route protection |
| `lib/types/profile.ts` | `Profile` type (replaces `AccountProfile` for Supabase data) |
| `lib/contexts/AuthContext.tsx` | Replaces `AccountContext` |
| `app/(auth)/layout.tsx` | Minimal layout without sidebar |
| `app/(auth)/login/page.tsx` | Login page |
| `app/(auth)/register/page.tsx` | Register page |
| `app/(auth)/verify-email/page.tsx` | Verify email instruction page |
| `components/auth/LoginForm.tsx` | Email + password login form |
| `components/auth/RegisterForm.tsx` | Name + email + password register form |
| `lib/db/sources.ts` | Async Supabase wrapper for `learning_sources` |
| `lib/db/sessions.ts` | Async wrapper for `learning_sessions` |
| `lib/db/skillProgress.ts` | Async wrapper for `skill_progress` |
| `lib/db/insights.ts` | Async wrapper for `key_insights` |
| `lib/db/tasks.ts` | Async wrapper for `source_tasks` |
| `lib/db/profile.ts` | Async wrapper for `profiles` |
| `components/layout/AdminSidebar.tsx` | Admin sidebar (separate from user sidebar) |
| `app/(admin)/layout.tsx` | Admin route group layout |
| `app/(admin)/admin/page.tsx` | Platform overview (Server Component) |
| `app/(admin)/admin/users/page.tsx` | User table (Server Component) |
| `app/(admin)/admin/users/[id]/page.tsx` | User detail (Server Component) |
| `app/(admin)/admin/users/[id]/actions.ts` | Server Actions (suspend/delete/promote) |
| `components/admin/UserActionButtons.tsx` | Client component for admin action buttons |

### Modified files
| Path | Change |
|---|---|
| `package.json` | Add `@supabase/supabase-js`, `@supabase/ssr` |
| `app/layout.tsx` | Wrap with `AuthProvider` |
| `app/dashboard/layout.tsx` | Remove `AccountProvider` (AuthProvider now in root) |
| `components/layout/Sidebar.tsx` | Remove `AccountSwitcher`, add user name + sign out button |
| `components/AppInitializer.tsx` | Disable seed data (no localStorage in new system) |
| `components/dashboard/DashboardShell.tsx` | `useAccount` → `useAuth`, async data |
| `components/pages/SourcesPage.tsx` | `useActiveAccountId` → `useAuth`, async data |
| `components/pages/SkillsPage.tsx` | async data |
| `components/pages/ActionsPage.tsx` | async data |
| `components/pages/InsightsPage.tsx` | async data |
| `components/pages/StatsPage.tsx` | async data |
| `components/account/AccountPage.tsx` | Full rewrite — single profile, no account switcher |
| `components/account/AccountProfileForm.tsx` | Edit `Profile` instead of `AccountProfile` |
| `components/sources/AddSourceForm.tsx` | `useActiveAccountId` → `useAuth` |
| `components/source-detail/SourceDetailShell.tsx` | async data |
| `components/source-detail/tabs/KeyInsightsTab.tsx` | async save/delete |
| `components/source-detail/tabs/SessionNotesTab.tsx` | async save |
| `components/source-detail/tabs/ActionItemsTab.tsx` | async save/update/delete |
| `components/source-detail/tabs/SkillProgressTab.tsx` | async update |

---

## Task 1: Install Dependencies + Environment File

**Files:**
- Modify: `package.json`
- Create: `.env.local`

- [ ] **Step 1: Install Supabase packages**

```bash
cd /Users/andrirohim/skillflow-app
npm install @supabase/supabase-js @supabase/ssr
```

Expected output: added 2 packages

- [ ] **Step 2: Create `.env.local`**

```bash
# .env.local — fill in from your Supabase project dashboard
# Settings > API > Project URL and API keys
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...YOUR_ANON_KEY...
SUPABASE_SERVICE_ROLE_KEY=eyJ...YOUR_SERVICE_ROLE_KEY...
```

**Where to find these values:** Supabase Dashboard → Your Project → Settings → API

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
```

Expected: ✓ Compiled successfully (env vars missing is OK for now — Supabase clients are not used yet)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.local
git commit -m "feat: install @supabase/supabase-js and @supabase/ssr"
```

---

## Task 2: Supabase SQL Schema (Manual — Run in Supabase Dashboard)

**Action:** Open your Supabase project → SQL Editor → New Query → paste and run the SQL below in order.

This task has no terminal commands — it's all done in the Supabase web dashboard.

- [ ] **Step 1: Create `profiles` table + trigger**

```sql
-- profiles: extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 text NOT NULL,
  name                  text NOT NULL DEFAULT 'User Baru',
  avatar                text NOT NULL DEFAULT '🧑',
  bio                   text,
  user_role             text CHECK (user_role IN ('pelajar','profesional','entrepreneur','developer')),
  focus_areas           text[] NOT NULL DEFAULT '{}',
  primary_goal          text,
  weekly_goal           int,
  gamification_mode     text NOT NULL DEFAULT 'standard' CHECK (gamification_mode IN ('light','standard')),
  onboarding_completed  boolean NOT NULL DEFAULT false,
  is_admin              boolean NOT NULL DEFAULT false,
  suspended_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User Baru')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 2: Create learning data tables**

```sql
CREATE TABLE IF NOT EXISTS public.learning_sources (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  creator_name          text NOT NULL DEFAULT '',
  url                   text,
  topic_tags            text[] NOT NULL DEFAULT '{}',
  skill_targets         text[] NOT NULL DEFAULT '{}',
  progress              jsonb NOT NULL DEFAULT '{"type":"article","estimatedReadMinutes":60,"consumedMinutes":0}',
  status                text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','on_hold')),
  difficulty_level      text NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner','intermediate','advanced')),
  daily_page_target     int,
  target_completion_date text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_id           uuid REFERENCES public.learning_sources(id) ON DELETE SET NULL,
  date                date NOT NULL,
  duration_minutes    int NOT NULL DEFAULT 0,
  units_consumed      numeric NOT NULL DEFAULT 0,
  start_progress      numeric,
  end_progress        numeric,
  notes               text,
  mood                text CHECK (mood IN ('great','good','okay','tired','distracted')),
  focus_rating        int CHECK (focus_rating BETWEEN 1 AND 5),
  productivity_rating int CHECK (productivity_rating BETWEEN 1 AND 5),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skill_progress (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_id         uuid REFERENCES public.learning_sources(id) ON DELETE SET NULL,
  skill_name        text NOT NULL,
  category          text NOT NULL DEFAULT '',
  level             text NOT NULL DEFAULT 'awareness' CHECK (level IN ('awareness','understanding','applied','mastered')),
  evidence          text,
  level_achieved_at timestamptz,
  action_items      jsonb NOT NULL DEFAULT '[]',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.key_insights (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_id        uuid REFERENCES public.learning_sources(id) ON DELETE SET NULL,
  type             text CHECK (type IN ('insight','quote','concept','reflection')),
  skill_target     text,
  quote            text NOT NULL,
  reflection       text,
  page_or_timestamp text,
  tags             text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.source_tasks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_id        uuid REFERENCES public.learning_sources(id) ON DELETE CASCADE,
  description      text NOT NULL,
  context          text,
  source_reference text,
  deadline         text,
  priority         text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status           text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','cancelled')),
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 3: Enable Row Level Security**

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_tasks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "own_profile" ON public.profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "own_sources" ON public.learning_sources FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_sessions" ON public.learning_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_skill_progress" ON public.skill_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_insights" ON public.key_insights FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_tasks" ON public.source_tasks FOR ALL USING (user_id = auth.uid());
```

- [ ] **Step 4: Verify tables in Supabase Dashboard**

Go to Table Editor — confirm all 6 tables appear: `profiles`, `learning_sources`, `learning_sessions`, `skill_progress`, `key_insights`, `source_tasks`.

---

## Task 3: Supabase Client Helpers

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`

- [ ] **Step 1: Create `lib/supabase/client.ts`** (browser client for "use client" components)

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create `lib/supabase/server.ts`** (server client for Server Components + middleware)

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component — cookies can't be set, middleware handles it
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create `lib/supabase/admin.ts`** (service-role client — bypasses RLS, server only)

```ts
import { createClient } from "@supabase/supabase-js";

// NEVER import this in "use client" components — service role key must stay server-side
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

- [ ] **Step 4: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client helpers (browser, server, admin)"
```

---

## Task 4: Middleware — Auth + Admin Route Protection

**Files:**
- Create: `middleware.ts` (at project root, next to `package.json`)

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required by @supabase/ssr
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin route: check is_admin flag and suspended_at
  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, suspended_at")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Dashboard route: check if user is suspended
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("suspended_at")
      .eq("id", user.id)
      .single();

    if (profile?.suspended_at) {
      await supabase.auth.signOut();
      const url = new URL("/login", request.url);
      url.searchParams.set("suspended", "true");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: ✓ Compiled successfully. Route table now shows middleware applied.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth + admin middleware with suspend check"
```

---

## Task 5: Profile Type + AuthContext

**Files:**
- Create: `lib/types/profile.ts`
- Create: `lib/contexts/AuthContext.tsx`

- [ ] **Step 1: Create `lib/types/profile.ts`**

This type mirrors the `profiles` Supabase table in camelCase.

```ts
export type UserRole = "pelajar" | "profesional" | "entrepreneur" | "developer";
export type GamificationMode = "light" | "standard";

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio?: string;
  userRole?: UserRole;
  focusAreas: string[];
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
```

- [ ] **Step 2: Create `lib/contexts/AuthContext.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mapProfile, profileToRow, type Profile } from "@/lib/types/profile";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) setProfile(mapProfile(data as Record<string, unknown>));
    },
    [supabase]
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id).finally(() => setIsLoading(false));
      else setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const updateProfile = useCallback(
    async (data: Partial<Profile>) => {
      if (!user) return;
      const row = profileToRow(data);
      const { data: updated } = await supabase
        .from("profiles")
        .update(row)
        .eq("id", user.id)
        .select()
        .single();
      if (updated) setProfile(mapProfile(updated as Record<string, unknown>));
    },
    [user, supabase]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.isAdmin ?? false,
        isLoading,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
```

- [ ] **Step 3: Wrap root layout with AuthProvider**

Edit `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dmsans",
});

export const metadata: Metadata = {
  title: "SkillFlow",
  description: "Ubah Pengetahuan Jadi Keahlian",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${poppins.variable} ${dmSans.variable}`}>
      <body className="font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Remove AccountProvider from dashboard layout**

Edit `app/dashboard/layout.tsx`:

```tsx
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: ✓ Compiled (AccountContext import errors will appear in components — that's expected, Task 9 fixes them)

- [ ] **Step 6: Commit**

```bash
git add lib/types/profile.ts lib/contexts/AuthContext.tsx app/layout.tsx app/dashboard/layout.tsx
git commit -m "feat: add Profile type, AuthContext, wrap app with AuthProvider"
```

---

## Task 6: Auth Pages — Login, Register, Verify Email

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/verify-email/page.tsx`
- Create: `components/auth/LoginForm.tsx`
- Create: `components/auth/RegisterForm.tsx`

- [ ] **Step 1: Create `app/(auth)/layout.tsx`** (no sidebar, centered card)

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-black tracking-tight">
            Skill<span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">Flow</span>
          </span>
          <p className="text-sm text-gray-400 mt-1">Ubah Pengetahuan Jadi Keahlian</p>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/auth/LoginForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const suspended = params.get("suspended") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email atau password salah."
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Masuk ke Akun</h1>

      {suspended && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          Akun kamu telah disuspend. Hubungi administrator.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
            placeholder="kamu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-600 to-violet-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-all hover:shadow-md active:scale-95"
        >
          {loading ? "Memproses..." : "Masuk →"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Belum punya akun?{" "}
        <a href="/register" className="text-sky-600 font-semibold hover:underline">
          Daftar sekarang
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/(auth)/login/page.tsx`**

```tsx
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 4: Create `components/auth/RegisterForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/verify-email");
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Buat Akun Baru</h1>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
            placeholder="Nama lengkap kamu"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
            placeholder="kamu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Konfirmasi Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
            placeholder="Ulangi password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-600 to-violet-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-all hover:shadow-md active:scale-95"
        >
          {loading ? "Membuat akun..." : "Daftar →"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Sudah punya akun?{" "}
        <a href="/login" className="text-sky-600 font-semibold hover:underline">
          Masuk di sini
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create `app/(auth)/register/page.tsx`**

```tsx
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 6: Create `app/(auth)/verify-email/page.tsx`**

```tsx
export default function VerifyEmailPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="text-5xl mb-4">📬</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Cek Inbox Kamu</h1>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Kami sudah kirim link verifikasi ke emailmu. Klik link tersebut untuk mengaktifkan akun dan mulai belajar.
      </p>
      <p className="text-xs text-gray-400">
        Tidak dapat email?{" "}
        <a href="/register" className="text-sky-600 font-semibold hover:underline">
          Coba daftar ulang
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: ✓ New routes `/login`, `/register`, `/verify-email` appear in route table

- [ ] **Step 8: Commit**

```bash
git add app/\(auth\)/ components/auth/
git commit -m "feat: add login, register, verify-email pages with Supabase auth"
```

---

## Task 7: Data Layer — `lib/db/*`

Replace `lib/accountStorage.ts` with async Supabase-backed functions. Same function signatures (except `async` + `await`).

**Files:**
- Create: `lib/db/sources.ts`
- Create: `lib/db/sessions.ts`
- Create: `lib/db/skillProgress.ts`
- Create: `lib/db/insights.ts`
- Create: `lib/db/tasks.ts`

- [ ] **Step 1: Create `lib/db/sources.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { LearningSource, SourceStatus, DifficultyLevel, ProgressData } from "@/lib/types";

function mapRow(row: Record<string, unknown>): LearningSource {
  return {
    id: row.id as string,
    title: row.title as string,
    creatorName: (row.creator_name as string) ?? "",
    url: row.url as string | undefined,
    topicTags: (row.topic_tags as string[]) ?? [],
    skillTargets: (row.skill_targets as string[]) ?? [],
    progress: row.progress as ProgressData,
    status: row.status as SourceStatus,
    difficultyLevel: row.difficulty_level as DifficultyLevel,
    dailyPageTarget: row.daily_page_target as number | undefined,
    targetCompletionDate: row.target_completion_date as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(source: LearningSource, userId: string) {
  return {
    id: source.id,
    user_id: userId,
    title: source.title,
    creator_name: source.creatorName,
    url: source.url ?? null,
    topic_tags: source.topicTags,
    skill_targets: source.skillTargets,
    progress: source.progress,
    status: source.status,
    difficulty_level: source.difficultyLevel,
    daily_page_target: source.dailyPageTarget ?? null,
    target_completion_date: source.targetCompletionDate ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function getSources(userId: string): Promise<LearningSource[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sources")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getSourceById(userId: string, id: string): Promise<LearningSource | undefined> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();
  return data ? mapRow(data as Record<string, unknown>) : undefined;
}

export async function saveSource(userId: string, source: LearningSource): Promise<void> {
  const supabase = createClient();
  await supabase.from("learning_sources").insert(toRow(source, userId));
}

export async function updateSource(userId: string, updated: LearningSource): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("learning_sources")
    .update(toRow(updated, userId))
    .eq("id", updated.id)
    .eq("user_id", userId);
}

export async function deleteSource(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("learning_sources")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
```

- [ ] **Step 2: Create `lib/db/sessions.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { LearningSession, MoodLevel } from "@/lib/types";

function mapRow(row: Record<string, unknown>): LearningSession {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    date: row.date as string,
    durationMinutes: (row.duration_minutes as number) ?? 0,
    unitsConsumed: (row.units_consumed as number) ?? 0,
    startProgress: row.start_progress as number | undefined,
    endProgress: row.end_progress as number | undefined,
    notes: row.notes as string | undefined,
    mood: row.mood as MoodLevel | undefined,
    focusRating: row.focus_rating as number | undefined,
    productivityRating: row.productivity_rating as number | undefined,
    createdAt: row.created_at as string,
  };
}

export async function getSessions(userId: string): Promise<LearningSession[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getSessionsBySource(userId: string, sourceId: string): Promise<LearningSession[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId)
    .order("date", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function saveSession(userId: string, session: LearningSession): Promise<void> {
  const supabase = createClient();
  await supabase.from("learning_sessions").insert({
    id: session.id,
    user_id: userId,
    source_id: session.sourceId || null,
    date: session.date,
    duration_minutes: session.durationMinutes,
    units_consumed: session.unitsConsumed,
    start_progress: session.startProgress ?? null,
    end_progress: session.endProgress ?? null,
    notes: session.notes ?? null,
    mood: session.mood ?? null,
    focus_rating: session.focusRating ?? null,
    productivity_rating: session.productivityRating ?? null,
  });
}

export async function deleteSession(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("learning_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
```

- [ ] **Step 3: Create `lib/db/skillProgress.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { SkillProgress, SkillLevel, ActionItem } from "@/lib/types";

function mapRow(row: Record<string, unknown>): SkillProgress {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    skillName: row.skill_name as string,
    category: (row.category as string) ?? "",
    level: ((row.level as string) ?? "awareness") as SkillLevel,
    evidence: row.evidence as string | undefined,
    levelAchievedAt: row.level_achieved_at as string | undefined,
    actionItems: (row.action_items as ActionItem[]) ?? [],
    createdAt: row.created_at as string,
  };
}

export async function getSkillProgress(userId: string): Promise<SkillProgress[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("skill_progress")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getSkillProgressBySource(userId: string, sourceId: string): Promise<SkillProgress[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("skill_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId);
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function saveSkillProgress(userId: string, sp: SkillProgress): Promise<void> {
  const supabase = createClient();
  await supabase.from("skill_progress").insert({
    id: sp.id,
    user_id: userId,
    source_id: sp.sourceId || null,
    skill_name: sp.skillName,
    category: sp.category,
    level: sp.level ?? "awareness",
    evidence: sp.evidence ?? null,
    level_achieved_at: sp.levelAchievedAt ?? null,
    action_items: sp.actionItems,
  });
}

export async function updateSkillProgress(userId: string, updated: SkillProgress): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("skill_progress")
    .update({
      skill_name: updated.skillName,
      category: updated.category,
      level: updated.level ?? "awareness",
      evidence: updated.evidence ?? null,
      level_achieved_at: updated.levelAchievedAt ?? null,
      action_items: updated.actionItems,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updated.id)
    .eq("user_id", userId);
}

export async function deleteSkillProgress(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("skill_progress")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
```

- [ ] **Step 4: Create `lib/db/insights.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { KeyInsight, InsightType } from "@/lib/types";

function mapRow(row: Record<string, unknown>): KeyInsight {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    type: row.type as InsightType | undefined,
    skillTarget: row.skill_target as string | undefined,
    quote: row.quote as string,
    reflection: row.reflection as string | undefined,
    pageOrTimestamp: row.page_or_timestamp as string | undefined,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

export async function getInsights(userId: string): Promise<KeyInsight[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("key_insights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getInsightsBySource(userId: string, sourceId: string): Promise<KeyInsight[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("key_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function saveInsight(userId: string, insight: KeyInsight): Promise<void> {
  const supabase = createClient();
  await supabase.from("key_insights").insert({
    id: insight.id,
    user_id: userId,
    source_id: insight.sourceId || null,
    type: insight.type ?? null,
    skill_target: insight.skillTarget ?? null,
    quote: insight.quote,
    reflection: insight.reflection ?? null,
    page_or_timestamp: insight.pageOrTimestamp ?? null,
    tags: insight.tags,
  });
}

export async function deleteInsight(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("key_insights")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
```

- [ ] **Step 5: Create `lib/db/tasks.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { SourceTask, TaskPriority, TaskStatus } from "@/lib/types";

function mapRow(row: Record<string, unknown>): SourceTask {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    description: row.description as string,
    context: row.context as string | undefined,
    sourceReference: row.source_reference as string | undefined,
    deadline: row.deadline as string | undefined,
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    completedAt: row.completed_at as string | undefined,
    createdAt: row.created_at as string,
  };
}

export async function getTasks(userId: string): Promise<SourceTask[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("source_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getTasksBySource(userId: string, sourceId: string): Promise<SourceTask[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("source_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId);
  const tasks = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  const priority = ["urgent", "high", "medium", "low"];
  return tasks.sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return priority.indexOf(a.priority) - priority.indexOf(b.priority);
  });
}

export async function saveTask(userId: string, task: SourceTask): Promise<void> {
  const supabase = createClient();
  await supabase.from("source_tasks").insert({
    id: task.id,
    user_id: userId,
    source_id: task.sourceId || null,
    description: task.description,
    context: task.context ?? null,
    source_reference: task.sourceReference ?? null,
    deadline: task.deadline ?? null,
    priority: task.priority,
    status: task.status,
    completed_at: task.completedAt ?? null,
  });
}

export async function updateTask(userId: string, updated: SourceTask): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("source_tasks")
    .update({
      description: updated.description,
      context: updated.context ?? null,
      source_reference: updated.sourceReference ?? null,
      deadline: updated.deadline ?? null,
      priority: updated.priority,
      status: updated.status,
      completed_at: updated.completedAt ?? null,
    })
    .eq("id", updated.id)
    .eq("user_id", userId);
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("source_tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: ✓ Compiled — new `lib/db/` files type-check correctly

- [ ] **Step 7: Commit**

```bash
git add lib/db/
git commit -m "feat: add async Supabase data layer (lib/db/*)"
```

---

## Task 8: Refactor Sidebar + Disable Seed Data

**Files:**
- Modify: `components/layout/Sidebar.tsx`
- Modify: `components/AppInitializer.tsx`

- [ ] **Step 1: Update `components/AppInitializer.tsx`** — disable localStorage seeding

```tsx
"use client";

// Seed data disabled: app now uses Supabase database
export default function AppInitializer() {
  return null;
}
```

- [ ] **Step 2: Update `components/layout/Sidebar.tsx`**

Replace `AccountSwitcher` import with `useAuth` sign-out button. Find the bottom section of the sidebar that renders `<AccountSwitcher />` and replace with:

At the top of the file, replace:
```tsx
import AccountSwitcher from "@/components/account/AccountSwitcher";
```
with:
```tsx
import { useAuth } from "@/lib/contexts/AuthContext";
```

Inside the `Sidebar` component, add after the existing hooks:
```tsx
const { profile, signOut } = useAuth();
```

Find the section near the bottom of the sidebar where `<AccountSwitcher />` appears and replace it with:
```tsx
{/* User info + sign out */}
<div className="px-4 py-4 border-t border-light-border dark:border-dark-border">
  <div className="flex items-center gap-2 mb-2">
    <span className="text-xl">{profile?.avatar ?? "🧑"}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-text-primary truncate">{profile?.name ?? "..."}</p>
      <p className="text-xs text-text-secondary truncate">{profile?.email ?? ""}</p>
    </div>
  </div>
  <button
    onClick={signOut}
    className="w-full text-left text-xs font-semibold text-text-secondary hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
  >
    Keluar →
  </button>
</div>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: ✓ (AccountSwitcher errors may persist from other files — acceptable at this stage)

- [ ] **Step 4: Commit**

```bash
git add components/AppInitializer.tsx components/layout/Sidebar.tsx
git commit -m "feat: update sidebar with user info + sign out, disable seed data"
```

---

## Task 9: Refactor Dashboard Components

Replace `useAccount()`/`useActiveAccountId()` with `useAuth()` and all `getSources(accountId)` style calls with `await getSources(userId)` in every component. The pattern is the same across all files.

**The refactor pattern:**

```ts
// BEFORE (in every component)
import { useActiveAccountId } from "@/lib/contexts/AccountContext";
import { getSources, getSessions } from "@/lib/accountStorage";
const accountId = useActiveAccountId();
const load = useCallback(() => {
  setSources(getSources(accountId));
  setSessions(getSessions(accountId));
}, [accountId]);

// AFTER
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSources } from "@/lib/db/sources";
import { getSessions } from "@/lib/db/sessions";
const { user } = useAuth();
const load = useCallback(async () => {
  if (!user) return;
  setSources(await getSources(user.id));
  setSessions(await getSessions(user.id));
}, [user]);
```

Apply this pattern to each file below. Only the import paths, hook name, and async/await change — the component structure stays the same.

- [ ] **Step 1: Refactor `components/dashboard/DashboardShell.tsx`**

Change imports:
```tsx
// Remove:
import { useAccount, useActiveAccountId } from "@/lib/contexts/AccountContext";
import { getSources, getSessions, getInsights, getSkillProgress, updateSkillProgress } from "@/lib/accountStorage";
// Add:
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSources } from "@/lib/db/sources";
import { getSessions } from "@/lib/db/sessions";
import { getInsights } from "@/lib/db/insights";
import { getSkillProgress, updateSkillProgress } from "@/lib/db/skillProgress";
```

Change the component top:
```tsx
const { user, profile: activeAccount, updateProfile: updateAccount } = useAuth();
```

Remove `useActiveAccountId()` call — use `user!.id` everywhere `accountId` was used.

Change `loadAllData` to async:
```ts
async function loadAllData(userId: string): Promise<AppData> {
  const [sources, sessions, insights, skillProgress] = await Promise.all([
    getSources(userId),
    getSessions(userId),
    getInsights(userId),
    getSkillProgress(userId),
  ]);
  return { sources, sessions, insights, skillProgress };
}
```

Change `refresh`:
```ts
const refresh = useCallback(async () => {
  if (!user) return;
  setData(await loadAllData(user.id));
}, [user]);
```

Change both `useEffect` calls — make them async internally:
```ts
useEffect(() => {
  if (!user) return;
  (async () => {
    setData(await loadAllData(user.id));
    setLearnerTypeState(getLearnerType());
    setMounted(true);
  })();
}, [user]);
```

Change `handleOnboardingComplete` to use `updateAccount` (now `updateProfile`):
```ts
const handleOnboardingComplete = useCallback(async (updated: AccountProfile) => {
  await updateAccount(updated);
  setShowOnboarding(false);
}, [updateAccount]);
```

Change `handleToggleActionItem`:
```ts
const handleToggleActionItem = useCallback(async (skillProgressId: string, actionItemId: string) => {
  if (!user) return;
  const sp = data.skillProgress.find((s) => s.id === skillProgressId);
  if (!sp) return;
  const now = new Date().toISOString();
  const updated: SkillProgress = {
    ...sp,
    actionItems: sp.actionItems.map((ai) =>
      ai.id === actionItemId
        ? { ...ai, completed: !ai.completed, completedAt: !ai.completed ? now : undefined }
        : ai
    ),
  };
  await updateSkillProgress(user.id, updated);
  await refresh();
}, [user, data.skillProgress, refresh]);
```

In JSX, `activeAccount` is now `profile` (which can be null while loading). Guard with `profile ??` defaults:
```tsx
focusAreas={activeAccount?.focusAreas ?? []}
onboardingCompleted={activeAccount?.onboardingCompleted ?? false}
weeklyGoal={activeAccount?.weeklyGoal}
gamificationMode={activeAccount?.gamificationMode ?? "standard"}
```

- [ ] **Step 2: Refactor `components/pages/SourcesPage.tsx`**

```tsx
// Remove: import { useActiveAccountId } from "@/lib/contexts/AccountContext";
// Remove: import { getSources, getSessions, getSkillProgress } from "@/lib/accountStorage";
// Add:
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSources } from "@/lib/db/sources";
import { getSessions } from "@/lib/db/sessions";
import { getSkillProgress } from "@/lib/db/skillProgress";
```

Replace:
```tsx
const { activeAccount } = useAccount();
const accountId = useActiveAccountId();
// →
const { user, profile: activeAccount } = useAuth();
```

Make `load` async:
```ts
const load = useCallback(async () => {
  if (!user) return;
  setSources(await getSources(user.id));
  setSessions(await getSessions(user.id));
  setSkills(await getSkillProgress(user.id));
}, [user]);

useEffect(() => { load(); setMounted(true); }, [load]);
```

- [ ] **Step 3: Refactor `components/pages/SkillsPage.tsx`**

```tsx
// Remove: import { useActiveAccountId } from "@/lib/contexts/AccountContext";
// Remove: import { getSkillProgress, getSources } from "@/lib/accountStorage";
// Add:
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSkillProgress } from "@/lib/db/skillProgress";
import { getSources } from "@/lib/db/sources";
```

```tsx
const { user, profile: activeAccount } = useAuth();
// Replace accountId with user!.id in load callback, make load async
const load = useCallback(async () => {
  if (!user) return;
  setSkills(await getSkillProgress(user.id));
  setSources(await getSources(user.id));
}, [user]);
```

- [ ] **Step 4: Refactor `components/pages/ActionsPage.tsx`**

```tsx
// Remove: import { useActiveAccountId } from "@/lib/contexts/AccountContext";
// Remove: import { getSkillProgress, getSources, updateSkillProgress } from "@/lib/accountStorage";
// Add:
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSkillProgress, updateSkillProgress } from "@/lib/db/skillProgress";
import { getSources } from "@/lib/db/sources";
```

```tsx
const { user } = useAuth();
const load = useCallback(async () => {
  if (!user) return;
  setSkills(await getSkillProgress(user.id));
  setSources(await getSources(user.id));
}, [user]);
```

Make `handleToggle` async:
```ts
const handleToggle = useCallback(async (skillProgressId: string, actionItemId: string) => {
  if (!user) return;
  // ... existing toggle logic ...
  await updateSkillProgress(user.id, updated);
  await load();
}, [user, skills, load]);
```

- [ ] **Step 5: Refactor `components/pages/InsightsPage.tsx`**

```tsx
// Remove AccountContext + accountStorage imports, add:
import { useAuth } from "@/lib/contexts/AuthContext";
import { getInsights } from "@/lib/db/insights";
import { getSources } from "@/lib/db/sources";

const { user } = useAuth();
const load = useCallback(async () => {
  if (!user) return;
  const raw = (await getInsights(user.id)).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  setInsights(raw);
  setSources(await getSources(user.id));
}, [user]);
```

- [ ] **Step 6: Refactor `components/pages/StatsPage.tsx`**

```tsx
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSessions } from "@/lib/db/sessions";
import { getInsights } from "@/lib/db/insights";
import { getSkillProgress } from "@/lib/db/skillProgress";
import { getSources } from "@/lib/db/sources";
import { getTasks } from "@/lib/db/tasks";

const { user } = useAuth();
const load = useCallback(async () => {
  if (!user) return;
  const [sessions, insights, skills, sources, tasks] = await Promise.all([
    getSessions(user.id),
    getInsights(user.id),
    getSkillProgress(user.id),
    getSources(user.id),
    getTasks(user.id),
  ]);
  setSessions(sessions);
  setInsights(insights);
  setSkills(skills);
  setSources(sources);
  setTasks(tasks);
}, [user]);
```

- [ ] **Step 7: Refactor `components/sources/AddSourceForm.tsx`**

```tsx
// Remove: import { useActiveAccountId } from "@/lib/contexts/AccountContext";
// Remove: import { generateId, saveSource, saveSkillProgress } from "@/lib/accountStorage";
// Add:
import { useAuth } from "@/lib/contexts/AuthContext";
import { saveSource } from "@/lib/db/sources";
import { saveSkillProgress } from "@/lib/db/skillProgress";

const { user } = useAuth();
// Replace generateId() with crypto.randomUUID()
// Replace saveSource(accountId, ...) with await saveSource(user!.id, ...)
// Replace saveSkillProgress(accountId, ...) with await saveSkillProgress(user!.id, ...)
// Make handleSubmit async
```

- [ ] **Step 8: Refactor `components/source-detail/SourceDetailShell.tsx`**

```tsx
// Remove AccountContext + accountStorage imports, add:
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSourceById, updateSource } from "@/lib/db/sources";
import { getSessionsBySource } from "@/lib/db/sessions";
import { getInsightsBySource } from "@/lib/db/insights";
import { getSkillProgressBySource, getSkillProgress } from "@/lib/db/skillProgress";
import { getTasksBySource } from "@/lib/db/tasks";
import { getSources } from "@/lib/db/sources";

const { user } = useAuth();
const refresh = useCallback(async () => {
  if (!user) return;
  const [src, sessions, insights, skillProgress, tasks, allSkillsGlobal, allSources] =
    await Promise.all([
      getSourceById(user.id, sourceId),
      getSessionsBySource(user.id, sourceId),
      getInsightsBySource(user.id, sourceId),
      getSkillProgressBySource(user.id, sourceId),
      getTasksBySource(user.id, sourceId),
      getSkillProgress(user.id),
      getSources(user.id),
    ]);
  if (!src) { setNotFound(true); return; }
  setSource(src);
  setSessions(sessions);
  setInsights(insights);
  setSkillProgress(skillProgress);
  setTasks(tasks);
  setAllSkillsGlobal(allSkillsGlobal);
  setAllSources(allSources);
}, [user, sourceId]);
// Also make handleProgressUpdate and other mutation callbacks async
// Replace updateSource(accountId, ...) with await updateSource(user!.id, ...)
```

- [ ] **Step 9: Refactor source-detail tabs**

For each tab, replace `useActiveAccountId()` with `useAuth()` and make all save/update/delete calls async.

**`components/source-detail/tabs/KeyInsightsTab.tsx`:**
```tsx
import { useAuth } from "@/lib/contexts/AuthContext";
import { saveInsight, deleteInsight } from "@/lib/db/insights";
const { user } = useAuth();
// Replace generateId() → crypto.randomUUID()
// saveInsight(accountId, insight) → await saveInsight(user!.id, insight)
// deleteInsight(accountId, id) → await deleteInsight(user!.id, id)
```

**`components/source-detail/tabs/SessionNotesTab.tsx`:**
```tsx
import { useAuth } from "@/lib/contexts/AuthContext";
import { saveSession } from "@/lib/db/sessions";
import { updateSource } from "@/lib/db/sources";
const { user } = useAuth();
// saveSession(accountId, session) → await saveSession(user!.id, session)
// updateSource(accountId, ...) → await updateSource(user!.id, ...)
// Make handleSave async
```

**`components/source-detail/tabs/ActionItemsTab.tsx`:**
```tsx
import { useAuth } from "@/lib/contexts/AuthContext";
import { saveTask, updateTask, deleteTask } from "@/lib/db/tasks";
const { user } = useAuth();
// saveTask → await saveTask(user!.id, task)
// updateTask → await updateTask(user!.id, updated)
// deleteTask → await deleteTask(user!.id, id)
```

**`components/source-detail/tabs/SkillProgressTab.tsx`:**
```tsx
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateSkillProgress } from "@/lib/db/skillProgress";
const { user } = useAuth();
// updateSkillProgress(accountId, ...) → await updateSkillProgress(user!.id, ...)
```

- [ ] **Step 10: Refactor `components/account/AccountPage.tsx`**

AccountPage no longer needs account-switching — it shows the current user's profile. Rewrite to a simplified form:

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getSessions } from "@/lib/db/sessions";
import { getCurrentStreak, getLongestStreak } from "@/lib/utils/analytics";
import type { LearningSession } from "@/lib/types";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import type { AccountProfile } from "@/lib/accountTypes";

export default function AccountPage() {
  const { user, profile, updateProfile } = useAuth();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user) return;
    getSessions(user.id).then(setSessions);
  }, [user]);

  const currentStreak = useMemo(() => getCurrentStreak(sessions), [sessions]);
  const longestStreak = useMemo(() => getLongestStreak(sessions), [sessions]);

  const handleOnboardingComplete = useCallback(
    async (updated: AccountProfile) => {
      await updateProfile({
        name: updated.name,
        avatar: updated.avatar,
        userRole: updated.userRole,
        focusAreas: updated.focusAreas,
        primaryGoal: updated.primaryGoal,
        onboardingCompleted: updated.onboardingCompleted,
      });
      setShowOnboarding(false);
    },
    [updateProfile]
  );

  if (!profile) return null;

  // Convert Profile → AccountProfile for OnboardingFlow compatibility
  const accountProfile: AccountProfile = {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    role: "owner",
    learningMode: "daily",
    focusAreas: profile.focusAreas,
    primaryGoal: profile.primaryGoal,
    weeklyGoal: profile.weeklyGoal,
    gamificationMode: profile.gamificationMode,
    createdAt: profile.createdAt,
    userRole: profile.userRole,
    onboardingCompleted: profile.onboardingCompleted,
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingFlow
          account={accountProfile}
          onComplete={handleOnboardingComplete}
          onSkip={() => handleOnboardingComplete({ ...accountProfile, onboardingCompleted: true })}
          editMode
        />
      )}

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Profil Akun</h1>
          <p className="text-sm text-gray-400 mt-1">{profile.email}</p>
        </div>

        {/* Streak stats */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-orange-600 mb-2">STATISTIK STREAK</p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-orange-700">🔥 {currentStreak} hari</p>
              <p className="text-xs text-orange-600 mt-1">Streak saat ini</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-700">🏆 {longestStreak} hari</p>
              <p className="text-xs text-amber-600 mt-1">Terpanjang</p>
            </div>
          </div>
        </div>

        {/* Edit preferences */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Preferensi Belajar</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-5">
            <p><span className="font-medium">Nama:</span> {profile.name}</p>
            <p><span className="font-medium">Avatar:</span> {profile.avatar}</p>
            {profile.primaryGoal && <p><span className="font-medium">Tujuan:</span> {profile.primaryGoal}</p>}
            {profile.focusAreas.length > 0 && (
              <p><span className="font-medium">Fokus:</span> {profile.focusAreas.join(", ")}</p>
            )}
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-xs font-semibold text-violet-600 hover:text-violet-800 px-3 py-1.5 rounded-lg border border-violet-200 hover:border-violet-300 transition-colors"
          >
            ✨ Edit Preferensi Belajar
          </button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 11: Refactor `components/account/AccountProfileForm.tsx`** 

This component is now only used via AccountPage → OnboardingFlow. If it still imports from AccountContext, update the import:
```tsx
// Remove: import { useAccount } from "@/lib/contexts/AccountContext";
// The component receives account as prop and calls onSaved — no context needed
// Remove archiveAccount usage (no longer relevant)
// Keep the form fields, update handleSave to not call updateAccount directly
// Instead just call onSaved(updated) and let the parent handle the update
```

- [ ] **Step 12: Verify build**

```bash
npm run build
```

Expected: ✓ Compiled successfully, 0 TypeScript errors

- [ ] **Step 13: Commit**

```bash
git add components/
git commit -m "feat: refactor all dashboard components to use AuthContext + async Supabase data layer"
```

---

## Task 10: Admin Layout + Sidebar

**Files:**
- Create: `components/layout/AdminSidebar.tsx`
- Create: `app/(admin)/layout.tsx`

- [ ] **Step 1: Create `components/layout/AdminSidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

const NAV = [
  { label: "Overview", href: "/admin", icon: "📊", exact: true },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Admin Panel</p>
        <span className="text-lg font-black">
          Skill<span className="text-sky-400">Flow</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-sky-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-4 border-t border-gray-700 mt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span>←</span>
            <span>Kembali ke App</span>
          </Link>
        </div>
      </nav>

      {/* Admin user info */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
        <button
          onClick={signOut}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors mt-1"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create `app/(admin)/layout.tsx`**

```tsx
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: ✓ Route `/admin` now shows in route table

- [ ] **Step 4: Commit**

```bash
git add components/layout/AdminSidebar.tsx app/\(admin\)/
git commit -m "feat: add admin layout and sidebar"
```

---

## Task 11: Admin Overview Page

**Files:**
- Create: `app/(admin)/admin/page.tsx`

This is a Server Component — uses `adminClient` directly, no "use client".

- [ ] **Step 1: Create `app/(admin)/admin/page.tsx`**

```tsx
import { adminClient } from "@/lib/supabase/admin";

async function getStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newThirtyDays },
    { data: recentSessions },
    { data: topSkills },
  ] = await Promise.all([
    adminClient.from("profiles").select("*", { count: "exact", head: true }),
    adminClient.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    adminClient.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    adminClient.from("learning_sessions").select("user_id").gte("date", sevenDaysAgo),
    adminClient.from("skill_progress").select("skill_name"),
  ]);

  // Count unique active users (had a session in last 7 days)
  const activeUsers = new Set((recentSessions ?? []).map((s: { user_id: string }) => s.user_id)).size;

  // Count top 5 skills
  const skillCounts: Record<string, number> = {};
  (topSkills ?? []).forEach((r: { skill_name: string }) => {
    skillCounts[r.skill_name] = (skillCounts[r.skill_name] ?? 0) + 1;
  });
  const top5Skills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalUsers: totalUsers ?? 0,
    newToday: newToday ?? 0,
    newThirtyDays: newThirtyDays ?? 0,
    activeUsers,
    top5Skills,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Statistik real-time seluruh pengguna SkillFlow</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total User", value: stats.totalUsers, color: "text-sky-600" },
          { label: "Aktif 7 Hari", value: stats.activeUsers, color: "text-emerald-600" },
          { label: "Baru Hari Ini", value: stats.newToday, color: "text-violet-600" },
          { label: "Baru 30 Hari", value: stats.newThirtyDays, color: "text-orange-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Top 5 Skill Ditrack</h2>
        {stats.top5Skills.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data skill.</p>
        ) : (
          <div className="space-y-3">
            {stats.top5Skills.map(([skill, count], i) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{skill}</span>
                    <span className="text-gray-400">{count} user</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-sky-400"
                      style={{ width: `${(count / (stats.top5Skills[0]?.[1] ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <a
          href="/admin/users"
          className="text-sm font-semibold text-sky-600 hover:text-sky-800 px-4 py-2 rounded-xl border border-sky-200 hover:border-sky-300 transition-colors"
        >
          Kelola Users →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: ✓ `/admin` static route appears

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/admin/page.tsx
git commit -m "feat: add admin overview page with platform stats"
```

---

## Task 12: Admin Users List Page

**Files:**
- Create: `app/(admin)/admin/users/page.tsx`

- [ ] **Step 1: Create `app/(admin)/admin/users/page.tsx`**

```tsx
import { adminClient } from "@/lib/supabase/admin";

async function getAllUsers() {
  // Fetch profiles
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, name, email, avatar, is_admin, suspended_at, created_at")
    .order("created_at", { ascending: false });

  // Fetch auth data (for last_sign_in_at)
  const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const authMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.last_sign_in_at])
  );

  // Fetch activity stats
  const { data: sessions } = await adminClient
    .from("learning_sessions")
    .select("user_id, duration_minutes");
  const { data: skillRows } = await adminClient
    .from("skill_progress")
    .select("user_id");

  const sessionsByUser = new Map<string, { count: number; minutes: number }>();
  (sessions ?? []).forEach((s: { user_id: string; duration_minutes: number }) => {
    const cur = sessionsByUser.get(s.user_id) ?? { count: 0, minutes: 0 };
    sessionsByUser.set(s.user_id, { count: cur.count + 1, minutes: cur.minutes + s.duration_minutes });
  });

  const skillsByUser = new Map<string, number>();
  (skillRows ?? []).forEach((r: { user_id: string }) => {
    skillsByUser.set(r.user_id, (skillsByUser.get(r.user_id) ?? 0) + 1);
  });

  return (profiles ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    email: p.email as string,
    avatar: (p.avatar as string) ?? "🧑",
    isAdmin: (p.is_admin as boolean) ?? false,
    suspendedAt: p.suspended_at as string | null,
    createdAt: p.created_at as string,
    lastSignIn: authMap.get(p.id as string) ?? null,
    totalSessions: sessionsByUser.get(p.id as string)?.count ?? 0,
    totalMinutes: sessionsByUser.get(p.id as string)?.minutes ?? 0,
    skillsTracked: skillsByUser.get(p.id as string) ?? 0,
  }));
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-1">{users.length} user terdaftar</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Daftar</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Last Login</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Sesi</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Menit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Skill</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{user.avatar}</span>
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-1">
                        {user.name}
                        {user.isAdmin && (
                          <span className="text-xs font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">Admin</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    user.suspendedAt
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {user.suspendedAt ? "Suspended" : "Aktif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.lastSignIn
                    ? new Date(user.lastSignIn).toLocaleDateString("id-ID")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{user.totalSessions}</td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{user.totalMinutes}</td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{user.skillsTracked}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/admin/users/${user.id}`}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                  >
                    Detail →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: ✓ `/admin/users` static route appears

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/admin/users/page.tsx
git commit -m "feat: add admin users list page with activity stats"
```

---

## Task 13: Admin User Detail Page + Server Actions

**Files:**
- Create: `app/(admin)/admin/users/[id]/page.tsx`
- Create: `app/(admin)/admin/users/[id]/actions.ts`
- Create: `components/admin/UserActionButtons.tsx`

- [ ] **Step 1: Create `app/(admin)/admin/users/[id]/actions.ts`** (Server Actions)

```ts
"use server";

import { adminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function suspendUser(userId: string) {
  await adminClient
    .from("profiles")
    .update({ suspended_at: new Date().toISOString() })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function unsuspendUser(userId: string) {
  await adminClient
    .from("profiles")
    .update({ suspended_at: null })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function promoteToAdmin(userId: string) {
  await adminClient
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
}

export async function demoteFromAdmin(userId: string) {
  await adminClient
    .from("profiles")
    .update({ is_admin: false })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteUser(userId: string) {
  // Deleting from auth.users cascades to profiles and all user data via FK
  await adminClient.auth.admin.deleteUser(userId);
  revalidatePath("/admin/users");
}
```

- [ ] **Step 2: Create `components/admin/UserActionButtons.tsx`** (Client Component for interactivity)

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  suspendUser,
  unsuspendUser,
  promoteToAdmin,
  demoteFromAdmin,
  deleteUser,
} from "@/app/(admin)/admin/users/[id]/actions";

interface Props {
  userId: string;
  isSuspended: boolean;
  isAdmin: boolean;
}

export default function UserActionButtons({ userId, isSuspended, isAdmin }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function run(action: string, fn: () => Promise<void>) {
    setLoading(action);
    try {
      await fn();
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Suspend / Unsuspend */}
      {isSuspended ? (
        <button
          onClick={() => run("unsuspend", () => unsuspendUser(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
        >
          {loading === "unsuspend" ? "Memproses..." : "✓ Aktifkan Akun"}
        </button>
      ) : (
        <button
          onClick={() => run("suspend", () => suspendUser(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-orange-200 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50 transition-colors"
        >
          {loading === "suspend" ? "Memproses..." : "⚠ Suspend Akun"}
        </button>
      )}

      {/* Promote / Demote Admin */}
      {isAdmin ? (
        <button
          onClick={() => run("demote", () => demoteFromAdmin(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {loading === "demote" ? "Memproses..." : "Cabut Hak Admin"}
        </button>
      ) : (
        <button
          onClick={() => run("promote", () => promoteToAdmin(userId))}
          disabled={loading !== null}
          className="w-full py-2 rounded-xl border border-violet-200 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50 transition-colors"
        >
          {loading === "promote" ? "Memproses..." : "★ Jadikan Admin"}
        </button>
      )}

      {/* Delete */}
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-2 rounded-xl border border-red-100 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          Hapus Akun
        </button>
      ) : (
        <div className="border border-red-200 rounded-xl p-3 bg-red-50">
          <p className="text-xs text-red-700 font-semibold mb-2">Yakin hapus akun ini? Tindakan tidak bisa dibatalkan.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-white transition-colors"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                setLoading("delete");
                await deleteUser(userId);
                router.push("/admin/users");
              }}
              disabled={loading !== null}
              className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading === "delete" ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `app/(admin)/admin/users/[id]/page.tsx`**

```tsx
import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import UserActionButtons from "@/components/admin/UserActionButtons";

async function getUserDetail(id: string) {
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    adminClient.from("profiles").select("*").eq("id", id).single(),
    adminClient.auth.admin.getUserById(id),
  ]);

  if (!profile) return null;

  const [
    { count: totalSessions },
    { data: sessionsData },
    { count: totalSkills },
    { count: totalInsights },
  ] = await Promise.all([
    adminClient.from("learning_sessions").select("*", { count: "exact", head: true }).eq("user_id", id),
    adminClient.from("learning_sessions").select("duration_minutes").eq("user_id", id),
    adminClient.from("skill_progress").select("*", { count: "exact", head: true }).eq("user_id", id),
    adminClient.from("key_insights").select("*", { count: "exact", head: true }).eq("user_id", id),
  ]);

  const totalMinutes = (sessionsData ?? []).reduce(
    (sum: number, s: { duration_minutes: number }) => sum + (s.duration_minutes ?? 0),
    0
  );

  return {
    id: profile.id as string,
    name: profile.name as string,
    email: profile.email as string,
    avatar: (profile.avatar as string) ?? "🧑",
    bio: profile.bio as string | null,
    userRole: profile.user_role as string | null,
    focusAreas: (profile.focus_areas as string[]) ?? [],
    primaryGoal: profile.primary_goal as string | null,
    weeklyGoal: profile.weekly_goal as number | null,
    isAdmin: (profile.is_admin as boolean) ?? false,
    suspendedAt: profile.suspended_at as string | null,
    onboardingCompleted: (profile.onboarding_completed as boolean) ?? false,
    createdAt: profile.created_at as string,
    lastSignIn: authUser?.user?.last_sign_in_at ?? null,
    emailConfirmedAt: authUser?.user?.email_confirmed_at ?? null,
    stats: {
      totalSessions: totalSessions ?? 0,
      totalMinutes,
      totalSkills: totalSkills ?? 0,
      totalInsights: totalInsights ?? 0,
    },
  };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a href="/admin/users" className="text-sm text-gray-400 hover:text-gray-600">← Semua Users</a>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-4xl">{user.avatar}</span>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            {user.name}
            {user.isAdmin && (
              <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Admin</span>
            )}
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
              user.suspendedAt ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {user.suspendedAt ? "Suspended" : "Aktif"}
            </span>
          </h1>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Profil</h2>
            <dl className="space-y-2 text-sm">
              {[
                { label: "Bio", value: user.bio },
                { label: "Peran", value: user.userRole },
                { label: "Tujuan", value: user.primaryGoal },
                { label: "Target Belajar", value: user.weeklyGoal ? `${user.weeklyGoal} menit/minggu` : null },
                { label: "Onboarding", value: user.onboardingCompleted ? "Selesai" : "Belum" },
                { label: "Email Verified", value: user.emailConfirmedAt ? new Date(user.emailConfirmedAt).toLocaleDateString("id-ID") : "Belum" },
                { label: "Bergabung", value: new Date(user.createdAt).toLocaleDateString("id-ID") },
                { label: "Last Login", value: user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString("id-ID") : "Belum pernah" },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex gap-2">
                  <dt className="w-32 text-gray-400 shrink-0">{label}</dt>
                  <dd className="text-gray-800 font-medium">{value}</dd>
                </div>
              ) : null)}
            </dl>
            {user.focusAreas.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {user.focusAreas.map((f) => (
                  <span key={f} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-lg border border-violet-100">{f}</span>
                ))}
              </div>
            )}
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Aktivitas Belajar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Sesi", value: user.stats.totalSessions, color: "text-sky-600" },
                { label: "Total Menit", value: user.stats.totalMinutes, color: "text-violet-600" },
                { label: "Skill Ditrack", value: user.stats.totalSkills, color: "text-emerald-600" },
                { label: "Insights", value: user.stats.totalInsights, color: "text-orange-600" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-gray-900 mb-4">Kelola Akun</h2>
          <UserActionButtons
            userId={user.id}
            isSuspended={!!user.suspendedAt}
            isAdmin={user.isAdmin}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify full build**

```bash
npm run build
```

Expected: ✓ All routes compile, 0 TypeScript errors. Route table shows:
- `/login`, `/register`, `/verify-email`
- `/dashboard/*` (all existing routes)
- `/admin`, `/admin/users`, `/admin/users/[id]`

- [ ] **Step 5: Final commit**

```bash
git add app/\(admin\)/admin/users/ components/admin/
git commit -m "feat: add admin user detail page with suspend/delete/promote actions"
```

---

## Post-Implementation Checklist

After all tasks are complete, manually verify these flows in the browser (`npm run dev`):

- [ ] `/register` — fill name + email + password → redirect to `/verify-email`
- [ ] Click verification link from email → redirect to `/dashboard`
- [ ] `/login` with wrong password → shows error message in Indonesian
- [ ] `/dashboard` without login → redirect to `/login`
- [ ] `/admin` without login → redirect to `/login`
- [ ] Set `is_admin = true` in Supabase Dashboard for your test account
- [ ] `/admin` with admin account → shows overview stats
- [ ] `/admin/users` → shows user table with activity data
- [ ] `/admin/users/[id]` → shows user detail, suspend button works, unsuspend works
- [ ] Suspend a user → log in as that user → redirected to `/login?suspended=true` with message
- [ ] Sign out from sidebar → redirected to `/login`
