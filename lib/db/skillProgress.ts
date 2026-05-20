import { createClient } from "@/lib/supabase/client";
import type { SkillProgress, ActionItem } from "@/lib/types";

function mapRow(row: Record<string, unknown>): SkillProgress {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    skillName: row.skill_name as string,
    category: (row.category as string) ?? "",
    level: (row.level as SkillProgress["level"]) ?? "awareness",
    evidence: row.evidence as string | undefined,
    levelAchievedAt: row.level_achieved_at as string | undefined,
    actionItems: (row.action_items as ActionItem[]) ?? [],
    createdAt: row.created_at as string,
  };
}

export async function getSkillProgress(userId: string): Promise<SkillProgress[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("skill_progress")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getSkillProgressBySource(userId: string, sourceId: string): Promise<SkillProgress[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("skill_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId);
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function saveSkillProgress(userId: string, sp: SkillProgress): Promise<void> {
  const supabase = createClient();
  await supabase.from("skill_progress").insert({
    id: sp.id,
    user_id: userId,
    source_id: sp.sourceId || null,
    skill_name: sp.skillName,
    category: sp.category,
    level: sp.level ?? "awareness",
    evidence: sp.evidence ?? null,
    level_achieved_at: sp.levelAchievedAt ?? null,
    action_items: sp.actionItems,
  });
}

export async function updateSkillProgress(userId: string, updated: SkillProgress): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("skill_progress")
    .update({
      skill_name: updated.skillName,
      category: updated.category,
      level: updated.level ?? "awareness",
      evidence: updated.evidence ?? null,
      level_achieved_at: updated.levelAchievedAt ?? null,
      action_items: updated.actionItems,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updated.id)
    .eq("user_id", userId);
}

export async function deleteSkillProgress(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("skill_progress")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
