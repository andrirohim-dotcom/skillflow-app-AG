# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillFlow is a client-side personal learning tracker (Indonesian: "Ubah Pengetahuan Jadi Keahlian"). The entire UI is in **Bahasa Indonesia** (lang="id"). There is no backend — all data persists in the browser via localStorage.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run start` — Serve production build

No test runner is configured.

## Architecture

**Next.js 15 App Router** with React 19, TypeScript (strict), Tailwind CSS 3.

### Routing

```
/                          → Landing page
/dashboard                 → DashboardShell (main overview)
/dashboard/sources         → SourcesPage
/dashboard/skills           → SkillsPage
/dashboard/actions          → ActionsPage
/dashboard/insights         → InsightsPage
/dashboard/stats            → StatsPage
/dashboard/item/[id]        → SourceDetailShell (async server component, Next 15 params pattern)
```

All dashboard routes share `app/dashboard/layout.tsx` → `DashboardLayout` (sidebar + main area).

### Data Layer

- **Storage** (`lib/storage.ts`): Generic `readStore<T>`/`writeStore<T>` over localStorage with `skillflow:*` keys defined in `lib/constants.ts`. SSR guard: `typeof window === "undefined"` checks. CRUD per entity with `getAll*()`, `getBySource()`, `save*()`, `update*()`, `delete*()`.
- **No global state** — each page component independently reads from localStorage and refreshes after mutations.
- **Relationships** are resolved at read time by filtering arrays on `sourceId`.

### Data Model (`lib/types.ts`)

Six entities: `LearningSource`, `LearningSession`, `KeyInsight`, `SkillProgress` (contains `ActionItem[]`), `SourceTask`. Progress on sources uses a **discriminated union** (`ProgressData`) keyed by `type` field, with variants: `BookProgress`, `YoutubeProgress`, `ArticleProgress`, `PodcastProgress`, `CourseProgress`.

### Component Patterns

- Every data-dependent component is `"use client"` (reads localStorage).
- **Hydration pattern**: `mounted` boolean state → skeleton (`animate-pulse`) until first `useEffect`, then real content.
- **Page component pattern** (in `components/pages/`): `useState` → `useCallback(load)` → `useEffect(load + setMounted)` → `useMemo(filtered/sorted)` → filter controls → content grid → empty state → skeleton function.
- `AppInitializer` component on every dashboard page runs `initializeSeedData()` once (gated by `skillflow:seeded` flag).

### Utilities (`lib/utils/`)

- `actionPlanGenerator.ts` — Keyword-matching action plan generator (not AI), returns 5 steps per skill.
- `analytics.ts` — Core analytics: streaks, weekly/monthly activity, consistency score, skill mastery, sort modes.
- `colorConfig.ts` — Centralized semantic color tokens (`ColorTokens` with 7 slots) across 3 palettes (sky, violet, rose). Source types map to palettes.
- `sourceProgress.ts` — Normalizes all progress variants into `SourceProgressStats { pct, consumed, total, unitLabel }` with Indonesian unit labels.

### Key Conventions

- UI text is always in **Indonesian**; code/types/comments in English.
- Colors go through `colorConfig` tokens, not ad-hoc Tailwind classes.
- Backward compatibility: optional fields (`SkillProgress.level`, `KeyInsight.type`) get runtime defaults in storage readers.
- Custom Tailwind animations: `fade-in`, `slide-up`, `scale-in` (defined in `tailwind.config.ts`).
- Path alias: `@/*` maps to project root.
# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
