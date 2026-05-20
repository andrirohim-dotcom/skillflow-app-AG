-- Fix legacy NOT NULL constraints that block the new multi-tenant schema
-- Run this in your Supabase SQL Editor

ALTER TABLE public.learning_sources ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.key_insights ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.learning_sessions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.skill_progress ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.source_tasks ALTER COLUMN user_id DROP NOT NULL;


-- 2. Create and configure Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Update Trigger to also create a Profile
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

  -- Create profile
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (NEW.id, split_part(NEW.email, '@', 1), '🧑');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Manual fix for existing users without profiles
INSERT INTO public.profiles (id, name, avatar_url)
SELECT id, split_part(email, '@', 1), '🧑'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
