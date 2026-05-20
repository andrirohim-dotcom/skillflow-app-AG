"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mapProfile, profileToRow, type Profile } from "@/lib/types/profile";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) setProfile(mapProfile(data as Record<string, unknown>));
    },
    [supabase]
  );

  useEffect(() => {
    // onAuthStateChange fires with INITIAL_SESSION immediately on mount
    // (reads from cookies — no network round-trip needed), so we drive
    // isLoading from here instead of from getUser() which can hang.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false); // always runs, even when there's no session
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase]);

  const signOut = useCallback(async () => {
    try {
      console.log("Initiating sign out...");
      
      // Clear localStorage explicitly just in case
      if (typeof window !== "undefined") {
        for (const key in window.localStorage) {
          if (key.startsWith("sb-")) {
            window.localStorage.removeItem(key);
          }
        }
      }
      
      // Navigate to the API route to clear server cookies and redirect
      window.location.href = "/auth/signout";
    } catch (err) {
      console.error("SignOut error:", err);
      window.location.href = "/";
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Profile>) => {
      if (!user) return;
      const row = profileToRow(data);
      const { data: updated } = await supabase
        .from("profiles")
        .update(row)
        .eq("id", user.id)
        .select()
        .single();
      if (updated) setProfile(mapProfile(updated as Record<string, unknown>));
    },
    [user, supabase]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.isAdmin ?? false,
        isLoading,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
