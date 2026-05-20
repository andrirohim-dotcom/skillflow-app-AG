const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Testing learning_sources...");
  const { data, error } = await supabase.from('learning_sources').select('*').limit(1);
  if (error) {
    console.error("ERROR learning_sources:", error);
  } else {
    console.log("SUCCESS learning_sources:", data);
  }

  console.log("Testing skill_progress...");
  const { data: d2, error: e2 } = await supabase.from('skill_progress').select('*').limit(1);
  if (e2) {
    console.error("ERROR skill_progress:", e2);
  } else {
    console.log("SUCCESS skill_progress:", d2);
  }
}

test();
