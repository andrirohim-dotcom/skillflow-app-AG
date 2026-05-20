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

// Use anon client first, to see if RLS or standard constraint blocks it
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const workspaceId = '4018cf86-7f69-410f-8215-c41895bf1037';
  const userId = '266a051a-3846-4abe-b239-470850ddb4ac';
  
  const payload = {
    id: '12345678-1234-1234-1234-123456789abc',
    source_id: 'c1ea0495-b344-45f6-9f75-612e76acff98',
    type: 'insight',
    skill_target: 'Productive Habits',
    quote: 'Test quote from script',
    reflection: null,
    page_or_timestamp: 'Bab 1',
    tags: ['produktivitas'],
    workspace_id: workspaceId,
    user_id: userId,
    visibility: null,
    created_at: new Date().toISOString()
  };

  console.log("Inserting with ANON client...");
  const { data, error } = await supabase.from('key_insights').insert(payload);
  console.log("ANON Result - Data:", data, "Error:", error);
}

testInsert();
