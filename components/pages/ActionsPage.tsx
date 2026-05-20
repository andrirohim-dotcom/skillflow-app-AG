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
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-150 group ${
        completed
          ? "bg-gray-50 border-gray-100"
          : "bg-white border-gray-100 hover:border-sky-100 hover:shadow-sm"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(flat)}
        className={`mt-0.5 shrink-0 w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
          completed
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-gray-300 hover:border-sky-400 bg-white"
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
        <p className={`text-sm leading-snug font-medium ${completed ? "line-through text-gray-400" : "text-gray-800"}`}>
          {text}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {type === "source_task" && priority && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${TASK_PRIORITY_COLORS[priority as TaskPriority]}`}>
              {TASK_PRIORITY_LABELS[priority as TaskPriority]}
            </span>
          )}
          {skillName && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[160px]">
              🎯 {skillName}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md truncate max-w-[160px]">
            📚 {sourceName}
          </span>
          {deadlineStr && !completed && (
            <span className="text-xs text-amber-600 font-medium">
              📅 {deadlineStr}
            </span>
          )}
          {completedAt && (
            <span className="text-xs text-emerald-500">
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
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl animate-slide-up">
      <div className="text-6xl mb-4">{m.icon}</div>
      <h3 className="text-lg font-bold text-gray-700">{m.title}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{m.desc}</p>
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
          <h1 className="text-2xl font-extrabold text-gray-900">Action Items</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {pendingCount} tertunda · {completedCount} selesai
          </p>
        </div>
        {/* Progress ring summary */}
        {allItems.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-extrabold text-sky-600">
              {allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-400">selesai</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari action item, skill, atau sumber..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
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
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  statusFilter === f.value
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-sky-200 hover:text-sky-600"
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
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
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

        <p className="text-xs text-gray-400">
          Menampilkan <span className="font-semibold text-gray-600">{filtered.length}</span> dari {allItems.length} action items
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

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-100 rounded-xl w-56" />
      <div className="h-28 bg-gray-100 rounded-2xl" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-xl" />
      ))}
    </div>
  );
}
