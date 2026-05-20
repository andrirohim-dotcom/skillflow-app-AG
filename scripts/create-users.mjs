import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables in env");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createUser({ email, password, name, isAdmin }) {
  console.log(`\nMembuat user: ${email}...`);

  // Create auth user (email already confirmed, no verification needed)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authError) {
    console.error(`  ❌ Gagal buat auth user: ${authError.message}`);
    return;
  }

  const userId = authData.user.id;
  console.log(`  ✓ Auth user dibuat (id: ${userId})`);

  // Wait a moment for trigger to create profile
  await new Promise((r) => setTimeout(r, 1000));

  // Set is_admin if needed
  if (isAdmin) {
    const { error: adminError } = await admin
      .from("profiles")
      .update({ is_admin: true, name })
      .eq("id", userId);

    if (adminError) {
      console.error(`  ❌ Gagal set is_admin: ${adminError.message}`);
    } else {
      console.log(`  ✓ is_admin = true`);
    }
  } else {
    // Just update the name
    await admin.from("profiles").update({ name }).eq("id", userId);
    console.log(`  ✓ Profile diupdate`);
  }

  console.log(`  ✅ ${isAdmin ? "Admin" : "User"} berhasil dibuat!`);
  console.log(`     Email   : ${email}`);
  console.log(`     Password: ${password}`);
}

async function main() {
  console.log("=== SkillFlow User Setup ===");

  await createUser({
    email: "andri.rohim@gmail.com",
    password: "Nindya355",
    name: "Andri Rohim",
    isAdmin: true,
  });

  await createUser({
    email: "test@skillflow.com",
    password: "Test1234",
    name: "User Testing",
    isAdmin: false,
  });

  console.log("\n=== Selesai! ===");
  console.log("Akses admin panel: http://localhost:3001/admin");
}

main().catch(console.error);
