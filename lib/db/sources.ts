import { createClient } from "@/lib/supabase/client";
import type { LearningSource, SourceStatus, DifficultyLevel, ProgressData } from "@/lib/types";

function mapRow(row: Record<string, unknown>): LearningSource {
  return {
    id: row.id as string,
    title: row.title as string,
    creatorName: (row.creator_name as string) ?? "",
    url: row.url as string | undefined,
    topicTags: (row.topic_tags as string[]) ?? [],
    skillTargets: (row.skill_targets as string[]) ?? [],
    progress: row.progress as ProgressData,
    status: row.status as SourceStatus,
    difficultyLevel: row.difficulty_level as DifficultyLevel,
    dailyPageTarget: row.daily_page_target as number | undefined,
    targetCompletionDate: row.target_completion_date as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(source: LearningSource, userId: string) {
  return {
    id: source.id,
    user_id: userId,
    title: source.title,
    creator_name: source.creatorName,
    url: source.url ?? null,
    topic_tags: source.topicTags,
    skill_targets: source.skillTargets,
    progress: source.progress,
    status: source.status,
    difficulty_level: source.difficultyLevel,
    daily_page_target: source.dailyPageTarget ?? null,
    target_completion_date: source.targetCompletionDate ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function getSources(userId: string): Promise<LearningSource[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sources")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getSourceById(userId: string, id: string): Promise<LearningSource | undefined> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();
  return data ? mapRow(data as Record<string, unknown>) : undefined;
}

export async function saveSource(userId: string, source: LearningSource): Promise<void> {
  const supabase = createClient();
  await supabase.from("learning_sources").insert(toRow(source, userId));
}

export async function updateSource(userId: string, updated: LearningSource): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("learning_sources")
    .update(toRow(updated, userId))
    .eq("id", updated.id)
    .eq("user_id", userId);
}

export async function deleteSource(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("learning_sources")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
