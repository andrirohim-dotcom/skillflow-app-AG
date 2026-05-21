"use client";

import { useState } from "react";
import { SOURCE_STATUS_LABELS, SOURCE_TYPE_UNIT_LABEL } from "@/lib/constants";
import { getSourceProgress } from "@/lib/utils/sourceProgress";
import type { LearningSource, SourceStatus } from "@/lib/types";

interface Props {
  source: LearningSource;
  onSaved: (updated: LearningSource) => void;
  onCancel: () => void;
}

export default function UpdateProgressForm({ source, onSaved, onCancel }: Props) {
  const stats = getSourceProgress(source);
  const [current, setCurrent] = useState(String(stats.consumed));
  const [status, setStatus] = useState<SourceStatus>(source.status);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(current);
    if (isNaN(val) || val < 0) {
      setError("Nilai progres tidak valid.");
      return;
    }
    if (val > stats.total) {
      setError(`Tidak boleh melebihi total (${stats.total} ${stats.unitLabel}).`);
      return;
    }
    setError("");

    const now = new Date().toISOString();
    const p = source.progress;
    let updatedProgress = { ...p };

    if (p.type === "book") updatedProgress = { ...p, currentPage: val };
    else if (p.type === "youtube") updatedProgress = { ...p, watchedMinutes: val };
    else if (p.type === "article") updatedProgress = { ...p, consumedMinutes: val };
    else if (p.type === "podcast") updatedProgress = { ...p, listenedMinutes: val };
    else if (p.type === "course") {
      if (p.totalModules) updatedProgress = { ...p, completedModules: val };
      else updatedProgress = { ...p, watchedMinutes: val };
    }

    // Auto-mark completed if progress hits 100%
    const newStatus = val >= stats.total ? "completed" : status;

    onSaved({
      ...source,
      progress: updatedProgress as typeof source.progress,
      status: newStatus,
      updatedAt: now,
    });
  }

  const pct = stats.total > 0 ? Math.round((Number(current) / stats.total) * 100) : 0;

  return (
    <div className="glass border border-white/10 shadow-xl overflow-hidden rounded-2xl">
      <div className="bg-gradient-to-r from-indigo-950/70 to-violet-950/70 border-b border-white/5 px-6 py-5">
        <h2 className="text-text font-bold text-lg">Update Progres</h2>
        <p className="text-text-mute text-sm mt-0.5">{source.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Current progress */}
        <div>
          <label className={LABEL_CLS}>
            Posisi Saat Ini ({stats.unitLabel})
          </label>
          <input
            type="number"
            min="0"
            max={stats.total}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={INPUT_CLS}
          />
          <div className="mt-2">
            <div className="flex justify-between text-xs text-text-mute mb-1">
              <span>0</span>
              <span className="font-semibold text-indigo-400">{pct}%</span>
              <span>{stats.total} {stats.unitLabel}</span>
            </div>
            <div className="w-full bg-white/5 border border-white/5 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-indigo-500 rounded-full transition-all duration-300 shadow-glow-primary"
                style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={LABEL_CLS}>Status</label>
          <div className="grid grid-cols-2 gap-2">
            {(["not_started", "in_progress", "completed", "on_hold"] as SourceStatus[]).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`text-sm py-2 rounded-xl border transition-all cursor-pointer ${
                  status === s
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-glow-primary font-semibold"
                    : "bg-white/5 text-text-mute border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}>
                {SOURCE_STATUS_LABELS[s]}
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
            className="flex-1 bg-gradient-to-r from-indigo-sleek to-violet-sleek hover:from-indigo-sleek/90 hover:to-violet-sleek/90 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 shadow-glow-primary border border-indigo-500/30 text-sm cursor-pointer">
            Simpan Progres
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 text-sm text-text-dim border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/25 transition-all cursor-pointer">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

const INPUT_CLS = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text placeholder-text-mute focus:outline-none focus:ring-2 focus:ring-indigo-sleek/50 focus:border-transparent transition";
const LABEL_CLS = "block text-xs font-semibold text-text-mute uppercase tracking-wide mb-1.5";
