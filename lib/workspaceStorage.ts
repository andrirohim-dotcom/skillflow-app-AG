/**
 * WORKSPACE STORAGE LAYER
 *
 * CRUD helpers for User, Workspace, and Membership entities.
 * Uses storage key patterns from lib/constants.multiuser.ts.
 *
 * Phase 1: localStorage only (no auth, no cloud).
 * Phase 4: Migrate to Supabase.
 */

import { createClient } from "@/lib/supabase/client";
import type { User, Workspace, Membership } from "./types.multiuser";

// ─── CURRENT USER / WORKSPACE SESSION ─────────────────────────────────────

const SESSION_KEYS = {
  currentWorkspaceId: "skillflow:session:current_workspace_id",
} as const;

export function getCurrentWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEYS.currentWorkspaceId);
}

export function setCurrentWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEYS.currentWorkspaceId, workspaceId);
}

// ─── USER ──────────────────────────────────────────────────────────────────

export async function getUser(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (!data) return null;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    profile: { avatar: data.avatar_url },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getUserWorkspaceIds(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId);
  return (data || []).map((m) => m.workspace_id);
}

// ─── WORKSPACE ─────────────────────────────────────────────────────────────

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();
  
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    type: data.type as Workspace["type"],
    ownerId: data.owner_id || "", // Fetch this properly in SQL if needed, or assume empty
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ─── MEMBERSHIP ────────────────────────────────────────────────────────────

export async function getUserMembership(workspaceId: string, userId: string): Promise<Membership | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();
  
  if (!data) return null;
  return {
    id: `${workspaceId}_${userId}`,
    workspaceId: data.workspace_id,
    userId: data.user_id,
    role: data.role as Membership["role"],
    status: data.status as Membership["status"],
    joinedAt: data.joined_at,
  };
}
