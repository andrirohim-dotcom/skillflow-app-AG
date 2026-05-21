"use client";

import { useState } from "react";
import { saveWsTask, updateWsTask, deleteWsTask } from "@/lib/storageV2";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
} from "@/lib/constants";
import type { LearningSource, SourceTask, TaskPriority, TaskStatus } from "@/lib/types";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
const STATUSES: TaskStatus[] = ["todo", "in_progress", "done", "cancelled"];

// ─── Add Task Form ────────────────────────────────────────────────────────────

function AddTaskForm({
  source,
  onSaved,
  onCancel,
}: {
  source: LearningSource;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [desc, setDesc] = useState("");
  const [context, setContext] = useState("");
  const [ref, setRef] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!desc.trim()) { setError("Deskripsi task tidak boleh kosong."); return; }
    setError("");
    if (!user || !workspace) return;

    const task: SourceTask = {
      id: crypto.randomUUID(),
      sourceId: source.id,
      workspaceId: workspace.id,
      userId: user.id,
      description: desc.trim(),
      context: context.trim() || undefined,
      sourceReference: ref.trim() || undefined,
      deadline: deadline || undefined,
      priority,
      status: "todo",
      createdAt: new Date().toISOString(),
    };

    await saveWsTask(workspace.id, user.id, task);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit}
      className="glass border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-depth">
      <h3 className="text-sm font-bold text-text">Tambah Action Item</h3>

      <div>
        <label className={LABEL_CLS}>Deskripsi *</label>
        <input type="text" value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Apa yang perlu dilakukan?"
          className={INPUT_CLS} />
      </div>

      <div>
        <label className={LABEL_CLS}>Konteks / Latar Belakang</label>
        <textarea value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          placeholder="Kenapa ini penting? Terkait insight apa?"
          className={`${INPUT_CLS} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Referensi Sumber</label>
          <input type="text" value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="p.42, bab 3..."
            className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Deadline</label>
          <input type="date" value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={INPUT_CLS} />
        </div>
      </div>

      {/* Priority selector */}
      <div>
        <label className={LABEL_CLS}>Prioritas</label>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button key={p} type="button" onClick={() => setPriority(p)}
              className={`flex-1 text-xs font-semibold px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                priority === p
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-glow-primary"
                  : `${TASK_PRIORITY_COLORS[p]} border-transparent hover:border-white/20`
              }`}>
              {TASK_PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-rose-400 text-xs bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-500/20">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit"
          className="flex-1 bg-gradient-to-r from-indigo-sleek to-violet-sleek hover:from-indigo-sleek/90 hover:to-violet-sleek/90 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-glow-primary active:scale-95 border border-indigo-500/30 cursor-pointer">
          Tambah Task
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 text-sm text-text-dim hover:text-text border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer bg-transparent">
          Batal
        </button>
      </div>
    </form>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: SourceTask;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDone = task.status === "done";
  const isCancelled = task.status === "cancelled";
  const isInactive = isDone || isCancelled;

  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isInactive;

  return (
    <div className={`glass-soft border rounded-2xl p-4 shadow-card-depth transition-all ${
      isInactive ? "opacity-55 border-white/5" : "border-white/10 hover:border-white/20"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Status checkbox */}
        <button
          onClick={() => onStatusChange(task.id, isDone ? "todo" : "done")}
          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isDone
              ? "bg-emerald-500/25 border-emerald-500 text-emerald-400 shadow-glow-primary"
              : "border-white/20 hover:border-emerald-500/40 bg-white/5"
          }`}
        >
          {isDone && <span className="text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${
            isDone ? "line-through text-text-mute" : "text-text"
          }`}>
            {task.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${TASK_PRIORITY_COLORS[task.priority]}`}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>
            {task.sourceReference && (
              <span className="text-xs text-text-mute font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                {task.sourceReference}
              </span>
            )}
            {deadline && (
              <span className={`text-xs font-medium ${isOverdue ? "text-rose-400" : "text-text-mute"}`}>
                {isOverdue ? "⚠️ " : "📅 "}{deadline}
              </span>
            )}
          </div>

          {/* Context */}
          {task.context && (
            <p className="text-xs text-text-mute mt-2 leading-relaxed bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5">
              {task.context}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={() => onDelete(task.id)}
                className="text-xs text-rose-400 font-semibold px-2 py-0.5 rounded hover:bg-rose-950/20 border border-rose-500/10 cursor-pointer">
                Hapus
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-xs text-text-mute px-2 py-0.5 rounded hover:bg-white/5 border border-white/10 cursor-pointer">
                Batal
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="text-text-mute hover:text-text text-xs transition-colors cursor-pointer">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status selector */}
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/5">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => onStatusChange(task.id, s)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              task.status === s
                ? TASK_STATUS_COLORS[s]
                : "text-text-mute border-transparent hover:border-white/10 hover:text-text"
            }`}>
            {TASK_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface Props {
  source: LearningSource;
  tasks: SourceTask[];
  onRefresh: () => void;
}

export default function ActionItemsTab({ source, tasks, onRefresh }: Props) {
  const { currentUser: user, currentWorkspace: workspace } = useWorkspace();
  const [showForm, setShowForm] = useState(false);

  const active = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const done = tasks.filter((t) => t.status === "done");

  async function handleStatusChange(id: string, status: TaskStatus) {
    if (!user || !workspace) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const now = new Date().toISOString();
    await updateWsTask(workspace.id, user.id, {
      ...task,
      status,
      completedAt: status === "done" ? now : undefined,
    });
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!user || !workspace) return;
    await deleteWsTask(workspace.id, user.id, id);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Aktif", value: active.length, color: "text-amber-400" },
            { label: "Selesai", value: done.length, color: "text-emerald-400" },
            { label: "Total", value: tasks.length, color: "text-text" },
          ].map((s) => (
            <div key={s.label} className="glass-soft border border-white/5 rounded-xl p-3 text-center shadow-card-depth">
              <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-text-mute mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add form toggle */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-indigo-500/35 hover:bg-white/5 text-text-mute hover:text-indigo-300 text-sm font-medium py-3 rounded-2xl transition-all cursor-pointer">
          + Tambah Action Item
        </button>
      ) : (
        <AddTaskForm
          source={source}
          onSaved={() => { setShowForm(false); onRefresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Active tasks */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-text-mute uppercase tracking-wide">
            Aktif ({active.length})
          </h3>
          {active.map((t) => (
            <TaskCard key={t.id} task={t}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Done tasks (collapsed group) */}
      {done.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
            Selesai ({done.length})
          </h3>
          {done.map((t) => (
            <TaskCard key={t.id} task={t}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Empty */}
      {tasks.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center glass-soft border border-white/10 rounded-2xl shadow-card-depth">
          <span className="text-4xl mb-3">✅</span>
          <p className="text-sm font-medium text-text">Belum ada action item</p>
          <p className="text-xs text-text-mute mt-1">Tambahkan tugas yang perlu dilakukan dari sumber ini.</p>
        </div>
      )}
    </div>
  );
}

const INPUT_CLS = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-sleek/50 focus:border-transparent transition bg-transparent";
const LABEL_CLS = "block text-xs font-semibold text-text-mute uppercase tracking-wide mb-1.5";
