"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWsSkillProgress, updateWsSkillProgress, getWsSources, getWsTasks, updateWsTask } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import type { SkillProgress, LearningSource, ActionItem, SourceTask, TaskPriority } from "@/lib/types";
import QuickCaptureFAB from "@/components/dashboard/QuickCaptureFAB";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "completed";

interface FlatActionItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  skillName?: string;
  sourceName: string;
  sourceId?: string;
  priority?: string;
  deadline?: string;
  type: "skill_ai" | "source_task";
  rawSp?: SkillProgress; // For skill_ai
  rawTask?: SourceTask; // For source_task
}

// ─── Action Row ───────────────────────────────────────────────────────────────

function ActionRow({
  flat,
  onToggle,
}: {
  flat: FlatActionItem;
  onToggle: (flat: FlatActionItem) => void;
}) {
  const { text, completed, completedAt, skillName, sourceName, priority, deadline, type } = flat;

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : null;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${
        completed
          ? "bg-surface/20 border-line/40 opacity-70"
          : "bg-surface/40 border-line hover:border-indigo-500/35 hover:bg-surface/60 hover:shadow-xl backdrop-blur-md"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(flat)}
        className={`mt-0.5 shrink-0 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          completed
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-white/20 hover:border-indigo-400/70 bg-white/5"
        }`}
        style={{ width: 18, height: 18 }}
      >
        {completed && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug font-medium ${completed ? "line-through text-text-mute/60" : "text-text"}`}>
          {text}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {type === "source_task" && priority && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${TASK_PRIORITY_COLORS[priority as TaskPriority]}`}>
              {TASK_PRIORITY_LABELS[priority as TaskPriority]}
            </span>
          )}
          {skillName && (
            <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md truncate max-w-[160px]">
              🎯 {skillName}
            </span>
          )}
          <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md truncate max-w-[160px]">
            📚 {sourceName}
          </span>
          {deadlineStr && !completed && (
            <span className="text-xs text-amber-400 font-medium">
              📅 {deadlineStr}
            </span>
          )}
          {completedAt && (
            <span className="text-xs text-emerald-400">
              ✓ {new Date(completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: StatusFilter }) {
  const msgs: Record<StatusFilter, { icon: string; title: string; desc: string }> = {
    all: {
      icon: "✅",
      title: "Belum ada action items",
      desc: "Action items akan muncul saat Anda menambahkan skill targets ke sumber belajar.",
    },
    pending: {
      icon: "🎉",
      title: "Semua selesai!",
      desc: "Tidak ada action items yang tertunda. Tambahkan sumber belajar baru untuk action plan baru.",
    },
    completed: {
      icon: "📋",
      title: "Belum ada yang selesai",
      desc: "Centang action items untuk menampilkannya di sini.",
    },
  };
  const m = msgs[filter];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/30 border border-dashed border-line rounded-2xl backdrop-blur-md animate-slide-up">
      <div className="text-6xl mb-4">{m.icon}</div>
      <h3 className="text-lg font-bold text-text">{m.title}</h3>
      <p className="text-sm text-text-mute mt-1 max-w-xs">{m.desc}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActionsPage() {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [skillsData, setSkillsData] = useState<SkillProgress[]>([]);
  const [tasksData, setTasksData] = useState<SourceTask[]>([]);
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!user || !workspace) return;
    
    // Simulate async
    await new Promise(r => setTimeout(r, 0));

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

  // Flatten all action items with context
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

  const filtered = useMemo(() => {
    let r = allItems;
    if (statusFilter === "pending") r = r.filter((f) => !f.completed);
    if (statusFilter === "completed") r = r.filter((f) => f.completed);
    if (sourceFilter !== "all") r = r.filter((f) => f.sourceId === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (f) =>
          f.text.toLowerCase().includes(q) ||
          (f.skillName ?? "").toLowerCase().includes(q) ||
          f.sourceName.toLowerCase().includes(q)
      );
    }
    // Sort: pending first, then by priority (if task), then by skill name
    return r.sort((a, b) => {
      if (a.completed !== b.completed)
        return a.completed ? 1 : -1;
      return (a.skillName ?? "").localeCompare(b.skillName ?? "");
    });
  }, [allItems, statusFilter, sourceFilter, search]);

  const pendingCount = useMemo(() => allItems.filter((f) => !f.completed).length, [allItems]);
  const completedCount = useMemo(() => allItems.filter((f) => f.completed).length, [allItems]);

  async function handleToggle(flat: FlatActionItem) {
    if (!user || !workspace) return;
    
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
      setSkillsData((prev) =>
        prev.map((s) => (s.id === sp.id ? updated : s))
      );
    } else if (flat.type === "source_task" && flat.rawTask) {
      const task = flat.rawTask;
      const nextStatus = task.status === "done" ? "todo" : "done";
      const updated: SourceTask = {
        ...task,
        status: nextStatus,
        completedAt: nextStatus === "done" ? new Date().toISOString() : undefined,
      };
      await updateWsTask(workspace.id, user.id, updated);
      setTasksData((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    }
  }

  if (!mounted) return <Skeleton />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Action Items</h1>
          <p className="text-sm text-text-mute mt-0.5">
            {pendingCount} tertunda · {completedCount} selesai
          </p>
        </div>
        {/* Progress ring summary */}
        {allItems.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-extrabold text-indigo-400">
              {allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0}%
            </p>
            <p className="text-xs text-text-mute">selesai</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-surface/40 border border-line rounded-2xl p-4 mb-6 shadow-lg backdrop-blur-md space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari action item, skill, atau sumber..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm border border-line bg-surface/50 rounded-xl px-3.5 py-2 text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
        />

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex gap-1">
            {(
              [
                { label: "Semua", value: "all" as StatusFilter },
                { label: `Tertunda (${pendingCount})`, value: "pending" as StatusFilter },
                { label: `Selesai (${completedCount})`, value: "completed" as StatusFilter },
              ] as { label: string; value: StatusFilter }[]
            ).map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  statusFilter === f.value
                    ? "bg-indigo-sleek text-white border-indigo-500/40"
                    : "bg-white/5 text-text-dim border-line hover:border-indigo-500/30 hover:text-text hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Source filter */}
          {sources.length > 0 && (
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-xs border border-line rounded-lg px-2.5 py-1.5 text-text-dim bg-surface/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all cursor-pointer"
            >
              <option value="all">Semua Sumber</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <p className="text-xs text-text-mute">
          Menampilkan <span className="font-semibold text-text-dim">{filtered.length}</span> dari {allItems.length} action items
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState filter={statusFilter} />
      ) : (
        <div className="space-y-2 animate-slide-up">
          {filtered.map((flat) => (
            <ActionRow
              key={flat.id}
              flat={flat}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <QuickCaptureFAB onRefresh={load} />
    </>
  );
}

// Skeleton loading layout
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-white/5 border border-line rounded-xl w-56" />
      <div className="h-28 bg-white/5 border border-line rounded-2xl" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-white/5 border border-line rounded-xl" />
      ))}
    </div>
  );
}
