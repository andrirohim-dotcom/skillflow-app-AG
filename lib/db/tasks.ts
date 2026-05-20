import { createClient } from "@/lib/supabase/client";
import type { SourceTask } from "@/lib/types";

function mapRow(row: Record<string, unknown>): SourceTask {
  return {
    id: row.id as string,
    sourceId: (row.source_id as string) ?? "",
    description: row.description as string,
    context: row.context as string | undefined,
    sourceReference: row.source_reference as string | undefined,
    deadline: row.deadline as string | undefined,
    priority: row.priority as SourceTask["priority"],
    status: row.status as SourceTask["status"],
    completedAt: row.completed_at as string | undefined,
    createdAt: row.created_at as string,
  };
}

export async function getTasks(userId: string): Promise<SourceTask[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("source_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getTasksBySource(userId: string, sourceId: string): Promise<SourceTask[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("source_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("source_id", sourceId);
  const tasks = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  const priority = ["urgent", "high", "medium", "low"];
  return tasks.sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return priority.indexOf(a.priority) - priority.indexOf(b.priority);
  });
}

export async function saveTask(userId: string, task: SourceTask): Promise<void> {
  const supabase = createClient();
  await supabase.from("source_tasks").insert({
    id: task.id,
    user_id: userId,
    source_id: task.sourceId || null,
    description: task.description,
    context: task.context ?? null,
    source_reference: task.sourceReference ?? null,
    deadline: task.deadline ?? null,
    priority: task.priority,
    status: task.status,
    completed_at: task.completedAt ?? null,
  });
}

export async function updateTask(userId: string, updated: SourceTask): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("source_tasks")
    .update({
      description: updated.description,
      context: updated.context ?? null,
      source_reference: updated.sourceReference ?? null,
      deadline: updated.deadline ?? null,
      priority: updated.priority,
      status: updated.status,
      completed_at: updated.completedAt ?? null,
    })
    .eq("id", updated.id)
    .eq("user_id", userId);
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("source_tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
