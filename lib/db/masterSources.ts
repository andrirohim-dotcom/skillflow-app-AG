// CLIENT-SAFE: File ini aman diimport di "use client" components.
// Hanya menggunakan browser Supabase client (RLS berlaku — hanya published rows).
// Fungsi admin ada di masterSources.admin.ts (server-only).

import { createClient } from "@/lib/supabase/client";
import type { MasterSource, SourceType, DifficultyLevel } from "@/lib/types";

// ─── Row mapper ───────────────────────────────────────────────────────────────

export function mapMasterSourceRow(row: Record<string, unknown>): MasterSource {
  return {
    id: row.id as string,
    title: row.title as string,
    creatorName: (row.creator_name as string) ?? "",
    url: (row.url as string) ?? undefined,
    sourceType: row.source_type as SourceType,
    topicTags: (row.topic_tags as string[]) ?? [],
    skillTargets: (row.skill_targets as string[]) ?? [],
    difficultyLevel: row.difficulty_level as DifficultyLevel,
    description: (row.description as string) ?? undefined,
    language: (row.language as "id" | "en") ?? "en",
    isPublished: (row.is_published as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── User-facing query (browser client — RLS: only published rows) ─────────────

export interface GetMasterSourcesOptions {
  sourceType?: SourceType;
  skillTarget?: string;
  search?: string;
  language?: "id" | "en" | "all";
  limit?: number;
}

export async function getMasterSources(
  opts: GetMasterSourcesOptions = {}
): Promise<MasterSource[]> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("master_sources")
    .select("*")
    .eq("is_published", true)
    .order("title", { ascending: true });

  if (opts.sourceType) query = query.eq("source_type", opts.sourceType);
  if (opts.skillTarget) query = query.contains("skill_targets", [opts.skillTarget]);
  if (opts.language && opts.language !== "all") query = query.eq("language", opts.language);
  if (opts.search?.trim()) {
    const q = opts.search.trim();
    query = query.or(`title.ilike.%${q}%,creator_name.ilike.%${q}%`);
  }
  if (opts.limit) query = query.limit(opts.limit);

  const { data } = await query;
  return (data ?? []).map((r: Record<string, unknown>) => mapMasterSourceRow(r));
}
