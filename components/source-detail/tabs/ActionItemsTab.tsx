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
      className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-800">Tambah Action Item</h3>

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
              className={`flex-1 text-xs font-semibold px-2 py-1.5 rounded-lg border transition-all ${
                priority === p
                  ? "bg-gray-800 text-white border-gray-800"
                  : `${TASK_PRIORITY_COLORS[p]} border-transparent hover:border-gray-300`
              }`}>
              {TASK_PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-rose-500 text-xs bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit"
          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
          Tambah Task
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors bg-white">
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
    <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
      isInactive ? "opacity-60" : "border-gray-100 hover:border-gray-200 hover:shadow-md"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Status checkbox */}
        <button
          onClick={() => onStatusChange(task.id, isDone ? "todo" : "done")}
          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
            isDone
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 hover:border-emerald-400"
          }`}
        >
          {isDone && <span className="text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${
            isDone ? "line-through text-gray-400" : "text-gray-800"
          }`}>
            {task.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${TASK_PRIORITY_COLORS[task.priority]}`}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>
            {task.sourceReference && (
              <span className="text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                {task.sourceReference}
              </span>
            )}
            {deadline && (
              <span className={`text-xs font-medium ${isOverdue ? "text-rose-500" : "text-gray-400"}`}>
                {isOverdue ? "⚠️ " : "📅 "}{deadline}
              </span>
            )}
          </div>

          {/* Context */}
          {task.context && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed bg-gray-50 rounded-lg px-2.5 py-1.5">
              {task.context}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={() => onDelete(task.id)}
                className="text-xs text-rose-600 font-semibold px-2 py-0.5 rounded hover:bg-rose-50">
                Hapus
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-400 px-2 py-0.5 rounded hover:bg-gray-50">
                Batal
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="text-gray-300 hover:text-gray-500 text-xs transition-colors">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status selector */}
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-50">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => onStatusChange(task.id, s)}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
              task.status === s
                ? TASK_STATUS_COLORS[s]
                : "text-gray-400 border-transparent hover:border-gray-200 hover:text-gray-600"
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
            { label: "Aktif", value: active.length, color: "text-amber-600" },
            { label: "Selesai", value: done.length, color: "text-emerald-600" },
            { label: "Total", value: tasks.length, color: "text-gray-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
              <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add form toggle */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-amber-300 text-gray-400 hover:text-amber-600 text-sm font-medium py-3 rounded-2xl transition-all">
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
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
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
          <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
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
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-gray-100 rounded-2xl">
          <span className="text-4xl mb-3">✅</span>
          <p className="text-sm font-medium text-gray-500">Belum ada action item</p>
          <p className="text-xs text-gray-400 mt-1">Tambahkan tugas yang perlu dilakukan dari sumber ini.</p>
        </div>
      )}
    </div>
  );
}

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition";
const LABEL_CLS = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
