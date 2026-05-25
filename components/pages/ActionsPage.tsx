"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getWsSkillProgress,
  updateWsSkillProgress,
  getWsSources,
  getWsTasks,
  updateWsTask,
  saveWsTask,
  deleteWsTask,
} from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import type {
  SkillProgress,
  LearningSource,
  SourceTask,
  TaskPriority,
  SourceType,
} from "@/lib/types";
import QuickCaptureFAB from "@/components/dashboard/QuickCaptureFAB";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "completed";
type ViewMode = "skill" | "source" | "flat";

interface FlatActionItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  skillName?: string;
  skillCategory?: string;
  skillLevel?: string;
  sourceName: string;
  sourceId?: string;
  sourceType?: SourceType;
  priority?: TaskPriority;
  deadline?: string;
  type: "skill_ai" | "source_task";
  rawSp?: SkillProgress;
  rawTask?: SourceTask;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  text: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; border: string; glow: string }> = {
  urgent: { label: "Mendesak", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/25", glow: "shadow-[0_0_12px_rgba(244,63,94,0.15)]" },
  high:   { label: "Tinggi",   color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25", glow: "shadow-[0_0_12px_rgba(249,115,22,0.15)]" },
  medium: { label: "Sedang",  color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", glow: "shadow-[0_0_12px_rgba(245,158,11,0.15)]" },
  low:    { label: "Rendah",  color: "text-slate-400", bg: "bg-white/5", border: "border-white/10", glow: "" },
};

const SOURCE_TYPE_ICONS: Record<string, string> = {
  book:    "📚",
  youtube: "🎥",
  article: "📄",
  podcast: "🎙️",
  course:  "🎓",
};

const SKILL_LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  awareness:    { label: "Awareness",    color: "text-slate-400" },
  understanding:{ label: "Pemahaman",    color: "text-sky-400" },
  applied:      { label: "Diterapkan",   color: "text-emerald-400" },
  mastered:     { label: "Dikuasai",     color: "text-violet-400" },
};

function getRelativeTime(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Terlambat ${Math.abs(diff)} hari`;
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Besok";
  return `${diff} hari lagi`;
}

function getMotivationalLabel(pct: number): string {
  if (pct === 0) return "Mulai perjalananmu! 🚀";
  if (pct < 25) return "Fondasi sedang dibangun 🌱";
  if (pct < 50) return "Momentum sedang terbangun 🔥";
  if (pct < 75) return "Sangat konsisten! ⚡";
  if (pct < 100) return "Hampir menguasai! 🎯";
  return "Semua selesai! 🏆";
}

// ─── TrackerHeader ────────────────────────────────────────────────────────────

function TrackerHeader({
  total,
  completed,
  pending,
  overdue,
}: {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (circumference * pct) / 100;

  const stats = [
    { label: "Total Aksi", value: total, color: "text-white", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "⚡" },
    { label: "Pending", value: pending, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "⏳" },
    { label: "Selesai", value: completed, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "✅" },
    { label: "Overdue", value: overdue, color: overdue > 0 ? "text-rose-400" : "text-slate-500", bg: overdue > 0 ? "bg-rose-500/10" : "bg-white/5", border: overdue > 0 ? "border-rose-500/20" : "border-white/10", icon: "⚠️" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/30 via-slate-950/50 to-purple-950/20 backdrop-blur-xl shadow-2xl p-6">
      {/* Ambient glows */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 bottom-0 w-48 h-48 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        {/* Left: Stats Grid */}
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              Action Tracker
            </span>
            <p className="text-lg font-bold text-white mt-2">{getMotivationalLabel(pct)}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-2xl border ${s.bg} ${s.border} px-4 py-3 flex flex-col gap-0.5`}>
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-mute">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{s.icon}</span>
                  <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Circular Progress */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" className="fill-none stroke-white/5" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke="url(#trackerGrad)"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(99,102,241,0.6))", transition: "stroke-dashoffset 0.8s ease" }}
              />
              <defs>
                <linearGradient id="trackerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{pct}%</span>
              <span className="text-[9px] uppercase font-bold text-text-mute tracking-wider">Selesai</span>
            </div>
          </div>
          <span className="text-[11px] text-text-mute font-medium">{completed}/{total} aksi</span>
        </div>
      </div>
    </div>
  );
}

// ─── TrackerSidebar ───────────────────────────────────────────────────────────

function TrackerSidebar({
  sources,
  skillGroups,
  activeSourceId,
  activeSkillName,
  onFilterSource,
  onFilterSkill,
  onClearFilters,
  allItems,
}: {
  sources: LearningSource[];
  skillGroups: { skillName: string; category: string; total: number; completed: number }[];
  activeSourceId: string;
  activeSkillName: string;
  onFilterSource: (id: string) => void;
  onFilterSkill: (name: string) => void;
  onClearFilters: () => void;
  allItems: FlatActionItem[];
}) {
  const hasFilters = activeSourceId !== "all" || activeSkillName !== "all";

  return (
    <aside className="w-full md:w-72 shrink-0 space-y-3">
      {/* Filter Reset */}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="w-full py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl transition-all cursor-pointer hover:bg-indigo-500/15"
        >
          ✕ Reset Filter
        </button>
      )}

      {/* Sumber Belajar */}
      <div className="bg-surface/30 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-[11px] uppercase font-bold tracking-widest text-text-mute">Sumber Belajar</h3>
        </div>
        <div className="p-2 space-y-1">
          <SidebarItem
            label="Semua Sumber"
            icon="🌐"
            count={allItems.length}
            completedCount={allItems.filter(i => i.completed).length}
            isActive={activeSourceId === "all" && activeSkillName === "all"}
            onClick={() => { onFilterSource("all"); onFilterSkill("all"); }}
          />
          {sources.map((s) => {
            const srcItems = allItems.filter(i => i.sourceId === s.id);
            const srcCompleted = srcItems.filter(i => i.completed).length;
            return (
              <SidebarItem
                key={s.id}
                label={s.title}
                icon={SOURCE_TYPE_ICONS[(s.progress as any)?.type ?? ""] ?? "📖"}
                count={srcItems.length}
                completedCount={srcCompleted}
                isActive={activeSourceId === s.id}
                onClick={() => { onFilterSource(s.id); onFilterSkill("all"); }}
              />
            );
          })}
          {/* Global/Inbox */}
          {(() => {
            const globalItems = allItems.filter(i => !i.sourceId);
            if (globalItems.length === 0) return null;
            return (
              <SidebarItem
                label="Global / Inbox"
                icon="📥"
                count={globalItems.length}
                completedCount={globalItems.filter(i => i.completed).length}
                isActive={activeSourceId === "__global__"}
                onClick={() => { onFilterSource("__global__"); onFilterSkill("all"); }}
              />
            );
          })()}
        </div>
      </div>

      {/* Skill Targets */}
      {skillGroups.length > 0 && (
        <div className="bg-surface/30 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-[11px] uppercase font-bold tracking-widest text-text-mute">Target Skill</h3>
          </div>
          <div className="p-2 space-y-1">
            {skillGroups.map((sg) => (
              <SidebarSkillItem
                key={sg.skillName}
                skillName={sg.skillName}
                category={sg.category}
                total={sg.total}
                completed={sg.completed}
                isActive={activeSkillName === sg.skillName}
                onClick={() => { onFilterSkill(sg.skillName); onFilterSource("all"); }}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function SidebarItem({
  label, icon, count, completedCount, isActive, onClick,
}: {
  label: string; icon: string; count: number; completedCount: number; isActive: boolean; onClick: () => void;
}) {
  const pct = count > 0 ? Math.round((completedCount / count) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group ${
        isActive
          ? "bg-indigo-500/15 border border-indigo-500/25 text-white"
          : "hover:bg-white/5 text-text-dim hover:text-text border border-transparent"
      }`}
    >
      <span className="text-base shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-white/20"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-[10px] font-bold shrink-0 ${isActive ? "text-indigo-300" : "text-text-mute"}`}>
            {completedCount}/{count}
          </span>
        </div>
      </div>
    </button>
  );
}

function SidebarSkillItem({
  skillName, category, total, completed, isActive, onClick,
}: {
  skillName: string; category: string; total: number; completed: number; isActive: boolean; onClick: () => void;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-violet-500/15 border border-violet-500/25 text-white"
          : "hover:bg-white/5 text-text-dim hover:text-text border border-transparent"
      }`}
    >
      <span className="text-sm shrink-0 mt-0.5">🎯</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{skillName}</p>
        <p className="text-[10px] text-text-mute truncate">{category}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-white/20"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-[10px] font-bold shrink-0 ${isActive ? "text-violet-300" : "text-text-mute"}`}>
            {pct}%
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({
  flat,
  onToggle,
  onDelete,
}: {
  flat: FlatActionItem;
  onToggle: (flat: FlatActionItem, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
}) {
  const { text, completed, completedAt, skillName, sourceName, sourceType, priority, deadline, type, skillLevel } = flat;

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const relativeTime = !completed ? getRelativeTime(deadline) : null;
  const isOverdue = relativeTime?.startsWith("Terlambat") ?? false;

  const srcIcon = SOURCE_TYPE_ICONS[sourceType ?? ""] ?? "📖";

  const cardBase = completed
    ? "border-white/5 bg-white/2 opacity-50 hover:opacity-70"
    : type === "skill_ai"
    ? "border-violet-500/20 hover:border-violet-500/40 bg-violet-950/5 hover:bg-violet-950/10 shadow-[0_0_12px_rgba(139,92,246,0.06)]"
    : (() => {
        const p = priority ?? "low";
        return `${PRIORITY_CONFIG[p].border} ${PRIORITY_CONFIG[p].bg} hover:border-opacity-70 ${PRIORITY_CONFIG[p].glow}`;
      })();

  const skillLevelInfo = skillLevel ? SKILL_LEVEL_LABELS[skillLevel] : null;

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-sm ${cardBase}`}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => onToggle(flat, e)}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-90 cursor-pointer ${
          completed
            ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] text-white"
            : "border-white/20 hover:border-indigo-400/60 bg-white/3"
        }`}
      >
        <svg
          width="11" height="11" viewBox="0 0 10 10" fill="none"
          className={`transition-all duration-300 ${completed ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        >
          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Task text */}
        <p className={`text-sm leading-relaxed font-medium transition-all duration-300 ${completed ? "line-through text-text-mute/50" : "text-text"}`}>
          {text}
        </p>

        {/* Meta badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Type badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
            type === "skill_ai"
              ? "text-violet-300 bg-violet-500/10 border-violet-500/20"
              : "text-sky-300 bg-sky-500/10 border-sky-500/20"
          }`}>
            {type === "skill_ai" ? "✦ AI" : "✏️ Custom"}
          </span>

          {/* Source badge */}
          <span className="text-[10px] text-text-mute bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg truncate max-w-[140px]" title={sourceName}>
            {srcIcon} {sourceName}
          </span>

          {/* Skill target */}
          {skillName && (
            <span className="text-[10px] text-violet-300 bg-violet-500/8 border border-violet-500/15 px-2 py-0.5 rounded-lg truncate max-w-[120px]" title={skillName}>
              🎯 {skillName}
            </span>
          )}

          {/* Skill level */}
          {skillLevelInfo && !completed && (
            <span className={`text-[10px] font-semibold ${skillLevelInfo.color}`}>
              · {skillLevelInfo.label}
            </span>
          )}

          {/* Priority badge (custom task only) */}
          {type === "source_task" && priority && priority !== "low" && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${PRIORITY_CONFIG[priority].color} ${PRIORITY_CONFIG[priority].bg} ${PRIORITY_CONFIG[priority].border}`}>
              {PRIORITY_CONFIG[priority].label}
            </span>
          )}

          {/* Deadline / relative time */}
          {relativeTime && !completed && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${
              isOverdue
                ? "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse"
                : relativeTime === "Hari ini" || relativeTime === "Besok"
                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-slate-400 bg-white/5 border-white/10"
            }`}>
              📅 {relativeTime}
            </span>
          )}

          {/* Completed date */}
          {completedAt && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-2 py-0.5 rounded-lg">
              ✓ {new Date(completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Delete button (custom tasks only) */}
      {type === "source_task" && onDelete && (
        <button
          onClick={() => onDelete(flat.id)}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-lg text-text-mute hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          title="Hapus"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── SkillGroup ───────────────────────────────────────────────────────────────

function SkillGroupCard({
  skillName,
  category,
  skillLevel,
  sourceName,
  sourceType,
  items,
  onToggle,
  onDelete,
  defaultExpanded,
}: {
  skillName: string;
  category: string;
  skillLevel?: string;
  sourceName: string;
  sourceType?: SourceType;
  items: FlatActionItem[];
  onToggle: (flat: FlatActionItem, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const completedCount = items.filter((i) => i.completed).length;
  const pendingCount = items.length - completedCount;
  const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const skillLevelInfo = skillLevel ? SKILL_LEVEL_LABELS[skillLevel] : null;
  const srcIcon = SOURCE_TYPE_ICONS[sourceType ?? ""] ?? "📖";

  return (
    <div className="rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-950/20 to-slate-950/30 overflow-hidden backdrop-blur-md shadow-lg">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-violet-500/5 transition-all duration-200 text-left cursor-pointer"
      >
        {/* Skill icon + info */}
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/25 flex items-center justify-center text-lg">
          🎯
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white truncate">{skillName}</h3>
            {skillLevelInfo && (
              <span className={`text-[10px] font-semibold ${skillLevelInfo.color}`}>
                · {skillLevelInfo.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-text-mute">{category}</span>
            <span className="text-text-mute/30">·</span>
            <span className="text-[11px] text-text-mute truncate max-w-[160px]">{srcIcon} {sourceName}</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-violet-300 shrink-0">{pct}%</span>
          </div>
        </div>

        {/* Right side: counts + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{completedCount}/{items.length}</p>
            <p className="text-[10px] text-text-mute">{pendingCount} tersisa</p>
          </div>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-text-mute transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded items */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-violet-500/10">
          <div className="pt-2 space-y-2">
            {items.map((item) => (
              <ActionCard key={item.id} flat={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SourceGroup ──────────────────────────────────────────────────────────────

function SourceGroupCard({
  source,
  items,
  onToggle,
  onDelete,
  onSaveTask,
  defaultExpanded,
}: {
  source: LearningSource | null;
  items: FlatActionItem[];
  onToggle: (flat: FlatActionItem, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  onSaveTask: (desc: string, sourceId: string, priority: TaskPriority, deadline: string) => Promise<void>;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = items.filter((i) => i.completed).length;
  const pendingCount = items.length - completedCount;
  const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const sourceType = (source?.progress as any)?.type ?? "";
  const srcIcon = SOURCE_TYPE_ICONS[sourceType] ?? "📖";
  const sourceName = source?.title ?? "Global / Inbox";
  const isGlobal = !source;

  const groupBorder = isGlobal ? "border-slate-500/15" : "border-sky-500/15";
  const gradFrom = isGlobal ? "from-slate-950/40" : "from-sky-950/20";
  const gradTo = "to-slate-950/30";
  const headerHover = isGlobal ? "hover:bg-slate-500/5" : "hover:bg-sky-500/5";
  const progressColor = isGlobal ? "from-slate-500 to-slate-400" : "from-sky-500 to-cyan-500";
  const iconBg = isGlobal ? "from-slate-500/20 to-slate-600/20 border-slate-500/25" : "from-sky-500/20 to-cyan-600/20 border-sky-500/25";
  const pctColor = isGlobal ? "text-slate-400" : "text-sky-300";

  const handleAddTask = async () => {
    if (!newTaskDesc.trim()) return;
    setIsSaving(true);
    try {
      await onSaveTask(newTaskDesc.trim(), source?.id ?? "", newTaskPriority, newTaskDeadline);
      setNewTaskDesc("");
      setNewTaskPriority("medium");
      setNewTaskDeadline("");
      setShowAddForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`rounded-2xl border ${groupBorder} bg-gradient-to-br ${gradFrom} ${gradTo} overflow-hidden backdrop-blur-md shadow-lg`}>
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className={`w-full flex items-center gap-4 px-5 py-4 ${headerHover} transition-all duration-200 text-left cursor-pointer`}
      >
        <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-lg`}>
          {isGlobal ? "📥" : srcIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white truncate">{sourceName}</h3>
            {source?.status && (
              <span className="text-[10px] text-text-mute capitalize">({source.status.replace("_", " ")})</span>
            )}
          </div>
          {source && (
            <p className="text-[11px] text-text-mute mt-0.5">
              {source.creatorName} {source.topicTags.length > 0 && `· ${source.topicTags.slice(0, 2).join(", ")}`}
            </p>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold shrink-0 ${pctColor}`}>{pct}%</span>
          </div>
        </div>

        {/* Right: counts + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{completedCount}/{items.length}</p>
            <p className="text-[10px] text-text-mute">{pendingCount} tersisa</p>
          </div>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-text-mute transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`px-3 pb-3 space-y-2 border-t ${isGlobal ? "border-slate-500/10" : "border-sky-500/10"}`}>
          <div className="pt-2 space-y-2">
            {items.map((item) => (
              <ActionCard key={item.id} flat={item} onToggle={onToggle} onDelete={onDelete} />
            ))}

            {/* Inline Add Task Form */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-text-mute hover:text-text text-xs font-medium transition-all duration-200 cursor-pointer hover:bg-white/3"
              >
                <span className="text-base">＋</span> Tambah aksi untuk {isGlobal ? "inbox" : "sumber ini"}
              </button>
            ) : (
              <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/15 p-3 space-y-3 backdrop-blur-sm">
                <input
                  autoFocus
                  type="text"
                  placeholder="Deskripsi aksi..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") setShowAddForm(false); }}
                  className="w-full bg-transparent text-sm text-text placeholder:text-text-mute focus:outline-none"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                        newTaskPriority === p
                          ? `${PRIORITY_CONFIG[p].color} ${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].border}`
                          : "text-text-mute border-white/10 hover:border-white/20"
                      }`}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-text-mute focus:outline-none focus:border-indigo-500/40 transition"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddForm(false)} className="text-xs text-text-mute hover:text-text px-3 py-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer">
                    Batal
                  </button>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskDesc.trim() || isSaving}
                    className="text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-1.5 rounded-lg transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── View Mode Switcher ───────────────────────────────────────────────────────

function ViewModeSwitcher({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const opts: { value: ViewMode; label: string; icon: string }[] = [
    { value: "skill",  label: "Per Skill",  icon: "🎯" },
    { value: "source", label: "Per Sumber", icon: "📚" },
    { value: "flat",   label: "Daftar",     icon: "☰" },
  ];
  return (
    <div className="flex p-1 rounded-xl bg-white/5 border border-white/8 shrink-0">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
            mode === o.value
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
              : "text-text-dim hover:text-text hover:bg-white/5"
          }`}
        >
          <span className="text-sm">{o.icon}</span>
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Task Creator (Global / Flat Mode) ───────────────────────────────────────

function GlobalTaskCreator({
  sources,
  onSave,
}: {
  sources: LearningSource[];
  onSave: (desc: string, sourceId: string, priority: TaskPriority, deadline: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [desc, setDesc] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [deadline, setDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setIsSaving(true);
    try {
      await onSave(desc.trim(), sourceId, priority, deadline);
      setDesc(""); setSourceId(""); setPriority("medium"); setDeadline(""); setIsExpanded(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 backdrop-blur-md ${isExpanded ? "border-indigo-500/30 bg-indigo-950/10 shadow-xl" : "border-white/10 bg-surface/25 hover:border-white/20"}`}>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-lg shrink-0">✏️</span>
          <input
            type="text"
            placeholder="Tambah aksi kustom baru..."
            value={desc}
            onFocus={() => setIsExpanded(true)}
            onChange={(e) => setDesc(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-mute focus:outline-none"
          />
          {!isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition cursor-pointer shrink-0"
            >
              + Tambah
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-mute">Sumber Belajar</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition cursor-pointer"
                >
                  <option value="">Global / Inbox</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-text-mute">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-mute">Prioritas</label>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`text-xs font-semibold py-2 rounded-xl border transition-all cursor-pointer ${
                      priority === p
                        ? `${PRIORITY_CONFIG[p].color} ${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].border} shadow-md`
                        : "text-text-mute border-white/10 hover:border-white/20"
                    }`}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setIsExpanded(false); setDesc(""); }}
                className="text-xs text-text-mute hover:text-text px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!desc.trim() || isSaving}
                className="text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50 transition cursor-pointer"
              >
                {isSaving ? "Menyimpan..." : "Buat Aksi ⚡"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-white/5 rounded-xl w-52" />
        <div className="h-4 bg-white/5 rounded-xl w-72" />
      </div>
      <div className="h-36 bg-white/5 rounded-3xl" />
      <div className="flex gap-6">
        <div className="w-72 h-96 bg-white/5 rounded-2xl shrink-0 hidden md:block" />
        <div className="flex-1 space-y-3">
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/2">
      <span className="text-4xl mb-3">🌱</span>
      <p className="text-sm text-text-mute max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

// ─── Main ActionsPage Component ───────────────────────────────────────────────

export default function ActionsPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();

  const [skillsData, setSkillsData] = useState<SkillProgress[]>([]);
  const [tasksData, setTasksData] = useState<SourceTask[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [mounted, setMounted] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("source");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeSourceId, setActiveSourceId] = useState("all");
  const [activeSkillName, setActiveSkillName] = useState("all");
  const [search, setSearch] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);

  // Load data
  const load = useCallback(async () => {
    if (!user || !workspace) return;
    const [sp, tasks, src] = await Promise.all([
      getWsSkillProgress(workspace.id, user.id),
      getWsTasks(workspace.id, user.id),
      getWsSources(workspace.id, user.id, "all"),
    ]);
    setSkillsData(sp);
    setTasksData(tasks);
    setSources(src);
  }, [user, workspace]);

  useEffect(() => {
    load();
    setMounted(true);
  }, [load]);

  // Flatten all items
  const allItems: FlatActionItem[] = useMemo(() => {
    const fromSkills = skillsData.flatMap((sp) => {
      const source = sources.find((s) => s.id === sp.sourceId);
      return sp.actionItems.map((item) => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
        completedAt: item.completedAt,
        skillName: sp.skillName,
        skillCategory: sp.category,
        skillLevel: sp.level,
        sourceName: source?.title ?? "Sumber tidak ditemukan",
        sourceId: sp.sourceId,
        sourceType: (source?.progress as any)?.type as SourceType | undefined,
        type: "skill_ai" as const,
        rawSp: sp,
      }));
    });

    const fromTasks = tasksData.map((t) => {
      const source = sources.find((s) => s.id === t.sourceId);
      return {
        id: t.id,
        text: t.description,
        completed: t.status === "done",
        completedAt: t.completedAt,
        sourceName: source?.title ?? "Global / Inbox",
        sourceId: t.sourceId,
        sourceType: (source?.progress as any)?.type as SourceType | undefined,
        priority: t.priority,
        deadline: t.deadline,
        type: "source_task" as const,
        rawTask: t,
      };
    });

    return [...fromSkills, ...fromTasks];
  }, [skillsData, tasksData, sources]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let r = [...allItems];
    if (statusFilter === "pending") r = r.filter((f) => !f.completed);
    if (statusFilter === "completed") r = r.filter((f) => f.completed);
    if (activeSourceId === "__global__") r = r.filter((f) => !f.sourceId);
    else if (activeSourceId !== "all") r = r.filter((f) => f.sourceId === activeSourceId);
    if (activeSkillName !== "all") r = r.filter((f) => f.skillName === activeSkillName);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (f) =>
          f.text.toLowerCase().includes(q) ||
          (f.skillName ?? "").toLowerCase().includes(q) ||
          f.sourceName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [allItems, statusFilter, activeSourceId, activeSkillName, search]);

  // Stats
  const totalCount = allItems.length;
  const completedCount = allItems.filter((f) => f.completed).length;
  const pendingCount = allItems.filter((f) => !f.completed).length;
  const overdueCount = allItems.filter((f) => {
    if (f.completed || !f.deadline) return false;
    return new Date(f.deadline).getTime() < new Date().setHours(0, 0, 0, 0);
  }).length;

  // Skill groups for sidebar
  const skillGroupsSidebar = useMemo(() => {
    const map = new Map<string, { skillName: string; category: string; total: number; completed: number }>();
    for (const sp of skillsData) {
      const existing = map.get(sp.skillName);
      const total = sp.actionItems.length;
      const done = sp.actionItems.filter((a) => a.completed).length;
      if (existing) {
        existing.total += total;
        existing.completed += done;
      } else {
        map.set(sp.skillName, { skillName: sp.skillName, category: sp.category, total, completed: done });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [skillsData]);

  // Toggle handler
  const handleToggle = async (flat: FlatActionItem, e: React.MouseEvent) => {
    if (!user || !workspace) return;
    const nextCompleted = !flat.completed;
    if (nextCompleted) {
      const particle: Particle = {
        id: crypto.randomUUID(),
        x: e.clientX,
        y: e.clientY - 20,
        text: "+10 XP 🏆  +5 Gold 🪙",
      };
      setParticles((prev) => [...prev, particle]);
      setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== particle.id)), 2000);
    }

    if (flat.type === "skill_ai" && flat.rawSp) {
      const sp = flat.rawSp;
      const updated: SkillProgress = {
        ...sp,
        actionItems: sp.actionItems.map((ai) =>
          ai.id === flat.id
            ? { ...ai, completed: !ai.completed, completedAt: !ai.completed ? new Date().toISOString() : undefined }
            : ai
        ),
      };
      await updateWsSkillProgress(workspace.id, user.id, updated);
      setSkillsData((prev) => prev.map((s) => (s.id === sp.id ? updated : s)));
    } else if (flat.type === "source_task" && flat.rawTask) {
      const task = flat.rawTask;
      const nextStatus = task.status === "done" ? "todo" : "done";
      const updated: SourceTask = {
        ...task,
        status: nextStatus,
        completedAt: nextStatus === "done" ? new Date().toISOString() : undefined,
      };
      await updateWsTask(workspace.id, user.id, updated);
      setTasksData((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    }
  };

  // Save custom task
  const handleSaveTask = async (desc: string, srcId: string, priority: TaskPriority, deadline: string) => {
    if (!user || !workspace) return;
    const newTask: SourceTask = {
      id: crypto.randomUUID(),
      sourceId: srcId || undefined,
      workspaceId: workspace.id,
      userId: user.id,
      description: desc,
      priority,
      status: "todo",
      deadline: deadline || undefined,
      createdAt: new Date().toISOString(),
    };
    await saveWsTask(workspace.id, user.id, newTask);
    await load();
  };

  // Delete custom task
  const handleDeleteTask = async (taskId: string) => {
    if (!user || !workspace) return;
    await deleteWsTask(workspace.id, user.id, taskId);
    setTasksData((prev) => prev.filter((t) => t.id !== taskId));
  };

  // ─── Build Grouped Views ──────────────────────────────────────────────────

  // By Skill
  const skillGroups = useMemo(() => {
    const map = new Map<string, { sp: SkillProgress; source: LearningSource | undefined; items: FlatActionItem[] }>();
    for (const item of filteredItems) {
      if (item.type !== "skill_ai" || !item.skillName) continue;
      const key = item.skillName;
      if (!map.has(key)) {
        const sp = skillsData.find((s) => s.skillName === item.skillName);
        const source = sp ? sources.find((s) => s.id === sp.sourceId) : undefined;
        map.set(key, { sp: sp!, source, items: [] });
      }
      map.get(key)!.items.push(item);
    }

    // Also include custom tasks as "no-skill" items
    const customItems = filteredItems.filter((f) => f.type === "source_task");
    if (customItems.length > 0) {
      map.set("__custom__", { sp: null as any, source: undefined, items: customItems });
    }

    return Array.from(map.entries());
  }, [filteredItems, skillsData, sources]);

  // By Source
  const sourceGroups = useMemo(() => {
    const map = new Map<string, { source: LearningSource | null; items: FlatActionItem[] }>();
    for (const item of filteredItems) {
      const key = item.sourceId ?? "__global__";
      if (!map.has(key)) {
        const source = item.sourceId ? sources.find((s) => s.id === item.sourceId) ?? null : null;
        map.set(key, { source, items: [] });
      }
      map.get(key)!.items.push(item);
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      if (!a.source) return 1;
      if (!b.source) return -1;
      return a.source.title.localeCompare(b.source.title);
    });
  }, [filteredItems, sources]);

  if (!mounted) return <Skeleton />;

  return (
    <div className="space-y-5 relative pb-20">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Action Tracker</h1>
          <p className="text-sm text-text-mute mt-1">
            Kelola dan lacak semua aksi belajarmu secara terkoneksi dengan sumber dan target skill.
          </p>
        </div>
        <ViewModeSwitcher mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Stats Header */}
      <TrackerHeader
        total={totalCount}
        completed={completedCount}
        pending={pendingCount}
        overdue={overdueCount}
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-surface/30 border border-white/8 rounded-2xl p-3.5 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-text-mute pointer-events-none text-sm">🔍</span>
          <input
            type="text"
            placeholder="Cari aksi, skill, atau sumber..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm bg-transparent border-none pl-9 pr-4 py-2 text-text placeholder:text-text-mute focus:outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="flex p-0.5 rounded-xl bg-white/5 border border-white/8 shrink-0">
          {([
            { label: "Semua", value: "all" as StatusFilter },
            { label: `Pending (${pendingCount})`, value: "pending" as StatusFilter },
            { label: `Selesai (${completedCount})`, value: "completed" as StatusFilter },
          ]).map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                statusFilter === f.value
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                  : "text-text-dim hover:text-text hover:bg-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reset */}
        {(search || statusFilter !== "all" || activeSourceId !== "all" || activeSkillName !== "all") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); setActiveSourceId("all"); setActiveSkillName("all"); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold shrink-0 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main layout: Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar */}
        <TrackerSidebar
          sources={sources}
          skillGroups={skillGroupsSidebar}
          activeSourceId={activeSourceId}
          activeSkillName={activeSkillName}
          onFilterSource={setActiveSourceId}
          onFilterSkill={setActiveSkillName}
          onClearFilters={() => { setActiveSourceId("all"); setActiveSkillName("all"); }}
          allItems={allItems}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Global Add Task (visible in flat/source mode) */}
          {(viewMode === "flat" || viewMode === "source") && (
            <GlobalTaskCreator sources={sources} onSave={handleSaveTask} />
          )}

          {/* View: By Skill */}
          {viewMode === "skill" && (
            <div className="space-y-3">
              {skillGroups.length === 0 ? (
                <EmptyState message="Tidak ada aksi yang cocok dengan filter ini. Coba ubah filter atau tambahkan skill target baru." />
              ) : (
                skillGroups.map(([key, { sp, source, items }]) => {
                  if (key === "__custom__") {
                    return (
                      <div key="custom" className="rounded-2xl border border-sky-500/15 bg-gradient-to-br from-sky-950/15 to-slate-950/30 overflow-hidden backdrop-blur-md shadow-lg">
                        <div className="px-5 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-600/20 border border-sky-500/25 flex items-center justify-center text-lg">✏️</div>
                          <div>
                            <h3 className="text-sm font-bold text-white">Aksi Kustom</h3>
                            <p className="text-[11px] text-text-mute">{items.filter(i => !i.completed).length} tersisa</p>
                          </div>
                        </div>
                        <div className="px-3 pb-3 border-t border-sky-500/10 pt-3 space-y-2">
                          {items.map((item) => (
                            <ActionCard key={item.id} flat={item} onToggle={handleToggle} onDelete={handleDeleteTask} />
                          ))}
                          <GlobalTaskCreator sources={sources} onSave={handleSaveTask} />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <SkillGroupCard
                      key={key}
                      skillName={sp?.skillName ?? key}
                      category={sp?.category ?? ""}
                      skillLevel={sp?.level}
                      sourceName={source?.title ?? "Sumber tidak ditemukan"}
                      sourceType={(source?.progress as any)?.type}
                      items={items}
                      onToggle={handleToggle}
                      onDelete={handleDeleteTask}
                      defaultExpanded={true}
                    />
                  );
                })
              )}
            </div>
          )}

          {/* View: By Source */}
          {viewMode === "source" && (
            <div className="space-y-3">
              {sourceGroups.length === 0 ? (
                <EmptyState message="Tidak ada aksi yang cocok. Tambahkan sumber belajar atau buat aksi kustom baru." />
              ) : (
                sourceGroups.map(([key, { source, items }]) => (
                  <SourceGroupCard
                    key={key}
                    source={source}
                    items={items}
                    onToggle={handleToggle}
                    onDelete={handleDeleteTask}
                    onSaveTask={handleSaveTask}
                    defaultExpanded={true}
                  />
                ))
              )}
            </div>
          )}

          {/* View: Flat List */}
          {viewMode === "flat" && (
            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <EmptyState message="Tidak ada aksi yang cocok dengan filter ini." />
              ) : (
                filteredItems
                  .sort((a, b) => {
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                    const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
                    return (pOrder[b.priority ?? "low"] ?? 0) - (pOrder[a.priority ?? "low"] ?? 0);
                  })
                  .map((flat) => (
                    <ActionCard key={flat.id} flat={flat} onToggle={handleToggle} onDelete={handleDeleteTask} />
                  ))
              )}
              <p className="text-xs text-text-mute text-center pt-2">
                Menampilkan <span className="text-indigo-300 font-semibold">{filteredItems.length}</span> dari {allItems.length} aksi
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Capture FAB */}
      <QuickCaptureFAB onRefresh={load} />

      {/* Floating Reward Particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}
            className="absolute text-xs font-black text-yellow-300 bg-slate-950/90 border border-yellow-500/30 px-3.5 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 backdrop-blur-md animate-float-up-fade"
          >
            {p.text}
          </div>
        ))}
      </div>
    </div>
  );
}
