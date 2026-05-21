"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { SkillProgress, LearningSource, ActionItem, SourceTask, TaskPriority } from "@/lib/types";
import QuickCaptureFAB from "@/components/dashboard/QuickCaptureFAB";

// ─── Constants & Styles ────────────────────────────────────────────────────────

const PRIORITY_GLOWS: Record<TaskPriority, string> = {
  urgent: "border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.08)] hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-500/5",
  high: "border-orange-500/30 hover:border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.08)] hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] bg-orange-500/5",
  medium: "border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.08)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-500/5",
  low: "border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.06)] bg-white/5",
};

const PRIORITY_BADGES: Record<TaskPriority, { label: string; cls: string }> = {
  urgent: { label: "Mendesak", cls: "text-rose-400 bg-rose-500/10 border border-rose-500/20" },
  high: { label: "Tinggi", cls: "text-orange-400 bg-orange-500/10 border border-orange-500/20" },
  medium: { label: "Sedang", cls: "text-amber-400 bg-amber-500/10 border border-amber-500/20" },
  low: { label: "Rendah", cls: "text-slate-400 bg-white/5 border border-white/10" },
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "completed";

interface FlatActionItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  skillName?: string;
  sourceName: string;
  sourceId?: string;
  priority?: TaskPriority;
  deadline?: string;
  type: "skill_ai" | "source_task";
  rawSp?: SkillProgress; // For skill_ai
  rawTask?: SourceTask; // For source_task
}

interface Particle {
  id: string;
  x: number;
  y: number;
  text: string;
}

// ─── Action Row Component ─────────────────────────────────────────────────────

function ActionRow({
  flat,
  onToggle,
  onDelete,
}: {
  flat: FlatActionItem;
  onToggle: (flat: FlatActionItem, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
}) {
  const { text, completed, completedAt, skillName, sourceName, priority, deadline, type } = flat;

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const isOverdue = useMemo(() => {
    if (!deadline || completed) return false;
    return new Date(deadline).getTime() < new Date().setHours(0, 0, 0, 0);
  }, [deadline, completed]);

  // Determine priority card style
  const cardStyle = useMemo(() => {
    if (completed) {
      return "bg-surface/20 border-white/5 opacity-55 hover:opacity-85";
    }
    if (type === "skill_ai") {
      return "border border-violet-500/25 hover:border-violet-500/45 shadow-[0_0_12px_rgba(139,92,246,0.06)] bg-violet-950/5 hover:bg-violet-950/10";
    }
    const p = priority ?? "low";
    return `border ${PRIORITY_GLOWS[p]}`;
  }, [completed, type, priority]);

  return (
    <div className={`flex items-start gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${cardStyle} backdrop-blur-md`}>
      {/* Custom Springy Checkbox */}
      <button
        onClick={(e) => onToggle(flat, e)}
        className={`mt-0.5 shrink-0 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-90 ${
          completed
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] text-white"
            : "border-white/20 hover:border-indigo-400 bg-white/5"
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-all duration-300 transform ${completed ? "scale-100 rotate-0" : "scale-0 rotate-45"}`}
        >
          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed font-medium transition-all duration-300 ${completed ? "line-through text-text-mute/50" : "text-text"}`}>
          {text}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {/* Priority tag (custom task only) */}
          {type === "source_task" && priority && (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${PRIORITY_BADGES[priority].cls}`}>
              {PRIORITY_BADGES[priority].label}
            </span>
          )}

          {/* Skill target tag */}
          {skillName && (
            <span className="text-[11px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-lg truncate max-w-[160px]" title={skillName}>
              🎯 {skillName}
            </span>
          )}

          {/* Source tag */}
          <span className="text-[11px] text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-lg truncate max-w-[180px]" title={sourceName}>
            📚 {sourceName}
          </span>

          {/* Deadline tag */}
          {deadlineStr && !completed && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${isOverdue ? "text-rose-400 bg-rose-500/10 border border-rose-500/20 animate-pulse" : "text-amber-400 bg-amber-500/10 border border-amber-500/20"}`}>
              📅 {deadlineStr} {isOverdue && "(Terlambat)"}
            </span>
          )}

          {/* Completed date tag */}
          {completedAt && (
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
              ✓ Selesai: {new Date(completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Delete button (custom task only) */}
      {type === "source_task" && onDelete && (
        <button
          onClick={() => onDelete(flat.id)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-text-mute hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          title="Hapus Misi"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── RPG Progress Card ────────────────────────────────────────────────────────

function QuestProgressCard({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  const ratio = totalCount > 0 ? completedCount / totalCount : 0;
  const percentage = Math.round(ratio * 100);

  // RPG Leveling Logic (40XP per Level)
  const totalXP = completedCount * 10;
  const xpPerLevel = 40;
  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const xpInCurrentLevel = totalXP % xpPerLevel;
  const progressPercent = (xpInCurrentLevel / xpPerLevel) * 100;

  const levelNames = [
    "Pencari Skill",
    "Ksatria Aksi",
    "Grandmaster Target",
    "Legenda Produktivitas",
  ];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/20 via-slate-900/30 to-purple-950/20 p-6 backdrop-blur-md shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Stats & Level */}
        <div className="space-y-4 flex-1">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              Quest Control Center
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2.5 flex items-center gap-2">
              Level {level}: {levelName}
            </h2>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-text-mute font-medium">Progress Level</span>
              <span className="text-indigo-300 font-bold">{xpInCurrentLevel} / {xpPerLevel} XP</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-amber-400">
              🏆 <span className="text-white">{totalXP}</span> XP
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-yellow-400">
              🪙 <span className="text-white">{completedCount * 5}</span> Gold
            </div>
            <div className="text-xs text-text-mute ml-1 font-medium">
              {totalCount - completedCount} Quest tersisa
            </div>
          </div>
        </div>

        {/* Right Side: Circular Progress */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="32"
                className="stroke-white/5 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                className="stroke-indigo-500 fill-none transition-all duration-500"
                strokeWidth="6"
                strokeDasharray="201.06"
                strokeDashoffset={201.06 - (201.06 * ratio)}
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(99,102,241,0.6))",
                }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-black text-white">{percentage}%</span>
              <p className="text-[9px] uppercase font-bold tracking-wider text-text-mute -mt-1">Selesai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Task Creator ──────────────────────────────────────────────────────

function TaskCreator({
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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setDesc("");
    setSourceId("");
    setPriority("medium");
    setDeadline("");
    setError("");
    setIsExpanded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) {
      setError("Deskripsi target tidak boleh kosong.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSave(desc.trim(), sourceId, priority, deadline);
      setDesc("");
      setSourceId("");
      setPriority("medium");
      setDeadline("");
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`transition-all duration-300 bg-surface/30 border rounded-2xl p-4 backdrop-blur-md ${
      isExpanded ? "border-indigo-500/30 bg-surface/40 shadow-xl" : "border-white/10 hover:border-white/20 shadow-md"
    }`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Text - Always visible */}
        <div className="relative flex items-center">
          <span className="text-lg mr-2 select-none">🛡️</span>
          <input
            type="text"
            placeholder="Tambah misi kustom baru... (contoh: 'Baca bab 4 Golden Circle')"
            value={desc}
            onFocus={handleFocus}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-transparent text-sm text-text placeholder:text-text-mute focus:outline-none pr-10"
          />
          {!isExpanded && (
            <button
              type="button"
              onClick={handleFocus}
              className="absolute right-0 p-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all text-xs font-bold cursor-pointer"
            >
              + Tambah
            </button>
          )}
        </div>

        {/* Expanded Fields */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-white/5 animate-slide-up">
            {/* Grid for parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Learning Source Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-mute">
                  Hubungkan dengan Sumber
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition cursor-pointer"
                >
                  <option value="">Global / Kotak Masuk</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline Datepicker */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-mute">
                  Batas Waktu (Deadline)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition bg-transparent"
                />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-text-mute">
                Tingkat Prioritas
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => {
                  const isActive = priority === p;
                  const config = PRIORITY_BADGES[p];
                  
                  let activeStyle = "";
                  if (isActive) {
                    if (p === "urgent") activeStyle = "bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.25)]";
                    else if (p === "high") activeStyle = "bg-orange-500/20 text-orange-300 border-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.25)]";
                    else if (p === "medium") activeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]";
                    else activeStyle = "bg-white/15 text-white border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.1)]";
                  } else {
                    activeStyle = "bg-white/5 border-transparent text-text-dim hover:border-white/10";
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`text-xs font-semibold py-2 rounded-xl border transition-all cursor-pointer ${activeStyle}`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-rose-400 text-xs bg-rose-950/20 px-3 py-2 rounded-xl border border-rose-500/20">
                ⚠️ {error}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-semibold text-text-dim hover:text-text hover:bg-white/5 border border-white/10 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-600 hover:to-violet-800 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Buat Misi ⚔️"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: StatusFilter }) {
  const msgs: Record<StatusFilter, { icon: string; title: string; desc: string }> = {
    all: {
      icon: "🏔️",
      title: "Belum ada target misi",
      desc: "Quest akan muncul saat Anda menambahkan skill targets atau membuat misi kustom baru.",
    },
    pending: {
      icon: "🔱",
      title: "Semua misi selesai!",
      desc: "Bagus sekali! Tidak ada target misi yang tersisa di papan ini. Tambahkan target baru untuk terus berkembang.",
    },
    completed: {
      icon: "⚖️",
      title: "Belum ada misi terselesaikan",
      desc: "Centang target misi yang telah Anda selesaikan untuk melihat riwayat keberhasilan Anda di sini.",
    },
  };
  const m = msgs[filter];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/20 border border-dashed border-white/10 rounded-3xl backdrop-blur-md animate-slide-up">
      <div className="text-5xl mb-4 select-none">{m.icon}</div>
      <h3 className="text-lg font-bold text-white">{m.title}</h3>
      <p className="text-sm text-text-mute mt-2 max-w-xs leading-relaxed">{m.desc}</p>
    </div>
  );
}

// ─── Main Actions Page Component ───────────────────────────────────────────────

export default function ActionsPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [skillsData, setSkillsData] = useState<SkillProgress[]>([]);
  const [tasksData, setTasksData] = useState<SourceTask[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [search, setSearch] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);

  // Database Loader
  const load = useCallback(async () => {
    if (!user || !workspace) return;
    
    const sp = await getWsSkillProgress(workspace.id, user.id);
    const tasks = await getWsTasks(workspace.id, user.id);
    const src = await getWsSources(workspace.id, user.id, "all");
    
    setSkillsData(sp);
    setTasksData(tasks);
    setSources(src);
  }, [user, workspace]);

  useEffect(() => {
    load();
    setMounted(true);
  }, [load]);

  // Flatten both standard AI targets and Custom Tasks
  const allItems: FlatActionItem[] = useMemo(() => {
    const fromSkills = skillsData.flatMap((sp) => {
      const source = sources.find((s) => s.id === sp.sourceId);
      return sp.actionItems.map((item) => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
        completedAt: item.completedAt,
        skillName: sp.skillName,
        sourceName: source?.title ?? "Sumber tidak ditemukan",
        sourceId: sp.sourceId,
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
        priority: t.priority,
        deadline: t.deadline,
        type: "source_task" as const,
        rawTask: t,
      };
    });

    return [...fromSkills, ...fromTasks];
  }, [skillsData, tasksData, sources]);

  // Apply filters and sorting
  const sortedAndFiltered = useMemo(() => {
    let r = [...allItems];
    
    if (statusFilter === "pending") r = r.filter((f) => !f.completed);
    if (statusFilter === "completed") r = r.filter((f) => f.completed);
    if (sourceFilter !== "all") r = r.filter((f) => f.sourceId === sourceFilter);
    if (priorityFilter !== "all") r = r.filter((f) => f.priority === priorityFilter);
    
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (f) =>
          f.text.toLowerCase().includes(q) ||
          (f.skillName ?? "").toLowerCase().includes(q) ||
          f.sourceName.toLowerCase().includes(q)
      );
    }

    // Sort items
    r.sort((a, b) => {
      // Completed items go to the bottom of the list always
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      
      if (sortBy === "priority") {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        const valA = pOrder[a.priority ?? "low"] ?? 0;
        const valB = pOrder[b.priority ?? "low"] ?? 0;
        return valB - valA;
      }
      
      if (sortBy === "alphabetical") {
        return a.text.localeCompare(b.text);
      }
      
      if (sortBy === "createdAt") {
        const dateA = a.rawTask?.createdAt ?? a.rawSp?.createdAt ?? "";
        const dateB = b.rawTask?.createdAt ?? b.rawSp?.createdAt ?? "";
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
      
      return 0;
    });

    return r;
  }, [allItems, statusFilter, sourceFilter, priorityFilter, search, sortBy]);

  const pendingCount = useMemo(() => allItems.filter((f) => !f.completed).length, [allItems]);
  const completedCount = useMemo(() => allItems.filter((f) => f.completed).length, [allItems]);

  // Toggle handlers (Updates Supabase/LocalStorage database)
  const handleToggle = async (flat: FlatActionItem, e: React.MouseEvent) => {
    if (!user || !workspace) return;

    const nextCompleted = !flat.completed;
    if (nextCompleted) {
      // Spawn floating reward particles (+10 XP & +5 Gold)
      const newParticle: Particle = {
        id: crypto.randomUUID(),
        x: e.clientX,
        y: e.clientY - 20,
        text: "+10 XP 🏆  +5 Gold 🪙",
      };
      setParticles((prev) => [...prev, newParticle]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 2000);
    }

    if (flat.type === "skill_ai" && flat.rawSp) {
      const sp = flat.rawSp;
      const updated: SkillProgress = {
        ...sp,
        actionItems: sp.actionItems.map((ai) =>
          ai.id === flat.id
            ? {
                ...ai,
                completed: !ai.completed,
                completedAt: !ai.completed ? new Date().toISOString() : undefined,
              }
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

  // Add Custom Task Handler
  const handleSaveTask = async (
    desc: string,
    srcId: string,
    priority: TaskPriority,
    deadline: string
  ) => {
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
    const tasks = await getWsTasks(workspace.id, user.id);
    setTasksData(tasks);
  };

  // Delete Custom Task Handler
  const handleDeleteTask = async (taskId: string) => {
    if (!user || !workspace) return;
    await deleteWsTask(workspace.id, user.id, taskId);
    setTasksData((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (!mounted) return <Skeleton />;

  return (
    <div className="space-y-6 relative pb-16">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Action Board</h1>
        <p className="text-sm text-text-mute mt-1">
          Kembangkan keahlian Anda dengan menindaklanjuti rencana aksi secara teratur.
        </p>
      </div>

      {/* Quest RPG Progress Dashboard Card */}
      <QuestProgressCard completedCount={completedCount} totalCount={allItems.length} />

      {/* Inline Quick Task Creator */}
      <TaskCreator sources={sources} onSave={handleSaveTask} />

      {/* Filters & Control Center */}
      <div className="bg-surface/30 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-md space-y-4">
        {/* Search input with glowing transition */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-mute select-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari target misi, skill, atau sumber belajar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border border-white/10 bg-slate-950/40 rounded-xl pl-10 pr-4 py-2.5 text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:shadow-[0_0_15px_rgba(99,102,241,0.12)] transition-all duration-300"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Controls for Status */}
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/5 self-start">
            {(
              [
                { label: "Semua", value: "all" as StatusFilter },
                { label: `Tertunda (${pendingCount})`, value: "pending" as StatusFilter },
                { label: `Selesai (${completedCount})`, value: "completed" as StatusFilter },
              ] as { label: string; value: StatusFilter }[]
            ).map((f) => {
              const isActive = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                      : "text-text-dim hover:text-text hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Dropdowns filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-white/10 rounded-xl px-3 py-2 text-text-dim bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition cursor-pointer"
            >
              <option value="all">Semua Prioritas</option>
              <option value="urgent">Mendesak</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>

            {/* Source filter */}
            {sources.length > 0 && (
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="text-xs border border-white/10 rounded-xl px-3 py-2 text-text-dim bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition cursor-pointer"
              >
                <option value="all">Semua Sumber</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-white/10 rounded-xl px-3 py-2 text-text-dim bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition cursor-pointer"
            >
              <option value="priority">Prioritas Tertinggi</option>
              <option value="deadline">Batas Waktu Terdekat</option>
              <option value="alphabetical">Alfabetis (A-Z)</option>
              <option value="createdAt">Tanggal Dibuat</option>
            </select>
          </div>
        </div>

        {/* Counter Info & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-text-mute pt-1.5 border-t border-white/5">
          <span>
            Menampilkan <span className="font-semibold text-indigo-300">{sortedAndFiltered.length}</span> dari {allItems.length} target
          </span>
          {statusFilter !== "all" || sourceFilter !== "all" || priorityFilter !== "all" || search.trim() !== "" ? (
            <button
              onClick={() => {
                setStatusFilter("all");
                setSourceFilter("all");
                setPriorityFilter("all");
                setSearch("");
                setSortBy("priority");
              }}
              className="text-indigo-400 hover:text-indigo-350 font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          ) : null}
        </div>
      </div>

      {/* Quest Lists */}
      {sortedAndFiltered.length === 0 ? (
        <EmptyState filter={statusFilter} />
      ) : (
        <div className="space-y-3 animate-slide-up">
          {sortedAndFiltered.map((flat) => (
            <ActionRow
              key={flat.id}
              flat={flat}
              onToggle={handleToggle}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Quick Capture Floating Action Button */}
      <QuickCaptureFAB onRefresh={load} />

      {/* Floating Reward Particle Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -50%)",
            }}
            className="absolute text-xs font-black text-yellow-300 bg-slate-950/90 border border-yellow-500/30 px-3.5 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 backdrop-blur-md animate-float-up-fade"
          >
            {p.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton Loading ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-white/5 border border-white/5 rounded-xl w-64" />
        <div className="h-4 bg-white/5 border border-white/5 rounded-xl w-40" />
      </div>
      {/* Progress card skeleton */}
      <div className="h-32 bg-white/5 border border-white/5 rounded-3xl" />
      {/* Creator skeleton */}
      <div className="h-14 bg-white/5 border border-white/5 rounded-2xl" />
      {/* Filter skeleton */}
      <div className="h-20 bg-white/5 border border-white/5 rounded-2xl" />
      {/* Rows skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-white/5 border border-white/5 rounded-2xl" />
      ))}
    </div>
  );
}
