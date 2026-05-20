"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

const NAV = [
  { label: "Dashboard",         href: "/dashboard",          icon: "🏠", exact: true, color: "from-neon-cyan" },
  { label: "Sumber Belajar",    href: "/dashboard/sources",  icon: "📚", color: "from-neon-purple" },
  { label: "Skill Tracker",     href: "/dashboard/skills",   icon: "🎯", color: "from-neon-pink" },
  { label: "Action Items",      href: "/dashboard/actions",  icon: "✅", color: "from-neon-lime" },
  { label: "Insights",          href: "/dashboard/insights", icon: "💡", color: "from-neon-gold" },
  { label: "Statistik",         href: "/dashboard/stats",    icon: "📊", color: "from-neon-orange" },
  { label: "Profil Akun",       href: "/dashboard/account",  icon: "👤", color: "from-neon-purple" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const WORKSPACE_TYPE_ICON: Record<string, string> = {
  personal: "🧑",
  team: "🏢",
  organization: "🏛️",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  mentor: "Mentor",
  member: "Member",
  learner: "Learner",
};

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { currentUser, currentWorkspace, membership } = useWorkspace();

  // Prefer workspace context for display; fall back to auth profile
  const displayName = currentUser?.name || profile?.name || "...";
  const displayEmail = currentUser?.email || profile?.email || "";
  const displayAvatar = currentUser?.profile?.avatar || profile?.avatar || "🧑";

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border
          flex flex-col transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static lg:z-auto lg:flex
          ${open ? "translate-x-0 shadow-card-depth" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-3 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="flex items-center gap-1.5 text-lg font-display font-black tracking-tight">
              <span className="text-text-primary">Skill</span>
              <span className="bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent">
                Flow
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-text-secondary hover:text-text-primary transition-colors text-lg leading-none hover:bg-light-border dark:hover:bg-dark-border px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>

          {/* Workspace Badge */}
          {currentWorkspace && membership && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-light-border/40 dark:bg-dark-border/40">
              <span className="text-base flex-shrink-0">
                {WORKSPACE_TYPE_ICON[currentWorkspace.type] ?? "🏢"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {currentWorkspace.name}
                </p>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neon-purple/15 text-neon-purple border border-neon-purple/30 flex-shrink-0">
                {ROLE_LABELS[membership.role] ?? membership.role}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? `bg-gradient-to-r ${item.color}/20 text-neon-pink shadow-sm border border-neon-pink/30 font-bold`
                    : "text-text-secondary hover:bg-light-border/30 dark:hover:bg-dark-border/30 hover:text-text-primary"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full" />
                )}
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info + sign out */}
        <div className="px-4 py-4 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{displayAvatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{displayName}</p>
              <p className="text-xs text-text-secondary truncate">{displayEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="w-full text-left text-xs font-semibold text-text-secondary hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Keluar →
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 border-t border-light-border dark:border-dark-border/50">
          <p className="text-xs text-text-secondary font-display font-bold">SkillFlow Learning OS</p>
          <p className="text-xs text-text-secondary/60 mt-1">v0.5.0 — Phase 1 Multi-User</p>
        </div>
      </aside>
    </>
  );
}
