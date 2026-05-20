"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createMasterSource,
  updateMasterSource,
  togglePublishMasterSource,
  deleteMasterSource,
} from "@/lib/db/masterSources.admin";
import { revalidatePath } from "next/cache";
import type { MasterSource } from "@/lib/types";

type MasterSourceInput = Omit<MasterSource, "id" | "createdAt" | "updatedAt">;

async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Forbidden");
}

export async function createMasterSourceAction(input: MasterSourceInput) {
  await requireAdmin();
  await createMasterSource(input);
  revalidatePath("/admin/sources");
}

export async function updateMasterSourceAction(id: string, input: MasterSourceInput) {
  await requireAdmin();
  await updateMasterSource(id, input);
  revalidatePath("/admin/sources");
}

export async function togglePublishAction(id: string, isPublished: boolean) {
  await requireAdmin();
  await togglePublishMasterSource(id, isPublished);
  revalidatePath("/admin/sources");
}

export async function deleteMasterSourceAction(id: string) {
  await requireAdmin();
  await deleteMasterSource(id);
  revalidatePath("/admin/sources");
}
