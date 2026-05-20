"use server";

import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Forbidden");
  return user.id;
}

export async function suspendUser(userId: string) {
  await requireAdmin();
  await adminClient
    .from("profiles")
    .update({ suspended_at: new Date().toISOString() })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function unsuspendUser(userId: string) {
  await requireAdmin();
  await adminClient
    .from("profiles")
    .update({ suspended_at: null })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function promoteToAdmin(userId: string) {
  await requireAdmin();
  await adminClient
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
}

export async function demoteFromAdmin(userId: string) {
  await requireAdmin();
  await adminClient
    .from("profiles")
    .update({ is_admin: false })
    .eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteUser(userId: string) {
  const callerId = await requireAdmin();
  if (userId === callerId) throw new Error("Cannot delete your own account");
  await adminClient.auth.admin.deleteUser(userId);
  revalidatePath("/admin/users");
}
