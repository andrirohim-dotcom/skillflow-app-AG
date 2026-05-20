const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log("=== WORKSPACES ===");
  const { data: workspaces, error: errWs } = await supabase.from('workspaces').select('*');
  console.log("Workspaces:", workspaces || errWs);

  console.log("\n=== WORKSPACE MEMBERS ===");
  const { data: members, error: errMem } = await supabase.from('workspace_members').select('*');
  console.log("Workspace Members:", members || errMem);

  console.log("\n=== USERS ===");
  const { data: users, error: errUsers } = await supabase.auth.admin.listUsers();
  console.log("Users:", users?.users?.map(u => ({ id: u.id, email: u.email })) || errUsers);

  console.log("\n=== LEARNING SOURCES ===");
  const { data: sources, error: errSrc } = await supabase.from('learning_sources').select('id, title, workspace_id, user_id');
  console.log("Learning Sources:", sources || errSrc);

  console.log("\n=== KEY INSIGHTS ===");
  const { data: insights, error: errIns } = await supabase.from('key_insights').select('id, quote, workspace_id, user_id, source_id, created_at');
  console.log("Key Insights:", insights || errIns);

  console.log("\n=== SOURCE TASKS ===");
  const { data: tasks, error: errTasks } = await supabase.from('source_tasks').select('id, description, workspace_id, user_id, source_id');
  console.log("Source Tasks:", tasks || errTasks);
}

check();
