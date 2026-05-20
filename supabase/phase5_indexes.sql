-- ==============================================================================
-- PHASE 5: PERFORMANCE OPTIMIZATION INDEXES
-- ==============================================================================

-- 1. Index for learning_sources
-- Frequently filtered by workspace_id and created_by
CREATE INDEX IF NOT EXISTS idx_ls_workspace ON public.learning_sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ls_created_by ON public.learning_sources(created_by);

-- 2. Index for learning_sessions
-- Heavily used in dashboard KPI calculations and filtered by workspace & user
CREATE INDEX IF NOT EXISTS idx_sess_workspace_user ON public.learning_sessions(workspace_id, user_id);
-- Often filtered or sorted by date
CREATE INDEX IF NOT EXISTS idx_sess_date ON public.learning_sessions(date);

-- 3. Index for key_insights
-- Frequently queried alongside sessions for dashboard
CREATE INDEX IF NOT EXISTS idx_ki_workspace_user ON public.key_insights(workspace_id, user_id);

-- 4. Index for skill_progress
-- Frequently queried for dashboard action items and skill completion
CREATE INDEX IF NOT EXISTS idx_sp_workspace_user ON public.skill_progress(workspace_id, user_id);
