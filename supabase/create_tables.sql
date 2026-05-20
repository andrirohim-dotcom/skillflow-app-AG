-- ==============================================================================
-- MISSING TABLES MIGRATION
-- ==============================================================================
-- It appears the foundational tables were never created in the cloud database
-- because they were previously only stored in localStorage.
-- Run this script in your Supabase SQL Editor to create them.
-- ==============================================================================

-- 1. Create learning_sources table
CREATE TABLE IF NOT EXISTS public.learning_sources (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    url TEXT,
    topic_tags JSONB DEFAULT '[]'::jsonb,
    skill_targets JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL,
    difficulty_level TEXT NOT NULL,
    progress JSONB DEFAULT '{}'::jsonb,
    daily_page_target INTEGER,
    target_completion_date DATE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    visibility TEXT DEFAULT 'personal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create key_insights table
CREATE TABLE IF NOT EXISTS public.key_insights (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES public.learning_sources(id) ON DELETE CASCADE,
    type TEXT,
    skill_target TEXT,
    quote TEXT NOT NULL,
    reflection TEXT,
    page_or_timestamp TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    visibility TEXT DEFAULT 'private',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create learning_sessions table
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES public.learning_sources(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    units_consumed INTEGER NOT NULL,
    start_progress INTEGER,
    end_progress INTEGER,
    notes TEXT,
    mood TEXT,
    focus_rating INTEGER,
    productivity_rating INTEGER,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create skill_progress table
CREATE TABLE IF NOT EXISTS public.skill_progress (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES public.learning_sources(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT DEFAULT 'awareness',
    evidence TEXT,
    level_achieved_at TIMESTAMPTZ,
    action_items JSONB DEFAULT '[]'::jsonb,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create source_tasks table
CREATE TABLE IF NOT EXISTS public.source_tasks (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES public.learning_sources(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    description TEXT NOT NULL,
    context TEXT,
    source_reference TEXT,
    deadline TIMESTAMPTZ,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.learning_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_tasks ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RE-APPLY RLS POLICIES (From Phase 4 Migration)
-- ==============================================================================

-- Learning Sources
DROP POLICY IF EXISTS "Users can select workspace sources" ON public.learning_sources;
DROP POLICY IF EXISTS "Users can insert workspace sources" ON public.learning_sources;
DROP POLICY IF EXISTS "Users can update workspace sources" ON public.learning_sources;
DROP POLICY IF EXISTS "Users can delete workspace sources" ON public.learning_sources;

CREATE POLICY "Users can select workspace sources" ON public.learning_sources FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace sources" ON public.learning_sources FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace sources" ON public.learning_sources FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace sources" ON public.learning_sources FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));

-- Key Insights
DROP POLICY IF EXISTS "Users can select workspace insights" ON public.key_insights;
DROP POLICY IF EXISTS "Users can insert workspace insights" ON public.key_insights;
DROP POLICY IF EXISTS "Users can update workspace insights" ON public.key_insights;
DROP POLICY IF EXISTS "Users can delete workspace insights" ON public.key_insights;

CREATE POLICY "Users can select workspace insights" ON public.key_insights FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace insights" ON public.key_insights FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace insights" ON public.key_insights FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace insights" ON public.key_insights FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));

-- Learning Sessions
DROP POLICY IF EXISTS "Users can select workspace sessions" ON public.learning_sessions;
DROP POLICY IF EXISTS "Users can insert workspace sessions" ON public.learning_sessions;
DROP POLICY IF EXISTS "Users can update workspace sessions" ON public.learning_sessions;
DROP POLICY IF EXISTS "Users can delete workspace sessions" ON public.learning_sessions;

CREATE POLICY "Users can select workspace sessions" ON public.learning_sessions FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace sessions" ON public.learning_sessions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace sessions" ON public.learning_sessions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace sessions" ON public.learning_sessions FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));

-- Skill Progress
DROP POLICY IF EXISTS "Users can select workspace skill progress" ON public.skill_progress;
DROP POLICY IF EXISTS "Users can insert workspace skill progress" ON public.skill_progress;
DROP POLICY IF EXISTS "Users can update workspace skill progress" ON public.skill_progress;
DROP POLICY IF EXISTS "Users can delete workspace skill progress" ON public.skill_progress;

CREATE POLICY "Users can select workspace skill progress" ON public.skill_progress FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace skill progress" ON public.skill_progress FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace skill progress" ON public.skill_progress FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace skill progress" ON public.skill_progress FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));

-- Source Tasks
DROP POLICY IF EXISTS "Users can select workspace source tasks" ON public.source_tasks;
DROP POLICY IF EXISTS "Users can insert workspace source tasks" ON public.source_tasks;
DROP POLICY IF EXISTS "Users can update workspace source tasks" ON public.source_tasks;
DROP POLICY IF EXISTS "Users can delete workspace source tasks" ON public.source_tasks;

CREATE POLICY "Users can select workspace source tasks" ON public.source_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace source tasks" ON public.source_tasks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace source tasks" ON public.source_tasks FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace source tasks" ON public.source_tasks FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));

