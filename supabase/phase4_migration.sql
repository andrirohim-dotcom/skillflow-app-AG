-- Phase 4 Migration: Cloud Database & Authentication
-- Run this script in your Supabase SQL Editor.

-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal', -- 'personal', 'team', 'enterprise'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'mentor', 'member', 'learner'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'invited', 'suspended'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 3. Modify existing tables to add workspace_id
-- We add the column as nullable first, then we'll update data, then we can make it NOT NULL if needed.
ALTER TABLE public.learning_sources ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.key_insights ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.learning_sessions ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.skill_progress ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.source_tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Also add multi-user fields
ALTER TABLE public.learning_sources ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'personal';
ALTER TABLE public.learning_sources ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE public.key_insights ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';

-- 4. Migrate existing data (Give existing users a personal workspace)
-- This creates a personal workspace for every existing user who has data, 
-- and assigns their existing data to that workspace.
DO $$
DECLARE
  u_record RECORD;
  new_ws_id UUID;
BEGIN
  FOR u_record IN SELECT DISTINCT user_id FROM public.learning_sources UNION SELECT DISTINCT user_id FROM public.skill_progress
  LOOP
    -- Create workspace
    new_ws_id := gen_random_uuid();
    INSERT INTO public.workspaces (id, name, type) VALUES (new_ws_id, 'Personal Lab', 'personal');
    
    -- Add membership
    INSERT INTO public.workspace_members (workspace_id, user_id, role, status) 
    VALUES (new_ws_id, u_record.user_id, 'owner', 'active')
    ON CONFLICT DO NOTHING;
    
    -- Update existing data
    UPDATE public.learning_sources SET workspace_id = new_ws_id, created_by = u_record.user_id, visibility = 'personal' WHERE user_id = u_record.user_id AND workspace_id IS NULL;
    UPDATE public.key_insights SET workspace_id = new_ws_id, visibility = 'private' WHERE user_id = u_record.user_id AND workspace_id IS NULL;
    UPDATE public.learning_sessions SET workspace_id = new_ws_id WHERE user_id = u_record.user_id AND workspace_id IS NULL;
    UPDATE public.skill_progress SET workspace_id = new_ws_id WHERE user_id = u_record.user_id AND workspace_id IS NULL;
    UPDATE public.source_tasks SET workspace_id = new_ws_id WHERE user_id = u_record.user_id AND workspace_id IS NULL;
  END LOOP;
END $$;

-- 5. Trigger for new user signup -> Create Personal Workspace
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_ws_id UUID;
BEGIN
  -- Create personal workspace
  new_ws_id := gen_random_uuid();
  INSERT INTO public.workspaces (id, name, type)
  VALUES (new_ws_id, 'Personal Lab', 'personal');

  -- Add user as owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (new_ws_id, NEW.id, 'owner', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_tasks ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
-- Workspaces: user can see workspace if they are a member
CREATE POLICY "Users can view workspaces they are members of" 
ON public.workspaces FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid()));

-- Workspace Members: user can see members of their workspaces
CREATE POLICY "Users can view members of their workspaces" 
ON public.workspace_members FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid()));

-- Entities: user can read/write if they are a member of the workspace_id
-- Learning Sources
CREATE POLICY "Users can select workspace sources" ON public.learning_sources FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace sources" ON public.learning_sources FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace sources" ON public.learning_sources FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace sources" ON public.learning_sources FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sources.workspace_id AND user_id = auth.uid()));

-- Key Insights
CREATE POLICY "Users can select workspace insights" ON public.key_insights FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace insights" ON public.key_insights FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace insights" ON public.key_insights FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace insights" ON public.key_insights FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = key_insights.workspace_id AND user_id = auth.uid()));

-- Learning Sessions
CREATE POLICY "Users can select workspace sessions" ON public.learning_sessions FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace sessions" ON public.learning_sessions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace sessions" ON public.learning_sessions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace sessions" ON public.learning_sessions FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = learning_sessions.workspace_id AND user_id = auth.uid()));

-- Skill Progress
CREATE POLICY "Users can select workspace skill progress" ON public.skill_progress FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace skill progress" ON public.skill_progress FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace skill progress" ON public.skill_progress FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace skill progress" ON public.skill_progress FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = skill_progress.workspace_id AND user_id = auth.uid()));

-- Source Tasks
CREATE POLICY "Users can select workspace source tasks" ON public.source_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert workspace source tasks" ON public.source_tasks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can update workspace source tasks" ON public.source_tasks FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete workspace source tasks" ON public.source_tasks FOR DELETE USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = source_tasks.workspace_id AND user_id = auth.uid()));
