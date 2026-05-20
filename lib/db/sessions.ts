import { createClient } from "@/lib/supabase/client";
import type { LearningSession } from "@/lib/types";

function mapRow(row: Record<string, unknown>): LearningSession {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    date: row.date as string,
    durationMinutes: (row.duration_minutes as number) ?? 0,
    unitsConsumed: (row.units_consumed as number) ?? 0,
    startProgress: row.start_progress as number | undefined,
    endProgress: row.end_progress as number | undefined,
    notes: row.notes as string | undefined,
    mood: row.mood as LearningSession["mood"],
    focusRating: row.focus_rating as number | undefined,
    productivityRating: row.productivity_rating as number | undefined,
    createdAt: row.created_at as string,
  };
}

export async function getSessions(userId: string): Promise<LearningSession[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getSessionsBySource(userId: string, sourceId: string): Promise<LearningSession[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId)
    .order("date", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function saveSession(userId: string, session: LearningSession): Promise<void> {
  const supabase = createClient();
  await supabase.from("learning_sessions").insert({
    id: session.id,
    user_id: userId,
    source_id: session.sourceId || null,
    date: session.date,
    duration_minutes: session.durationMinutes,
    units_consumed: session.unitsConsumed,
    start_progress: session.startProgress ?? null,
    end_progress: session.endProgress ?? null,
    notes: session.notes ?? null,
    mood: session.mood ?? null,
    focus_rating: session.focusRating ?? null,
    productivity_rating: session.productivityRating ?? null,
  });
}

export async function deleteSession(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("learning_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
