import { createClient } from "@/lib/supabase/client";
import type {
  LearningSource,
  LearningSession,
  KeyInsight,
  SkillProgress,
  SourceTask,
} from "./types";

// ─── LearningSource ─────────────────────────────────────────────────────────

function mapSourceRow(row: Record<string, any>): LearningSource {
  return {
    id: row.id,
    title: row.title,
    creatorName: row.creator_name || "",
    url: row.url || undefined,
    topicTags: row.topic_tags || [],
    skillTargets: row.skill_targets || [],
    status: row.status,
    difficultyLevel: row.difficulty_level,
    progress: row.progress || {},
    dailyPageTarget: row.daily_page_target || undefined,
    targetCompletionDate: row.target_completion_date || undefined,
    workspaceId: row.workspace_id,
    createdBy: row.created_by,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSourceRow(s: LearningSource) {
  return {
    id: s.id,
    title: s.title,
    creator_name: s.creatorName,
    url: s.url || null,
    topic_tags: s.topicTags,
    skill_targets: s.skillTargets,
    status: s.status,
    difficulty_level: s.difficultyLevel,
    progress: s.progress,
    daily_page_target: s.dailyPageTarget || null,
    target_completion_date: s.targetCompletionDate || null,
    workspace_id: s.workspaceId,
    created_by: s.createdBy,
    visibility: s.visibility,
    updated_at: new Date().toISOString(),
  };
}

export async function getWsSources(
  workspaceId: string,
  userId?: string,
  filter: "all" | "mine" | "shared" = "all"
): Promise<LearningSource[]> {
  const supabase = createClient();
  let query = supabase.from("learning_sources").select("*").eq("workspace_id", workspaceId);
  
  if (filter === "mine" && userId) {
    query = query.eq("created_by", userId);
  } else if (filter === "shared") {
    query = query.in("visibility", ["workspace", "public"]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching sources:", error);
    return [];
  }
  return (data || []).map(mapSourceRow);
}

export async function getWsSourceById(workspaceId: string, id: string): Promise<LearningSource | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase.from("learning_sources").select("*").eq("workspace_id", workspaceId).eq("id", id).maybeSingle();
  if (error) {
    console.error("[Supabase Error] getWsSourceById:", error);
  }
  return data ? mapSourceRow(data) : undefined;
}

export async function saveWsSource(workspaceId: string, source: LearningSource): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("learning_sources").upsert({ ...toSourceRow(source), workspace_id: workspaceId, created_at: source.createdAt });
  if (error) {
    console.error("[Supabase Error] saveWsSource:", error);
    throw new Error(error.message);
  }
}

export async function updateWsSource(workspaceId: string, updated: LearningSource): Promise<void> {
  const supabase = createClient();
  await supabase.from("learning_sources").update(toSourceRow(updated)).eq("workspace_id", workspaceId).eq("id", updated.id);
}

export async function deleteWsSource(workspaceId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("learning_sources").delete().eq("workspace_id", workspaceId).eq("id", id);
}

// ─── KeyInsight ─────────────────────────────────────────────────────────────

function mapInsightRow(row: Record<string, any>): KeyInsight {
  return {
    id: row.id,
    sourceId: row.source_id || undefined,
    type: row.type || "insight",
    skillTarget: row.skill_target || undefined,
    quote: row.quote,
    reflection: row.reflection || undefined,
    pageOrTimestamp: row.page_or_timestamp || undefined,
    tags: row.tags || [],
    lastReviewedAt: row.last_reviewed_at || undefined,
    reviewIntervalDays: row.review_interval_days || 1,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    visibility: row.visibility,
    createdAt: row.created_at,
  };
}

function toInsightRow(i: KeyInsight) {
  const row: Record<string, any> = {
    id: i.id,
    source_id: i.sourceId || null,
    type: i.type,
    skill_target: i.skillTarget || null,
    quote: i.quote,
    reflection: i.reflection || null,
    page_or_timestamp: i.pageOrTimestamp || null,
    tags: i.tags,
    workspace_id: i.workspaceId,
    user_id: i.userId,
    visibility: i.visibility,
  };
  if (i.lastReviewedAt !== undefined) {
    row.last_reviewed_at = i.lastReviewedAt;
  }
  if (i.reviewIntervalDays !== undefined) {
    row.review_interval_days = i.reviewIntervalDays;
  }
  return row;
}

export async function getWsInsights(workspaceId: string, userId: string, columns: string = "*"): Promise<KeyInsight[]> {
  const supabase = createClient();
  const { data } = await supabase.from("key_insights").select(columns).eq("workspace_id", workspaceId).eq("user_id", userId);
  return (data || []).map(mapInsightRow);
}

export async function getWsInsightsBySource(workspaceId: string, userId: string, sourceId: string): Promise<KeyInsight[]> {
  const supabase = createClient();
  const { data } = await supabase.from("key_insights").select("*").eq("workspace_id", workspaceId).eq("user_id", userId).eq("source_id", sourceId);
  return (data || []).map(mapInsightRow);
}

export async function saveWsInsight(workspaceId: string, userId: string, insight: KeyInsight): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("key_insights").upsert({ ...toInsightRow(insight), workspace_id: workspaceId, user_id: userId, created_at: insight.createdAt });
  if (error) {
    console.error("[Supabase Error] saveWsInsight:", error);
    throw new Error(error.message);
  }
}

export async function deleteWsInsight(workspaceId: string, userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("key_insights").delete().eq("workspace_id", workspaceId).eq("user_id", userId).eq("id", id);
}

// ─── LearningSession ────────────────────────────────────────────────────────

function mapSessionRow(row: Record<string, any>): LearningSession {
  return {
    id: row.id,
    sourceId: row.source_id,
    date: row.date || new Date().toISOString().slice(0, 10),
    durationMinutes: Number(row.duration_minutes || 0),
    unitsConsumed: Number(row.units_consumed || 0),
    startProgress: row.start_progress || undefined,
    endProgress: row.end_progress || undefined,
    notes: row.notes || undefined,
    mood: row.mood || undefined,
    focusRating: row.focus_rating || undefined,
    productivityRating: row.productivity_rating || undefined,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function toSessionRow(s: LearningSession) {
  return {
    id: s.id,
    source_id: s.sourceId,
    date: s.date,
    duration_minutes: s.durationMinutes,
    units_consumed: s.unitsConsumed,
    start_progress: s.startProgress || null,
    end_progress: s.endProgress || null,
    notes: s.notes || null,
    mood: s.mood || null,
    focus_rating: s.focusRating || null,
    productivity_rating: s.productivityRating || null,
    workspace_id: s.workspaceId,
    user_id: s.userId,
  };
}

export async function getWsSessions(workspaceId: string, userId: string, columns: string = "*"): Promise<LearningSession[]> {
  const supabase = createClient();
  const { data } = await supabase.from("learning_sessions").select(columns).eq("workspace_id", workspaceId).eq("user_id", userId);
  return (data || []).map(mapSessionRow);
}

export async function getWsSessionsBySource(workspaceId: string, userId: string, sourceId: string): Promise<LearningSession[]> {
  const supabase = createClient();
  const { data } = await supabase.from("learning_sessions").select("*").eq("workspace_id", workspaceId).eq("user_id", userId).eq("source_id", sourceId);
  return (data || []).map(mapSessionRow).sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveWsSession(workspaceId: string, userId: string, session: LearningSession): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("learning_sessions").upsert({ ...toSessionRow(session), workspace_id: workspaceId, user_id: userId, created_at: session.createdAt });
  if (error) {
    console.error("[Supabase Error] saveWsSession:", error);
    throw new Error(error.message);
  }
}

export async function deleteWsSession(workspaceId: string, userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("learning_sessions").delete().eq("workspace_id", workspaceId).eq("user_id", userId).eq("id", id);
}

// ─── SkillProgress ──────────────────────────────────────────────────────────

function mapSkillProgressRow(row: Record<string, any>): SkillProgress {
  return {
    id: row.id,
    sourceId: row.source_id,
    skillName: row.skill_name,
    category: row.category,
    level: row.level || "awareness",
    evidence: row.evidence || undefined,
    levelAchievedAt: row.level_achieved_at || undefined,
    actionItems: row.action_items || [],
    workspaceId: row.workspace_id,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

function toSkillProgressRow(sp: SkillProgress) {
  return {
    id: sp.id,
    source_id: sp.sourceId,
    skill_name: sp.skillName,
    category: sp.category,
    level: sp.level,
    evidence: sp.evidence || null,
    level_achieved_at: sp.levelAchievedAt || null,
    action_items: sp.actionItems,
    workspace_id: sp.workspaceId,
    user_id: sp.userId,
  };
}

export async function getWsSkillProgress(workspaceId: string, userId: string, columns: string = "*"): Promise<SkillProgress[]> {
  const supabase = createClient();
  const { data } = await supabase.from("skill_progress").select(columns).eq("workspace_id", workspaceId).eq("user_id", userId);
  return (data || []).map(mapSkillProgressRow);
}

export async function getWsSkillProgressBySource(workspaceId: string, userId: string, sourceId: string): Promise<SkillProgress[]> {
  const supabase = createClient();
  const { data } = await supabase.from("skill_progress").select("*").eq("workspace_id", workspaceId).eq("user_id", userId).eq("source_id", sourceId);
  return (data || []).map(mapSkillProgressRow);
}

export async function saveWsSkillProgress(workspaceId: string, userId: string, sp: SkillProgress): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("skill_progress").upsert({ ...toSkillProgressRow(sp), workspace_id: workspaceId, user_id: userId, created_at: sp.createdAt });
  if (error) {
    console.error("[Supabase Error] saveWsSkillProgress:", error);
    throw new Error(error.message);
  }
}

export async function updateWsSkillProgress(workspaceId: string, userId: string, updated: SkillProgress): Promise<void> {
  const supabase = createClient();
  await supabase.from("skill_progress").update(toSkillProgressRow(updated)).eq("workspace_id", workspaceId).eq("user_id", userId).eq("id", updated.id);
}

export async function deleteWsSkillProgress(workspaceId: string, userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("skill_progress").delete().eq("workspace_id", workspaceId).eq("user_id", userId).eq("id", id);
}

// ─── SourceTask ─────────────────────────────────────────────────────────────

function mapTaskRow(row: Record<string, any>): SourceTask {
  return {
    id: row.id,
    sourceId: row.source_id || undefined,
    description: row.description,
    context: row.context || undefined,
    sourceReference: row.source_reference || undefined,
    deadline: row.deadline || undefined,
    priority: row.priority,
    status: row.status,
    completedAt: row.completed_at || undefined,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

function toTaskRow(t: SourceTask) {
  return {
    id: t.id,
    source_id: t.sourceId || null,
    description: t.description,
    context: t.context || null,
    source_reference: t.sourceReference || null,
    deadline: t.deadline || null,
    priority: t.priority,
    status: t.status,
    completed_at: t.completedAt || null,
    workspace_id: t.workspaceId,
    user_id: t.userId,
  };
}

export async function getWsTasks(workspaceId: string, userId: string): Promise<SourceTask[]> {
  const supabase = createClient();
  const { data } = await supabase.from("source_tasks").select("*").eq("workspace_id", workspaceId).eq("user_id", userId);
  return (data || []).map(mapTaskRow);
}

export async function getWsTasksBySource(workspaceId: string, userId: string, sourceId: string): Promise<SourceTask[]> {
  const supabase = createClient();
  const { data } = await supabase.from("source_tasks").select("*").eq("workspace_id", workspaceId).eq("user_id", userId).eq("source_id", sourceId);
  return (data || []).map(mapTaskRow);
}

export async function saveWsTask(workspaceId: string, userId: string, task: SourceTask): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("source_tasks").upsert({ ...toTaskRow(task), workspace_id: workspaceId, user_id: userId, created_at: task.createdAt });
  if (error) {
    console.error("[Supabase Error] saveWsTask:", error);
    throw new Error(error.message);
  }
}

export async function updateWsTask(workspaceId: string, userId: string, updated: SourceTask): Promise<void> {
  const supabase = createClient();
  await supabase.from("source_tasks").update(toTaskRow(updated)).eq("workspace_id", workspaceId).eq("user_id", userId).eq("id", updated.id);
}

export async function deleteWsTask(workspaceId: string, userId: string, id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("source_tasks").delete().eq("workspace_id", workspaceId).eq("user_id", userId).eq("id", id);
}

// ─── Migration Helper (Deprecated for Cloud) ────────────────────────────────

export function isDataMigrated(): boolean {
  return true; // We assume migrated for the cloud DB.
}

export function migrateLegacyDataToWorkspace() {
  // Not implemented on client anymore, done via SQL.
}
