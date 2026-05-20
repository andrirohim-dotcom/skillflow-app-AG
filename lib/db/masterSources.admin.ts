// SERVER-ONLY: Jangan import file ini di "use client" components!
// Gunakan adminClient (service role) — bypass RLS.
// Import file ini hanya dari server components, server actions, atau API routes.

import { adminClient } from "@/lib/supabase/admin";
import type { MasterSource } from "@/lib/types";
import { mapMasterSourceRow } from "./masterSources";

// ─── toRow helper (server-only) ───────────────────────────────────────────────

function toRow(input: Omit<MasterSource, "id" | "createdAt" | "updatedAt">) {
  return {
    title: input.title,
    creator_name: input.creatorName,
    url: input.url ?? null,
    source_type: input.sourceType,
    topic_tags: input.topicTags,
    skill_targets: input.skillTargets,
    difficulty_level: input.difficultyLevel,
    description: input.description ?? null,
    language: input.language,
    is_published: input.isPublished,
  };
}

// ─── Admin queries ────────────────────────────────────────────────────────────

export async function getAllMasterSourcesAdmin(): Promise<MasterSource[]> {
  const { data } = await adminClient
    .from("master_sources")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapMasterSourceRow(r as Record<string, unknown>));
}

export async function createMasterSource(
  input: Omit<MasterSource, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  await adminClient.from("master_sources").insert(toRow(input));
}

export async function updateMasterSource(
  id: string,
  input: Omit<MasterSource, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  await adminClient.from("master_sources").update(toRow(input)).eq("id", id);
}

export async function togglePublishMasterSource(
  id: string,
  isPublished: boolean
): Promise<void> {
  await adminClient
    .from("master_sources")
    .update({ is_published: isPublished })
    .eq("id", id);
}

export async function deleteMasterSource(id: string): Promise<void> {
  await adminClient.from("master_sources").delete().eq("id", id);
}
