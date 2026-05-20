"use client";

/**
 * WORKSPACE CONTEXT
 *
 * Provides currentUser, currentWorkspace, and membership to the whole app.
 * Phase 1: localStorage + mock seed data (no real auth).
 * Phase 4: Replace getCurrentUser/Workspace with Supabase session.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User, Workspace, Membership, Permission } from "@/lib/types.multiuser";
import { hasPermission as checkRolePermission } from "@/lib/permissions";
import {
  getUser,
  getWorkspace,
  getUserMembership,
  getUserWorkspaceIds,
  setCurrentWorkspaceId,
  getCurrentWorkspaceId,
} from "@/lib/workspaceStorage";
import { createClient } from "@/lib/supabase/client";
// ─── Context Shape ────────────────────────────────────────────────────────────

interface WorkspaceContextValue {
  currentUser: User | null;
  currentWorkspace: Workspace | null;
  membership: Membership | null;
  userWorkspaces: Workspace[];
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  hasPermission: (permission: Permission) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessionData = useCallback(async (userId: string) => {
    try {
      let wsIds = await getUserWorkspaceIds(userId);

      // ─── Fallback: Auto-create workspace if none exists ────────────────
      if (wsIds.length === 0) {
        console.warn("No workspaces found for user. Auto-creating Personal Lab...");
        const newWsId = crypto.randomUUID();
        const supabase = createClient();
        
        // Create workspace
        await supabase.from("workspaces").insert({
          id: newWsId,
          name: "Personal Lab",
          type: "personal",
        });

        // Add user as owner
        await supabase.from("workspace_members").insert({
          workspace_id: newWsId,
          user_id: userId,
          role: "owner",
          status: "active",
        });

        wsIds = [newWsId];
      }
      // ─────────────────────────────────────────────────────────────────

      const workspacesPromises = wsIds.map((id) => getWorkspace(id));
      const workspacesResults = await Promise.all(workspacesPromises);
      const workspaces = workspacesResults.filter((ws): ws is Workspace => ws !== null);
      
      setUserWorkspaces(workspaces);

      let activeWsId = getCurrentWorkspaceId();
      let ws = activeWsId ? await getWorkspace(activeWsId) : null;

      // If activeWsId from localStorage is invalid or missing, fallback to the first workspace
      if (!ws && workspaces.length > 0) {
        activeWsId = workspaces[0].id;
        ws = workspaces[0];
        setCurrentWorkspaceId(activeWsId);
      }

      if (activeWsId && ws) {
        setCurrentWorkspace(ws);
        const mbr = await getUserMembership(activeWsId, userId);
        setMembership(mbr);
      } else {
        setCurrentWorkspace(null);
        setMembership(null);
      }
    } catch (error) {
      console.error("Failed to load session data:", error);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          profile: { avatar: "🧑" },
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at || session.user.created_at
        });
        loadSessionData(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          profile: { avatar: "🧑" },
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at || session.user.created_at
        });
        loadSessionData(session.user.id);
      } else {
        setCurrentUser(null);
        setCurrentWorkspace(null);
        setMembership(null);
        setUserWorkspaces([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSessionData]);

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!currentUser) return;
      const ws = await getWorkspace(workspaceId);
      if (!ws) return;

      const mbr = await getUserMembership(workspaceId, currentUser.id);
      if (!mbr) return;

      setCurrentWorkspace(ws);
      setMembership(mbr);
      setCurrentWorkspaceId(workspaceId);
    },
    [currentUser]
  );

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!membership) return false;
      return checkRolePermission(membership.role, permission);
    },
    [membership]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        currentUser,
        currentWorkspace,
        membership,
        userWorkspaces,
        isLoading,
        switchWorkspace,
        hasPermission,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}

export function useCurrentUser(): User | null {
  return useWorkspace().currentUser;
}

export function useCurrentWorkspace(): Workspace | null {
  return useWorkspace().currentWorkspace;
}
