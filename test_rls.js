const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Logging in...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com', // Assuming this is the test email they created
    password: '123456'
  });

  if (authErr) {
    console.error("Login failed (maybe different email/pass?):", authErr.message);
    // Let's try to grab ANY user session from the DB via service role and impersonate them?
    // We can't easily impersonate without a valid JWT. But we can just create a test user.
  }

  // Let's just create a test user right now to test RLS!
  const testEmail = 'rls_test_' + Date.now() + '@test.com';
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123'
  });

  if (signUpErr) {
    console.error("Signup failed:", signUpErr);
    return;
  }
  
  console.log("Logged in as:", signUpData.user.id);

  console.log("Testing workspace_members SELECT...");
  const { data: members, error: memErr } = await supabase.from('workspace_members').select('*');
  console.log("Members:", members, memErr);

  console.log("Testing workspaces SELECT...");
  const { data: workspaces, error: wsErr } = await supabase.from('workspaces').select('*');
  console.log("Workspaces:", workspaces, wsErr);

  console.log("Testing getUserWorkspaceIds manually...");
  const { data: memIds, error: memIdsErr } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", signUpData.user.id);
  console.log("Mem IDs:", memIds, memIdsErr);
  
  if (memIds && memIds.length > 0) {
    console.log("Testing getWorkspace manually...");
    const { data: wsData, error: wsDataErr } = await supabase.from("workspaces").select("*").eq("id", memIds[0].workspace_id).single();
    console.log("Workspace Data:", wsData, wsDataErr);
  }
}

test();
