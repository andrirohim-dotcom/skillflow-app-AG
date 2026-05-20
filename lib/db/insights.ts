import { createClient } from "@/lib/supabase/client";
import type { KeyInsight } from "@/lib/types";

function mapRow(row: Record<string, unknown>): KeyInsight {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    type: row.type as KeyInsight["type"],
    skillTarget: row.skill_target as string | undefined,
    quote: row.quote as string,
    reflection: row.reflection as string | undefined,
    pageOrTimestamp: row.page_or_timestamp as string | undefined,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

export async function getInsights(userId: string): Promise<KeyInsight[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("key_insights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getInsightsBySource(userId: string, sourceId: string): Promise<KeyInsight[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("key_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function saveInsight(userId: string, insight: KeyInsight): Promise<void> {
  const supabase = createClient();
  await supabase.from("key_insights").insert({
    id: insight.id,
    user_id: userId,
    source_id: insight.sourceId || null,
    type: insight.type ?? null,
    skill_target: insight.skillTarget ?? null,
    quote: insight.quote,
    reflection: insight.reflection ?? null,
    page_or_timestamp: insight.pageOrTimestamp ?? null,
    tags: insight.tags,
  });
}

export async function deleteInsight(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("key_insights")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
