-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;

-- Create the fixed policy
CREATE POLICY "Users can view their own membership" 
ON public.workspace_members FOR SELECT 
USING (user_id = auth.uid());
