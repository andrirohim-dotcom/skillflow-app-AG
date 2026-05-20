import { createClient } from "@supabase/supabase-js";

// NEVER import this in "use client" components — service role key must stay server-side
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
